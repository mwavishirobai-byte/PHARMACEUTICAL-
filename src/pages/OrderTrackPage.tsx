import React, { useState, useEffect } from 'react';
import {
  Search,
  Truck,
  CheckCircle2,
  Clock,
  Package,
  AlertCircle,
  PhoneCall,
  Store,
  MapPin,
  Smartphone,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../services/api';
import { Order, OrderStatus } from '../types';
import { PochiPaymentCard } from '../components/common/PochiPaymentCard';

interface OrderTrackPageProps {
  initialOrderNumber?: string;
  onNavigate: (view: string) => void;
}

const STATUS_STEPS: { key: OrderStatus; label: string; desc: string }[] = [
  { key: 'pending', label: 'Order Received', desc: 'Registered in pharmacy database' },
  { key: 'payment_submitted', label: 'Payment Submitted', desc: 'Awaiting staff verification' },
  { key: 'processing', label: 'Pharmacist Dispensing', desc: 'Verification, batching & packing' },
  { key: 'ready_for_pickup', label: 'Ready for Pickup / Dispatch', desc: 'At Kitale counter or with courier' },
  { key: 'completed', label: 'Completed', desc: 'Collected or safely delivered' },
];

export const OrderTrackPage: React.FC<OrderTrackPageProps> = ({
  initialOrderNumber,
  onNavigate,
}) => {
  const [orderNumber, setOrderNumber] = useState(initialOrderNumber || '');
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // For submitting payment from tracking screen
  const [showPaymentInput, setShowPaymentInput] = useState(false);
  const [paymentRef, setPaymentRef] = useState('');
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const fetchOrder = async (numberToSearch: string) => {
    if (!numberToSearch.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.trackOrder(numberToSearch.trim(), phone.trim() || undefined);
      setOrder(data);
    } catch (err: any) {
      setError(err.message || 'Order not found. Please verify your order number.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderNumber) {
      fetchOrder(initialOrderNumber);
    }
  }, [initialOrderNumber]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrder(orderNumber);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order || !paymentRef.trim()) return;
    setSubmittingPayment(true);
    try {
      const res = await api.submitPayment(order.id, paymentRef.trim());
      setOrder(res.order);
      setPaymentSuccess(true);
      setShowPaymentInput(false);
    } catch (err: any) {
      alert(err.message || 'Failed to submit payment reference');
    } finally {
      setSubmittingPayment(false);
    }
  };

  const getStepStatus = (stepKey: OrderStatus, currentStatus: OrderStatus) => {
    const statusOrder: OrderStatus[] = [
      'pending',
      'awaiting_payment',
      'payment_submitted',
      'processing',
      'ready_for_pickup',
      'out_for_delivery',
      'completed',
    ];

    if (currentStatus === 'cancelled') return 'cancelled';

    let currentIdx = statusOrder.indexOf(currentStatus);
    if (currentStatus === 'ready_for_pickup' || currentStatus === 'out_for_delivery') {
      currentIdx = 4;
    }

    const stepIdx = statusOrder.indexOf(stepKey);
    if (currentIdx >= stepIdx) return 'completed';
    if (currentIdx === stepIdx - 1) return 'current';
    return 'upcoming';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 animate-in fade-in">
      <div className="text-center space-y-3 max-w-xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          Live Order Tracker
        </span>
        <h1 className="text-3xl font-black text-slate-900">Track Pharmacy Order Status</h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Enter your order reference code (e.g. <strong>GFP-2026-7842</strong>) to inspect clinical preparation, verification, and dispatch.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs max-w-2xl mx-auto">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Order Reference Number *
              </label>
              <input
                type="text"
                required
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="e.g. GFP-2026-XXXX"
                className="w-full text-xs sm:text-sm font-mono uppercase font-bold border border-slate-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-emerald-600 bg-slate-50"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Contact Phone (Optional)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="07XX XXX XXX"
                className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-emerald-600 bg-slate-50"
              />
            </div>
          </div>

          <button
            id="track-order-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-xs sm:text-sm disabled:opacity-50"
          >
            {loading ? <span>Searching...</span> : (
              <>
                <Search className="w-4 h-4" />
                <span>Track Order Live</span>
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Order Status Display */}
      {order && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-lg space-y-8 animate-in zoom-in-95">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-900 font-mono">{order.orderNumber}</h2>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                  order.status === 'completed'
                    ? 'bg-emerald-100 text-emerald-800'
                    : order.status === 'cancelled'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-amber-100 text-amber-900'
                }`}>
                  {order.status.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs text-slate-500 block">Total Due</span>
              <span className="text-xl font-black text-emerald-800">
                KSh {order.total.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Progress Timeline */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Fulfillment Progression
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {STATUS_STEPS.map((step, idx) => {
                const status = getStepStatus(step.key, order.status);
                const isCompleted = status === 'completed';
                const isCurrent = status === 'current';

                return (
                  <div
                    key={step.key}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isCurrent
                        ? 'bg-emerald-50 border-emerald-500 shadow-xs'
                        : isCompleted
                        ? 'bg-slate-50 border-slate-200 text-slate-700'
                        : 'bg-white border-slate-100 text-slate-400 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                        isCompleted
                          ? 'bg-emerald-700 text-white'
                          : isCurrent
                          ? 'bg-amber-500 text-white animate-pulse'
                          : 'bg-slate-200 text-slate-600'
                      }`}>
                        {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                      </div>
                      <span className="font-bold text-xs text-slate-900 leading-tight">
                        {step.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-normal">{step.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment Status Card & Pochi Submission */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs text-slate-500 block">Payment State:</span>
                <div className="flex items-center gap-2">
                  <span className={`font-bold text-xs uppercase px-2.5 py-0.5 rounded-md ${
                    order.paymentStatus === 'verified'
                      ? 'bg-emerald-100 text-emerald-800'
                      : order.paymentStatus === 'submitted'
                      ? 'bg-amber-100 text-amber-900'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {order.paymentStatus}
                  </span>
                  {order.paymentDetails?.transactionReference && (
                    <span className="text-xs font-mono font-bold text-slate-700">
                      Ref: {order.paymentDetails.transactionReference}
                    </span>
                  )}
                </div>
              </div>

              {order.paymentStatus === 'unpaid' && !showPaymentInput && (
                <button
                  onClick={() => setShowPaymentInput(true)}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors"
                >
                  Submit Pochi M-Pesa Payment
                </button>
              )}
            </div>

            {showPaymentInput && (
              <form onSubmit={handlePaymentSubmit} className="pt-3 border-t border-slate-200 space-y-3">
                <label className="text-xs font-bold text-slate-800 block">
                  Enter M-Pesa / Pochi Transaction Reference for 07417758578:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={paymentRef}
                    onChange={(e) => setPaymentRef(e.target.value.toUpperCase())}
                    placeholder="e.g. QHK871239J"
                    className="flex-1 text-xs font-mono uppercase font-bold border border-slate-300 rounded-xl px-3 py-2 bg-white"
                  />
                  <button
                    type="submit"
                    disabled={submittingPayment}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2 rounded-xl text-xs"
                  >
                    {submittingPayment ? 'Submitting...' : 'Confirm'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Items Breakdown */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Order Items Summary</h3>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between text-xs p-3 bg-slate-50 rounded-xl border border-slate-100"
                >
                  <div>
                    <span className="font-bold text-slate-900">{item.productNameSnapshot}</span>
                    <span className="text-slate-500 block text-[11px]">
                      Qty: {item.quantity} &times; KSh {item.unitPrice.toLocaleString()}
                    </span>
                  </div>
                  <span className="font-bold text-emerald-800">
                    KSh {item.subtotal.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Support */}
          <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-emerald-950 font-medium">
              Need assistance regarding this order in Kitale? Contact our dispensing team directly.
            </span>
            <a
              href="tel:07417758578"
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 shrink-0"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>07417758578</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
