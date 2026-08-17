import http from 'node:http';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const runtimeRoot = '/tmp/gods-favor-pharmacy';
fs.mkdirSync(runtimeRoot, { recursive: true });

const originalCwd = process.cwd;
const originalListen = http.Server.prototype.listen;
let capturedServer: http.Server | undefined;

process.env.NODE_ENV = 'production';
process.cwd = () => runtimeRoot;

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
  // The normal build creates dist/server.cjs. Load that CommonJS bundle so
  // Node never attempts the unsupported ESM directory import of ../server.
  const require = createRequire(import.meta.url);
  require('../dist/server.cjs');
} finally {
  http.Server.prototype.listen = originalListen;
  process.cwd = originalCwd;
}

if (!capturedServer) {
  throw new Error('Express server was not initialized.');
}

export default function handler(req: http.IncomingMessage, res: http.ServerResponse) {
  capturedServer!.emit('request', req, res);
}
