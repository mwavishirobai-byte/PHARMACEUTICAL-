import React, { useState } from 'react';
import {
  ShoppingBag,
  Store,
  MapPin,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  PhoneCall,
  Clock,
  ArrowRight,
  ShieldCheck,
  Copy,
  Check,
  Upload,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Order } from '../types';
import { PochiPaymentCard } from '../components/common/PochiPaymentCard';

interface CartCheckoutPageProps {
  onNavigate: (view: string, data?: any) => void;
}

export const CartCheckoutPage: React.FC<CartCheckoutPageProps> = ({ onNavigate }) => {
  const {
    items,
    subtotal,
    deliveryFee,
    total,
    fulfillmentMethod,
    setFulfillmentMethod,
    clearCart,
    hasPrescriptionItem,
  } = useCart();
  const { user } = useAuth();

  const [customerName, setCustomerName] = useState(user?.fullName || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [deliveryAddress, setDeliveryAddress] = useState(user?.address || '');
  const [deliveryLandmark, setDeliveryLandmark] = useState('');
  const [notes, setNotes] = useState('');

  // Payment Reference
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentProofUrl, setPaymentProofUrl] = useState('');
  const [proofFileName, setProofFileName] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  const handleProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProofFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setPaymentProofUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setError('Your cart is empty.');
      return;
    }
    if (!customerName.trim() || !customerPhone.trim()) {
      setError('Customer name and contact phone number are required.');
      return;
    }
    if (fulfillmentMethod === 'delivery' && !deliveryAddress.trim()) {
      setError('Delivery address in Kitale is required for home delivery.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const orderPayload = {
        customerName,
        customerPhone,
        customerEmail,
        items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
        fulfillmentMethod,
        deliveryAddress: fulfillmentMethod === 'delivery' ? deliveryAddress : undefined,
        deliveryLandmark: fulfillmentMethod === 'delivery' ? deliveryLandmark : undefined,
        notes,
        paymentReference: paymentReference || undefined,
        paymentProofUrl: paymentProofUrl || undefined,
      };

      const order = await api.createOrder(orderPayload);
      setCreatedOrder(order);
      clearCart();

      // Confetti burst on order placement
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }
    } catch (err: any) {
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Order Success Screen
  if (createdOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8 animate-in zoom-in-95">
        <div className="bg-white rounded-3xl border border-emerald-200 p-8 sm:p-10 shadow-2xl text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full">
              Order Confirmed &bull; Gods Favor Pharmacy Kitale
            </span>
            <h1 className="text-3xl font-black text-slate-900">Thank You for Your Order!</h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
              Your order is registered with our dispensing team in Kitale.
            </p>
          </div>

          {/* Order Details Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-left space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <span className="text-slate-500 font-medium">Order Reference Number:</span>
              <span className="font-mono font-black text-emerald-800 text-base">
                {createdOrder.orderNumber}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500">Total Amount:</span>
              <span className="font-black text-slate-900 text-base">
                KSh {createdOrder.total.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500">Fulfillment Method:</span>
              <span className="font-bold text-slate-800 capitalize">
                {createdOrder.fulfillmentMethod === 'pickup' ? 'Counter Pickup (Kitale Store)' : 'Kitale Home Delivery'}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500">Payment Status:</span>
              <span className={`font-bold px-2.5 py-0.5 rounded-full text-xs uppercase ${
                createdOrder.paymentStatus === 'submitted'
                  ? 'bg-amber-100 text-amber-900'
                  : 'bg-slate-200 text-slate-800'
              }`}>
                {createdOrder.paymentStatus === 'submitted' ? 'Payment Submitted (Pending Staff Verification)' : 'Awaiting Payment'}
              </span>
            </div>

            {createdOrder.paymentDetails?.transactionReference && (
              <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                <span className="text-slate-500">M-Pesa Reference:</span>
                <span className="font-mono font-bold text-slate-900">
                  {createdOrder.paymentDetails.transactionReference}
                </span>
              </div>
            )}
          </div>

          {/* If unpaid, show Pochi Instructions */}
          {createdOrder.paymentStatus === 'unpaid' && (
            <div className="text-left">
              <PochiPaymentCard amount={createdOrder.total} />
            </div>
          )}

          {/* Next Steps Guide */}
          <div className="p-4 bg-emerald-50 rounded-2xl text-xs text-emerald-950 text-left space-y-1.5 border border-emerald-200">
            <strong className="block font-bold text-emerald-900">What to expect next:</strong>
            <p className="text-slate-700">
              1. Our pharmacy staff will verify your payment and medicine stock.<br />
              2. For pickup orders: We'll prepare your parcel at our counter along Kijana Wamalwa Road.<br />
              3. For delivery orders: Our rider will contact you upon dispatch.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 pt-4">
            <button
              onClick={() => onNavigate('track', { orderNumber: createdOrder.orderNumber })}
              className="bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-bold px-6 py-3 rounded-xl text-xs transition-colors shadow-md flex items-center gap-2"
            >
              <span>Track This Order Live</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('catalog')}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-5 py-3 rounded-xl text-xs transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If cart is empty
  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Your Cart is Empty</h2>
        <p className="text-xs text-slate-500">
          Add medicines, first aid supplies, or OTC essentials to proceed to checkout.
        </p>
        <button
          onClick={() => onNavigate('catalog')}
          className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-6 py-3 rounded-xl text-xs transition-colors"
        >
          Browse Medicine Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 animate-in fade-in">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Checkout & Payment</span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">Complete Your Pharmacy Order</h1>
      </div>

      <form onSubmit={handlePlaceOrder}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Customer & Delivery Details */}
          <div className="lg:col-span-7 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Prescription Items Warning */}
            {hasPrescriptionItem && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">Prescription Medication Notice</strong>
                  Your cart contains prescription items. Our pharmacist will verify your medical details or call you prior to dispatch.
                </div>
              </div>
            )}

            {/* 1. Fulfillment Selection */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Store className="w-4 h-4 text-emerald-700" />
                1. Select Fulfillment Method in Kitale
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => setFulfillmentMethod('pickup')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    fulfillmentMethod === 'pickup'
                      ? 'border-emerald-700 bg-emerald-50/50'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                      <Store className="w-4 h-4 text-emerald-700" />
                      Pharmacy Counter Pickup
                    </span>
                    <span className="bg-emerald-100 text-emerald-900 text-[10px] font-black px-2 py-0.5 rounded-sm uppercase">
                      FREE
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Collect directly at Gods Favor Pharmacy along Kijana Wamalwa Road, Kitale. Ready within 20 minutes.
                  </p>
                </div>

                <div
                  onClick={() => setFulfillmentMethod('delivery')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    fulfillmentMethod === 'delivery'
                      ? 'border-emerald-700 bg-emerald-50/50'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-emerald-700" />
                      Doorstep Delivery
                    </span>
                    <span className="bg-slate-200 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-sm">
                      +KSh 150
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Fast, secure motorcycle courier delivery anywhere within Kitale town and nearby neighborhoods.
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Customer Contact & Location */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-slate-900">2. Customer & Contact Details</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. John Mwangi"
                    className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-emerald-600 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Phone Number (M-Pesa / Active Line) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="07XX XXX XXX"
                    className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-emerald-600 bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Email Address (Optional for receipt)
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-emerald-600 bg-slate-50"
                />
              </div>

              {fulfillmentMethod === 'delivery' && (
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Delivery Address / Estate in Kitale *
                    </label>
                    <input
                      type="text"
                      required
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="e.g. Milimani Estate, Next to Highridge Court"
                      className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-emerald-600 bg-slate-50"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Landmark or Specific Gate Details
                    </label>
                    <input
                      type="text"
                      value={deliveryLandmark}
                      onChange={(e) => setDeliveryLandmark(e.target.value)}
                      placeholder="e.g. Black gate opposite Total station"
                      className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-emerald-600 bg-slate-50"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Order Notes / Dispensing Instructions (Optional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special packing instructions or allergy details..."
                  className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-emerald-600 bg-slate-50"
                />
              </div>
            </div>

            {/* 3. Pochi la Biashara Payment Guide & Transaction Input */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-700" />
                3. Pochi la Biashara Payment Instructions
              </h2>

              <PochiPaymentCard amount={total} showSteps={true} />

              <div className="pt-2 space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-800 block mb-1">
                    M-Pesa / Pochi Transaction Reference Code
                  </label>
                  <input
                    type="text"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value.toUpperCase())}
                    placeholder="e.g. QHK871239J (From Safaricom SMS)"
                    className="w-full text-xs sm:text-sm font-mono uppercase font-bold border border-slate-300 rounded-xl px-3.5 py-3 focus:ring-2 focus:ring-emerald-600 bg-slate-50"
                  />
                  <span className="text-[11px] text-slate-500 block mt-1">
                    Paste the 10-digit Safaricom M-Pesa transaction code once you send payment to <strong>07417758578</strong>.
                  </span>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Attach Payment Screenshot / SMS Photo (Optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProofUpload}
                    className="text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-800 hover:file:bg-emerald-100"
                  />
                  {proofFileName && (
                    <span className="text-xs text-emerald-800 font-semibold block mt-1">
                      Uploaded: {proofFileName}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Place Order */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4 sticky top-28">
              <h3 className="font-bold text-slate-900 text-base pb-3 border-b border-slate-100">
                Order Items ({items.length})
              </h3>

              <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
                {items.map((item) => {
                  const price = item.product.discountPrice || item.product.price;
                  return (
                    <div key={item.product.id} className="flex justify-between items-center text-xs">
                      <div className="flex-1 min-w-0 pr-2">
                        <p className="font-bold text-slate-800 truncate">{item.product.name}</p>
                        <p className="text-[11px] text-slate-500">
                          {item.quantity} &times; KSh {price.toLocaleString()}
                        </p>
                      </div>
                      <span className="font-bold text-slate-900 shrink-0">
                        KSh {(price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-slate-200 space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900">KSh {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fulfillment ({fulfillmentMethod === 'pickup' ? 'Kitale Counter' : 'Delivery'})</span>
                  <span className="font-bold text-slate-900">
                    {deliveryFee === 0 ? 'FREE' : `KSh ${deliveryFee.toLocaleString()}`}
                  </span>
                </div>
                <div className="flex justify-between text-base font-black text-slate-900 pt-3 border-t border-slate-200">
                  <span>Total Amount</span>
                  <span className="text-emerald-800 text-lg">KSh {total.toLocaleString()}</span>
                </div>
              </div>

              <button
                id="place-order-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white font-bold py-4 px-6 rounded-2xl shadow-xl shadow-emerald-700/25 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                {loading ? (
                  <span>Processing Order...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    <span>Place Pharmacy Order &bull; KSh {total.toLocaleString()}</span>
                  </>
                )}
              </button>

              <div className="text-center pt-2 text-[11px] text-slate-400">
                <span>By placing this order, you confirm medicines will be dispensed according to Kenyan pharmaceutical laws.</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
