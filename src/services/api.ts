import {
  Category,
  Product,
  Order,
  Prescription,
  Appointment,
  PharmacyService,
  HealthArticle,
  ContactMessage,
  PharmacySettings,
  User,
  AuthResponse,
  OrderStatus,
  PaymentStatus,
  PrescriptionStatus,
  AppointmentStatus,
} from '../types';

const API_BASE = '/api';

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('gfp_auth_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse<T>(res: globalThis.Response): Promise<T> {
  if (!res.ok) {
    let errorMsg = 'Network request failed';
    try {
      const errorData = await res.json();
      errorMsg = errorData.error || errorMsg;
    } catch {
      // keep fallback
    }
    throw new Error(errorMsg);
  }
  return res.json() as Promise<T>;
}

export const api = {
  // Settings & System
  async getSettings(): Promise<PharmacySettings> {
    const res = await fetch(`${API_BASE}/settings`);
    return handleResponse<PharmacySettings>(res);
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    const res = await fetch(`${API_BASE}/categories`);
    return handleResponse<Category[]>(res);
  },

  // Products
  async getProducts(params?: {
    category?: string;
    q?: string;
    prescription?: boolean;
    featured?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ products: Product[]; total: number }> {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.q) query.append('q', params.q);
    if (params?.prescription !== undefined) query.append('prescription', String(params.prescription));
    if (params?.featured) query.append('featured', 'true');
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.offset) query.append('offset', String(params.offset));

    const res = await fetch(`${API_BASE}/products?${query.toString()}`);
    return handleResponse<{ products: Product[]; total: number }>(res);
  },

  async getProduct(idOrSlug: string): Promise<Product> {
    const res = await fetch(`${API_BASE}/products/${idOrSlug}`);
    return handleResponse<Product>(res);
  },

  // Cart Calculation
  async calculateCart(
    items: { productId: string; quantity: number }[],
    fulfillmentMethod: 'pickup' | 'delivery'
  ): Promise<{
    validatedItems: any[];
    subtotal: number;
    deliveryFee: number;
    total: number;
    prescriptionRequired: boolean;
  }> {
    const res = await fetch(`${API_BASE}/cart/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items, fulfillmentMethod }),
    });
    return handleResponse(res);
  },

  // Orders
  async createOrder(orderData: {
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
  }): Promise<Order> {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(orderData),
    });
    return handleResponse<Order>(res);
  },

  async trackOrder(orderNumber: string, phone?: string): Promise<Order> {
    const query = new URLSearchParams({ orderNumber });
    if (phone) query.append('phone', phone);
    const res = await fetch(`${API_BASE}/orders/track?${query.toString()}`);
    return handleResponse<Order>(res);
  },

  async submitPayment(orderId: string, transactionReference: string, proofUrl?: string): Promise<{ success: boolean; message: string; order: Order }> {
    const res = await fetch(`${API_BASE}/payments/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, transactionReference, proofUrl }),
    });
    return handleResponse(res);
  },

  // Prescriptions
  async uploadPrescription(data: {
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
  }): Promise<{ success: boolean; message: string; prescription: Prescription }> {
    const res = await fetch(`${API_BASE}/prescriptions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  // Appointments
  async requestAppointment(data: {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    serviceId: string;
    appointmentDate: string;
    appointmentTime: string;
    notes?: string;
  }): Promise<{ success: boolean; message: string; appointment: Appointment }> {
    const res = await fetch(`${API_BASE}/appointments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  // Services
  async getServices(): Promise<PharmacyService[]> {
    const res = await fetch(`${API_BASE}/services`);
    return handleResponse<PharmacyService[]>(res);
  },

  // Articles
  async getArticles(): Promise<HealthArticle[]> {
    const res = await fetch(`${API_BASE}/articles`);
    return handleResponse<HealthArticle[]>(res);
  },

  async getArticle(slug: string): Promise<HealthArticle> {
    const res = await fetch(`${API_BASE}/articles/${slug}`);
    return handleResponse<HealthArticle>(res);
  },

  // Contact
  async sendContactMessage(data: {
    name: string;
    email?: string;
    phone: string;
    subject?: string;
    message: string;
  }): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  // AI Virtual Pharmacist Assistant
  async askHealthAssistant(query: string, context?: string): Promise<{ answer: string; disclaimer: string }> {
    const res = await fetch(`${API_BASE}/ai/health-assistant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, context }),
    });
    return handleResponse(res);
  },

  // Authentication
  async register(data: {
    fullName: string;
    phone: string;
    email: string;
    password: string;
    address?: string;
  }): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<AuthResponse>(res);
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse<AuthResponse>(res);
  },

  async getMe(): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<{ user: User }>(res);
  },

  // Customer Account
  async getMyOrders(): Promise<Order[]> {
    const res = await fetch(`${API_BASE}/account/orders`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Order[]>(res);
  },

  async getMyPrescriptions(): Promise<Prescription[]> {
    const res = await fetch(`${API_BASE}/account/prescriptions`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Prescription[]>(res);
  },

  async getMyAppointments(): Promise<Appointment[]> {
    const res = await fetch(`${API_BASE}/account/appointments`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Appointment[]>(res);
  },

  // ----------------- ADMIN PORTAL APIS -----------------

  async getAdminMetrics(): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/metrics`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async getAdminOrders(params?: { status?: OrderStatus; paymentStatus?: PaymentStatus; search?: string }): Promise<{ orders: Order[]; total: number }> {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.paymentStatus) query.append('paymentStatus', params.paymentStatus);
    if (params?.search) query.append('search', params.search);

    const res = await fetch(`${API_BASE}/admin/orders?${query.toString()}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async updateOrderStatus(id: string, status: OrderStatus, staffNotes?: string): Promise<{ success: boolean; order: Order }> {
    const res = await fetch(`${API_BASE}/admin/orders/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, staffNotes }),
    });
    return handleResponse(res);
  },

  async verifyPayment(id: string, status: 'verified' | 'rejected', notes?: string): Promise<{ success: boolean; message: string; order: Order }> {
    const res = await fetch(`${API_BASE}/admin/orders/${id}/verify-payment`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, notes }),
    });
    return handleResponse(res);
  },

  async getAdminProducts(): Promise<Product[]> {
    const res = await fetch(`${API_BASE}/admin/products`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Product[]>(res);
  },

  async saveProduct(product: Partial<Product>): Promise<{ success: boolean; product: Product }> {
    const isEdit = Boolean(product.id);
    const url = isEdit ? `${API_BASE}/admin/products/${product.id}` : `${API_BASE}/admin/products`;
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: getAuthHeaders(),
      body: JSON.stringify(product),
    });
    return handleResponse(res);
  },

  async deleteProduct(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/admin/products/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async getAdminPrescriptions(status?: PrescriptionStatus): Promise<Prescription[]> {
    const query = status ? `?status=${status}` : '';
    const res = await fetch(`${API_BASE}/admin/prescriptions${query}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Prescription[]>(res);
  },

  async reviewPrescription(id: string, status: PrescriptionStatus, reviewNotes?: string): Promise<{ success: boolean; prescription: Prescription }> {
    const res = await fetch(`${API_BASE}/admin/prescriptions/${id}/review`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, reviewNotes }),
    });
    return handleResponse(res);
  },

  async getAdminAppointments(status?: AppointmentStatus): Promise<Appointment[]> {
    const query = status ? `?status=${status}` : '';
    const res = await fetch(`${API_BASE}/admin/appointments${query}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Appointment[]>(res);
  },

  async updateAppointment(id: string, status: AppointmentStatus, staffNotes?: string): Promise<{ success: boolean; appointment: Appointment }> {
    const res = await fetch(`${API_BASE}/admin/appointments/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, staffNotes }),
    });
    return handleResponse(res);
  },

  async getAdminServices(): Promise<PharmacyService[]> {
    const res = await fetch(`${API_BASE}/admin/services`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<PharmacyService[]>(res);
  },

  async saveService(service: Partial<PharmacyService>): Promise<{ success: boolean; service: PharmacyService }> {
    const isEdit = Boolean(service.id);
    const url = isEdit ? `${API_BASE}/admin/services/${service.id}` : `${API_BASE}/admin/services`;
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: getAuthHeaders(),
      body: JSON.stringify(service),
    });
    return handleResponse(res);
  },

  async getAdminContactMessages(): Promise<ContactMessage[]> {
    const res = await fetch(`${API_BASE}/admin/contact-messages`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<ContactMessage[]>(res);
  },

  async updateContactMessage(id: string, status: 'unread' | 'read' | 'replied', replyNotes?: string): Promise<{ success: boolean; contactMessage: ContactMessage }> {
    const res = await fetch(`${API_BASE}/admin/contact-messages/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, replyNotes }),
    });
    return handleResponse(res);
  },

  async getAuditLogs(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/admin/audit-logs`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async updateSettings(settings: Partial<PharmacySettings>): Promise<{ success: boolean; settings: PharmacySettings }> {
    const res = await fetch(`${API_BASE}/admin/settings`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(settings),
    });
    return handleResponse(res);
  },
};
