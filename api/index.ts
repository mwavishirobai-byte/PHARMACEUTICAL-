import http from 'node:http';
import { createRequire } from 'node:module';

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
  // server.ts is bundled by the existing build into dist/server.cjs.
  // Keep process.cwd() unchanged so the production SPA can resolve /dist.
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
