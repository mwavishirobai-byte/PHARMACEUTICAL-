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
  revokeUserTokens,
} from './server/db';
import { UserRole } from './src/types';
import { createRateLimiter } from './server/rateLimiter';

dotenv.config();

// Ensure DB is initialized on boot
loadDatabase();

const app = express();
const PORT = 3000;

// Body Parsers with generous payload limit for prescription/payment image uploads (base64)
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

app.use('/api/auth/login', createRateLimiter({ windowMs: 15 * 60 * 1000, max: 10 }));
app.use('/api/auth/register', createRateLimiter({ windowMs: 15 * 60 * 1000, max: 8 }));
app.use('/api/payments/submit', createRateLimiter({ windowMs: 10 * 60 * 1000, max: 10 }));
app.use('/api/contact', createRateLimiter({ windowMs: 10 * 60 * 1000, max: 10 }));
app.use('/api/ai/health-assistant', createRateLimiter({ windowMs: 5 * 60 * 1000, max: 20 }));
app.use('/api/orders/track', createRateLimiter({ windowMs: 10 * 60 * 1000, max: 20 }));

// ----------------- AUTHENTICATION MIDDLEWARES -----------------

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    fullName: string;
  };
}

function authenticateOptional(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (decoded) {
      req.user = decoded as AuthenticatedRequest['user'];
    }
  }
  next();
}

function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }
  const token = authHeader.substring(7);
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Session expired or invalid token. Please log in again.' });
  }
  req.user = decoded as AuthenticatedRequest['user'];
  next();
}

function requireStaffAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Staff authentication required.' });
  }
  const token = authHeader.substring(7);
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Session expired. Please log in again.' });
  }
  const role = decoded.role;
  if (role !== 'admin' && role !== 'pharmacist' && role !== 'staff' && role !== 'super_admin') {
    return res.status(403).json({ error: 'Forbidden. Access restricted to authorized pharmacy staff.' });
  }
  req.user = decoded as AuthenticatedRequest['user'];
  next();
}

// ----------------- PUBLIC API ENDPOINTS -----------------

// Health & System Info
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    pharmacy: 'Gods Favor Pharmacy',
    location: 'Kitale Town, Kijana Wamalwa Road',
    timestamp: new Date().toISOString(),
  });
});

// Pharmacy Business Information & Settings
app.get('/api/settings', (req: Request, res: Response) => {
  try {
    const settings = getSettings();
    res.json(settings);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to retrieve settings' });
  }
});

// Categories
app.get('/api/categories', (req: Request, res: Response) => {
  try {
    const categories = getCategories();
    res.json(categories);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to retrieve categories' });
  }
});

// Products
app.get('/api/products', (req: Request, res: Response) => {
  try {
    const categoryId = req.query.category as string | undefined;
    const search = req.query.q as string | undefined;
    const prescription = req.query.prescription === 'true' ? true : req.query.prescription === 'false' ? false : undefined;
    const featured = req.query.featured === 'true';
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;

    const result = getProducts({
      categoryId,
      search,
      prescriptionRequired: prescription,
      featuredOnly: featured,
      limit,
      offset,
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to retrieve products' });
  }
});

app.get('/api/products/:idOrSlug', (req: Request, res: Response) => {
  try {
    const product = getProductBySlugOrId(req.params.idOrSlug);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to retrieve product details' });
  }
});

// Cart Total Calculation (Server-authoritative)
app.post('/api/cart/calculate', (req: Request, res: Response) => {
  try {
    const { items, fulfillmentMethod = 'pickup' } = req.body;
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: 'Items array is required' });
    }
    const calculation = calculateOrderTotals(items, fulfillmentMethod);
    res.json(calculation);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Calculation error' });
  }
});

// Order Creation
app.post('/api/orders', authenticateOptional, (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      customerName,
      customerPhone,
      customerEmail,
      items,
      fulfillmentMethod,
      deliveryAddress,
      deliveryLandmark,
      notes,
      prescriptionId,
      paymentReference,
      paymentProofUrl,
    } = req.body;

    const customerId = req.user ? req.user.id : undefined;

    const order = createOrder({
      customerId,
      customerName,
      customerPhone,
      customerEmail,
      items,
      fulfillmentMethod,
      deliveryAddress,
      deliveryLandmark,
      notes,
      prescriptionId,
      paymentReference,
      paymentProofUrl,
    });

    res.status(201).json(order);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to create order' });
  }
});

// Track Order (Public by orderNumber + phone)
app.get('/api/orders/track', (req: Request, res: Response) => {
  try {
    const orderNumber = req.query.orderNumber as string;
    const phone = req.query.phone as string;

    if (!orderNumber) {
      return res.status(400).json({ error: 'Order number is required' });
    }

    const order = getOrderByNumberOrId(orderNumber, phone);
    if (!order) {
      return res.status(404).json({ error: 'Order not found. Please check the order number and phone.' });
    }

    res.json({ id: order.id, orderNumber: order.orderNumber, status: order.status, paymentStatus: order.paymentStatus, fulfillmentMethod: order.fulfillmentMethod, total: order.total, createdAt: order.createdAt, updatedAt: order.updatedAt });
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
});

// Submit Payment for existing order (Pochi la Biashara)
app.post('/api/payments/submit', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { orderId, transactionReference, proofUrl } = req.body;
    if (!orderId || !transactionReference) return res.status(400).json({ error: 'Order ID and transaction reference are required.' });
    const targetOrder = getOrderByNumberOrId(orderId);
    if (!targetOrder) return res.status(404).json({ error: 'Order not found.' });
    const isStaff = ['admin', 'pharmacist', 'staff', 'super_admin'].includes(req.user!.role);
    if (!isStaff && targetOrder.customerId !== req.user!.id) return res.status(403).json({ error: 'Forbidden. You may only submit payment for your own order.' });
    const order = submitOrderPayment(orderId, transactionReference, proofUrl);
    res.json({
      success: true,
      message: 'Payment details submitted successfully. Our pharmacy team will verify and dispatch your order.',
      order,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to submit payment' });
  }
});

// Prescriptions
app.post('/api/prescriptions', authenticateOptional, (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      customerName,
      customerPhone,
      customerEmail,
      fileUrl,
      fileName,
      fileType,
      notes,
      medicationsRequested,
      doctorName,
      hospitalName,
    } = req.body;

    const customerId = req.user ? req.user.id : undefined;

    const prescription = createPrescription({
      customerId,
      customerName,
      customerPhone,
      customerEmail,
      fileUrl,
      fileName: fileName || 'Prescription_Document',
      fileType: fileType || 'image/jpeg',
      notes,
      medicationsRequested,
      doctorName,
      hospitalName,
    });

    res.status(201).json({
      success: true,
      message: 'Prescription uploaded successfully. A registered pharmacist will review it promptly.',
      prescription,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to upload prescription' });
  }
});

// Appointments
app.post('/api/appointments', authenticateOptional, (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      customerName,
      customerPhone,
      customerEmail,
      serviceId,
      appointmentDate,
      appointmentTime,
      notes,
    } = req.body;

    const customerId = req.user ? req.user.id : undefined;

    const appointment = createAppointment({
      customerId,
      customerName,
      customerPhone,
      customerEmail,
      serviceId,
      appointmentDate,
      appointmentTime,
      notes,
    });

    res.status(201).json({
      success: true,
      message: 'Appointment requested successfully. Our pharmacy staff will confirm your slot.',
      appointment,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to request appointment' });
  }
});

// Services
app.get('/api/services', (req: Request, res: Response) => {
  try {
    const services = getServices();
    res.json(services);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to retrieve services' });
  }
});

// Articles / Health tips
app.get('/api/articles', (req: Request, res: Response) => {
  try {
    const articles = getArticles();
    res.json(articles);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to retrieve health articles' });
  }
});

app.get('/api/articles/:slug', (req: Request, res: Response) => {
  try {
    const article = getArticleBySlug(req.params.slug);
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }
    res.json(article);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to retrieve article' });
  }
});

// Contact Messages
app.post('/api/contact', (req: Request, res: Response) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    const msg = createContactMessage({ name, email, phone, subject, message });
    res.status(201).json({
      success: true,
      message: 'Thank you for reaching out to Gods Favor Pharmacy. We will respond promptly.',
      contactMessage: msg,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to send message' });
  }
});

// ----------------- AUTHENTICATION ENDPOINTS -----------------

app.post('/api/auth/register', (req: Request, res: Response) => {
  try {
    const { fullName, phone, email, password, address } = req.body;
    if (!fullName || !phone || !email || !password) {
      return res.status(400).json({ error: 'Full name, phone, email, and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }
    const result = registerUser({ fullName, phone, email, password, address });
    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Registration failed' });
  }
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    const result = loginUser(email, password);
    res.json(result);
  } catch (err: any) {
    res.status(401).json({ error: err.message || 'Login failed' });
  }
});

app.post('/api/auth/logout', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    revokeUserTokens(req.user!.id);
    res.json({ success: true, message: 'Logged out successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Logout failed' });
  }
});

app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = getUserById(req.user!.id);
    if (!user) {
      return res.status(404).json({ error: 'User profile not found' });
    }
    res.json({ user });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error fetching user' });
  }
});

// Customer Account Records
app.get('/api/account/orders', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = getOrders({ customerId: req.user!.id });
    res.json(result.orders);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to retrieve orders' });
  }
});

app.get('/api/account/prescriptions', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const list = getPrescriptions({ customerId: req.user!.id });
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to retrieve prescriptions' });
  }
});

app.get('/api/account/appointments', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const list = getAppointments({ customerId: req.user!.id });
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to retrieve appointments' });
  }
});

// ----------------- AI CLINICAL ASSISTANT (GEMINI HIGH THINKING) -----------------

app.post('/api/ai/health-assistant', async (req: Request, res: Response) => {
  try {
    const { query, context } = req.body;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query prompt is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({
        answer: `Thank you for consulting Gods Favor Pharmacy Kitale. For personalized medical evaluation, specific dosage, and prescription medicine inquiries, please speak directly to our licensed clinical pharmacist or doctor at 07417758578 or visit our pharmacy along Kijana Wamalwa Road, Kitale Town.`,
        disclaimer: 'This automated information is for educational reference only and does not substitute professional clinical diagnosis or emergency medical care.',
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const systemInstruction = `You are the Virtual Health & Medication Information Assistant for Gods Favor Pharmacy in Kitale Town, Kenya (along Kijana Wamalwa Road).
Contact Phone for Pharmacist / Doctor: 07417758578.
Payment Method: Pochi la Biashara (07417758578).

Clinical Guidelines:
1. Provide accurate, clear, evidence-based medication information, OTC remedies, common side effects, and general wellness advice relevant to Kenya / East African healthcare contexts.
2. ALWAYS include a clear safety caution: Never prescribe restricted prescription medicines without a doctor's valid review.
3. If the user presents severe red-flag symptoms (severe chest pain, difficulty breathing, high infant fever, severe bleeding, signs of stroke), advise them to seek IMMEDIATE emergency hospital care in Kitale (e.g. Kitale County Referral Hospital).
4. Direct users to call or WhatsApp our clinical doctor / pharmacist on 07417758578 for personalized medication counseling.
5. Keep explanations warm, professional, accessible, and structured with concise bullet points.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: `Patient Query: ${query}\nAdditional Context: ${context || 'General inquiry'}`,
      config: {
        systemInstruction,
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.HIGH,
        },
      },
    });

    res.json({
      answer: response.text || 'Thank you for contacting Gods Favor Pharmacy. Please consult our pharmacist at 07417758578 for detailed guidance.',
      disclaimer: 'Notice: This health guidance is for educational reference. For prescription medicines, official diagnosis, or urgent concerns, please consult our pharmacist at 07417758578 or visit our Kitale clinic.',
    });
  } catch (err: any) {
    console.error('AI assistant error:', err);
    // Graceful fallback
    res.json({
      answer: 'Our pharmacy clinical team is available to assist you directly. Please contact our pharmacist or doctor on 07417758578 or visit our branch along Kijana Wamalwa Road in Kitale.',
      disclaimer: 'Educational information only. Please speak directly to our clinical staff.',
    });
  }
});

// ----------------- ADMIN & STAFF MANAGEMENT ENDPOINTS -----------------

// Admin Dashboard Metrics
app.get('/api/admin/metrics', requireStaffAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const metrics = getAdminMetrics();
    res.json(metrics);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to load admin metrics' });
  }
});

// Admin Orders
app.get('/api/admin/orders', requireStaffAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const status = req.query.status as any;
    const paymentStatus = req.query.paymentStatus as any;
    const search = req.query.search as string;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;

    const result = getOrders({ status, paymentStatus, search, limit, offset });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch orders' });
  }
});

app.patch('/api/admin/orders/:id/status', requireStaffAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, staffNotes } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    const staff = { id: req.user!.id, name: req.user!.fullName, role: req.user!.role };
    const order = updateOrderStatus(req.params.id, status, staff, staffNotes);
    res.json({ success: true, order });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update order status' });
  }
});

app.post('/api/admin/orders/:id/verify-payment', requireStaffAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, notes = '' } = req.body;
    if (status !== 'verified' && status !== 'rejected') {
      return res.status(400).json({ error: 'Status must be "verified" or "rejected"' });
    }
    const staff = { id: req.user!.id, name: req.user!.fullName, role: req.user!.role };
    const order = verifyOrderPayment(req.params.id, status, notes, staff);
    res.json({
      success: true,
      message: `Payment marked as ${status}.`,
      order,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to verify payment' });
  }
});

// Admin Products CRUD
app.get('/api/admin/products', requireStaffAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = getProducts({ limit: 500 });
    res.json(result.products);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to load products' });
  }
});

app.post('/api/admin/products', requireStaffAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const staff = { id: req.user!.id, name: req.user!.fullName, role: req.user!.role };
    const product = saveProduct(req.body, staff);
    res.status(201).json({ success: true, product });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to create product' });
  }
});

app.put('/api/admin/products/:id', requireStaffAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const staff = { id: req.user!.id, name: req.user!.fullName, role: req.user!.role };
    const product = saveProduct({ ...req.body, id: req.params.id }, staff);
    res.json({ success: true, product });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update product' });
  }
});

app.delete('/api/admin/products/:id', requireStaffAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const staff = { id: req.user!.id, name: req.user!.fullName, role: req.user!.role };
    deleteProduct(req.params.id, staff);
    res.json({ success: true, message: 'Product archived successfully' });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to archive product' });
  }
});

// Admin Prescriptions
app.get('/api/admin/prescriptions', requireStaffAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const status = req.query.status as any;
    const prescriptions = getPrescriptions({ status });
    res.json(prescriptions);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to retrieve prescriptions' });
  }
});

app.patch('/api/admin/prescriptions/:id/review', requireStaffAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, reviewNotes } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Review status is required' });
    }
    const staff = { id: req.user!.id, name: req.user!.fullName, role: req.user!.role };
    const prescription = reviewPrescription(req.params.id, status, reviewNotes || '', staff);
    res.json({ success: true, prescription });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to review prescription' });
  }
});

// Admin Appointments
app.get('/api/admin/appointments', requireStaffAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const status = req.query.status as any;
    const appointments = getAppointments({ status });
    res.json(appointments);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to retrieve appointments' });
  }
});

app.patch('/api/admin/appointments/:id', requireStaffAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, staffNotes } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    const staff = { id: req.user!.id, name: req.user!.fullName, role: req.user!.role };
    const appointment = updateAppointmentStatus(req.params.id, status, staffNotes, staff);
    res.json({ success: true, appointment });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update appointment' });
  }
});

// Admin Services
app.get('/api/admin/services', requireStaffAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const services = getAllServicesAdmin();
    res.json(services);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch services' });
  }
});

app.post('/api/admin/services', requireStaffAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const staff = { id: req.user!.id, name: req.user!.fullName, role: req.user!.role };
    const service = saveService(req.body, staff);
    res.status(201).json({ success: true, service });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to save service' });
  }
});

app.put('/api/admin/services/:id', requireStaffAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const staff = { id: req.user!.id, name: req.user!.fullName, role: req.user!.role };
    const service = saveService({ ...req.body, id: req.params.id }, staff);
    res.json({ success: true, service });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update service' });
  }
});

// Admin Contact Messages
app.get('/api/admin/contact-messages', requireStaffAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const messages = getContactMessages();
    res.json(messages);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch messages' });
  }
});

app.patch('/api/admin/contact-messages/:id', requireStaffAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, replyNotes } = req.body;
    const msg = updateContactMessageStatus(req.params.id, status, replyNotes);
    res.json({ success: true, contactMessage: msg });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update message' });
  }
});

// Admin Audit Logs
app.get('/api/admin/audit-logs', requireStaffAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const logs = getAuditLogs();
    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch audit logs' });
  }
});

// Admin Settings Update
app.put('/api/admin/settings', requireStaffAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const staff = { id: req.user!.id, name: req.user!.fullName, role: req.user!.role };
    const updated = updateSettings(req.body, staff);
    res.json({ success: true, settings: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update settings' });
  }
});

// ----------------- VITE & STATIC SPA SERVING -----------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Gods Favor Pharmacy server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
