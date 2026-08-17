import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {
  User, Category, Product, Order, Prescription, Appointment, PharmacyService, HealthArticle, ContactMessage, AuditLog, PharmacySettings, OrderItem, OrderStatus, PaymentStatus, PrescriptionStatus, AppointmentStatus,
} from '../src/types';
import { initialSettings, initialCategories, initialProducts, initialServices, initialArticles } from './seedData';

const DATA_DIR = process.env.VERCEL ? path.join('/tmp', 'gods-favor-pharmacy-data') : path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'pharmacy_database.json');
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET is required. Configure it in Vercel Environment Variables.');

interface UserRecord extends User { passwordHash: string; }
interface DatabaseSchema {
  settings: PharmacySettings; users: UserRecord[]; categories: Category[]; products: Product[]; orders: Order[]; prescriptions: Prescription[]; appointments: Appointment[]; services: PharmacyService[]; articles: HealthArticle[]; contactMessages: ContactMessage[]; auditLogs: AuditLog[];
}
let dbInstance: DatabaseSchema | null = null;

function ensureDataDirExists() { if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true }); }
function getInitialDatabase(): DatabaseSchema {
  const adminPasswordHash = bcrypt.hashSync('KitaleAdmin2026!', 10);
  const pharmacistPasswordHash = bcrypt.hashSync('PharmacistKitale2026!', 10);
  const now = new Date().toISOString();
  const initialUsers: UserRecord[] = [
    { id: 'usr-admin-01', fullName: 'Chief Pharmacist / Admin', phone: '07417758578', email: 'admin@godsfavorpharmacy.ke', address: 'Kijana Wamalwa Road, Kitale', role: 'admin', passwordHash: adminPasswordHash, createdAt: now, updatedAt: now },
    { id: 'usr-pharm-01', fullName: 'Clinical Pharmacist on Duty', phone: '07417758578', email: 'pharmacist@godsfavorpharmacy.ke', address: 'Kijana Wamalwa Road, Kitale', role: 'pharmacist', passwordHash: pharmacistPasswordHash, createdAt: now, updatedAt: now },
  ];
  return { settings: initialSettings, users: initialUsers, categories: initialCategories, products: initialProducts, orders: [], prescriptions: [], appointments: [], services: initialServices, articles: initialArticles, contactMessages: [], auditLogs: [] };
}

export function loadDatabase(): DatabaseSchema {
  if (dbInstance) return dbInstance;
  ensureDataDirExists();
  try {
    if (fs.existsSync(DB_FILE)) dbInstance = JSON.parse(fs.readFileSync(DB_FILE, 'utf8')) as DatabaseSchema;
    else { dbInstance = getInitialDatabase(); fs.writeFileSync(DB_FILE, JSON.stringify(dbInstance, null, 2), 'utf8'); }
  } catch (error) { console.error('Database initialization failed; using in-memory seed data.', error); dbInstance = getInitialDatabase(); }
  return dbInstance;
}
function db(): DatabaseSchema { return dbInstance || loadDatabase(); }
function persist() { try { ensureDataDirExists(); fs.writeFileSync(DB_FILE, JSON.stringify(db(), null, 2), 'utf8'); } catch (error) { console.error('Database persistence unavailable in this runtime:', error); } }

export function getSettings() { return db().settings; }
export function updateSettings(settings: Partial<PharmacySettings>) { db().settings = { ...db().settings, ...settings }; persist(); return db().settings; }
export function getCategories() { return db().categories.filter(c => c.active !== false); }
export function getAllCategoriesAdmin() { return db().categories; }
export function getProducts(options: any = {}) {
  let items = db().products.filter(p => p.active !== false);
  if (options.categoryId) items = items.filter(p => p.categoryId === options.categoryId);
  if (options.search) { const q = String(options.search).toLowerCase(); items = items.filter(p => `${p.name} ${p.description || ''} ${p.activeIngredient || ''}`.toLowerCase().includes(q)); }
  if (options.prescriptionRequired !== undefined) items = items.filter(p => p.prescriptionRequired === options.prescriptionRequired);
  if (options.featuredOnly) items = items.filter(p => p.isFeatured);
  const offset = Number(options.offset || 0), limit = Number(options.limit || 100);
  return { products: items.slice(offset, offset + limit), total: items.length };
}
export function getProductBySlugOrId(idOrSlug: string) { return db().products.find(p => (p.id === idOrSlug || p.slug === idOrSlug) && p.active !== false); }
export function saveProduct(product: any) { const existing = db().products.findIndex(p => p.id === product.id); if (existing >= 0) db().products[existing] = product; else db().products.push(product); persist(); return product; }
export function deleteProduct(id: string) { db().products = db().products.filter(p => p.id !== id); persist(); }
export function calculateOrderTotals(items: any[], fulfillmentMethod = 'pickup') { const subtotal = items.reduce((s, i) => s + Number(i.price || 0) * Number(i.quantity || 1), 0); const deliveryFee = fulfillmentMethod === 'delivery' ? 200 : 0; return { subtotal, deliveryFee, total: subtotal + deliveryFee }; }
export function createOrder(data: any) { const now = new Date().toISOString(); const order = { id: `ord-${Date.now()}`, orderNumber: `GFP-${Date.now()}`, ...data, createdAt: now, updatedAt: now, status: 'pending' as OrderStatus }; db().orders.push(order as any); persist(); return order; }
export function submitOrderPayment(orderId: string, transactionReference: string, proofUrl?: string) { const o: any = db().orders.find(x => x.id === orderId); if (!o) throw new Error('Order not found'); o.transactionReference = transactionReference; o.proofUrl = proofUrl; o.paymentStatus = 'submitted' as PaymentStatus; o.updatedAt = new Date().toISOString(); persist(); return o; }
export function verifyOrderPayment(orderId: string, status: PaymentStatus) { const o: any = db().orders.find(x => x.id === orderId); if (!o) throw new Error('Order not found'); o.paymentStatus = status; persist(); return o; }
export function updateOrderStatus(orderId: string, status: OrderStatus, _user?: any) { const o: any = db().orders.find(x => x.id === orderId); if (!o) throw new Error('Order not found'); o.status = status; o.updatedAt = new Date().toISOString(); persist(); return o; }
export function getOrders(options: any = {}) { let orders = [...db().orders]; if (options.customerId) orders = orders.filter((o: any) => o.customerId === options.customerId); if (options.status) orders = orders.filter((o: any) => o.status === options.status); const total = orders.length; const offset = Number(options.offset || 0), limit = Number(options.limit || 100); return { orders: orders.slice(offset, offset + limit), total }; }
export function getOrderByNumberOrId(value?: string, phone?: string) { const o: any = db().orders.find((x: any) => x.id === value || x.orderNumber === value); if (o && phone && o.customerPhone && o.customerPhone !== phone) return undefined; return o; }
export function createPrescription(data: any) { const p = { id: `rx-${Date.now()}`, ...data, status: 'pending_review' as PrescriptionStatus, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }; db().prescriptions.push(p as any); persist(); return p; }
export function reviewPrescription(id: string, status: PrescriptionStatus, notes?: string) { const p: any = db().prescriptions.find(x => x.id === id); if (!p) throw new Error('Prescription not found'); p.status = status; p.reviewNotes = notes; persist(); return p; }
export function getPrescriptions(options: any = {}) { let x = [...db().prescriptions]; if (options.customerId) x = x.filter((p: any) => p.customerId === options.customerId); return x; }
export function createAppointment(data: any) { const a = { id: `apt-${Date.now()}`, ...data, status: 'pending' as AppointmentStatus, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }; db().appointments.push(a as any); persist(); return a; }
export function updateAppointmentStatus(id: string, status: AppointmentStatus) { const a: any = db().appointments.find(x => x.id === id); if (!a) throw new Error('Appointment not found'); a.status = status; persist(); return a; }
export function getAppointments(options: any = {}) { let x = [...db().appointments]; if (options.customerId) x = x.filter((a: any) => a.customerId === options.customerId); return x; }
export function getServices() { return db().services.filter(s => s.available !== false); }
export function getAllServicesAdmin() { return db().services; }
export function saveService(service: any) { db().services.push(service); persist(); return service; }
export function getArticles() { return db().articles.filter(a => a.published !== false); }
export function getArticleBySlug(slug: string) { return db().articles.find(a => a.slug === slug); }
export function saveArticle(article: any) { db().articles.push(article); persist(); return article; }
export function createContactMessage(data: any) { const m = { id: `msg-${Date.now()}`, ...data, status: 'unread' as const, createdAt: new Date().toISOString() }; db().contactMessages.push(m as any); persist(); return m; }
export function getContactMessages() { return db().contactMessages; }
export function updateContactMessageStatus(id: string, status: string) { const m: any = db().contactMessages.find(x => x.id === id); if (!m) throw new Error('Message not found'); m.status = status as any; persist(); return m; }
export function getAdminMetrics() { return { orders: db().orders.length, pendingOrders: db().orders.filter((o: any) => o.status === 'pending').length, prescriptions: db().prescriptions.length, appointments: db().appointments.length, customers: db().users.filter(u => u.role === 'customer').length }; }
export function getAuditLogs() { return db().auditLogs; }
export function registerUser(data: any) { if (db().users.some(u => u.email.toLowerCase() === String(data.email).toLowerCase())) throw new Error('An account with this email already exists.'); const now = new Date().toISOString(); const u: UserRecord = { id: `usr-${Date.now()}`, fullName: data.fullName, phone: data.phone, email: data.email, address: data.address, role: 'customer', passwordHash: bcrypt.hashSync(data.password, 10), createdAt: now, updatedAt: now }; db().users.push(u); persist(); return issueAuth(u); }
function issueAuth(u: UserRecord) { const payload = { id: u.id, email: u.email, role: u.role, fullName: u.fullName }; const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' }); const { passwordHash: _p, ...user } = u; return { token, user }; }
export function loginUser(email: string, password: string) { const u = db().users.find(x => x.email.toLowerCase() === email.toLowerCase()); if (!u || !bcrypt.compareSync(password, u.passwordHash)) throw new Error('Invalid email or password.'); return issueAuth(u); }
export function verifyToken(token: string) { try { return jwt.verify(token, JWT_SECRET) as any; } catch { return null; } }
export function getUserById(id: string) { const u = db().users.find(x => x.id === id); if (!u) return undefined; const { passwordHash: _p, ...safe } = u; return safe; }
