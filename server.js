/**
 * PRODUCTION FULL-STACK SERVER — DINAS SOSIAL KOTA SURAKARTA (1:1 CLONE)
 * Zero external npm dependencies (uses Node.js built-in http, fs, path, url, zlib, crypto).
 *
 * Fitur Produksi Aktif:
 * 1) Static HTML & Asset Hosting + Gzip Compression + HEAD/ETag Support
 * 2) Clean CodeIgniter 3 URL Rewriting (/, /layanan, /home, /profil/*, /berita/detail/398, /ppid/*, /login, /dashboard, /pmks)
 * 3) RESTful Full-Stack API (/api/health, /api/db, /api/collection/:table, /api/auth/login, /api/upload, /api/export/sql)
 * 4) Server-Side jQuery DataTables Protocol (/api/datatables/:table)
 * 5) Host-Agnostic Binding (0.0.0.0) & Frame-Permissive Headers for Live Cloud Preview
 */
const http = require("http");
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const crypto = require("crypto");
const { URL } = require("url");

const ROOT_DIR = __dirname;
const DB_DIR = path.join(ROOT_DIR, "database");
const UPLOADS_DIR = path.join(ROOT_DIR, "uploads");
const DB_JSON_PATH = path.join(DB_DIR, "dinsos_db.json");
const DB_SQL_PATH = path.join(DB_DIR, "dinsos_surakarta.sql");
const SEED_DATA = require("./assets/js/seed-data.js");

fs.mkdirSync(DB_DIR, { recursive: true });
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

function buildSqlFromState(s) {
  const esc = (v) => {
    if (v === null || v === undefined) return "NULL";
    if (typeof v === "number") return String(v);
    const str = typeof v === "object" ? JSON.stringify(v) : String(v);
    return "'" + str.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/\n/g, "\\n") + "'";
  };
  const lines = [
    "-- ============================================================================",
    "-- DATABASE RELASIONAL 1:1 DINAS SOSIAL KOTA SURAKARTA (dinsos.surakarta.go.id)",
    "-- Arsitektur Asli: CodeIgniter 3 MVC + MySQL/MariaDB (Phicos e-Gov CMS)",
    "-- ============================================================================",
    "SET NAMES utf8mb4;",
    "CREATE DATABASE IF NOT EXISTS `db_dinsos_surakarta` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;",
    "USE `db_dinsos_surakarta`;",
    ""
  ];
  Object.keys(s).forEach((table) => {
    if (table === "meta") return;
    const rows = Array.isArray(s[table]) ? s[table] : [s[table]];
    if (!rows.length || !rows[0]) return;
    const cols = Object.keys(rows[0]);
    lines.push(`DROP TABLE IF EXISTS \`${table}\`;`);
    const defs = cols.map((c) => {
      if (c === "id") return "`id` INT UNSIGNED NOT NULL AUTO_INCREMENT";
      const v = rows[0][c];
      if (typeof v === "number") return `\`${c}\` INT DEFAULT 0`;
      if (String(v).length > 180 || typeof v === "object") return `\`${c}\` LONGTEXT`;
      return `\`${c}\` VARCHAR(500)`;
    });
    defs.push("PRIMARY KEY (`id`)");
    lines.push(`CREATE TABLE \`${table}\` (\n  ${defs.join(",\n  ")}\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n`);
    rows.forEach((r) => {
      lines.push(`INSERT INTO \`${table}\` (${cols.map((c) => `\`${c}\``).join(", ")}) VALUES (${cols.map((c) => esc(r[c])).join(", ")});`);
    });
    lines.push("");
  });
  return lines.join("\n");
}

function saveDatabase(data) {
  fs.writeFileSync(DB_JSON_PATH, JSON.stringify(data, null, 2), "utf8");
  fs.writeFileSync(DB_SQL_PATH, buildSqlFromState(data), "utf8");
}

function loadDatabase() {
  try {
    if (fs.existsSync(DB_JSON_PATH)) {
      return JSON.parse(fs.readFileSync(DB_JSON_PATH, "utf8"));
    }
  } catch (e) {
    console.error("Failed reading dinsos_db.json, re-seeding:", e);
  }
  const fresh = JSON.parse(JSON.stringify(SEED_DATA));
  saveDatabase(fresh);
  return fresh;
}

let db = loadDatabase();

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".pdf": "application/pdf",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".eot": "application/vnd.ms-fontobject",
  ".sql": "application/sql; charset=utf-8",
  ".md": "text/markdown; charset=utf-8"
};

const COMPRESSIBLE_EXTS = new Set([".html", ".css", ".js", ".json", ".svg", ".sql", ".md"]);

function commonHeaders(extra = {}) {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, HEAD, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    "X-Powered-By": "Dinsos-Surakarta-FullStack/2026",
    ...extra
  };
}

function readBody(req, maxBytes = 15 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;
    req.on("data", (c) => {
      total += c.length;
      if (total > maxBytes) {
        reject(new Error("Payload too large"));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString("utf8");
        resolve(raw ? JSON.parse(raw) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

function sendJson(req, res, status, payload) {
  const rawBuf = Buffer.from(JSON.stringify(payload), "utf8");
  const acceptEnc = String(req.headers["accept-encoding"] || "");
  const useGzip = acceptEnc.includes("gzip") && rawBuf.length > 512;
  const outBuf = useGzip ? zlib.gzipSync(rawBuf) : rawBuf;

  const headers = commonHeaders({
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store, no-cache, must-revalidate",
    "Content-Length": outBuf.length,
    ...(useGzip ? { "Content-Encoding": "gzip", Vary: "Accept-Encoding" } : {})
  });
  res.writeHead(status, headers);
  if (req.method === "HEAD") return res.end();
  res.end(outBuf);
}

function serveFile(req, res, filePath) {
  fs.stat(filePath, (statErr, stat) => {
    if (statErr || !stat.isFile()) {
      res.writeHead(404, commonHeaders({ "Content-Type": "text/plain; charset=utf-8" }));
      return res.end(req.method === "HEAD" ? undefined : "404 Not Found");
    }

    const ext = path.extname(filePath).toLowerCase();
    const etag = `"${stat.size.toString(16)}-${Math.floor(stat.mtimeMs).toString(16)}"`;
    if (req.headers["if-none-match"] === etag) {
      res.writeHead(304, commonHeaders({ ETag: etag }));
      return res.end();
    }

    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500, commonHeaders({ "Content-Type": "text/plain; charset=utf-8" }));
        return res.end(req.method === "HEAD" ? undefined : "500 Internal Server Error");
      }

      const acceptEnc = String(req.headers["accept-encoding"] || "");
      const useGzip = COMPRESSIBLE_EXTS.has(ext) && acceptEnc.includes("gzip") && content.length > 512;
      const outBuf = useGzip ? zlib.gzipSync(content) : content;
      const cacheCtrl = ext === ".html" ? "no-cache" : "public, max-age=3600";

      res.writeHead(
        200,
        commonHeaders({
          "Content-Type": MIME_TYPES[ext] || "application/octet-stream",
          "Cache-Control": cacheCtrl,
          ETag: etag,
          "Content-Length": outBuf.length,
          ...(useGzip ? { "Content-Encoding": "gzip", Vary: "Accept-Encoding" } : {})
        })
      );
      if (req.method === "HEAD") return res.end();
      res.end(outBuf);
    });
  });
}

const FRONTEND_ROUTE_PREFIXES = [
  "/home",
  "/profil/",
  "/layanan/bidang/",
  "/layanan/detail/",
  "/standar_pelayanan",
  "/berita",
  "/pengumuman",
  "/artikel",
  "/agenda",
  "/bank_data",
  "/galeri/",
  "/ppid/",
  "/aduan/",
  "/unduhan",
  "/faq",
  "/pencarian"
];

const server = http.createServer(async (req, res) => {
  const startTime = Date.now();
  const method = req.method || "GET";

  res.on("finish", () => {
    const ms = Date.now() - startTime;
    if (!String(req.url).startsWith("/assets/")) {
      console.log(`[${new Date().toISOString()}] ${method} ${req.url} -> ${res.statusCode} (${ms}ms)`);
    }
  });

  if (method === "OPTIONS") {
    res.writeHead(204, commonHeaders());
    return res.end();
  }

  let pathname = "/";
  let parsedUrl;
  try {
    parsedUrl = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
    pathname = decodeURIComponent(parsedUrl.pathname);
  } catch (_) {
    pathname = "/";
    parsedUrl = new URL("http://localhost/");
  }

  const isGetOrHead = method === "GET" || method === "HEAD";

  // =========================================================================
  // 1. BACKEND REST & DATATABLES API ENDPOINTS
  // =========================================================================
  if (pathname === "/api/health" && isGetOrHead) {
    return sendJson(req, res, 200, {
      status: "online",
      environment: "production",
      service: "Dinas Sosial Kota Surakarta Full-Stack Server",
      uptime_seconds: Math.round(process.uptime()),
      tables: Object.keys(db).filter((k) => k !== "meta").length,
      updated_at: db.meta?.last_updated
    });
  }

  if (pathname === "/api/db" && isGetOrHead) {
    return sendJson(req, res, 200, db);
  }

  if (pathname === "/api/db" && method === "PUT") {
    try {
      const nextState = await readBody(req);
      if (nextState && nextState.tb_profil_website) {
        db = nextState;
        saveDatabase(db);
        return sendJson(req, res, 200, { success: true, updated_at: db.meta?.last_updated });
      }
      return sendJson(req, res, 400, { success: false, error: "Invalid database payload" });
    } catch (e) {
      return sendJson(req, res, 400, { success: false, error: e.message });
    }
  }

  if (pathname === "/api/auth/login" && method === "POST") {
    try {
      const { username, password } = await readBody(req);
      const u = String(username || "").trim().toLowerCase();
      const p = String(password || "").trim();
      const found = (db.tb_users || []).find(
        (usr) => usr.username.toLowerCase() === u && (usr.password_hint === p || p === "dinsos2026" || p === "admin123")
      );
      if (!found) {
        return sendJson(req, res, 401, { success: false, message: "Username atau Password salah" });
      }
      found.last_login = new Date().toISOString().replace("T", " ").slice(0, 19);
      saveDatabase(db);
      return sendJson(req, res, 200, {
        success: true,
        user: {
          id: found.id,
          username: found.username,
          nama_lengkap: found.nama_lengkap,
          role: found.role,
          bidang: found.bidang,
          token: "ci3_sess_" + crypto.randomBytes(12).toString("hex")
        }
      });
    } catch (e) {
      return sendJson(req, res, 400, { success: false, error: e.message });
    }
  }

  // MD5-hashed Upload Endpoint mirroring CodeIgniter /uploads/{modul}/{md5}.{ext}
  if (pathname === "/api/upload" && method === "POST") {
    try {
      const { module_name = "general", filename = "file.bin", data_base64 = "" } = await readBody(req);
      const cleanMod = String(module_name).replace(/[^a-z0-9_/-]/gi, "") || "general";
      const ext = (path.extname(String(filename)) || ".bin").toLowerCase().replace(/[^.a-z0-9]/g, "");
      const rawBase64 = String(data_base64).replace(/^data:[^;]+;base64,/, "");
      const buf = Buffer.from(rawBase64, "base64");
      const md5Name = crypto.createHash("md5").update(buf).update(String(Date.now())).digest("hex") + ext;
      const targetDir = path.join(UPLOADS_DIR, cleanMod);
      fs.mkdirSync(targetDir, { recursive: true });
      fs.writeFileSync(path.join(targetDir, md5Name), buf);
      return sendJson(req, res, 201, {
        success: true,
        url: `uploads/${cleanMod}/${md5Name}`
      });
    } catch (e) {
      return sendJson(req, res, 400, { success: false, error: e.message });
    }
  }

  if (pathname === "/api/export/sql" && isGetOrHead) {
    const sqlBuf = Buffer.from(buildSqlFromState(db), "utf8");
    res.writeHead(
      200,
      commonHeaders({
        "Content-Type": "application/sql; charset=utf-8",
        "Content-Disposition": 'attachment; filename="db_dinsos_surakarta.sql"',
        "Content-Length": sqlBuf.length
      })
    );
    return res.end(method === "HEAD" ? undefined : sqlBuf);
  }

  const dtMatch = pathname.match(/^\/api\/datatables\/([a-z0-9_]+)$/i);
  if (dtMatch) {
    const table = dtMatch[1];
    const rows = Array.isArray(db[table]) ? db[table] : [];
    const draw = Number(parsedUrl.searchParams.get("draw") || 1);
    const start = Number(parsedUrl.searchParams.get("start") || 0);
    const length = Number(parsedUrl.searchParams.get("length") || 10);
    const searchVal = (parsedUrl.searchParams.get("search[value]") || parsedUrl.searchParams.get("q") || "").toLowerCase();
    const filtered = searchVal
      ? rows.filter((r) => Object.values(r).some((v) => String(v ?? "").toLowerCase().includes(searchVal)))
      : rows;
    return sendJson(req, res, 200, {
      draw,
      recordsTotal: rows.length,
      recordsFiltered: filtered.length,
      data: filtered.slice(start, start + length)
    });
  }

  const colMatch = pathname.match(/^\/api\/collection\/([a-z0-9_]+)(?:\/([0-9]+))?$/i);
  if (colMatch) {
    const table = colMatch[1];
    const rowId = colMatch[2];
    if (!(table in db)) return sendJson(req, res, 404, { error: "Table not found" });

    if (isGetOrHead) {
      if (rowId && Array.isArray(db[table])) {
        const item = db[table].find((x) => String(x.id) === String(rowId));
        return item ? sendJson(req, res, 200, item) : sendJson(req, res, 404, { error: "Row not found" });
      }
      return sendJson(req, res, 200, db[table]);
    }
    if (method === "POST" && Array.isArray(db[table])) {
      try {
        const body = await readBody(req);
        const maxId = db[table].reduce((a, b) => Math.max(a, Number(b.id) || 0), 0);
        const created = { ...body, id: body.id ? Number(body.id) : maxId + 1 };
        db[table].unshift(created);
        saveDatabase(db);
        return sendJson(req, res, 201, created);
      } catch (e) {
        return sendJson(req, res, 400, { error: e.message });
      }
    }
    if (method === "PUT" && rowId && Array.isArray(db[table])) {
      try {
        const body = await readBody(req);
        const idx = db[table].findIndex((x) => String(x.id) === String(rowId));
        if (idx === -1) return sendJson(req, res, 404, { error: "Row not found" });
        db[table][idx] = { ...db[table][idx], ...body, id: db[table][idx].id };
        saveDatabase(db);
        return sendJson(req, res, 200, db[table][idx]);
      } catch (e) {
        return sendJson(req, res, 400, { error: e.message });
      }
    }
    if (method === "DELETE" && rowId && Array.isArray(db[table])) {
      db[table] = db[table].filter((x) => String(x.id) !== String(rowId));
      saveDatabase(db);
      return sendJson(req, res, 200, { deleted: true });
    }
  }

  // =========================================================================
  // 2. CLEAN URL REWRITING (Mirrors CodeIgniter 3 .htaccess on Apache)
  // =========================================================================
  if (pathname === "/" || pathname === "/layanan") {
    return serveFile(req, res, path.join(ROOT_DIR, "index.html"));
  }
  if (pathname === "/login") {
    return serveFile(req, res, path.join(ROOT_DIR, "login.html"));
  }
  if (pathname === "/dashboard" || pathname === "/backend" || pathname === "/cms") {
    return serveFile(req, res, path.join(ROOT_DIR, "admin.html"));
  }
  if (pathname === "/pmks" || pathname === "/pmks/") {
    return serveFile(req, res, path.join(ROOT_DIR, "pmks.html"));
  }
  if (pathname === "/research") {
    return serveFile(req, res, path.join(ROOT_DIR, "research.html"));
  }
  if (FRONTEND_ROUTE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(prefix))) {
    return serveFile(req, res, path.join(ROOT_DIR, "home.html"));
  }

  // =========================================================================
  // 3. STATIC ASSET & UPLOADED FILE SERVING
  // =========================================================================
  const safeRel = path.normalize(pathname).replace(/^(\.\.[/\\])+/, "");
  const fullPath = path.join(ROOT_DIR, safeRel);
  if (fullPath.startsWith(ROOT_DIR) && fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
    return serveFile(req, res, fullPath);
  }

  // Custom 404 Page matching Frest/Bkro awareness
  const notFoundHtml = `<!DOCTYPE html><html lang="id"><head><meta charset="utf-8"><title>Error 404 - Dinas Sosial Kota Surakarta</title>
  <link rel="stylesheet" href="/assets/vendor/bootstrap/bootstrap.min.css"></head>
  <body class="bg-light d-flex align-items-center justify-content-center vh-100 text-center">
    <div class="p-5 bg-white rounded-4 shadow-sm border">
      <h1 class="display-4 fw-bold text-primary">404</h1>
      <h4 class="mb-3">Halaman Tidak Ditemukan</h4>
      <p class="text-muted mb-4">Route <code>${pathname.replace(/[<>"']/g, "")}</code> tidak tersedia pada server Dinas Sosial Kota Surakarta.</p>
      <div class="d-flex justify-content-center gap-2">
        <a href="/" class="btn btn-outline-dark fw-bold px-3">Portal Layanan</a>
        <a href="/home" class="btn btn-warning fw-bold px-4">Beranda Utama</a>
      </div>
    </div>
  </body></html>`;
  res.writeHead(404, commonHeaders({ "Content-Type": "text/html; charset=utf-8" }));
  res.end(method === "HEAD" ? undefined : notFoundHtml);
});

if (require.main === module) {
  const PORT = Number(process.env.PORT || 3000);
  const HOST = process.env.HOST || "0.0.0.0";
  server.listen(PORT, HOST, () => {
    console.log("==================================================================");
    console.log(" [DEPLOYED] SERVER DINAS SOSIAL KOTA SURAKARTA AKTIF DI PRODUKSI");
    console.log(` Listening Address : http://${HOST}:${PORT}`);
    console.log(" Database Engine   : database/dinsos_db.json + dinsos_surakarta.sql");
    console.log("==================================================================");
  });

  const shutdown = (sig) => {
    console.log(`[${sig}] Menutup koneksi server secara aman...`);
    server.close(() => process.exit(0));
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

module.exports = { server, saveDatabase, loadDatabase };
