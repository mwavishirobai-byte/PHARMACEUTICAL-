import React, { useState, useEffect } from 'react';
import {
  Package,
  FileText,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Plus,
  RefreshCw,
  PhoneCall,
  User,
  ShieldCheck,
  Truck,
  ExternalLink,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Order,
  Prescription,
  Appointment,
  Product,
  OrderStatus,
  PrescriptionStatus,
  AppointmentStatus,
} from '../types';

interface AdminPageProps {
  onNavigate: (view: string, data?: any) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'prescriptions' | 'appointments' | 'products'>('orders');

  const [orders, setOrders] = useState<Order[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Selected for review modal / notes
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [staffNote, setStaffNote] = useState<string>('');

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'orders') {
        const data = await api.getAdminOrders();
        setOrders(data.orders || []);
      } else if (activeTab === 'prescriptions') {
        const data = await api.getAdminPrescriptions();
        setPrescriptions(data || []);
      } else if (activeTab === 'appointments') {
        const data = await api.getAdminAppointments();
        setAppointments(data || []);
      } else if (activeTab === 'products') {
        const data = await api.getAdminProducts();
        setProducts(data || []);
      }
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await api.updateOrderStatus(orderId, status, staffNote || undefined);
      setActionSuccess(`Order updated to "${status.replace(/_/g, ' ')}"`);
      setTimeout(() => setActionSuccess(null), 3000);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update order');
    }
  };

  const handleVerifyPayment = async (orderId: string, status: 'verified' | 'rejected') => {
    try {
      await api.verifyPayment(orderId, status, 'Verified via Pochi la Biashara M-Pesa 07417758578');
      setActionSuccess(`Payment status set to "${status}"`);
      setTimeout(() => setActionSuccess(null), 3000);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to verify payment');
    }
  };

  const handleReviewPrescription = async (prescId: string, status: PrescriptionStatus) => {
    const notes = prompt(`Enter pharmacist review note for patient (Optional):`, 'Verified by pharmacist on duty.');
    try {
      await api.reviewPrescription(prescId, status, notes || undefined);
      setActionSuccess(`Prescription status updated to "${status}"`);
      setTimeout(() => setActionSuccess(null), 3000);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update prescription');
    }
  };

  const handleUpdateAppointment = async (appId: string, status: AppointmentStatus) => {
    try {
      await api.updateAppointment(appId, status, 'Confirmed by clinical team.');
      setActionSuccess(`Appointment marked as "${status}"`);
      setTimeout(() => setActionSuccess(null), 3000);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update appointment');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-emerald-500 text-emerald-950 font-black text-xs px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Staff Clinical Portal
            </span>
            <span className="text-slate-400 text-xs font-mono">Kitale Store Ops</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Pharmacy Operations Management</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Logged in as: <strong className="text-emerald-400">{user?.fullName || 'Pharmacy Staff'}</strong> ({user?.role || 'Staff'})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-700 flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
            activeTab === 'orders'
              ? 'bg-emerald-800 text-white shadow-md'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Orders & Payments</span>
        </button>

        <button
          onClick={() => setActiveTab('prescriptions')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
            activeTab === 'prescriptions'
              ? 'bg-emerald-800 text-white shadow-md'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Prescription Approvals</span>
        </button>

        <button
          onClick={() => setActiveTab('appointments')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
            activeTab === 'appointments'
              ? 'bg-emerald-800 text-white shadow-md'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Clinical Appointments</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
            activeTab === 'products'
              ? 'bg-emerald-800 text-white shadow-md'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Medicine Inventory</span>
        </button>
      </div>

      {/* TAB CONTENT: ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-900">
              Customer Orders & Pochi M-Pesa Verification ({orders.length})
            </h2>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-slate-100 rounded-2xl h-24 animate-pulse" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-500 text-sm">
              No orders found in the database.
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow space-y-4"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-emerald-800 text-sm">{ord.orderNumber}</span>
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-semibold">
                          {new Date(ord.createdAt).toLocaleDateString()} {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-xs font-bold text-slate-800">
                          {ord.fulfillmentMethod === 'pickup' ? 'Counter Pickup' : 'Kitale Delivery'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        Patient: <strong>{ord.customerName}</strong> &bull; Phone: <a href={`tel:${ord.customerPhone}`} className="text-emerald-800 font-bold underline">{ord.customerPhone}</a>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2.5 py-1 rounded-md font-bold uppercase ${
                        ord.status === 'delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ord.status === 'processing'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}>
                        {ord.status.replace(/_/g, ' ')}
                      </span>

                      <span className={`text-xs px-2.5 py-1 rounded-md font-bold uppercase ${
                        ord.paymentStatus === 'verified'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ord.paymentStatus === 'submitted'
                          ? 'bg-purple-100 text-purple-900 animate-pulse'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        Payment: {ord.paymentStatus}
                      </span>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                      <strong className="text-slate-800 block">Ordered Medications:</strong>
                      {ord.items.map((it) => (
                        <div key={it.id} className="flex justify-between text-slate-600">
                          <span>{it.quantity}x {it.productNameSnapshot}</span>
                          <span className="font-semibold">KSh {it.subtotal.toLocaleString()}</span>
                        </div>
                      ))}
                      <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-slate-900 text-sm">
                        <span>Total Due:</span>
                        <span className="text-emerald-800">KSh {ord.total.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2">
                      <div>
                        <strong className="text-slate-800 block">Pochi la Biashara Ref:</strong>
                        {ord.paymentDetails?.transactionReference ? (
                          <span className="font-mono font-black text-emerald-800 text-sm">
                            {ord.paymentDetails.transactionReference}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">No M-Pesa reference submitted yet</span>
                        )}
                      </div>

                      {ord.deliveryAddress && (
                        <div>
                          <strong className="text-slate-800 block">Delivery Location:</strong>
                          <span className="text-slate-600">{ord.deliveryAddress} ({ord.deliveryLandmark})</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Staff Actions Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-500 uppercase">Change Status:</span>
                      <button
                        onClick={() => handleUpdateOrderStatus(ord.id, 'processing')}
                        className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded-lg font-semibold"
                      >
                        Dispensing
                      </button>
                      <button
                        onClick={() => handleUpdateOrderStatus(ord.id, 'ready_for_pickup')}
                        className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-800 px-3 py-1.5 rounded-lg font-semibold"
                      >
                        Ready for Pickup
                      </button>
                      <button
                        onClick={() => handleUpdateOrderStatus(ord.id, 'completed')}
                        className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-lg font-semibold"
                      >
                        Mark Completed
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      {ord.paymentStatus !== 'verified' ? (
                        <button
                          onClick={() => handleVerifyPayment(ord.id, 'verified')}
                          className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg transition-colors shadow-xs"
                        >
                          Verify Pochi Payment (07417758578)
                        </button>
                      ) : (
                        <span className="text-xs text-emerald-800 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Payment Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: PRESCRIPTIONS */}
      {activeTab === 'prescriptions' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">
            Uploaded Doctor Prescriptions for Pharmacist Review ({prescriptions.length})
          </h2>

          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="bg-slate-100 rounded-2xl h-24 animate-pulse" />
              ))}
            </div>
          ) : prescriptions.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-500 text-sm">
              No prescriptions uploaded yet.
            </div>
          ) : (
            <div className="space-y-4">
              {prescriptions.map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-emerald-800 text-sm">{p.prescriptionNumber}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-md font-bold uppercase ${
                          p.status === 'verified'
                            ? 'bg-emerald-100 text-emerald-800'
                            : p.status === 'dispensed'
                            ? 'bg-blue-100 text-blue-800'
                            : p.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-900'
                        }`}>
                          {p.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        Patient: <strong>{p.customerName}</strong> &bull; Phone: <a href={`tel:${p.customerPhone}`} className="text-emerald-800 font-bold underline">{p.customerPhone}</a>
                      </p>
                    </div>

                    <div className="text-xs text-slate-500">
                      Uploaded: {new Date(p.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-2">
                      {p.doctorName && (
                        <div>
                          <strong className="text-slate-700">Prescribing Doctor:</strong> {p.doctorName}
                        </div>
                      )}
                      {p.hospitalName && (
                        <div>
                          <strong className="text-slate-700">Hospital / Clinic:</strong> {p.hospitalName}
                        </div>
                      )}
                      {p.medicationsRequested && (
                        <div className="bg-slate-50 p-2.5 rounded-xl">
                          <strong className="text-slate-800 block">Medications Requested:</strong>
                          <p className="text-slate-600">{p.medicationsRequested}</p>
                        </div>
                      )}
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between">
                      <div>
                        <strong className="text-slate-800 block">Prescription Document:</strong>
                        <span className="text-slate-500 truncate max-w-xs block">{p.fileName}</span>
                      </div>
                      {p.fileUrl && (
                        <a
                          href={p.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs"
                        >
                          <span>View Doc</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Pharmacist Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                    <span className="text-xs text-slate-500">
                      Pharmacist Action:
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleReviewPrescription(p.id, 'approved')}
                        className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Approve & Verify
                      </button>
                      <button
                        onClick={() => handleReviewPrescription(p.id, 'clarification_required')}
                        className="bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Need Clarification
                      </button>
                      <button
                        onClick={() => handleReviewPrescription(p.id, 'rejected')}
                        className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: APPOINTMENTS */}
      {activeTab === 'appointments' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">
            Booked Screenings & Consultations ({appointments.length})
          </h2>

          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="bg-slate-100 rounded-2xl h-24 animate-pulse" />
              ))}
            </div>
          ) : appointments.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-500 text-sm">
              No appointments scheduled.
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((app) => (
                <div
                  key={app.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-emerald-800 text-sm">{app.appointmentNumber}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-md font-bold uppercase ${
                          app.status === 'confirmed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : app.status === 'completed'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-900'
                        }`}>
                          {app.status}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mt-1">{app.serviceName}</h4>
                      <p className="text-xs text-slate-600">
                        Patient: <strong>{app.customerName}</strong> &bull; Phone: <a href={`tel:${app.customerPhone}`} className="text-emerald-800 font-bold underline">{app.customerPhone}</a>
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-slate-900 text-sm">{app.appointmentDate}</div>
                      <div className="text-xs text-emerald-800 font-semibold">{app.appointmentTime}</div>
                    </div>
                  </div>

                  {app.notes && (
                    <div className="text-xs bg-slate-50 p-2.5 rounded-xl text-slate-600">
                      <strong>Patient Note:</strong> {app.notes}
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleUpdateAppointment(app.id, 'confirmed')}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg"
                    >
                      Confirm Slot
                    </button>
                    <button
                      onClick={() => handleUpdateAppointment(app.id, 'completed')}
                      className="bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg"
                    >
                      Mark Completed
                    </button>
                    <button
                      onClick={() => handleUpdateAppointment(app.id, 'cancelled')}
                      className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: PRODUCTS */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              Medicines & Healthcare Inventory ({products.length})
            </h2>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-xs">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Medicine / Item</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Price</th>
                  <th className="p-3.5">Stock</th>
                  <th className="p-3.5">Prescription</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((prd) => (
                  <tr key={prd.id} className="hover:bg-slate-50">
                    <td className="p-3.5 font-bold text-slate-900">
                      <div>{prd.name}</div>
                      <span className="text-[11px] text-slate-400 font-normal">{prd.brand} &bull; {prd.dosageForm}</span>
                    </td>
                    <td className="p-3.5">{prd.categoryName}</td>
                    <td className="p-3.5 font-bold text-emerald-800">
                      KSh {prd.price.toLocaleString()}
                    </td>
                    <td className="p-3.5">
                      <span className={`font-bold px-2 py-0.5 rounded-md text-[11px] ${
                        (prd.stockQuantity || 0) > 10
                          ? 'bg-emerald-100 text-emerald-800'
                          : (prd.stockQuantity || 0) > 0
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {prd.stockQuantity} in stock
                      </span>
                    </td>
                    <td className="p-3.5">
                      {prd.prescriptionRequired ? (
                        <span className="text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded-md">Required</span>
                      ) : (
                        <span className="text-slate-400">OTC</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
