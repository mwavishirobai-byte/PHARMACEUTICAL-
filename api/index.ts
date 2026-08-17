import express from 'express';

let capturedApp: express.Express | undefined;

// The existing server.ts starts its Express app with app.listen().
// Vercel needs the Express application itself instead of a listening port.
// Capture the app during module initialization without opening a local port.
const originalListen = express.application.listen;
express.application.listen = function (..._args: any[]) {
  capturedApp = this as express.Express;
  return {} as any;
};

await import('../server');

express.application.listen = originalListen;

if (!capturedApp) {
  throw new Error('Express application failed to initialize.');
}

export default capturedApp;
