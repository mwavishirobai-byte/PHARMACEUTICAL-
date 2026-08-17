import React from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, AlertCircle, MapPin, Store } from 'lucide-react';
import { useCart } from '../../context/CartContext';

interface CartDrawerProps {
  onProceedToCheckout: () => void;
  onUploadPrescription: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  onProceedToCheckout,
  onUploadPrescription,
}) => {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    removeItem,
    updateQuantity,
    subtotal,
    deliveryFee,
    total,
    fulfillmentMethod,
    setFulfillmentMethod,
    hasPrescriptionItem,
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <div id="cart-drawer-backdrop" className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div className="absolute inset-0" onClick={() => setIsCartOpen(false)} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div
          id="cart-drawer-content"
          className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between overflow-hidden relative animate-in slide-in-from-right duration-300"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-base">Your Pharmacy Cart</h2>
                <p className="text-xs text-slate-500">{items.length} unique medicine{items.length === 1 ? '' : 's'}</p>
              </div>
            </div>
            <button
              id="close-cart-drawer-btn"
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-200 transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-slate-800 text-base">Your cart is empty</h3>
                <p className="text-xs text-slate-500 max-w-xs">
                  Browse our authentic medicine catalog, wellness products, and OTC essentials for fast Kitale fulfillment.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-colors shadow-sm"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <>
                {/* Prescription items banner */}
                {hasPrescriptionItem && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold">Prescription Required</strong>
                      One or more items in your cart requires a valid doctor's prescription. You can upload it during checkout or review.
                      <button
                        onClick={() => {
                          setIsCartOpen(false);
                          onUploadPrescription();
                        }}
                        className="text-amber-800 font-bold underline block mt-1 hover:text-amber-950"
                      >
                        Upload prescription document &rarr;
                      </button>
                    </div>
                  </div>
                )}

                {/* Items */}
                <div className="space-y-3">
                  {items.map((item) => {
                    const price = item.product.discountPrice !== undefined && item.product.discountPrice > 0
                      ? item.product.discountPrice
                      : item.product.price;
                    const itemTotal = price * item.quantity;

                    return (
                      <div
                        key={item.product.id}
                        id={`cart-item-${item.product.id}`}
                        className="bg-slate-50/80 rounded-xl p-3 border border-slate-200 flex gap-3 items-center justify-between"
                      >
                        <div className="w-14 h-14 rounded-lg bg-white overflow-hidden border border-slate-200 shrink-0">
                          <img
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-900 text-xs sm:text-sm truncate">{item.product.name}</h4>
                          <p className="text-[11px] text-slate-500">
                            KSh {price.toLocaleString()} &bull; {item.product.dosageForm}
                          </p>

                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex items-center border border-slate-300 rounded-md bg-white overflow-hidden">
                              <button
                                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                className="p-1 hover:bg-slate-100 text-slate-600 transition-colors"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-6 text-center text-xs font-bold text-slate-800">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                className="p-1 hover:bg-slate-100 text-slate-600 transition-colors"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <button
                              onClick={() => removeItem(item.product.id)}
                              className="text-slate-400 hover:text-red-600 p-1 transition-colors"
                              title="Remove item"
                              aria-label={`Remove ${item.product.name}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-black text-emerald-800 text-sm">
                            KSh {itemTotal.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Fulfillment Selection */}
                <div className="pt-2 border-t border-slate-200">
                  <label className="text-xs font-bold text-slate-700 block mb-2 uppercase">
                    Fulfillment Method in Kitale:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFulfillmentMethod('pickup')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                        fulfillmentMethod === 'pickup'
                          ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <Store className="w-3.5 h-3.5" />
                      <span>Pharmacy Pickup (Free)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFulfillmentMethod('delivery')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                        fulfillmentMethod === 'delivery'
                          ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Kitale Delivery (+KSh 150)</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer Summary & Checkout */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 space-y-3">
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">KSh {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fulfillment ({fulfillmentMethod === 'pickup' ? 'Kitale Counter Pickup' : 'Local Delivery'})</span>
                  <span className="font-semibold text-slate-900">
                    {deliveryFee === 0 ? 'FREE' : `KSh ${deliveryFee.toLocaleString()}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total Due</span>
                  <span className="text-emerald-800 text-base">KSh {total.toLocaleString()}</span>
                </div>
              </div>

              <button
                id="checkout-drawer-btn"
                onClick={() => {
                  setIsCartOpen(false);
                  onProceedToCheckout();
                }}
                className="w-full bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <span>Proceed to Pochi Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
