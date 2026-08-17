import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import {
  loadDatabase,
  getSettings,
  updateSettings,
  getCategories,
  getAllCategoriesAdmin,
  getProducts,
  getProductBySlugOrId,
  saveProduct,
  deleteProduct,
  calculateOrderTotals,
  createOrder,
  submitOrderPayment,
  verifyOrderPayment,
  updateOrderStatus,
  getOrders,
  getOrderByNumberOrId,
  createPrescription,
  reviewPrescription,
  getPrescriptions,
  createAppointment,
  updateAppointmentStatus,
  getAppointments,
  getServices,
  getAllServicesAdmin,
  saveService,
  getArticles,
  getArticleBySlug,
  saveArticle,
  createContactMessage,
  getContactMessages,
  updateContactMessageStatus,
  getAdminMetrics,
  getAuditLogs,
  registerUser,
  loginUser,
  verifyToken,
  getUserById,
} from './server/db';
import { UserRole } from './src/types';

dotenv.config();

loadDatabase();

export const app = express();
const PORT = 3000;

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

export interface AuthenticatedRequest extends Request {
  user?: { id: string; email: string; role: UserRole; fullName: string };
}

function authenticateOptional(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const decoded = verifyToken(authHeader.substring(7));
    if (decoded) req.user = decoded as AuthenticatedRequest['user'];
  }
  next();
}

function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Authentication required. Please log in.' });
  const decoded = verifyToken(authHeader.substring(7));
  if (!decoded) return res.status(401).json({ error: 'Session expired or invalid token. Please log in again.' });
  req.user = decoded as AuthenticatedRequest['user'];
  next();
}

function requireStaffAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Staff authentication required.' });
  const decoded = verifyToken(authHeader.substring(7));
  if (!decoded) return res.status(401).json({ error: 'Session expired. Please log in again.' });
  const role = decoded.role;
  if (role !== 'admin' && role !== 'pharmacist' && role !== 'staff' && role !== 'super_admin') return res.status(403).json({ error: 'Forbidden. Access restricted to authorized pharmacy staff.' });
  req.user = decoded as AuthenticatedRequest['user'];
  next();
}

app.get('/api/health', (_req: Request, res: Response) => res.json({ status: 'ok', pharmacy: 'Gods Favor Pharmacy', location: 'Kitale Town, Kijana Wamalwa Road', timestamp: new Date().toISOString() }));
app.get('/api/settings', (_req, res) => { try { res.json(getSettings()); } catch (e: any) { res.status(500).json({ error: e.message || 'Failed to retrieve settings' }); } });
app.get('/api/categories', (_req, res) => { try { res.json(getCategories()); } catch (e: any) { res.status(500).json({ error: e.message || 'Failed to retrieve categories' }); } });
app.get('/api/products', (req, res) => { try { res.json(getProducts({ categoryId: req.query.category as string | undefined, search: req.query.q as string | undefined, prescriptionRequired: req.query.prescription === 'true' ? true : req.query.prescription === 'false' ? false : undefined, featuredOnly: req.query.featured === 'true', limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 100, offset: req.query.offset ? parseInt(req.query.offset as string, 10) : 0 })); } catch (e: any) { res.status(500).json({ error: e.message || 'Failed to retrieve products' }); } });
app.get('/api/products/:idOrSlug', (req, res) => { try { const p = getProductBySlugOrId(req.params.idOrSlug); if (!p) return res.status(404).json({ error: 'Product not found' }); res.json(p); } catch (e: any) { res.status(500).json({ error: e.message || 'Failed to retrieve product details' }); } });
app.post('/api/cart/calculate', (req, res) => { try { if (!Array.isArray(req.body.items)) return res.status(400).json({ error: 'Items array is required' }); res.json(calculateOrderTotals(req.body.items, req.body.fulfillmentMethod || 'pickup')); } catch (e: any) { res.status(400).json({ error: e.message || 'Calculation error' }); } });
app.post('/api/orders', authenticateOptional, (req: AuthenticatedRequest, res) => { try { const b = req.body; res.status(201).json(createOrder({ ...b, customerId: req.user?.id })); } catch (e: any) { res.status(400).json({ error: e.message || 'Failed to create order' }); } });
app.get('/api/orders/track', (req, res) => { try { const o = getOrderByNumberOrId(req.query.orderNumber as string, req.query.phone as string); if (!o) return res.status(404).json({ error: 'Order not found. Please check the order number and phone.' }); res.json(o); } catch (e: any) { res.status(500).json({ error: e.message || 'Error tracking order' }); } });
app.get('/api/orders/:id', authenticateOptional, (req, res) => { try { const o = getOrderByNumberOrId(req.params.id); if (!o) return res.status(404).json({ error: 'Order not found' }); res.json(o); } catch (e: any) { res.status(500).json({ error: e.message || 'Error retrieving order' }); } });
app.post('/api/payments/submit', (req, res) => { try { const { orderId, transactionReference, proofUrl } = req.body; if (!orderId || !transactionReference) return res.status(400).json({ error: 'Order ID and transaction reference are required.' }); res.json({ success: true, message: 'Payment details submitted successfully. Our pharmacy team will verify and dispatch your order.', order: submitOrderPayment(orderId, transactionReference, proofUrl) }); } catch (e: any) { res.status(400).json({ error: e.message || 'Failed to submit payment' }); } });
app.post('/api/prescriptions', authenticateOptional, (req: AuthenticatedRequest, res) => { try { res.status(201).json({ success: true, message: 'Prescription uploaded successfully. A registered pharmacist will review it promptly.', prescription: createPrescription({ ...req.body, customerId: req.user?.id, fileName: req.body.fileName || 'Prescription_Document', fileType: req.body.fileType || 'image/jpeg' }) }); } catch (e: any) { res.status(400).json({ error: e.message || 'Failed to upload prescription' }); } });
app.post('/api/appointments', authenticateOptional, (req: AuthenticatedRequest, res) => { try { res.status(201).json({ success: true, message: 'Appointment requested successfully. Our pharmacy staff will confirm your slot.', appointment: createAppointment({ ...req.body, customerId: req.user?.id }) }); } catch (e: any) { res.status(400).json({ error: e.message || 'Failed to request appointment' }); } });
app.get('/api/services', (_req, res) => { try { res.json(getServices()); } catch (e: any) { res.status(500).json({ error: e.message || 'Failed to retrieve services' }); } });
app.get('/api/articles', (_req, res) => { try { res.json(getArticles()); } catch (e: any) { res.status(500).json({ error: e.message || 'Failed to retrieve health articles' }); } });
app.get('/api/articles/:slug', (req, res) => { try { const a = getArticleBySlug(req.params.slug); if (!a) return res.status(404).json({ error: 'Article not found' }); res.json(a); } catch (e: any) { res.status(500).json({ error: e.message || 'Failed to retrieve article' }); } });
app.post('/api/contact', (req, res) => { try { res.status(201).json({ success: true, message: 'Thank you for reaching out to Gods Favor Pharmacy. We will respond promptly.', contactMessage: createContactMessage(req.body) }); } catch (e: any) { res.status(400).json({ error: e.message || 'Failed to send message' }); } });
app.post('/api/auth/register', (req, res) => { try { const { fullName, phone, email, password, address } = req.body; if (!fullName || !phone || !email || !password) return res.status(400).json({ error: 'Full name, phone, email, and password are required.' }); if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters long.' }); res.status(201).json(registerUser({ fullName, phone, email, password, address })); } catch (e: any) { res.status(400).json({ error: e.message || 'Registration failed' }); } });
app.post('/api/auth/login', (req, res) => { try { const { email, password } = req.body; if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' }); res.json(loginUser(email, password)); } catch (e: any) { res.status(401).json({ error: e.message || 'Login failed' }); } });
app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res) => { try { const u = getUserById(req.user!.id); if (!u) return res.status(404).json({ error: 'User profile not found' }); res.json({ user: u }); } catch (e: any) { res.status(500).json({ error: e.message || 'Error fetching user' }); } });
app.get('/api/account/orders', requireAuth, (req: AuthenticatedRequest, res) => { try { res.json(getOrders({ customerId: req.user!.id }).orders); } catch (e: any) { res.status(500).json({ error: e.message || 'Failed to retrieve orders' }); } });
app.get('/api/account/prescriptions', requireAuth, (req: AuthenticatedRequest, res) => { try { res.json(getPrescriptions({ customerId: req.user!.id })); } catch (e: any) { res.status(500).json({ error: e.message || 'Failed to retrieve prescriptions' }); } });
app.get('/api/account/appointments', requireAuth, (req: AuthenticatedRequest, res) => { try { res.json(getAppointments({ customerId: req.user!.id })); } catch (e: any) { res.status(500).json({ error: e.message || 'Failed to retrieve appointments' }); } });

// Admin/staff endpoints remain protected by the existing staff middleware.
app.get('/api/admin/metrics', requireStaffAuth, (_req, res) => { try { res.json(getAdminMetrics()); } catch (e: any) { res.status(500).json({ error: e.message || 'Failed to retrieve metrics' }); } });
app.get('/api/admin/orders', requireStaffAuth, (req, res) => { try { res.json(getOrders({ status: req.query.status as any, limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 100, offset: req.query.offset ? parseInt(req.query.offset as string, 10) : 0 })); } catch (e: any) { res.status(500).json({ error: e.message || 'Failed to retrieve orders' }); } });
app.patch('/api/admin/orders/:id/status', requireStaffAuth, (req, res) => { try { res.json(updateOrderStatus(req.params.id, req.body.status, req.user!)); } catch (e: any) { res.status(400).json({ error: e.message || 'Failed to update order status' }); } });
app.get('/api/admin/products', requireStaffAuth, (_req, res) => { try { res.json(getProducts({ limit: 10000, offset: 0 })); } catch (e: any) { res.status(500).json({ error: e.message || 'Failed to retrieve products' }); } });
app.get('/api/admin/prescriptions', requireStaffAuth, (_req, res) => { try { res.json(getPrescriptions()); } catch (e: any) { res.status(500).json({ error: e.message || 'Failed to retrieve prescriptions' }); } });
app.get('/api/admin/appointments', requireStaffAuth, (_req, res) => { try { res.json(getAppointments()); } catch (e: any) { res.status(500).json({ error: e.message || 'Failed to retrieve appointments' }); } });
app.get('/api/admin/contacts', requireStaffAuth, (_req, res) => { try { res.json(getContactMessages()); } catch (e: any) { res.status(500).json({ error: e.message || 'Failed to retrieve contact messages' }); } });
app.get('/api/admin/audit-logs', requireStaffAuth, (_req, res) => { try { res.json(getAuditLogs()); } catch (e: any) { res.status(500).json({ error: e.message || 'Failed to retrieve audit logs' }); } });

if (!process.env.VERCEL) {
  async function startServer() {
    if (process.env.NODE_ENV !== 'production') {
      const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')));
    }
    app.listen(PORT, '0.0.0.0', () => console.log(`Gods Favor Pharmacy server running on http://0.0.0.0:${PORT}`));
  }
  startServer();
}

export default app;
