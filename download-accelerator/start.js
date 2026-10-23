#!/usr/bin/env node
'use strict';

/**
 * Launcher: re-executes server.js with the system CA bundle when one exists,
 * so downloads work behind TLS-intercepting proxies (corporate / sandbox).
 * If NODE_EXTRA_CA_CERTS is already set, or no bundle is found, just run the
 * server in-process.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const BUNDLES = [
  '/etc/ssl/certs/ca-certificates.crt', // Debian / Ubuntu
  '/etc/pki/tls/certs/ca-bundle.crt', // RHEL / Fedora
  '/etc/ssl/cert.pem', // Alpine / some macOS
];

const SERVER = path.join(__dirname, 'server.js');

if (process.env.NODE_EXTRA_CA_CERTS) {
  require(SERVER);
} else {
  const bundle = BUNDLES.find((p) => fs.existsSync(p));
  if (!bundle) {
    require(SERVER);
  } else {
    const child = spawn(process.execPath, [SERVER], {
      stdio: 'inherit',
      env: { ...process.env, NODE_EXTRA_CA_CERTS: bundle },
    });
    for (const sig of ['SIGINT', 'SIGTERM']) {
      process.on(sig, () => child.kill(sig));
    }
    child.on('exit', (code, signal) => {
      if (signal) {
        process.kill(process.pid, signal);
      } else {
        process.exit(code ?? 0);
      }
    });
  }
}
