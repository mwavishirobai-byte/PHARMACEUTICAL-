import express from 'express';

let app: express.Express | undefined;

const originalCwd = process.cwd();
process.chdir('/tmp');

const originalListen = express.application.listen;
express.application.listen = function (..._args: any[]) {
  app = this as express.Express;
  return {} as any;
};

try {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is required for the serverless API. Configure it in Vercel Environment Variables.');
  }

  await import('../server');
} finally {
  express.application.listen = originalListen;
  process.chdir(originalCwd);
}

if (!app) {
  throw new Error('Express application failed to initialize.');
}

export default function handler(req: any, res: any) {
  return app!(req, res);
}
