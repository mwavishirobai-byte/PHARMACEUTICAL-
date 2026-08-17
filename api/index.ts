import http from 'node:http';
import express from 'express';

// The existing Express server was written for a long-running Node process.
// Vercel invokes it as a Serverless Function. Capture listen() so no TCP
// socket is opened, and ignore the production SPA catch-all route because
// Vercel serves the built frontend separately.
let capturedServer: http.Server | undefined;
const originalListen = http.Server.prototype.listen;
const originalGet = express.application.get;

http.Server.prototype.listen = function (...args: any[]) {
  capturedServer = this;
  const last = args[args.length - 1];
  if (typeof last === 'function') {
    args.pop();
    process.nextTick(last);
  }
  return this;
} as typeof http.Server.prototype.listen;

// Express 5 rejects the legacy app.get('*', ...) syntax with a
// path-to-regexp error. That route only serves the SPA fallback and is not
// needed inside this API function, so skip only that one route.
express.application.get = function (...args: any[]) {
  if (args[0] === '*') {
    return this;
  }
  return originalGet.apply(this, args as any);
} as typeof express.application.get;

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
