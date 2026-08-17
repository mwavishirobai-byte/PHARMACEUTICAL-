import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';

let app: express.Express | undefined;

const originalListen = express.application.listen;
express.application.listen = function (..._args: any[]) {
  app = this as express.Express;
  return {} as any;
};

try {
  await import('../server');
} finally {
  express.application.listen = originalListen;
}

if (!app) {
  throw new Error('Express application failed to initialize.');
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  return app!(req, res);
}
