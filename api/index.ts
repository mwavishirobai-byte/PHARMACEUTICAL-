import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

// Vercel's function filesystem is read-only except for /tmp. Keep the
// application's working directory unchanged so dist/index.html remains
// available, but redirect only the existing /data database directory.
const DATA_RUNTIME_DIR = '/tmp/gods-favor-pharmacy-data';
const originalExistsSync = fs.existsSync.bind(fs);
const originalMkdirSync = fs.mkdirSync.bind(fs);
const originalReadFileSync = fs.readFileSync.bind(fs);
const originalWriteFileSync = fs.writeFileSync.bind(fs);
const originalRenameSync = fs.renameSync.bind(fs);

function redirectDataPath(value: any): any {
  if (typeof value !== 'string') return value;
  const normalized = value.replace(/\\/g, '/');
  const marker = '/data/';
  const index = normalized.lastIndexOf(marker);
  if (index === -1) return value;
  return path.join(DATA_RUNTIME_DIR, normalized.slice(index + marker.length));
}

(fs as any).existsSync = (value: any) => originalExistsSync(redirectDataPath(value));
(fs as any).mkdirSync = (value: any, options?: any) => originalMkdirSync(redirectDataPath(value), options);
(fs as any).readFileSync = (value: any, options?: any) => originalReadFileSync(redirectDataPath(value), options);
(fs as any).writeFileSync = (value: any, data: any, options?: any) => originalWriteFileSync(redirectDataPath(value), data, options);
(fs as any).renameSync = (oldValue: any, newValue: any) => originalRenameSync(redirectDataPath(oldValue), redirectDataPath(newValue));

const originalListen = http.Server.prototype.listen;
let capturedServer: http.Server | undefined;

process.env.NODE_ENV = 'production';

http.Server.prototype.listen = function (...args: any[]) {
  capturedServer = this;
  const callback = args[args.length - 1];
  if (typeof callback === 'function') {
    args.pop();
    process.nextTick(callback);
  }
  return this;
} as typeof http.Server.prototype.listen;

try {
  const require = createRequire(import.meta.url);
  require('../dist/server.cjs');
} finally {
  http.Server.prototype.listen = originalListen;
}

if (!capturedServer) {
  throw new Error('Express server was not initialized.');
}

export default function handler(req: http.IncomingMessage, res: http.ServerResponse) {
  capturedServer!.emit('request', req, res);
}
