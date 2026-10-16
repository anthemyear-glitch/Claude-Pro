'use strict';

/**
 * Download engine: splits a file into N byte-range segments and downloads
 * them in parallel (like IDM / FDM), with pause/resume, retries, live speed
 * tracking, a concurrency queue, and crash-safe state persistence.
 */

const fsp = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const { EventEmitter } = require('events');

const UA = 'Mozilla/5.0 (compatible; DownloadAccelerator/1.0)';
const MAX_RETRIES = 3;
const TICK_MS = 400;
const MIN_SEGMENT_BYTES = 64 * 1024;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function clamp(n, lo, hi) {
  n = Number(n);
  if (!Number.isFinite(n)) n = lo;
  return Math.min(hi, Math.max(lo, Math.round(n)));
}

function sanitizeFilename(name) {
  if (!name) return null;
  try {
    name = decodeURIComponent(String(name));
  } catch {
    /* keep raw */
  }
  name = name
    .replace(/[\x00-\x1f\x7f]/g, '')
    .replace(/[\\/]/g, '_')
    .replace(/^\.+/, '')
    .trim();
  if (!name || name === '.' || name === '..') return null;
  return name.slice(0, 180);
}

function filenameFromDisposition(cd) {
  if (!cd) return null;
  let m = /filename\*\s*=\s*(?:UTF-8|utf-8)''([^;]+)/i.exec(cd);
  if (m) return sanitizeFilename(m[1].trim());
  m = /filename\s*=\s*"((?:[^"\\]|\\.)*)"/.exec(cd) || /filename\s*=\s*([^;]+)/.exec(cd);
  if (m) return sanitizeFilename(m[1].replace(/\\(.)/g, '$1').trim());
  return null;
}

function filenameFromUrl(url) {
  try {
    const last = path.posix.basename(new URL(url).pathname);
    return sanitizeFilename(last);
  } catch {
    return null;
  }
}

/** Probe the URL: total size, range support, final name. */
async function probe(url) {
  const res = await fetch(url, {
    method: 'GET',
    redirect: 'follow',
    headers: { 'user-agent': UA, 'accept-encoding': 'identity', range: 'bytes=0-0' },
  });

  const info = {
    finalUrl: res.url || url,
    supportsRanges: false,
    size: null,
    filename: filenameFromDisposition(res.headers.get('content-disposition')),
  };

  try {
    if (res.status === 206) {
      const m = /bytes\s+0-0\/(\d+)/.exec(res.headers.get('content-range') || '');
      if (m) {
        info.size = parseInt(m[1], 10);
        info.supportsRanges = true;
      }
    } else if (res.ok) {
      const cl = res.headers.get('content-length');
      if (cl) info.size = parseInt(cl, 10);
    } else {
      throw new Error(`Server responded with HTTP ${res.status}`);
    }
  } finally {
    if (res.body) {
      try {
        await res.body.cancel();
      } catch {
        /* ignore */
      }
    }
  }

  if (!info.filename) {
    info.filename = filenameFromUrl(info.finalUrl) || filenameFromUrl(url) || `download-${Date.now()}.bin`;
  }
  return info;
}

async function uniquePath(dir, filename) {
  const ext = path.extname(filename);
  const base = path.basename(filename, ext);
  let candidate = path.join(dir, filename);
  for (let i = 1; ; i++) {
    const partExists = await fsp
      .stat(candidate + '.part')
      .then(() => true)
      .catch(() => false);
    const exists = await fsp
      .stat(candidate)
      .then(() => true)
      .catch(() => false);
    if (!exists && !partExists) return candidate;
    candidate = path.join(dir, `${base} (${i})${ext}`);
  }
}

class DownloadManager extends EventEmitter {
  constructor({ downloadsDir, dataDir, maxActive = 3, defaultSegments = 8 }) {
    super();
    this.downloadsDir = downloadsDir;
    this.dataDir = dataDir;
    this.statePath = path.join(dataDir, 'state.json');
    this.settings = { maxActive, defaultSegments };
    this.tasks = new Map();
    this.globalSpeed = 0;
    this._dirty = false;
    this._timer = setInterval(() => this._tick(), TICK_MS);
    this._timer.unref();
    this._saveTimer = setInterval(() => {
      if (this._dirty) this._saveState();
    }, 2000);
    this._saveTimer.unref();
  }

  /* ---------------- lifecycle ---------------- */

  add({ url, filename, segments }) {
    let parsed;
    try {
      parsed = new URL(url);
    } catch {
      throw new Error('Invalid URL');
    }
    if (!/^https?:$/.test(parsed.protocol)) throw new Error('Only http(s) URLs are supported');

    const task = {
      id: crypto.randomBytes(6).toString('hex'),
      url: parsed.href,
      finalUrl: parsed.href,
      filename: sanitizeFilename(filename) || null,
      savePath: null,
      partPath: null,
      size: null,
      downloaded: 0,
      status: 'queued',
      supportsRanges: false,
      segmentCount: segments != null ? clamp(segments, 1, 16) : this.settings.defaultSegments,
      segments: [],
      speed: 0,
      eta: null,
      error: null,
      createdAt: Date.now(),
      startedAt: null,
      finishedAt: null,
      _window: [],
    };
    this.tasks.set(task.id, task);
    this._promote();
    this._dirty = true;
    this.emit('change');
    return task.id;
  }

  pause(id) {
    const task = this._get(id);
    if (task.status === 'probing' || task.status === 'downloading') {
      task.status = 'paused';
      this._abort(task);
      task.speed = 0;
      task.eta = null;
      this._closeFh(task);
      this._dirty = true;
      this._promote();
      this.emit('change');
    }
    return task;
  }

  resume(id) {
    const task = this._get(id);
    if (task.status === 'paused' || task.status === 'error') {
      task.status = 'queued';
      task.error = null;
      for (const seg of task.segments) {
        seg.status = 'active';
        seg.retries = 0;
        seg.speed = 0;
      }
      this._dirty = true;
      this._promote();
      this.emit('change');
    }
    return task;
  }

  cancel(id) {
    const task = this._get(id);
    if (task.status === 'probing' || task.status === 'downloading' || task.status === 'paused' || task.status === 'queued' || task.status === 'error') {
      this._abort(task);
      this._closeFh(task);
      this.tasks.delete(id);
      const part = task.partPath;
      if (part) fsp.unlink(part).catch(() => {});
      this._dirty = true;
      this._promote();
      this.emit('change');
    } else if (task.status === 'completed') {
      this.tasks.delete(id);
      this._dirty = true;
      this.emit('change');
    }
    return true;
  }

  updateSettings({ maxActive, defaultSegments }) {
    if (maxActive != null) this.settings.maxActive = clamp(maxActive, 1, 8);
    if (defaultSegments != null) this.settings.defaultSegments = clamp(defaultSegments, 1, 16);
    this._dirty = true;
    this._promote();
    this.emit('change');
    return this.settings;
  }

  async shutdown() {
    clearInterval(this._timer);
    clearInterval(this._saveTimer);
    for (const task of this.tasks.values()) {
      if (task.status === 'downloading' || task.status === 'probing') {
        task.status = 'paused';
        this._abort(task);
        this._closeFh(task);
      }
    }
    await this._saveState();
  }

  /* ---------------- snapshots ---------------- */

  _get(id) {
    const task = this.tasks.get(id);
    if (!task) {
      const err = new Error('Download not found');
      err.status = 404;
      throw err;
    }
    return task;
  }

  snapshot() {
    const downloads = [...this.tasks.values()]
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((t) => this._public(t));
    return { downloads, globalSpeed: this.globalSpeed, settings: this.settings };
  }

  _public(t) {
    return {
      id: t.id,
      url: t.url,
      finalUrl: t.finalUrl,
      filename: t.filename,
      size: t.size,
      downloaded: t.downloaded,
      status: t.status,
      supportsRanges: t.supportsRanges,
      segmentCount: t.segments.length || t.segmentCount,
      segments: t.segments.map((s) => ({
        start: s.start,
        end: s.end,
        downloaded: s.downloaded,
        status: s.status,
        speed: s.speed,
      })),
      speed: t.speed,
      eta: t.eta,
      error: t.error,
      createdAt: t.createdAt,
      startedAt: t.startedAt,
      finishedAt: t.finishedAt,
    };
  }

  /* ---------------- queue ---------------- */

  _activeCount() {
    let n = 0;
    for (const t of this.tasks.values()) {
      if (t.status === 'downloading' || t.status === 'probing') n++;
    }
    return n;
  }

  _promote() {
    while (this._activeCount() < this.settings.maxActive) {
      const next = [...this.tasks.values()]
        .filter((t) => t.status === 'queued')
        .sort((a, b) => a.createdAt - b.createdAt)[0];
      if (!next) break;
      this._start(next).catch((err) => {
        next.status = 'error';
        next.error = err.message || String(err);
        next.speed = 0;
        this._closeFh(next);
        this._dirty = true;
        this._promote();
        this.emit('change');
      });
    }
  }

  /* ---------------- download core ---------------- */

  _abort(task) {
    if (task._controllers) {
      for (const c of task._controllers) {
        try {
          c.abort();
        } catch {
          /* ignore */
        }
      }
      task._controllers.clear();
    }
  }

  _closeFh(task) {
    if (task._fh) {
      task._fh.close().catch(() => {});
      task._fh = null;
    }
  }

  async _start(task) {
    task.status = 'probing';
    task.error = null;
    task.startedAt = task.startedAt || Date.now();
    task._window = [{ t: Date.now(), b: task.downloaded }];
    task._controllers = new Set();
    this.emit('change');

    const info = await probe(task.url);
    task.finalUrl = info.finalUrl;
    if (task.size == null) task.size = info.size;
    if (!task.filename) task.filename = info.filename;
    task.supportsRanges = info.supportsRanges && task.size != null;

    if (!task.savePath) {
      await fsp.mkdir(this.downloadsDir, { recursive: true });
      task.savePath = await uniquePath(this.downloadsDir, task.filename);
      task.filename = path.basename(task.savePath);
      task.partPath = task.savePath + '.part';
    }

    // (Re)build segment table
    let restartFromZero = false;
    if (task.segments.length === 0) {
      const canSplit = task.supportsRanges && task.segmentCount > 1 && task.size > MIN_SEGMENT_BYTES * 2;
      if (canSplit) {
        const n = Math.min(task.segmentCount, Math.max(1, Math.floor(task.size / MIN_SEGMENT_BYTES)));
        const per = Math.ceil(task.size / n);
        for (let i = 0; i < n; i++) {
          const start = i * per;
          const end = Math.min(task.size - 1, (i + 1) * per - 1);
          if (start > task.size - 1) break;
          task.segments.push({ index: i, start, end, downloaded: 0, status: 'active', retries: 0, speed: 0, _lastBytes: 0 });
        }
      } else {
        task.segments.push({
          index: 0,
          start: 0,
          end: task.size != null ? task.size - 1 : Infinity,
          downloaded: 0,
          status: 'active',
          retries: 0,
          speed: 0,
          _lastBytes: 0,
        });
      }
      task.downloaded = 0;
    } else {
      // Resuming: keep per-segment progress
      if (!task.supportsRanges) {
        // Cannot resume without range support — restart from scratch
        for (const seg of task.segments) {
          seg.downloaded = 0;
          seg.status = 'active';
        }
        task.downloaded = 0;
        restartFromZero = true;
      }
      for (const seg of task.segments) {
        if (Number.isFinite(seg.end) && seg.downloaded >= seg.end - seg.start + 1) seg.status = 'done';
        else seg.status = 'active';
      }
      task.downloaded = task.segments.reduce((a, s) => a + s.downloaded, 0);
    }

    // Open (or create) the sparse part file
    const partStat = await fsp.stat(task.partPath).catch(() => null);
    if (!partStat) {
      task._fh = await fsp.open(task.partPath, 'w+');
      if (task.size != null) await task._fh.truncate(task.size);
    } else {
      task._fh = await fsp.open(task.partPath, 'r+');
      if (restartFromZero) await task._fh.truncate(0);
    }

    task.status = 'downloading';
    this._dirty = true;
    this.emit('change');

    const jobs = task.segments
      .filter((s) => s.status !== 'done')
      .map((seg) => this._runSegment(task, seg));

    try {
      await Promise.all(jobs);
    } catch (err) {
      task.status = 'error';
      task.error = err.fatal ? err.message || String(err) : `Segment failed: ${err.message || err}`;
      task.speed = 0;
      task.eta = null;
      this._abort(task);
      this._closeFh(task);
      this._dirty = true;
      this._promote();
      this.emit('change');
      return;
    }

    if (task.status !== 'downloading') return; // paused/canceled mid-flight

    if (task.size != null && task.downloaded !== task.size) {
      task.status = 'error';
      task.error = `Size mismatch: got ${task.downloaded} of ${task.size} bytes`;
      task.speed = 0;
      this._closeFh(task);
      this._dirty = true;
      this._promote();
      this.emit('change');
      return;
    }

    // Finish: atomically move .part -> final name
    await task._fh.close();
    task._fh = null;
    await fsp.rename(task.partPath, task.savePath);
    if (task.size == null) task.size = task.downloaded;
    task.status = 'completed';
    task.finishedAt = Date.now();
    task.speed = 0;
    task.eta = 0;
    task._window = [];
    for (const s of task.segments) {
      s.speed = 0;
      s.status = 'done';
    }
    this._dirty = true;
    this._promote();
    this.emit('change');
  }

  async _runSegment(task, seg) {
    const segLen = Number.isFinite(seg.end) ? seg.end - seg.start + 1 : null; // null = unknown size

    while (segLen == null || seg.downloaded < segLen) {
      if (task.status !== 'downloading') return;

      const from = seg.start + seg.downloaded;
      const to = seg.end;
      const controller = new AbortController();
      task._controllers.add(controller);
      const gotBefore = seg.downloaded;

      try {
        const headers = { 'user-agent': UA, 'accept-encoding': 'identity' };
        if (Number.isFinite(to)) headers.range = `bytes=${from}-${to}`;

        const res = await fetch(task.finalUrl || task.url, {
          headers,
          signal: controller.signal,
          redirect: 'follow',
        });

        if (res.status === 200 && task.segments.length > 1) {
          const err = new Error('Server ignored byte-range request');
          err.fatal = true;
          throw err;
        }
        if (res.status !== 206 && res.status !== 200) {
          throw new Error(`HTTP ${res.status}`);
        }

        const reader = res.body.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (task.status !== 'downloading') {
            try {
              await reader.cancel();
            } catch {
              /* ignore */
            }
            return;
          }
          await task._fh.write(value, 0, value.length, seg.start + seg.downloaded);
          seg.downloaded += value.length;
          task.downloaded += value.length;
        }
        task._controllers.delete(controller);

        if (seg.downloaded === gotBefore) {
          throw new Error('Empty response body');
        }
        if (segLen == null) {
          // Unknown total size: end of body = end of file
          break;
        }
      } catch (err) {
        task._controllers.delete(controller);
        if (task.status !== 'downloading' || controller.signal.aborted) return;

        seg.retries++;
        if (err.fatal || seg.retries > MAX_RETRIES) {
          seg.status = 'error';
          throw err;
        }
        await sleep(Math.min(8000, 1000 * 2 ** (seg.retries - 1)));
        if (task.status !== 'downloading') return;
      }
    }

    seg.status = 'done';
    seg.speed = 0;
  }

  /* ---------------- tick: speeds / ETA ---------------- */

  _tick() {
    const now = Date.now();
    let global = 0;

    for (const task of this.tasks.values()) {
      if (task.status === 'downloading') {
        task._window.push({ t: now, b: task.downloaded });
        while (task._window.length > 2 && now - task._window[0].t > 2000) task._window.shift();
        const first = task._window[0];
        const dt = (now - first.t) / 1000;
        const inst = dt > 0 ? (task.downloaded - first.b) / dt : 0;
        task.speed = Math.round(task.speed * 0.55 + inst * 0.45);
        if (task.speed < 0) task.speed = 0;
        task.eta =
          task.speed > 0 && task.size != null
            ? Math.max(0, Math.round((task.size - task.downloaded) / task.speed))
            : null;
        global += task.speed;

        for (const seg of task.segments) {
          const segInst = ((seg.downloaded - (seg._lastBytes ?? seg.downloaded)) / (TICK_MS / 1000));
          seg.speed = Math.round((seg.speed ?? 0) * 0.5 + segInst * 0.5);
          if (seg.speed < 0 || seg.status === 'done') seg.speed = 0;
          seg._lastBytes = seg.downloaded;
        }
      } else {
        task.speed = 0;
      }
    }

    this.globalSpeed = global;
    this.emit('tick');
  }

  /* ---------------- persistence ---------------- */

  async loadState() {
    try {
      const raw = await fsp.readFile(this.statePath, 'utf8');
      const data = JSON.parse(raw);
      if (data.settings) {
        this.settings.maxActive = clamp(data.settings.maxActive ?? 3, 1, 8);
        this.settings.defaultSegments = clamp(data.settings.defaultSegments ?? 8, 1, 16);
      }
      for (const t of data.tasks || []) {
        if (!t.id || !t.url) continue;
        if (t.status === 'downloading' || t.status === 'probing') t.status = 'paused';
        if (t.status === 'completed' && t.savePath) {
          const ok = await fsp
            .stat(t.savePath)
            .then((s) => s.isFile())
            .catch(() => false);
          if (!ok) continue;
        }
        t._window = [];
        t._controllers = new Set();
        t._fh = null;
        t.speed = 0;
        t.eta = null;
        t.segments = (t.segments || []).map((s, i) => ({
          index: i,
          start: s.start,
          end: s.end,
          downloaded: s.downloaded || 0,
          status: s.status || 'active',
          retries: 0,
          speed: 0,
          _lastBytes: 0,
        }));
        this.tasks.set(t.id, t);
      }
    } catch {
      /* no state yet */
    }
    this._promote();
    this.emit('change');
  }

  async _saveState() {
    this._dirty = false;
    const tasks = [...this.tasks.values()].map((t) => ({
      id: t.id,
      url: t.url,
      finalUrl: t.finalUrl,
      filename: t.filename,
      savePath: t.savePath,
      partPath: t.partPath,
      size: t.size,
      downloaded: t.downloaded,
      status: t.status,
      supportsRanges: t.supportsRanges,
      segmentCount: t.segmentCount,
      segments: t.segments.map((s) => ({
        start: s.start,
        end: s.end,
        downloaded: s.downloaded,
        status: s.status,
      })),
      error: t.error,
      createdAt: t.createdAt,
      startedAt: t.startedAt,
      finishedAt: t.finishedAt,
    }));
    try {
      await fsp.mkdir(this.dataDir, { recursive: true });
      const tmp = this.statePath + '.tmp';
      await fsp.writeFile(tmp, JSON.stringify({ settings: this.settings, tasks }, null, 2));
      await fsp.rename(tmp, this.statePath);
    } catch {
      /* best effort */
    }
  }
}

module.exports = { DownloadManager, probe, sanitizeFilename };
