export type UserRole = 'customer' | 'pharmacist' | 'staff' | 'admin' | 'super_admin';

export interface User {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  address?: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName?: string;
  active: boolean;
  order: number;
}

export interface Product {
  id: string;
  categoryId: string;
  categoryName?: string;
  name: string;
  slug: string;
  description: string;
  sku: string;
  brand: string;
  price: number; // in KSh
  discountPrice?: number;
  stockQuantity: number;
  prescriptionRequired: boolean;
  imageUrl: string;
  active: boolean;
  dosageForm: string; // e.g. "Tablets", "Syrup", "Suspension", "Cream", "Inhaler", "Injection", "Drops"
  activeIngredient?: string;
  packSize: string; // e.g. "30 Tablets", "100ml Bottle", "1 Tube (20g)"
  instructions?: string;
  warnings?: string;
  sideEffects?: string;
  storageInfo?: string;
  isFeatured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productNameSnapshot: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  imageUrl?: string;
  prescriptionRequired: boolean;
  dosageForm?: string;
}

export type OrderStatus =
  | 'pending'
  | 'awaiting_payment'
  | 'payment_submitted'
  | 'payment_verified'
  | 'processing'
  | 'ready_for_pickup'
  | 'out_for_delivery'
  | 'completed'
  | 'cancelled'
  | 'rejected';

export type PaymentStatus =
  | 'unpaid'
  | 'submitted'
  | 'verified'
  | 'failed'
  | 'refunded';

export type FulfillmentMethod = 'pickup' | 'delivery';

export interface PaymentDetails {
  method: 'pochi_la_biashara';
  businessNumber: string;
  amount: number;
  transactionReference: string; // M-Pesa confirmation code
  proofUrl?: string; // screenshot data or URL
  paidAt?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. "GFP-2026-8942"
  customerId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  fulfillmentMethod: FulfillmentMethod;
  deliveryAddress?: string;
  deliveryLandmark?: string;
  notes?: string;
  prescriptionId?: string;
  paymentDetails?: PaymentDetails;
  createdAt: string;
  updatedAt: string;
}

export type PrescriptionStatus =
  | 'pending_review'
  | 'approved'
  | 'rejected'
  | 'clarification_required';

export interface Prescription {
  id: string;
  prescriptionNumber: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  fileUrl: string; // base64 or file URL
  fileName: string;
  fileType: string;
  notes?: string;
  medicationsRequested?: string;
  doctorName?: string;
  hospitalName?: string;
  status: PrescriptionStatus;
  reviewedBy?: string;
  reviewNotes?: string;
  reviewedAt?: string;
  associatedOrderId?: string;
  createdAt: string;
  updatedAt: string;
}

export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'rescheduled'
  | 'completed'
  | 'cancelled';

export interface Appointment {
  id: string;
  appointmentNumber: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  serviceId: string;
  serviceName: string;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // e.g. "10:30 AM"
  notes?: string;
  status: AppointmentStatus;
  staffNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PharmacyService {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  priceEstimate?: string;
  duration?: string;
  iconName: string;
  category: string;
  available: boolean;
  featured: boolean;
  createdAt: string;
}

export interface HealthArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  readTime: string;
  publishedDate: string;
  imageUrl: string;
  tags: string[];
  published: boolean;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  createdAt: string;
  replyNotes?: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: string;
  entityType: 'order' | 'payment' | 'prescription' | 'appointment' | 'product' | 'service' | 'auth';
  entityId: string;
  details: string;
  createdAt: string;
}

export interface PharmacySettings {
  name: string;
  tagline: string;
  locationAddress: string;
  road: string;
  town: string;
  county: string;
  country: string;
  doctorPhone: string;
  pochiNumber: string;
  emergencyNotice: string;
  openingHours: {
    weekdays: string;
    saturday: string;
    sunday: string;
    holidays: string;
  };
  email: string;
  whatsappNumber: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
