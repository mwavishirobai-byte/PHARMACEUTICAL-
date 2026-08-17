import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import express from 'express';

// Vercel functions have a writable /tmp filesystem, while the existing
// pharmacy JSON database uses <project>/data. Redirect only that database
// directory to /tmp so the existing backend can boot without changing its
// data model or route logic.
const originalFs = {
  existsSync: fs.existsSync,
  mkdirSync: fs.mkdirSync,
  readFileSync: fs.readFileSync,
  writeFileSync: fs.writeFileSync,
  renameSync: fs.renameSync,
};

const VERCEL_DATA_DIR = '/tmp/gods-favor-pharmacy-data';

function redirectDataPath(value: any): any {
  if (typeof value !== 'string') return value;
  const normalized = path.posix.normalize(value.replace(/\\/g, '/'));
  const marker = '/data/';
  const index = normalized.indexOf(marker);
  if (index === -1) return value;
  return path.join(VERCEL_DATA_DIR, normalized.slice(index + marker.length));
}

(fs as any).existsSync = (value: any) => originalFs.existsSync(redirectDataPath(value));
(fs as any).mkdirSync = (value: any, options?: any) => originalFs.mkdirSync(redirectDataPath(value), options);
(fs as any).readFileSync = (value: any, ...args: any[]) => originalFs.readFileSync(redirectDataPath(value), ...args);
(fs as any).writeFileSync = (value: any, ...args: any[]) => originalFs.writeFileSync(redirectDataPath(value), ...args);
(fs as any).renameSync = (oldValue: any, newValue: any) => originalFs.renameSync(redirectDataPath(oldValue), redirectDataPath(newValue));

// The existing server uses Express 4-style `app.get('*', ...)`. Express 5
// rejects that pattern during startup. Skip only that SPA fallback inside
// the API function; Vercel serves the frontend separately.
const originalGet = express.application.get;
express.application.get = function (...args: any[]) {
  if (args[0] === '*') return this;
  return originalGet.apply(this, args as any);
} as typeof express.application.get;

let capturedServer: http.Server | undefined;
const originalListen = http.Server.prototype.listen;
http.Server.prototype.listen = function (...args: any[]) {
  capturedServer = this;
  const last = args[args.length - 1];
  if (typeof last === 'function') {
    args.pop();
    process.nextTick(last);
  }
  return this;
} as typeof http.Server.prototype.listen;

try {
  await import('../server');
} finally {
  http.Server.prototype.listen = originalListen;
  express.application.get = originalGet;
}

if (!capturedServer) {
  throw new Error('Express server was not initialized.');
}

export default function handler(req: http.IncomingMessage, res: http.ServerResponse) {
  capturedServer!.emit('request', req, res);
}
