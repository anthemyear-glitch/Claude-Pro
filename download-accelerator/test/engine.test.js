'use strict';

/**
 * End-to-end engine test for Download Accelerator.
 * Spins up a local throttled file server (with + without range support),
 * then exercises: multi-segment integrity, pause/resume, no-range fallback,
 * and queue promotion. Run: node test/engine.test.js
 */

const http = require('http');
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const { DownloadManager } = require('../lib/engine');

const FILE_SIZE = 6 * 1024 * 1024; // 6 MB
const CHUNK = 64 * 1024;
const THROTTLE_MS_PER_CHUNK = 60; // ~1 MB/s per connection (keeps pause/resume windows wide)

let passed = 0;
let failed = 0;

function check(name, cond, extra = '') {
  if (cond) {
    passed++;
    console.log(`  ✔ ${name}`);
  } else {
    failed++;
    console.log(`  ✘ ${name} ${extra}`);
  }
}

function makePatternFile(size) {
  const buf = Buffer.alloc(size);
  for (let i = 0; i < size; i++) buf[i] = (i * 31 + 7) % 251;
  return buf;
}

function sha256(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

/** Throttled file server. `ranges` toggles byte-range support, `chunked` omits content-length. */
function startFileServer(payload, ranges, chunked = false) {
  return new Promise((resolve) => {
    const server = http.createServer(async (req, res) => {
      const range = ranges ? req.headers.range : null;
      let start = 0;
      let end = payload.length - 1;
      let status = 200;

      if (range) {
        const m = /bytes=(\d+)-(\d*)/.exec(range);
        if (m) {
          start = parseInt(m[1], 10);
          if (m[2]) end = parseInt(m[2], 10);
          status = 206;
        }
      }

      const headers = {
        'content-type': 'application/octet-stream',
        'accept-ranges': ranges && !chunked ? 'bytes' : 'none',
      };
      if (chunked) {
        // no content-length -> Transfer-Encoding: chunked
      } else {
        headers['content-length'] = end - start + 1;
        if (status === 206) headers['content-range'] = `bytes ${start}-${end}/${payload.length}`;
      }
      res.writeHead(status, headers);

      // Stream in throttled chunks
      let pos = start;
      const timer = setInterval(() => {
        if (pos > end) {
          clearInterval(timer);
          res.end();
          return;
        }
        const len = Math.min(CHUNK, end - pos + 1);
        res.write(payload.subarray(pos, pos + len));
        pos += len;
      }, THROTTLE_MS_PER_CHUNK);
      req.on('close', () => clearInterval(timer));
    });
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

function waitFor(manager, id, predicate, timeoutMs = 30000) {
  return new Promise((resolve, reject) => {
    const t0 = Date.now();
    const timer = setInterval(() => {
      const task = manager.tasks.get(id);
      if (!task) {
        clearInterval(timer);
        return reject(new Error('task disappeared'));
      }
      if (predicate(task)) {
        clearInterval(timer);
        return resolve(task);
      }
      if (Date.now() - t0 > timeoutMs) {
        clearInterval(timer);
        reject(new Error(`timeout waiting (status=${task.status}, got=${task.downloaded}/${task.size})`));
      }
    }, 100);
  });
}

async function main() {
  const payload = makePatternFile(FILE_SIZE);
  const expectedHash = sha256(payload);

  const tmpRoot = await fsp.mkdtemp(path.join(os.tmpdir(), 'da-test-'));

  console.log('── starting throttled test servers');
  const rangeServer = await startFileServer(payload, true);
  const noRangeServer = await startFileServer(payload, false);
  const chunkedServer = await startFileServer(payload, false, true);
  const rangePort = rangeServer.address().port;
  const noRangePort = noRangeServer.address().port;
  const chunkedPort = chunkedServer.address().port;

  const manager = new DownloadManager({
    downloadsDir: path.join(tmpRoot, 'downloads'),
    dataDir: path.join(tmpRoot, 'data'),
    maxActive: 2,
    defaultSegments: 8,
  });

  try {
    /* ---------- 1. multi-segment integrity ---------- */
    console.log('\n[1] multi-segment download (8 segments)');
    const id1 = manager.add({ url: `http://127.0.0.1:${rangePort}/file.bin`, filename: 'multi.bin', segments: 8 });
    const t1 = await waitFor(manager, id1, (t) => t.status === 'completed' || t.status === 'error');
    check('completes', t1.status === 'completed', t1.error);
    check('uses 8 segments', t1.segments.length === 8, `got ${t1.segments.length}`);
    check('all segments done', t1.segments.every((s) => s.status === 'done'));
    const f1 = await fsp.readFile(t1.savePath);
    check('sha256 matches source', sha256(f1) === expectedHash);

    /* ---------- 2. pause / resume ---------- */
    console.log('\n[2] pause / resume mid-download');
    const id2 = manager.add({ url: `http://127.0.0.1:${rangePort}/file2.bin`, filename: 'pause.bin', segments: 4 });
    await waitFor(manager, id2, (t) => t.downloaded > FILE_SIZE * 0.15 && t.status === 'downloading', 20000);
    manager.pause(id2);
    const t2 = manager.tasks.get(id2);
    check('pause switches status', t2.status === 'paused');
    const pausedBytes = t2.downloaded;
    check('partial progress kept', pausedBytes > 0 && pausedBytes < FILE_SIZE, `got ${pausedBytes}`);
    await new Promise((r) => setTimeout(r, 800));
    check('no data while paused', manager.tasks.get(id2).downloaded === pausedBytes);
    check('.part file exists', fs.existsSync(t2.partPath));

    manager.resume(id2);
    check('resume re-queues', ['queued', 'downloading', 'probing'].includes(manager.tasks.get(id2).status));
    const t2b = await waitFor(manager, id2, (t) => t.status === 'completed' || t.status === 'error', 30000);
    check('resumes to completion', t2b.status === 'completed', t2b.error);
    check('continues from offset (no restart)', t2b.downloaded === FILE_SIZE);
    const f2 = await fsp.readFile(t2b.savePath);
    check('sha256 matches source after resume', sha256(f2) === expectedHash);

    /* ---------- 3. no-range fallback (single stream) ---------- */
    console.log('\n[3] no-range server fallback');
    const id3 = manager.add({ url: `http://127.0.0.1:${noRangePort}/file3.bin`, filename: 'norange.bin', segments: 8 });
    const t3 = await waitFor(manager, id3, (t) => t.status === 'completed' || t.status === 'error', 40000);
    check('completes via single stream', t3.status === 'completed', t3.error);
    check('falls back to 1 connection', t3.segments.length === 1, `got ${t3.segments.length}`);
    const f3 = await fsp.readFile(t3.savePath);
    check('sha256 matches source', sha256(f3) === expectedHash);

    /* ---------- 3b. unknown size (no content-length) ---------- */
    console.log('\n[3b] unknown-size server (chunked, no content-length)');
    const id3b = manager.add({ url: `http://127.0.0.1:${chunkedPort}/file3b.bin`, filename: 'chunked.bin', segments: 8 });
    const t3b = await waitFor(manager, id3b, (t) => t.status === 'completed' || t.status === 'error', 40000);
    check('completes via single stream', t3b.status === 'completed', t3b.error);
    check('reads exactly one pass (no dupes)', t3b.downloaded === FILE_SIZE, `got ${t3b.downloaded}`);
    const f3b = await fsp.readFile(t3b.savePath);
    check('sha256 matches source', sha256(f3b) === expectedHash);

    /* ---------- 4. queue promotion (maxActive=2) ---------- */
    console.log('\n[4] queue promotion with maxActive=2');
    const ids = [];
    for (let i = 0; i < 3; i++) {
      ids.push(manager.add({ url: `http://127.0.0.1:${rangePort}/q${i}.bin`, filename: `q${i}.bin`, segments: 2 }));
    }
    await new Promise((r) => setTimeout(r, 300));
    const statuses = ids.map((id) => manager.tasks.get(id).status);
    const activeCount = statuses.filter((s) => s === 'downloading' || s === 'probing').length;
    check('only 2 run at once', activeCount <= 2, `statuses=${statuses}`);
    check('one is queued', statuses.includes('queued'));
    await Promise.all(ids.map((id) => waitFor(manager, id, (t) => t.status === 'completed' || t.status === 'error', 60000)));
    check('all queued downloads finish', ids.every((id) => manager.tasks.get(id).status === 'completed'));

    /* ---------- 5. cancel removes + cleans up ---------- */
    console.log('\n[5] cancel cleanup');
    const id5 = manager.add({ url: `http://127.0.0.1:${rangePort}/c.bin`, filename: 'cancel-me.bin', segments: 2 });
    await waitFor(manager, id5, (t) => t.downloaded > 0, 20000);
    const t5 = manager.tasks.get(id5);
    const part5 = t5.partPath;
    manager.cancel(id5);
    check('task removed', !manager.tasks.has(id5));
    await new Promise((r) => setTimeout(r, 300));
    check('.part deleted', !fs.existsSync(part5));
  } finally {
    await manager.shutdown();
    rangeServer.close();
    noRangeServer.close();
    chunkedServer.close();
    await fsp.rm(tmpRoot, { recursive: true, force: true });
  }

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
}

main().catch((err) => {
  console.error('TEST HARNESS ERROR:', err);
  process.exit(1);
});
