import http from 'node:http';

// Vercel executes files under /api as Serverless Functions. The existing
// Express application currently calls app.listen(), so capture that server
// without opening a real TCP port and forward Vercel requests to it.
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

await import('../server.ts');

http.Server.prototype.listen = originalListen;

if (!capturedServer) {
  throw new Error('Express server was not initialized.');
}

export default function handler(req: http.IncomingMessage, res: http.ServerResponse) {
  capturedServer!.emit('request', req, res);
}
