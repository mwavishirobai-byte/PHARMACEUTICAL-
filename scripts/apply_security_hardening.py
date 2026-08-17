from pathlib import Path
import json
import re


def read(path: str) -> str:
    return Path(path).read_text()


def write(path: str, text: str) -> None:
    Path(path).write_text(text)


env = read('.env.example')
env = re.sub(r'^JWT_SECRET=.*$', 'JWT_SECRET=', env, flags=re.M)
if 'ADMIN_PASSWORD=' not in env:
    env += '\n# Server-side admin password used only to initialize the admin account.\nADMIN_PASSWORD=\n'
if 'PHARMACIST_PASSWORD=' not in env:
    env += '# Optional server-side pharmacist password. Leave empty to omit the seeded pharmacist account.\nPHARMACIST_PASSWORD=\n'
write('.env.example', env.rstrip() + '\n')

write('server/rateLimiter.ts', '''import type { NextFunction, Request, Response } from 'express';

interface RateLimitOptions {
  windowMs: number;
  max: number;
  key?: (req: Request) => string;
}

interface Bucket {
  count: number;
  resetAt: number;
}

export function createRateLimiter(options: RateLimitOptions) {
  const buckets = new Map<string, Bucket>();
  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    const key = options.key?.(req) || req.ip || req.socket.remoteAddress || 'unknown';
    const current = buckets.get(key);
    if (!current || current.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + options.windowMs });
      res.setHeader('X-RateLimit-Limit', options.max);
      return next();
    }
    if (current.count >= options.max) {
      const retryAfter = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
      res.setHeader('Retry-After', retryAfter);
      return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }
    current.count += 1;
    res.setHeader('X-RateLimit-Limit', options.max);
    next();
  };
}
''')

db = read('server/db.ts')
db = db.replace("const JWT_SECRET = process.env.JWT_SECRET || 'gods-favor-pharmacy-secure-secret-key-kitale-2026';", "const JWT_SECRET = process.env.JWT_SECRET;\nif (!JWT_SECRET || JWT_SECRET.length < 32) {\n  throw new Error('JWT_SECRET must be configured as a random server-side secret of at least 32 characters.');\n}")
db = db.replace("interface UserRecord extends User {\n  passwordHash: string;\n}", "interface UserRecord extends User {\n  passwordHash: string;\n  tokenVersion?: number;\n}")
db = re.sub(r"function getInitialDatabase\(\): DatabaseSchema \{.*?\n  return \{", '''function getInitialDatabase(): DatabaseSchema {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword || adminPassword.length < 12) {
    throw new Error('ADMIN_PASSWORD must be configured with at least 12 characters before the pharmacy database can initialize.');
  }
  const pharmacistPassword = process.env.PHARMACIST_PASSWORD;
  const now = new Date().toISOString();
  const initialUsers: UserRecord[] = [
    {
      id: 'usr-admin-01', fullName: 'Chief Pharmacist / Admin', phone: '07417758578',
      email: 'admin@godsfavorpharmacy.ke', address: 'Kijana Wamalwa Road, Kitale', role: 'admin',
      passwordHash: bcrypt.hashSync(adminPassword, 12), tokenVersion: 0, createdAt: now, updatedAt: now,
    },
    ...(pharmacistPassword ? [{
      id: 'usr-pharm-01', fullName: 'Clinical Pharmacist on Duty', phone: '07417758578',
      email: 'pharmacist@godsfavorpharmacy.ke', address: 'Kitale Town', role: 'pharmacist' as const,
      passwordHash: bcrypt.hashSync(pharmacistPassword, 12), tokenVersion: 0, createdAt: now, updatedAt: now,
    }] : []),
  ];

  return {''', db, count=1, flags=re.S)
db = db.replace("      if (!dbInstance!.users) dbInstance!.users = [];", "      if (!dbInstance!.users) dbInstance!.users = [];\n      dbInstance!.users = dbInstance!.users.map((user) => ({ ...user, tokenVersion: user.tokenVersion ?? 0 }));")
db = db.replace("    role: 'customer',\n    passwordHash,", "    role: 'customer',\n    passwordHash,\n    tokenVersion: 0,")
db = db.replace('''export function generateToken(user: User): string {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, fullName: user.fullName },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): { id: string; email: string; role: string; fullName: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string; fullName: string };
  } catch (err) {
    return null;
  }
}''', '''export function generateToken(user: User, tokenVersion = 0): string {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, fullName: user.fullName, tokenVersion },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): { id: string; email: string; role: string; fullName: string; tokenVersion?: number } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string; fullName: string; tokenVersion?: number };
    const db = loadDatabase();
    const user = db.users.find((candidate) => candidate.id === decoded.id);
    if (!user || (user.tokenVersion ?? 0) !== (decoded.tokenVersion ?? 0)) return null;
    return decoded;
  } catch (err) {
    return null;
  }
}

export function revokeUserTokens(userId: string): void {
  const db = loadDatabase();
  const user = db.users.find((candidate) => candidate.id === userId);
  if (!user) return;
  user.tokenVersion = (user.tokenVersion ?? 0) + 1;
  user.updatedAt = new Date().toISOString();
  saveDatabase();
}''')
db = db.replace("  const token = generateToken(safe);\n  return { user: safe, token };", "  const token = generateToken(safe, newUser.tokenVersion ?? 0);\n  return { user: safe, token };", 1)
db = db.replace("  const token = generateToken(safe);\n  return { user: safe, token };", "  const token = generateToken(safe, user.tokenVersion ?? 0);\n  return { user: safe, token };", 1)
db = db.replace("const orderNumber = `GFP-2026-${randomDigits}`;", "const orderNumber = `GFP-${new Date().getFullYear()}-${randomDigits}`;")
db = db.replace("const prescriptionNumber = `RX-2026-${randomDigits}`;", "const prescriptionNumber = `RX-${new Date().getFullYear()}-${randomDigits}`;")
db = db.replace("const appointmentNumber = `APT-2026-${randomDigits}`;", "const appointmentNumber = `APT-${new Date().getFullYear()}-${randomDigits}`;")
write('server/db.ts', db)

server = read('server.ts')
if "import { createRateLimiter } from './server/rateLimiter';" not in server:
    server = server.replace("import { UserRole } from './src/types';", "import { UserRole } from './src/types';\nimport { createRateLimiter } from './server/rateLimiter';")
marker = "app.use(express.urlencoded({ extended: true, limit: '25mb' }));"
rate_block = marker + "\n\napp.use('/api/auth/login', createRateLimiter({ windowMs: 15 * 60 * 1000, max: 10 }));\napp.use('/api/auth/register', createRateLimiter({ windowMs: 15 * 60 * 1000, max: 8 }));\napp.use('/api/payments/submit', createRateLimiter({ windowMs: 10 * 60 * 1000, max: 10 }));\napp.use('/api/contact', createRateLimiter({ windowMs: 10 * 60 * 1000, max: 10 }));\napp.use('/api/ai/health-assistant', createRateLimiter({ windowMs: 5 * 60 * 1000, max: 20 }));\napp.use('/api/orders/track', createRateLimiter({ windowMs: 10 * 60 * 1000, max: 20 }));"
if "app.use('/api/auth/login', createRateLimiter" not in server:
    if marker not in server: raise SystemExit('Body parser marker not found')
    server = server.replace(marker, rate_block, 1)
old_track = '''    res.json(order);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error tracking order' });
  }
});

app.get('/api/orders/:id', authenticateOptional, (req: AuthenticatedRequest, res: Response) => {
  try {
    const order = getOrderByNumberOrId(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    // Allow if public lookup or owner or staff
    res.json(order);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error retrieving order' });
  }
});'''
new_track = '''    res.json({ id: order.id, orderNumber: order.orderNumber, status: order.status, paymentStatus: order.paymentStatus, fulfillmentMethod: order.fulfillmentMethod, total: order.total, createdAt: order.createdAt, updatedAt: order.updatedAt });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error tracking order' });
  }
});

app.get('/api/orders/:id', authenticateOptional, (req: AuthenticatedRequest, res: Response) => {
  try {
    const order = getOrderByNumberOrId(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (!req.user) return res.status(401).json({ error: 'Authentication required to access order details.' });
    const isStaff = ['admin', 'pharmacist', 'staff', 'super_admin'].includes(req.user.role);
    if (!isStaff && order.customerId !== req.user.id) return res.status(403).json({ error: 'Forbidden. You may only access your own orders.' });
    res.json(order);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error retrieving order' });
  }
});'''
if old_track not in server: raise SystemExit('Expected IDOR block not found')
server = server.replace(old_track, new_track, 1)
old_payment = '''app.post('/api/payments/submit', (req: Request, res: Response) => {
  try {
    const { orderId, transactionReference, proofUrl } = req.body;
    if (!orderId || !transactionReference) {
      return res.status(400).json({ error: 'Order ID and transaction reference are required.' });
    }
    const order = submitOrderPayment(orderId, transactionReference, proofUrl);'''
new_payment = '''app.post('/api/payments/submit', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { orderId, transactionReference, proofUrl } = req.body;
    if (!orderId || !transactionReference) return res.status(400).json({ error: 'Order ID and transaction reference are required.' });
    const targetOrder = getOrderByNumberOrId(orderId);
    if (!targetOrder) return res.status(404).json({ error: 'Order not found.' });
    const isStaff = ['admin', 'pharmacist', 'staff', 'super_admin'].includes(req.user!.role);
    if (!isStaff && targetOrder.customerId !== req.user!.id) return res.status(403).json({ error: 'Forbidden. You may only submit payment for your own order.' });
    const order = submitOrderPayment(orderId, transactionReference, proofUrl);'''
if old_payment not in server: raise SystemExit('Expected payment block not found')
server = server.replace(old_payment, new_payment, 1)
server = server.replace("  getUserById,\n} from './server/db';", "  getUserById,\n  revokeUserTokens,\n} from './server/db';")
auth_me = "app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {"
logout_route = "app.post('/api/auth/logout', requireAuth, (req: AuthenticatedRequest, res: Response) => {\n  try {\n    revokeUserTokens(req.user!.id);\n    res.json({ success: true, message: 'Logged out successfully.' });\n  } catch (err: any) {\n    res.status(500).json({ error: err.message || 'Logout failed' });\n  }\n});\n\n"
if logout_route not in server:
    if auth_me not in server: raise SystemExit('Auth me route not found')
    server = server.replace(auth_me, logout_route + auth_me, 1)
write('server.ts', server)

api = read('src/services/api.ts')
login_marker = '''  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse<AuthResponse>(res);
  },'''
logout_method = login_marker + '''

  async logout(): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/auth/logout`, { method: 'POST', headers: getAuthHeaders() });
    return handleResponse<{ success: boolean; message: string }>(res);
  },'''
if "async logout(): Promise<{ success: boolean; message: string }>" not in api:
    if login_marker not in api: raise SystemExit('Login method not found')
    api = api.replace(login_marker, logout_method, 1)
write('src/services/api.ts', api)

auth = read('src/context/AuthContext.tsx')
old_logout = '''  const logout = () => {
    localStorage.removeItem('gfp_auth_token');
    setToken(null);
    setUser(null);
  };'''
new_logout = '''  const logout = () => {
    void api.logout().catch((err) => {
      console.warn('Server logout request failed; clearing local session anyway:', err);
    }).finally(() => {
      localStorage.removeItem('gfp_auth_token');
      setToken(null);
      setUser(null);
    });
  };'''
if old_logout not in auth: raise SystemExit('AuthContext logout implementation not found')
auth = auth.replace(old_logout, new_logout, 1)
write('src/context/AuthContext.tsx', auth)

package = json.loads(read('package.json'))
package['scripts']['clean'] = 'rm -rf dist'
write('package.json', json.dumps(package, indent=2) + '\n')
print('Security hardening patch applied successfully.')
