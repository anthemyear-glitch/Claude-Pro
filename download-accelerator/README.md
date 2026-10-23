# ⚡ Download Accelerator

A **multi-segment download accelerator** — the same core idea as Internet Download Manager (IDM) and Free Download Manager: split every file into byte-range segments and download them **in parallel**, then reassemble the file. Big files can come down several times faster than a single connection allows.

Built with **zero dependencies** (plain Node.js ≥ 18) with a live web dashboard.

![tech](https://img.shields.io/badge/node-%3E%3D18-brightgreen) ![deps](https://img.shields.io/badge/dependencies-0-blue)

---

## Features

| Feature | Description |
| --- | --- |
| 🚀 **Multi-segment downloads** | Files are split into up to 16 parallel byte-range connections |
| ⏯️ **Pause / Resume** | Pause anytime; resume continues from exact per-segment offsets (survives restarts) |
| 📊 **Live dashboard** | Real-time total & per-segment speed, progress, ETA, and a speed sparkline |
| 🎛️ **Queue manager** | Configurable max simultaneous downloads; the rest wait in queue |
| 🔁 **Retries** | Failed segments retry with exponential backoff (3 attempts each) |
| 🧩 **Smart fallback** | Servers without `Range` support (or without `Content-Length`) automatically drop to one connection |
| 💾 **Crash-safe state** | Download state is persisted to disk; interrupted downloads resume after a restart |
| 📂 **Safe file handling** | Atomic `.part` → final rename, filename sanitizing, duplicate-name handling |
| 🌐 **Any http(s) URL** | Works with direct file links (npm, PyPI, GitHub releases, CDNs, …) |

## Quick start

```bash
cd download-accelerator
npm start          # or: node start.js
```

Open **http://localhost:3000**, paste a file URL, pick a segment count, and hit **Download**.

Completed files land in `download-accelerator/downloads/`.

> `start.js` re-execs the server with the system CA bundle when one exists, so downloads work behind TLS-inspecting proxies too. `node server.js` works directly on machines without one.

## Using the dashboard

1. **Paste a URL** into the top field (optionally rename the file).
2. Choose **Segments** — more segments = more parallel connections (8 is a good default). Use more for big files on fast links; use 1–2 for slow servers.
3. Hit **Download**. Watch the per-segment strip light up as each range completes.
4. **Pause/Resume/Cancel** from each card. Completed items expose a **Save file** button.

Settings (gear icon): default segment count and max simultaneous downloads.

## Demo links

The dashboard offers sample links that work anywhere:

- `https://registry.npmjs.org/typescript/-/typescript-5.9.3.tgz` — range-capable, 8-way split
- `https://registry.npmjs.org/lodash/-/lodash-4.17.21.tgz` — small range-capable file
- `https://codeload.github.com/anthemyear-glitch/Claude-Pro/zip/refs/heads/master` — no range support → single-connection fallback

## API

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/downloads` | `{ "url", "filename?", "segments?" }` → add download |
| `GET` | `/api/downloads` | List all downloads + live stats |
| `POST` | `/api/downloads/:id/pause` | Pause |
| `POST` | `/api/downloads/:id/resume` | Resume |
| `DELETE` | `/api/downloads/:id` | Cancel & remove (deletes partial data) |
| `GET` | `/api/downloads/:id/file` | Download the finished file (`?inline=1` to preview) |
| `GET` | `/api/status` | Global speed + counts + settings |
| `POST` | `/api/settings` | `{ "defaultSegments?", "maxActive?" }` |

## Tests

A self-contained end-to-end suite spins up throttled local servers and verifies multi-segment integrity (SHA-256), pause/resume, no-range & unknown-size fallbacks, queue promotion, and cancel cleanup:

```bash
npm test
```

## How it works

```
                ┌────────────────────────────────────────────┐
   URL in ───►  │  probe: size? Range? filename?             │
                └───────────────┬────────────────────────────┘
                                ▼
        size known & Range: bytes supported?
           │ yes                                │ no
           ▼                                    ▼
   split into N segments              single connection
   [0-x][x-y]…[y-end]                 (stream to .part)
           │                                    │
           ▼                                    │
   N parallel Range requests                   │
   write chunks at exact offsets               │
           │                                    │
           └────────────►  all done?  ◄─────────┘
                               ▼
                   rename .part → final file
                   (atomic, SHA-exact)
```

Every segment tracks its own byte window; on resume each connection re-issues `Range: bytes=<start+done>-<end>`, so a paused download never re-fetches finished data.

## Project layout

```
download-accelerator/
├── server.js            # HTTP server: static UI + JSON API
├── start.js             # launcher (CA-bundle aware)
├── lib/engine.js        # download engine (segments, queue, persistence)
├── public/              # dashboard (index.html, style.css, app.js)
├── test/engine.test.js  # end-to-end test suite
├── downloads/           # finished files (gitignored)
└── data/state.json      # persisted download state (gitignored)
```

## Notes

- Only `http(s)` URLs are supported.
- Servers that ignore `Range` headers degrade gracefully to one connection — you still get the queue, pause/resume (restart), and tracking UI.
- Segment counts above the server's actual parallel-connection allowance may not help; 8 is a balanced default.
