import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {
  User,
  Category,
  Product,
  Order,
  Prescription,
  Appointment,
  PharmacyService,
  HealthArticle,
  ContactMessage,
  AuditLog,
  PharmacySettings,
  OrderItem,
  OrderStatus,
  PaymentStatus,
  PrescriptionStatus,
  AppointmentStatus,
} from '../src/types';
import {
  initialSettings,
  initialCategories,
  initialProducts,
  initialServices,
  initialArticles,
} from './seedData';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'pharmacy_database.json');
const JWT_SECRET = process.env.JWT_SECRET || 'gods-favor-pharmacy-secure-secret-key-kitale-2026';

interface UserRecord extends User {
  passwordHash: string;
}

interface DatabaseSchema {
  settings: PharmacySettings;
  users: UserRecord[];
  categories: Category[];
  products: Product[];
  orders: Order[];
  prescriptions: Prescription[];
  appointments: Appointment[];
  services: PharmacyService[];
  articles: HealthArticle[];
  contactMessages: ContactMessage[];
  auditLogs: AuditLog[];
}

let dbInstance: DatabaseSchema | null = null;

function ensureDataDirExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function getInitialDatabase(): DatabaseSchema {
  const adminPasswordHash = bcrypt.hashSync('KitaleAdmin2026!', 10);
  const pharmacistPasswordHash = bcrypt.hashSync('PharmacistKitale2026!', 10);

  const initialUsers: UserRecord[] = [
    {
      id: 'usr-admin-01',
      fullName: 'Chief Pharmacist / Admin',
      phone: '07417758578',
      email: 'admin@godsfavorpharmacy.ke',
      address: 'Kijana Wamalwa Road, Kitale',
      role: 'admin',
      passwordHash: adminPasswordHash,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'usr-pharm-01',
      fullName: 'Clinical Pharmacist on Duty',
      phone: '07417758578',
      email: 'pharmacist@godsfavorpharmacy.ke',
      address: 'Kitale Town',
      role: 'pharmacist',
      passwordHash: pharmacistPasswordHash,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  return {
    settings: initialSettings,
    users: initialUsers,
    categories: initialCategories,
    products: initialProducts,
    orders: [],
    prescriptions: [],
    appointments: [],
    services: initialServices,
    articles: initialArticles,
    contactMessages: [],
    auditLogs: [
      {
        id: 'log-init-01',
        actorId: 'system',
        actorName: 'System Initializer',
        actorRole: 'system',
        action: 'DATABASE_INITIALIZED',
        entityType: 'auth',
        entityId: 'system',
        details: 'Initial pharmacy database schema, products, categories and services bootstrapped.',
        createdAt: new Date().toISOString(),
      },
    ],
  };
}

export function loadDatabase(): DatabaseSchema {
  if (dbInstance) {
    return dbInstance;
  }

  ensureDataDirExists();

  if (fs.existsSync(DB_FILE)) {
    try {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      dbInstance = JSON.parse(data);
      // Ensure all fields exist
      if (!dbInstance!.settings) dbInstance!.settings = initialSettings;
      if (!dbInstance!.users) dbInstance!.users = [];
      if (!dbInstance!.categories || dbInstance!.categories.length === 0) dbInstance!.categories = initialCategories;
      if (!dbInstance!.products || dbInstance!.products.length === 0) dbInstance!.products = initialProducts;
      if (!dbInstance!.services || dbInstance!.services.length === 0) dbInstance!.services = initialServices;
      if (!dbInstance!.articles || dbInstance!.articles.length === 0) dbInstance!.articles = initialArticles;
      if (!dbInstance!.orders) dbInstance!.orders = [];
      if (!dbInstance!.prescriptions) dbInstance!.prescriptions = [];
      if (!dbInstance!.appointments) dbInstance!.appointments = [];
      if (!dbInstance!.contactMessages) dbInstance!.contactMessages = [];
      if (!dbInstance!.auditLogs) dbInstance!.auditLogs = [];
      return dbInstance!;
    } catch (err) {
      console.error('Error loading database file, resetting to clean state:', err);
      dbInstance = getInitialDatabase();
      saveDatabase();
      return dbInstance;
    }
  } else {
    dbInstance = getInitialDatabase();
    saveDatabase();
    return dbInstance;
  }
}

export function saveDatabase(): void {
  if (!dbInstance) return;
  ensureDataDirExists();
  const tempFile = `${DB_FILE}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(dbInstance, null, 2), 'utf-8');
  fs.renameSync(tempFile, DB_FILE);
}

// ----------------- AUTHENTICATION -----------------

export function generateToken(user: User): string {
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
}

export function sanitizeUser(user: UserRecord): User {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

export function registerUser(userData: {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  address?: string;
  role?: 'customer';
}): { user: User; token: string } {
  const db = loadDatabase();
  const emailLower = userData.email.toLowerCase().trim();

  const existing = db.users.find((u) => u.email.toLowerCase() === emailLower);
  if (existing) {
    throw new Error('An account with this email address already exists.');
  }

  const passwordHash = bcrypt.hashSync(userData.password, 10);
  const newUser: UserRecord = {
    id: `usr-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    fullName: userData.fullName.trim(),
    phone: userData.phone.trim(),
    email: emailLower,
    address: userData.address?.trim() || '',
    role: 'customer',
    passwordHash,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  saveDatabase();

  const safe = sanitizeUser(newUser);
  const token = generateToken(safe);
  return { user: safe, token };
}

export function loginUser(email: string, password: string): { user: User; token: string } {
  const db = loadDatabase();
  const emailLower = email.toLowerCase().trim();
  const user = db.users.find((u) => u.email.toLowerCase() === emailLower);

  if (!user) {
    throw new Error('Invalid email or password.');
  }

  const isMatch = bcrypt.compareSync(password, user.passwordHash);
  if (!isMatch) {
    throw new Error('Invalid email or password.');
  }

  const safe = sanitizeUser(user);
  const token = generateToken(safe);
  return { user: safe, token };
}

export function getUserById(id: string): User | null {
  const db = loadDatabase();
  const user = db.users.find((u) => u.id === id);
  return user ? sanitizeUser(user) : null;
}

// ----------------- AUDIT LOGS -----------------

export function logAudit(
  actor: { id: string; name: string; role: string },
  action: string,
  entityType: 'order' | 'payment' | 'prescription' | 'appointment' | 'product' | 'service' | 'auth',
  entityId: string,
  details: string
): void {
  const db = loadDatabase();
  const log: AuditLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    action,
    entityType,
    entityId,
    details,
    createdAt: new Date().toISOString(),
  };
  db.auditLogs.unshift(log);
  if (db.auditLogs.length > 500) {
    db.auditLogs = db.auditLogs.slice(0, 500);
  }
  saveDatabase();
}

// ----------------- PRODUCTS & CATEGORIES -----------------

export function getCategories(): Category[] {
  const db = loadDatabase();
  return db.categories.filter((c) => c.active).sort((a, b) => a.order - b.order);
}

export function getAllCategoriesAdmin(): Category[] {
  const db = loadDatabase();
  return db.categories.sort((a, b) => a.order - b.order);
}

export function getProducts(options?: {
  categoryId?: string;
  search?: string;
  prescriptionRequired?: boolean;
  featuredOnly?: boolean;
  limit?: number;
  offset?: number;
}): { products: Product[]; total: number } {
  const db = loadDatabase();
  let list = db.products.filter((p) => p.active);

  if (options?.categoryId) {
    list = list.filter((p) => p.categoryId === options.categoryId);
  }

  if (options?.prescriptionRequired !== undefined) {
    list = list.filter((p) => p.prescriptionRequired === options.prescriptionRequired);
  }

  if (options?.featuredOnly) {
    list = list.filter((p) => p.isFeatured);
  }

  if (options?.search) {
    const q = options.search.toLowerCase().trim();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        (p.activeIngredient && p.activeIngredient.toLowerCase().includes(q)) ||
        p.sku.toLowerCase().includes(q)
    );
  }

  // Attach categoryName
  const categoryMap = new Map(db.categories.map((c) => [c.id, c.name]));
  list = list.map((p) => ({
    ...p,
    categoryName: categoryMap.get(p.categoryId) || 'General',
  }));

  const total = list.length;
  const offset = options?.offset || 0;
  const limit = options?.limit || 100;
  const paginated = list.slice(offset, offset + limit);

  return { products: paginated, total };
}

export function getProductBySlugOrId(idOrSlug: string): Product | null {
  const db = loadDatabase();
  const product = db.products.find((p) => p.id === idOrSlug || p.slug === idOrSlug);
  if (!product) return null;
  const category = db.categories.find((c) => c.id === product.categoryId);
  return {
    ...product,
    categoryName: category ? category.name : 'General',
  };
}

export function saveProduct(productData: Partial<Product>, actor: { id: string; name: string; role: string }): Product {
  const db = loadDatabase();

  if (productData.id) {
    const idx = db.products.findIndex((p) => p.id === productData.id);
    if (idx === -1) throw new Error('Product not found.');
    const updated: Product = {
      ...db.products[idx],
      ...productData,
      updatedAt: new Date().toISOString(),
    };
    db.products[idx] = updated;
    saveDatabase();
    logAudit(actor, 'PRODUCT_UPDATED', 'product', updated.id, `Updated product: ${updated.name} (Price: KSh ${updated.price}, Stock: ${updated.stockQuantity})`);
    return updated;
  } else {
    if (!productData.name || !productData.categoryId || productData.price === undefined) {
      throw new Error('Product name, category, and price are required.');
    }
    const slug = productData.slug || productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newProduct: Product = {
      id: `prod-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      categoryId: productData.categoryId,
      name: productData.name,
      slug,
      description: productData.description || '',
      sku: productData.sku || `SKU-${Date.now().toString().slice(-6)}`,
      brand: productData.brand || 'Generic',
      price: Number(productData.price),
      discountPrice: productData.discountPrice ? Number(productData.discountPrice) : undefined,
      stockQuantity: Number(productData.stockQuantity) || 0,
      prescriptionRequired: Boolean(productData.prescriptionRequired),
      imageUrl: productData.imageUrl || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80',
      active: productData.active !== undefined ? productData.active : true,
      dosageForm: productData.dosageForm || 'Tablets',
      activeIngredient: productData.activeIngredient || '',
      packSize: productData.packSize || 'Standard Pack',
      instructions: productData.instructions || '',
      warnings: productData.warnings || '',
      storageInfo: productData.storageInfo || '',
      isFeatured: Boolean(productData.isFeatured),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.products.push(newProduct);
    saveDatabase();
    logAudit(actor, 'PRODUCT_CREATED', 'product', newProduct.id, `Created product: ${newProduct.name} (KSh ${newProduct.price})`);
    return newProduct;
  }
}

export function deleteProduct(productId: string, actor: { id: string; name: string; role: string }): void {
  const db = loadDatabase();
  const idx = db.products.findIndex((p) => p.id === productId);
  if (idx === -1) throw new Error('Product not found.');
  const name = db.products[idx].name;
  db.products[idx].active = false;
  db.products[idx].updatedAt = new Date().toISOString();
  saveDatabase();
  logAudit(actor, 'PRODUCT_ARCHIVED', 'product', productId, `Archived product: ${name}`);
}

// ----------------- ORDERS & CART CALCULATION -----------------

export function calculateOrderTotals(
  items: { productId: string; quantity: number }[],
  fulfillmentMethod: 'pickup' | 'delivery'
): {
  validatedItems: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  prescriptionRequired: boolean;
} {
  const db = loadDatabase();
  let subtotal = 0;
  let hasPrescriptionItem = false;
  const validatedItems: OrderItem[] = [];

  for (const item of items) {
    if (item.quantity <= 0) {
      throw new Error('Item quantity must be greater than zero.');
    }
    const product = db.products.find((p) => p.id === item.productId && p.active);
    if (!product) {
      throw new Error(`Product with ID ${item.productId} is unavailable.`);
    }
    if (product.stockQuantity < item.quantity) {
      throw new Error(
        `Insufficient stock for "${product.name}". Available: ${product.stockQuantity}, Requested: ${item.quantity}.`
      );
    }

    const unitPrice = product.discountPrice !== undefined && product.discountPrice > 0 ? product.discountPrice : product.price;
    const itemSubtotal = unitPrice * item.quantity;
    subtotal += itemSubtotal;

    if (product.prescriptionRequired) {
      hasPrescriptionItem = true;
    }

    validatedItems.push({
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      productId: product.id,
      productNameSnapshot: product.name,
      unitPrice,
      quantity: item.quantity,
      subtotal: itemSubtotal,
      imageUrl: product.imageUrl,
      prescriptionRequired: product.prescriptionRequired,
      dosageForm: product.dosageForm,
    });
  }

  const deliveryFee = fulfillmentMethod === 'delivery' ? 150 : 0;
  const total = subtotal + deliveryFee;

  return {
    validatedItems,
    subtotal,
    deliveryFee,
    total,
    prescriptionRequired: hasPrescriptionItem,
  };
}

export function createOrder(data: {
  customerId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  items: { productId: string; quantity: number }[];
  fulfillmentMethod: 'pickup' | 'delivery';
  deliveryAddress?: string;
  deliveryLandmark?: string;
  notes?: string;
  prescriptionId?: string;
  paymentReference?: string;
  paymentProofUrl?: string;
}): Order {
  const db = loadDatabase();

  if (!data.customerName || !data.customerPhone) {
    throw new Error('Customer name and phone number are required.');
  }

  if (!data.items || data.items.length === 0) {
    throw new Error('Order must contain at least one item.');
  }

  if (data.fulfillmentMethod === 'delivery' && !data.deliveryAddress) {
    throw new Error('Delivery address is required for home/office delivery.');
  }

  // Atomic calculation and stock verification
  const { validatedItems, subtotal, deliveryFee, total, prescriptionRequired } = calculateOrderTotals(
    data.items,
    data.fulfillmentMethod
  );

  // If prescription item exists and no prescriptionId provided, enforce notification
  if (prescriptionRequired && !data.prescriptionId) {
    // Allowed to create order as pending_prescription_review
  }

  // Generate unique human-readable order number e.g. "GFP-2026-7842"
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  const orderNumber = `GFP-2026-${randomDigits}`;

  // Atomic Stock Deduction
  for (const item of data.items) {
    const prod = db.products.find((p) => p.id === item.productId)!;
    prod.stockQuantity = Math.max(0, prod.stockQuantity - item.quantity);
    prod.updatedAt = new Date().toISOString();
  }

  const hasPaymentRef = Boolean(data.paymentReference?.trim());

  const newOrder: Order = {
    id: `ord-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    orderNumber,
    customerId: data.customerId,
    customerName: data.customerName.trim(),
    customerPhone: data.customerPhone.trim(),
    customerEmail: data.customerEmail?.trim(),
    items: validatedItems,
    subtotal,
    deliveryFee,
    total,
    status: hasPaymentRef ? 'payment_submitted' : 'awaiting_payment',
    paymentStatus: hasPaymentRef ? 'submitted' : 'unpaid',
    fulfillmentMethod: data.fulfillmentMethod,
    deliveryAddress: data.deliveryAddress?.trim(),
    deliveryLandmark: data.deliveryLandmark?.trim(),
    notes: data.notes?.trim(),
    prescriptionId: data.prescriptionId,
    paymentDetails: hasPaymentRef
      ? {
          method: 'pochi_la_biashara',
          businessNumber: '07417758578',
          amount: total,
          transactionReference: data.paymentReference!.trim().toUpperCase(),
          proofUrl: data.paymentProofUrl,
          paidAt: new Date().toISOString(),
        }
      : undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.orders.unshift(newOrder);
  saveDatabase();

  logAudit(
    { id: data.customerId || 'guest', name: data.customerName, role: 'customer' },
    'ORDER_CREATED',
    'order',
    newOrder.id,
    `Order ${newOrder.orderNumber} created. Total: KSh ${newOrder.total} (${data.fulfillmentMethod}).`
  );

  return newOrder;
}

export function submitOrderPayment(
  orderId: string,
  transactionReference: string,
  proofUrl?: string
): Order {
  const db = loadDatabase();
  const order = db.orders.find((o) => o.id === orderId || o.orderNumber === orderId);

  if (!order) {
    throw new Error('Order not found.');
  }

  if (!transactionReference || transactionReference.trim().length < 4) {
    throw new Error('Valid M-Pesa / Pochi transaction confirmation reference is required.');
  }

  order.paymentDetails = {
    method: 'pochi_la_biashara',
    businessNumber: '07417758578',
    amount: order.total,
    transactionReference: transactionReference.trim().toUpperCase(),
    proofUrl: proofUrl || order.paymentDetails?.proofUrl,
    paidAt: new Date().toISOString(),
  };

  order.paymentStatus = 'submitted';
  order.status = 'payment_submitted';
  order.updatedAt = new Date().toISOString();

  saveDatabase();

  logAudit(
    { id: order.customerId || 'guest', name: order.customerName, role: 'customer' },
    'PAYMENT_SUBMITTED',
    'payment',
    order.id,
    `Payment submitted for ${order.orderNumber}. Ref: ${transactionReference.toUpperCase()}`
  );

  return order;
}

export function verifyOrderPayment(
  orderId: string,
  status: 'verified' | 'rejected',
  notes: string,
  staff: { id: string; name: string; role: string }
): Order {
  const db = loadDatabase();
  const order = db.orders.find((o) => o.id === orderId);

  if (!order) {
    throw new Error('Order not found.');
  }

  if (!order.paymentDetails) {
    throw new Error('No payment has been submitted for this order yet.');
  }

  order.paymentDetails.verifiedBy = staff.name;
  order.paymentDetails.verifiedAt = new Date().toISOString();
  order.paymentDetails.notes = notes;

  if (status === 'verified') {
    order.paymentStatus = 'verified';
    order.status = 'processing';
  } else {
    order.paymentStatus = 'failed';
    order.status = 'awaiting_payment';
  }

  order.updatedAt = new Date().toISOString();
  saveDatabase();

  logAudit(
    staff,
    status === 'verified' ? 'PAYMENT_VERIFIED' : 'PAYMENT_REJECTED',
    'payment',
    order.id,
    `Payment for order ${order.orderNumber} ${status === 'verified' ? 'VERIFIED' : 'REJECTED'}. Notes: ${notes}`
  );

  return order;
}

export function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  staff: { id: string; name: string; role: string },
  staffNotes?: string
): Order {
  const db = loadDatabase();
  const order = db.orders.find((o) => o.id === orderId);

  if (!order) {
    throw new Error('Order not found.');
  }

  const previousStatus = order.status;
  order.status = status;
  if (staffNotes) {
    order.notes = order.notes ? `${order.notes}\n[Staff Note: ${staffNotes}]` : `[Staff Note: ${staffNotes}]`;
  }
  order.updatedAt = new Date().toISOString();
  saveDatabase();

  logAudit(
    staff,
    'ORDER_STATUS_UPDATED',
    'order',
    order.id,
    `Order ${order.orderNumber} status changed from ${previousStatus} to ${status}`
  );

  return order;
}

export function getOrders(options?: {
  customerId?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  search?: string;
  limit?: number;
  offset?: number;
}): { orders: Order[]; total: number } {
  const db = loadDatabase();
  let list = db.orders;

  if (options?.customerId) {
    list = list.filter((o) => o.customerId === options.customerId);
  }

  if (options?.status) {
    list = list.filter((o) => o.status === options.status);
  }

  if (options?.paymentStatus) {
    list = list.filter((o) => o.paymentStatus === options.paymentStatus);
  }

  if (options?.search) {
    const q = options.search.toLowerCase().trim();
    list = list.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.includes(q) ||
        (o.paymentDetails?.transactionReference &&
          o.paymentDetails.transactionReference.toLowerCase().includes(q))
    );
  }

  const total = list.length;
  const offset = options?.offset || 0;
  const limit = options?.limit || 100;
  const paginated = list.slice(offset, offset + limit);

  return { orders: paginated, total };
}

export function getOrderByNumberOrId(idOrNumber: string, phone?: string): Order | null {
  const db = loadDatabase();
  const order = db.orders.find(
    (o) =>
      o.id === idOrNumber ||
      o.orderNumber.toLowerCase() === idOrNumber.toLowerCase().trim()
  );

  if (!order) return null;

  // Optional privacy guard if guest is looking up with phone
  if (phone && order.customerPhone.replace(/\D/g, '') !== phone.replace(/\D/g, '')) {
    return null;
  }

  return order;
}

// ----------------- PRESCRIPTIONS -----------------

export function createPrescription(data: {
  customerId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  notes?: string;
  medicationsRequested?: string;
  doctorName?: string;
  hospitalName?: string;
}): Prescription {
  const db = loadDatabase();

  if (!data.customerName || !data.customerPhone) {
    throw new Error('Patient name and contact phone number are required.');
  }

  if (!data.fileUrl) {
    throw new Error('Prescription file or document image is required.');
  }

  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  const prescriptionNumber = `RX-2026-${randomDigits}`;

  const newPrescription: Prescription = {
    id: `rx-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    prescriptionNumber,
    customerId: data.customerId,
    customerName: data.customerName.trim(),
    customerPhone: data.customerPhone.trim(),
    customerEmail: data.customerEmail?.trim(),
    fileUrl: data.fileUrl,
    fileName: data.fileName,
    fileType: data.fileType,
    notes: data.notes?.trim(),
    medicationsRequested: data.medicationsRequested?.trim(),
    doctorName: data.doctorName?.trim(),
    hospitalName: data.hospitalName?.trim(),
    status: 'pending_review',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.prescriptions.unshift(newPrescription);
  saveDatabase();

  logAudit(
    { id: data.customerId || 'guest', name: data.customerName, role: 'customer' },
    'PRESCRIPTION_SUBMITTED',
    'prescription',
    newPrescription.id,
    `Prescription ${newPrescription.prescriptionNumber} uploaded for pharmacist review.`
  );

  return newPrescription;
}

export function reviewPrescription(
  prescriptionId: string,
  status: PrescriptionStatus,
  reviewNotes: string,
  staff: { id: string; name: string; role: string }
): Prescription {
  const db = loadDatabase();
  const prescription = db.prescriptions.find((p) => p.id === prescriptionId);

  if (!prescription) {
    throw new Error('Prescription not found.');
  }

  prescription.status = status;
  prescription.reviewNotes = reviewNotes;
  prescription.reviewedBy = staff.name;
  prescription.reviewedAt = new Date().toISOString();
  prescription.updatedAt = new Date().toISOString();

  saveDatabase();

  logAudit(
    staff,
    'PRESCRIPTION_REVIEWED',
    'prescription',
    prescription.id,
    `Prescription ${prescription.prescriptionNumber} marked as ${status}. Notes: ${reviewNotes}`
  );

  return prescription;
}

export function getPrescriptions(options?: {
  customerId?: string;
  status?: PrescriptionStatus;
}): Prescription[] {
  const db = loadDatabase();
  let list = db.prescriptions;

  if (options?.customerId) {
    list = list.filter((p) => p.customerId === options.customerId);
  }

  if (options?.status) {
    list = list.filter((p) => p.status === options.status);
  }

  return list;
}

// ----------------- APPOINTMENTS -----------------

export function createAppointment(data: {
  customerId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  serviceId: string;
  appointmentDate: string;
  appointmentTime: string;
  notes?: string;
}): Appointment {
  const db = loadDatabase();

  if (!data.customerName || !data.customerPhone || !data.serviceId || !data.appointmentDate || !data.appointmentTime) {
    throw new Error('Customer name, phone, service, date, and preferred time are required.');
  }

  const service = db.services.find((s) => s.id === data.serviceId);
  const serviceName = service ? service.name : 'General Pharmacy Consultation';

  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  const appointmentNumber = `APT-2026-${randomDigits}`;

  const newAppointment: Appointment = {
    id: `apt-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    appointmentNumber,
    customerId: data.customerId,
    customerName: data.customerName.trim(),
    customerPhone: data.customerPhone.trim(),
    customerEmail: data.customerEmail?.trim(),
    serviceId: data.serviceId,
    serviceName,
    appointmentDate: data.appointmentDate,
    appointmentTime: data.appointmentTime,
    notes: data.notes?.trim(),
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.appointments.unshift(newAppointment);
  saveDatabase();

  logAudit(
    { id: data.customerId || 'guest', name: data.customerName, role: 'customer' },
    'APPOINTMENT_REQUESTED',
    'appointment',
    newAppointment.id,
    `Appointment ${newAppointment.appointmentNumber} requested for ${serviceName} on ${data.appointmentDate} at ${data.appointmentTime}.`
  );

  return newAppointment;
}

export function updateAppointmentStatus(
  appointmentId: string,
  status: AppointmentStatus,
  staffNotes: string | undefined,
  staff: { id: string; name: string; role: string }
): Appointment {
  const db = loadDatabase();
  const appointment = db.appointments.find((a) => a.id === appointmentId);

  if (!appointment) {
    throw new Error('Appointment not found.');
  }

  appointment.status = status;
  if (staffNotes) {
    appointment.staffNotes = staffNotes;
  }
  appointment.updatedAt = new Date().toISOString();

  saveDatabase();

  logAudit(
    staff,
    'APPOINTMENT_UPDATED',
    'appointment',
    appointment.id,
    `Appointment ${appointment.appointmentNumber} marked as ${status}. Staff note: ${staffNotes || 'N/A'}`
  );

  return appointment;
}

export function getAppointments(options?: { customerId?: string; status?: AppointmentStatus }): Appointment[] {
  const db = loadDatabase();
  let list = db.appointments;

  if (options?.customerId) {
    list = list.filter((a) => a.customerId === options.customerId);
  }

  if (options?.status) {
    list = list.filter((a) => a.status === options.status);
  }

  return list;
}

// ----------------- SERVICES & ARTICLES & CONTACT -----------------

export function getServices(): PharmacyService[] {
  const db = loadDatabase();
  return db.services.filter((s) => s.available);
}

export function getAllServicesAdmin(): PharmacyService[] {
  const db = loadDatabase();
  return db.services;
}

export function saveService(serviceData: Partial<PharmacyService>, actor: { id: string; name: string; role: string }): PharmacyService {
  const db = loadDatabase();
  if (serviceData.id) {
    const idx = db.services.findIndex((s) => s.id === serviceData.id);
    if (idx === -1) throw new Error('Service not found.');
    const updated = { ...db.services[idx], ...serviceData };
    db.services[idx] = updated;
    saveDatabase();
    logAudit(actor, 'SERVICE_UPDATED', 'service', updated.id, `Updated service: ${updated.name}`);
    return updated;
  } else {
    const newService: PharmacyService = {
      id: `srv-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: serviceData.name || 'New Service',
      slug: serviceData.slug || serviceData.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'service',
      shortDescription: serviceData.shortDescription || '',
      fullDescription: serviceData.fullDescription || '',
      priceEstimate: serviceData.priceEstimate || 'Contact for price',
      duration: serviceData.duration || '15 mins',
      iconName: serviceData.iconName || 'Activity',
      category: serviceData.category || 'General',
      available: serviceData.available !== undefined ? serviceData.available : true,
      featured: Boolean(serviceData.featured),
      createdAt: new Date().toISOString(),
    };
    db.services.push(newService);
    saveDatabase();
    logAudit(actor, 'SERVICE_CREATED', 'service', newService.id, `Created service: ${newService.name}`);
    return newService;
  }
}

export function getArticles(): HealthArticle[] {
  const db = loadDatabase();
  return db.articles.filter((a) => a.published);
}

export function getArticleBySlug(slug: string): HealthArticle | null {
  const db = loadDatabase();
  return db.articles.find((a) => a.slug === slug && a.published) || null;
}

export function saveArticle(articleData: Partial<HealthArticle>, actor: { id: string; name: string; role: string }): HealthArticle {
  const db = loadDatabase();
  if (articleData.id) {
    const idx = db.articles.findIndex((a) => a.id === articleData.id);
    if (idx === -1) throw new Error('Article not found.');
    const updated = { ...db.articles[idx], ...articleData };
    db.articles[idx] = updated;
    saveDatabase();
    return updated;
  } else {
    const newArt: HealthArticle = {
      id: `art-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      title: articleData.title || 'Untitled Article',
      slug: articleData.slug || articleData.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'article',
      excerpt: articleData.excerpt || '',
      content: articleData.content || '',
      category: articleData.category || 'Health Education',
      author: articleData.author || 'Gods Favor Pharmacy Team',
      readTime: articleData.readTime || '4 min read',
      publishedDate: new Date().toISOString().split('T')[0],
      imageUrl: articleData.imageUrl || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80',
      tags: articleData.tags || ['Health', 'Pharmacy'],
      published: articleData.published !== undefined ? articleData.published : true,
    };
    db.articles.push(newArt);
    saveDatabase();
    return newArt;
  }
}

export function createContactMessage(data: {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}): ContactMessage {
  const db = loadDatabase();
  if (!data.name || !data.phone || !data.message) {
    throw new Error('Name, phone number, and message content are required.');
  }

  const newMsg: ContactMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    name: data.name.trim(),
    email: data.email?.trim() || '',
    phone: data.phone.trim(),
    subject: data.subject?.trim() || 'General Inquiry',
    message: data.message.trim(),
    status: 'unread',
    createdAt: new Date().toISOString(),
  };

  db.contactMessages.unshift(newMsg);
  saveDatabase();
  return newMsg;
}

export function getContactMessages(): ContactMessage[] {
  const db = loadDatabase();
  return db.contactMessages;
}

export function updateContactMessageStatus(id: string, status: 'unread' | 'read' | 'replied', replyNotes?: string): ContactMessage {
  const db = loadDatabase();
  const msg = db.contactMessages.find((m) => m.id === id);
  if (!msg) throw new Error('Message not found.');
  msg.status = status;
  if (replyNotes) msg.replyNotes = replyNotes;
  saveDatabase();
  return msg;
}

// ----------------- SETTINGS & METRICS -----------------

export function getSettings(): PharmacySettings {
  const db = loadDatabase();
  return db.settings;
}

export function updateSettings(settingsData: Partial<PharmacySettings>, actor: { id: string; name: string; role: string }): PharmacySettings {
  const db = loadDatabase();
  db.settings = {
    ...db.settings,
    ...settingsData,
  };
  saveDatabase();
  logAudit(actor, 'SETTINGS_UPDATED', 'auth', 'settings', 'Updated pharmacy business contact and operating hours settings.');
  return db.settings;
}

export function getAdminMetrics(): {
  todayOrdersCount: number;
  pendingOrdersCount: number;
  pendingPaymentsCount: number;
  pendingPrescriptionsCount: number;
  upcomingAppointmentsCount: number;
  lowStockCount: number;
  totalRevenue: number;
  recentOrders: Order[];
  recentAuditLogs: AuditLog[];
} {
  const db = loadDatabase();
  const todayStr = new Date().toISOString().split('T')[0];

  const todayOrders = db.orders.filter((o) => o.createdAt.startsWith(todayStr));
  const pendingOrders = db.orders.filter((o) => o.status === 'pending' || o.status === 'awaiting_payment' || o.status === 'payment_submitted');
  const pendingPayments = db.orders.filter((o) => o.paymentStatus === 'submitted');
  const pendingPrescriptions = db.prescriptions.filter((p) => p.status === 'pending_review');
  const upcomingAppointments = db.appointments.filter((a) => a.status === 'pending' || a.status === 'confirmed');
  const lowStock = db.products.filter((p) => p.active && p.stockQuantity <= 10);

  const totalRevenue = db.orders
    .filter((o) => o.paymentStatus === 'verified')
    .reduce((sum, o) => sum + o.total, 0);

  return {
    todayOrdersCount: todayOrders.length,
    pendingOrdersCount: pendingOrders.length,
    pendingPaymentsCount: pendingPayments.length,
    pendingPrescriptionsCount: pendingPrescriptions.length,
    upcomingAppointmentsCount: upcomingAppointments.length,
    lowStockCount: lowStock.length,
    totalRevenue,
    recentOrders: db.orders.slice(0, 10),
    recentAuditLogs: db.auditLogs.slice(0, 15),
  };
}

export function getAuditLogs(): AuditLog[] {
  const db = loadDatabase();
  return db.auditLogs;
}
