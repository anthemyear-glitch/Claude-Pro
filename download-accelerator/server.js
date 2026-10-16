'use strict';

/**
 * Download Accelerator — zero-dependency Node server.
 * Serves the dashboard UI and a JSON API that drives the download engine.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { DownloadManager } = require('./lib/engine');

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const PUBLIC_DIR = path.join(__dirname, 'public');

const manager = new DownloadManager({
  downloadsDir: path.join(__dirname, 'downloads'),
  dataDir: path.join(__dirname, 'data'),
});

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.json': 'application/json; charset=utf-8',
};

const INLINE_TYPES = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.pdf', '.txt', '.md', '.json', '.mp4', '.webm', '.mp3']);

const STATIC_FILES = {
  '/': 'index.html',
  '/index.html': 'index.html',
  '/style.css': 'style.css',
  '/app.js': 'app.js',
  '/favicon.svg': 'favicon.svg',
};

function sendJSON(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'access-control-allow-origin': '*',
  });
  res.end(body);
}

function readBody(req, limit = 64 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (c) => {
      size += c.length;
      if (size > limit) {
        reject(new Error('Body too large'));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => {
      if (!chunks.length) return resolve({});
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function notFound(res) {
  sendJSON(res, 404, { error: 'Not found' });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const p = url.pathname;

  try {
    const isRead = req.method === 'GET' || req.method === 'HEAD';

    /* ---------- static UI ---------- */
    if (isRead && p in STATIC_FILES) {
      const file = path.join(PUBLIC_DIR, STATIC_FILES[p]);
      const data = await fs.promises.readFile(file);
      res.writeHead(200, {
        'content-type': MIME[path.extname(file)] || 'application/octet-stream',
        'content-length': data.length,
        'cache-control': 'no-cache',
      });
      res.end(req.method === 'HEAD' ? undefined : data);
      return;
    }

    /* ---------- API ---------- */
    if (p === '/api/status' && req.method === 'GET') {
      const snap = manager.snapshot();
      const counts = { active: 0, queued: 0, completed: 0, error: 0, paused: 0 };
      for (const d of snap.downloads) {
        if (d.status === 'downloading' || d.status === 'probing') counts.active++;
        else if (d.status === 'queued') counts.queued++;
        else if (d.status === 'completed') counts.completed++;
        else if (d.status === 'error') counts.error++;
        else if (d.status === 'paused') counts.paused++;
      }
      sendJSON(res, 200, { globalSpeed: snap.globalSpeed, counts, settings: snap.settings });
      return;
    }

    if (p === '/api/downloads' && req.method === 'GET') {
      sendJSON(res, 200, manager.snapshot());
      return;
    }

    if (p === '/api/downloads' && req.method === 'POST') {
      const body = await readBody(req);
      if (!body.url) return sendJSON(res, 400, { error: 'url is required' });
      const id = manager.add({
        url: body.url,
        filename: body.filename || null,
        segments: body.segments != null ? body.segments : null,
      });
      sendJSON(res, 201, { id });
      return;
    }

    if (p === '/api/settings' && req.method === 'POST') {
      const body = await readBody(req);
      sendJSON(res, 200, manager.updateSettings(body));
      return;
    }

    let m = /^\/api\/downloads\/([a-f0-9]+)$/.exec(p);
    if (m && req.method === 'DELETE') {
      manager.cancel(m[1]);
      sendJSON(res, 200, { ok: true });
      return;
    }

    m = /^\/api\/downloads\/([a-f0-9]+)\/(pause|resume)$/.exec(p);
    if (m && req.method === 'POST') {
      const task = m[2] === 'pause' ? manager.pause(m[1]) : manager.resume(m[1]);
      sendJSON(res, 200, manager._public(task));
      return;
    }

    m = /^\/api\/downloads\/([a-f0-9]+)\/file$/.exec(p);
    if (m && isRead) {
      const task = manager.tasks.get(m[1]);
      if (!task || task.status !== 'completed' || !task.savePath) return notFound(res);
      const stat = await fs.promises.stat(task.savePath).catch(() => null);
      if (!stat) return notFound(res);
      const ext = path.extname(task.filename || '').toLowerCase();
      const inline = url.searchParams.get('inline') === '1' && INLINE_TYPES.has(ext);
      res.writeHead(200, {
        'content-type': MIME[ext] || 'application/octet-stream',
        'content-length': stat.size,
        'content-disposition': `${inline ? 'inline' : 'attachment'}; filename="${encodeURIComponent(task.filename)}"`,
        'cache-control': 'private, max-age=3600',
      });
      if (req.method === 'HEAD') return res.end();
      fs.createReadStream(task.savePath).pipe(res);
      return;
    }

    notFound(res);
  } catch (err) {
    const code = err.status || 500;
    if (!res.headersSent) sendJSON(res, code, { error: err.message || String(err) });
  }
});

manager.loadState().then(() => {
  server.listen(PORT, HOST, () => {
    console.log(`⚡ Download Accelerator running at http://${HOST}:${PORT}`);
    console.log(`   Downloads folder: ${manager.downloadsDir}`);
  });
});

for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, async () => {
    console.log('\nSaving state and shutting down…');
    await manager.shutdown();
    server.close();
    process.exit(0);
  });
}
