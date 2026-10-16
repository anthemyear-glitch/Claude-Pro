/* Download Accelerator — dashboard front-end (vanilla JS) */

(() => {
  'use strict';

  const $ = (sel) => document.querySelector(sel);

  const els = {
    url: $('#urlInput'),
    name: $('#nameInput'),
    seg: $('#segCount'),
    form: $('#addForm'),
    addBtn: $('#addBtn'),
    globalSpeed: $('#globalSpeed'),
    spark: $('#spark'),
    statActive: $('#statActive'),
    statQueued: $('#statQueued'),
    statDone: $('#statDone'),
    statError: $('#statError'),
    sectionActive: $('#sectionActive'),
    sectionPaused: $('#sectionPaused'),
    sectionDone: $('#sectionDone'),
    listActive: $('#listActive'),
    listPaused: $('#listPaused'),
    listDone: $('#listDone'),
    empty: $('#emptyState'),
    toasts: $('#toasts'),
    settingsBtn: $('#settingsBtn'),
    settingsModal: $('#settingsModal'),
    settingsSave: $('#settingsSave'),
    settingsCancel: $('#settingsCancel'),
    setSegments: $('#setSegments'),
    setActive: $('#setActive'),
  };

  /* ---------- utils ---------- */

  function fmtBytes(n) {
    if (n == null) return '—';
    if (n < 1024) return `${n} B`;
    const units = ['KB', 'MB', 'GB', 'TB'];
    let i = -1;
    do { n /= 1024; i++; } while (n >= 1024 && i < units.length - 1);
    return `${n >= 100 ? n.toFixed(0) : n.toFixed(1)} ${units[i]}`;
  }

  function fmtSpeed(bps) {
    if (!bps || bps < 1) return '0 B/s';
    return `${fmtBytes(bps)}/s`;
  }

  function fmtETA(sec) {
    if (sec == null || !Number.isFinite(sec)) return '—';
    if (sec < 60) return `${Math.ceil(sec)}s`;
    const m = Math.floor(sec / 60);
    if (m < 60) return `${m}m ${Math.round(sec % 60)}s`;
    return `${Math.floor(m / 60)}h ${m % 60}m`;
  }

  function hostOf(url) {
    try { return new URL(url).hostname; } catch { return url; }
  }

  function extOf(name) {
    const m = /\.([a-z0-9]{1,6})$/i.exec(name || '');
    return m ? m[1] : 'bin';
  }

  function iconClassFor(name) {
    const e = extOf(name).toLowerCase();
    if (['mp4', 'mkv', 'webm', 'mov', 'avi', 'mp3', 'flac', 'wav', 'm4a'].includes(e)) return 'type-video';
    if (['zip', 'rar', '7z', 'gz', 'tgz', 'bz2', 'xz', 'iso', 'tar'].includes(e)) return 'type-arch';
    if (['pdf', 'doc', 'docx', 'txt', 'md', 'epub', 'csv', 'json', 'js', 'ts'].includes(e)) return 'type-doc';
    return '';
  }

  function esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
  }

  function toast(msg, type = '') {
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.textContent = msg;
    els.toasts.appendChild(t);
    setTimeout(() => {
      t.style.opacity = '0';
      t.style.transition = 'opacity .3s';
      setTimeout(() => t.remove(), 320);
    }, 3600);
  }

  /* ---------- API ---------- */

  async function api(path, opts = {}) {
    const res = await fetch(path, {
      headers: { 'content-type': 'application/json' },
      ...opts,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    return data;
  }

  /* ---------- rendering ---------- */

  const SEG_COLORS = ['#22d3ee', '#6366f1', '#a78bfa', '#34d399', '#fbbf24', '#f472b6', '#60a5fa', '#2dd4bf'];

  function taskCard(t) {
    const pct = t.size ? Math.min(100, (t.downloaded / t.size) * 100) : (t.status === 'completed' ? 100 : 0);
    const ext = extOf(t.filename);
    const statusLabel = {
      downloading: 'Downloading', probing: 'Connecting…', queued: 'Queued',
      paused: 'Paused', completed: 'Completed', error: 'Failed',
    }[t.status] || t.status;

    let fillClass = '';
    if (t.status === 'completed') fillClass = 'completed';
    else if (t.status === 'error') fillClass = 'error';
    else if (t.status === 'paused' || t.status === 'queued') fillClass = 'paused';

    // segment strip
    const totalBytes = t.segments.reduce((a, s) => a + Math.max(0, (s.end ?? 0) - s.start + 1), 0) || 1;
    const segStrip = (t.segments.length > 1)
      ? `<div class="seg-strip">${t.segments.map((s, i) => {
          const len = Math.max(1, (s.end ?? 0) - s.start + 1);
          const sp = Math.min(100, (s.downloaded / len) * 100);
          const color = SEG_COLORS[i % SEG_COLORS.length];
          return `<div class="seg-part ${s.status === 'done' ? 'done' : ''} ${s.status === 'error' ? 'error' : ''}"
                       style="flex:${len / totalBytes}"
                       title="Segment ${i + 1}: ${fmtBytes(s.downloaded)} / ${fmtBytes(len)}${s.speed ? ` · ${fmtSpeed(s.speed)}` : ''}">
                    <div class="seg-fill" style="width:${sp}%;background:${color}"></div>
                  </div>`;
        }).join('')}</div>`
      : '';

    // action buttons
    let actions = '';
    if (t.status === 'downloading' || t.status === 'probing') {
      actions = `
        <button class="act-btn" data-act="pause" data-id="${t.id}" title="Pause">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
        </button>
        <button class="act-btn danger" data-act="cancel" data-id="${t.id}" title="Cancel">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>`;
    } else if (t.status === 'paused' || t.status === 'queued' || t.status === 'error') {
      actions = `
        <button class="act-btn" data-act="resume" data-id="${t.id}" title="Resume">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15a1 1 0 0 0 1.54.84l11-7.5a1 1 0 0 0 0-1.68l-11-7.5A1 1 0 0 0 7 4.5Z"/></svg>
        </button>
        <button class="act-btn danger" data-act="cancel" data-id="${t.id}" title="Remove">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>`;
    } else if (t.status === 'completed') {
      actions = `
        <button class="act-btn danger" data-act="cancel" data-id="${t.id}" title="Remove from list">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>`;
    }

    const doneActions = t.status === 'completed'
      ? `<div class="task-done-actions">
           <a class="link-btn" href="/api/downloads/${t.id}/file">
             <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 3v12"/><path d="m7 11 5 5 5-5"/><path d="M5 21h14"/></svg>
             Save file
           </a>
         </div>`
      : '';

    const errorBox = t.status === 'error' && t.error
      ? `<div class="task-error">${esc(t.error)}</div>` : '';

    return `
    <div class="task" data-task="${t.id}">
      <div class="task-head">
        <div class="file-icon ${iconClassFor(t.filename)}">${esc(ext)}</div>
        <div class="task-title-wrap">
          <div class="task-name" title="${esc(t.filename || t.url)}">${esc(t.filename || 'Probing…')}</div>
          <div class="task-meta">
            ${esc(hostOf(t.url))}<span class="sep">·</span>${statusLabel}
            ${t.supportsRanges && t.segments.length > 1 ? `<span class="sep">·</span>${t.segments.length} segments` : ''}
            ${!t.supportsRanges && t.status === 'downloading' ? `<span class="sep">·</span>single connection` : ''}
          </div>
        </div>
        <div class="task-actions">${actions}</div>
      </div>

      <div class="progress-area">
        <div class="progress-track">
          <div class="progress-fill ${fillClass}" style="width:${pct}%"></div>
        </div>
        ${segStrip}
      </div>

      <div class="task-stats">
        <div class="tstat"><span class="lbl">speed</span><strong>${t.status === 'downloading' ? fmtSpeed(t.speed) : '—'}</strong></div>
        <div class="tstat"><span class="lbl">size</span><strong>${fmtBytes(t.downloaded)} / ${fmtBytes(t.size)}</strong></div>
        <div class="tstat"><span class="lbl">eta</span><strong>${t.status === 'downloading' ? fmtETA(t.eta) : '—'}</strong></div>
        <div class="task-pct">${pct.toFixed(1)}%</div>
      </div>

      ${errorBox}
      ${doneActions}
    </div>`;
  }

  function render(data) {
    const { downloads, globalSpeed, settings } = data;

    els.globalSpeed.textContent = fmtSpeed(globalSpeed);

    const active = downloads.filter((t) => ['downloading', 'probing', 'queued'].includes(t.status));
    const paused = downloads.filter((t) => ['paused', 'error'].includes(t.status));
    const done = downloads.filter((t) => t.status === 'completed');

    els.statActive.textContent = active.filter((t) => t.status !== 'queued').length;
    els.statQueued.textContent = active.filter((t) => t.status === 'queued').length;
    els.statDone.textContent = done.length;
    els.statError.textContent = downloads.filter((t) => t.status === 'error').length;

    const any = downloads.length > 0;
    els.empty.style.display = any ? 'none' : '';
    els.sectionActive.hidden = active.length === 0;
    els.sectionPaused.hidden = paused.length === 0;
    els.sectionDone.hidden = done.length === 0;

    els.listActive.innerHTML = active.map(taskCard).join('');
    els.listPaused.innerHTML = paused.map(taskCard).join('');
    els.listDone.innerHTML = done.map(taskCard).join('');

    if (settings) {
      els.seg.value = String(settings.defaultSegments ?? 8);
    }

    pushSpark(globalSpeed);
  }

  /* ---------- sparkline ---------- */

  const sparkHistory = [];
  const MAX_SPARK = 70;
  let sparkMax = 1;

  function pushSpark(v) {
    sparkHistory.push(v || 0);
    if (sparkHistory.length > MAX_SPARK) sparkHistory.shift();
    sparkMax = Math.max(1, ...sparkHistory) * 1.15;
    drawSpark();
  }

  function drawSpark() {
    const canvas = els.spark;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth || 220;
    const h = canvas.clientHeight || 46;
    if (canvas.width !== w * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    if (sparkHistory.length < 2) return;

    const step = w / (MAX_SPARK - 1);
    const offset = (MAX_SPARK - sparkHistory.length) * step;

    const pts = sparkHistory.map((v, i) => [offset + i * step, h - 4 - (v / sparkMax) * (h - 10)]);

    // area
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, 'rgba(125, 211, 252, 0.35)');
    grad.addColorStop(1, 'rgba(125, 211, 252, 0)');
    ctx.beginPath();
    ctx.moveTo(pts[0][0], h);
    for (const [x, y] of pts) ctx.lineTo(x, y);
    ctx.lineTo(pts[pts.length - 1][0], h);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // line
    ctx.beginPath();
    for (let i = 0; i < pts.length; i++) {
      const [x, y] = pts[i];
      if (i === 0) ctx.moveTo(x, y);
      else {
        const [px, py] = pts[i - 1];
        const cx = (px + x) / 2;
        ctx.bezierCurveTo(cx, py, cx, y, x, y);
      }
    }
    ctx.strokeStyle = '#7dd3fc';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // head dot
    const [hx, hy] = pts[pts.length - 1];
    ctx.beginPath();
    ctx.arc(hx, hy, 2.6, 0, Math.PI * 2);
    ctx.fillStyle = '#7dd3fc';
    ctx.fill();
  }

  /* ---------- actions ---------- */

  async function doAction(act, id) {
    try {
      if (act === 'pause') {
        await api(`/api/downloads/${id}/pause`, { method: 'POST' });
      } else if (act === 'resume') {
        await api(`/api/downloads/${id}/resume`, { method: 'POST' });
      } else if (act === 'cancel') {
        await api(`/api/downloads/${id}`, { method: 'DELETE' });
      }
      await refresh();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-act]');
    if (btn) {
      doAction(btn.dataset.act, btn.dataset.id);
      return;
    }
    const chip = e.target.closest('[data-sample]');
    if (chip) {
      els.url.value = chip.dataset.sample;
      els.url.focus();
    }
  });

  els.form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const url = els.url.value.trim();
    if (!url) return;

    els.addBtn.disabled = true;
    try {
      await api('/api/downloads', {
        method: 'POST',
        body: JSON.stringify({
          url,
          filename: els.name.value.trim() || null,
          segments: Number(els.seg.value),
        }),
      });
      toast('Download added to queue', 'success');
      els.url.value = '';
      els.name.value = '';
      await refresh();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      els.addBtn.disabled = false;
    }
  });

  /* ---------- settings modal ---------- */

  let settingsSnapshot = null;

  els.settingsBtn.addEventListener('click', async () => {
    try {
      const snap = await api('/api/status');
      settingsSnapshot = snap.settings;
      els.setSegments.value = snap.settings.defaultSegments ?? 8;
      els.setActive.value = snap.settings.maxActive ?? 3;
      els.settingsModal.hidden = false;
    } catch (err) {
      toast(err.message, 'error');
    }
  });

  els.settingsCancel.addEventListener('click', () => {
    els.settingsModal.hidden = true;
  });

  els.settingsModal.addEventListener('click', (e) => {
    if (e.target === els.settingsModal) els.settingsModal.hidden = true;
  });

  els.settingsSave.addEventListener('click', async () => {
    try {
      await api('/api/settings', {
        method: 'POST',
        body: JSON.stringify({
          defaultSegments: Number(els.setSegments.value),
          maxActive: Number(els.setActive.value),
        }),
      });
      els.settingsModal.hidden = true;
      toast('Settings saved', 'success');
      await refresh();
    } catch (err) {
      toast(err.message, 'error');
    }
  });

  /* ---------- polling ---------- */

  async function refresh() {
    try {
      const data = await api('/api/downloads');
      render(data);
    } catch (err) {
      /* transient network error — keep last render */
    }
  }

  refresh();
  setInterval(refresh, 450);
  window.addEventListener('resize', drawSpark);
})();
