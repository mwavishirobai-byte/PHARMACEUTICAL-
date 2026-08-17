import http from 'node:http';
import express from 'express';

const originalGet = express.application.get;
express.application.get = function (...args: any[]) {
  if (args[0] === '*') return this;
  return originalGet.apply(this, args as any);
} as typeof express.application.get;

let capturedServer: http.Server | undefined;
const originalListen = http.Server.prototype.listen;
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
  // The existing build produces dist/server.cjs. Loading that compiled
  // CommonJS entrypoint avoids Vercel's ESM directory-resolution failure.
  await import('../dist/server.cjs');
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
