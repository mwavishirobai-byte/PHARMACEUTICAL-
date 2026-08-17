import React, { useState } from 'react';
import { X, Plus, Minus, ShoppingBag, ShieldCheck, AlertCircle, FileText, CheckCircle2, PhoneCall } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onUploadPrescription?: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onUploadPrescription,
}) => {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [addedToast, setAddedToast] = useState(false);

  if (!product) return null;

  const currentPrice = product.discountPrice !== undefined && product.discountPrice > 0 ? product.discountPrice : product.price;
  const isOutOfStock = (product.stockQuantity || 0) <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem(product, quantity);
    setAddedToast(true);
    setTimeout(() => {
      setAddedToast(false);
      onClose();
    }, 1200);
  };

  return (
    <div id="product-detail-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div
        id="product-detail-modal"
        className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200 relative my-8 animate-in fade-in zoom-in duration-200"
      >
        {/* Header with Close */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              {product.categoryName || 'Pharmaceutical Product'}
            </span>
            {product.prescriptionRequired && (
              <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                Prescription Required
              </span>
            )}
          </div>
          <button
            id="close-product-modal-btn"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-200 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image Section */}
            <div className="space-y-3">
              <div className="aspect-square rounded-xl bg-slate-100 overflow-hidden border border-slate-200 relative flex items-center justify-center">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                {product.discountPrice && (
                  <span className="absolute top-3 left-3 bg-red-600 text-white font-bold text-xs px-2 py-1 rounded-md shadow-sm">
                    Special Offer
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-500 flex items-center justify-between">
                <span>SKU: <strong className="text-slate-700">{product.sku}</strong></span>
                <span>Pack: <strong className="text-slate-700">{product.packSize || 'Standard'}</strong></span>
              </div>
            </div>

            {/* Product Clinical & Pricing Info */}
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 leading-tight">{product.name}</h2>
                <p className="text-xs font-semibold text-slate-500 mt-0.5">
                  Brand: <span className="text-emerald-800">{product.brand}</span> &bull; Formulation: <span>{product.dosageForm}</span>
                </p>
                {product.activeIngredient && (
                  <div className="mt-2 inline-block bg-slate-100 text-slate-800 text-xs px-2.5 py-1 rounded-md font-medium border border-slate-200">
                    Active Ingredient: <strong>{product.activeIngredient}</strong>
                  </div>
                )}
              </div>

              {/* Price Display */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-slate-500 block">Retail Price (Inc. VAT)</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-emerald-800">
                      KSh {currentPrice.toLocaleString()}
                    </span>
                    {product.discountPrice && (
                      <span className="text-sm text-slate-400 line-through">
                        KSh {product.price.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  {isOutOfStock ? (
                    <span className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-md border border-red-200">
                      Out of Stock
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      In Stock ({product.stockQuantity} available)
                    </span>
                  )}
                </div>
              </div>

              {/* Prescription Notice */}
              {product.prescriptionRequired && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 space-y-1">
                  <div className="font-bold flex items-center gap-1 text-amber-800">
                    <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                    Doctor's Prescription Notice
                  </div>
                  <p>
                    This is a restricted medication in Kenya. You may add it to your order, but our pharmacist will review your prescription document before dispatch.
                  </p>
                  {onUploadPrescription && (
                    <button
                      onClick={() => {
                        onClose();
                        onUploadPrescription();
                      }}
                      className="text-amber-800 underline font-bold mt-1 hover:text-amber-950 inline-block"
                    >
                      Have a prescription? Upload here &rarr;
                    </button>
                  )}
                </div>
              )}

              {/* Quantity Selector & Add to Cart */}
              {!isOutOfStock && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-700 uppercase">Quantity:</span>
                    <div className="flex items-center border border-slate-300 rounded-lg bg-white overflow-hidden">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        disabled={quantity <= 1}
                        className="p-2 hover:bg-slate-100 text-slate-600 disabled:opacity-40 transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-12 text-center font-bold text-slate-800 text-sm">{quantity}</span>
                      <button
                        onClick={() => setQuantity((q) => Math.min(product.stockQuantity || 99, q + 1))}
                        disabled={quantity >= (product.stockQuantity || 99)}
                        className="p-2 hover:bg-slate-100 text-slate-600 disabled:opacity-40 transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <button
                    id="add-to-cart-modal-btn"
                    onClick={handleAddToCart}
                    className="w-full bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    {addedToast ? (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        <span>Added to Cart!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-5 h-5" />
                        <span>Add to Cart &bull; KSh {(currentPrice * quantity).toLocaleString()}</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Description & Clinical Tabs */}
          <div className="space-y-4 pt-4 border-t border-slate-200 text-xs sm:text-sm">
            <div>
              <h3 className="font-bold text-slate-900 text-base mb-1.5">Description & Indications</h3>
              <p className="text-slate-600 leading-relaxed">{product.description}</p>
            </div>

            {product.instructions && (
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-700" />
                  Usage & Dosage Instructions
                </h4>
                <p className="text-slate-600">{product.instructions}</p>
              </div>
            )}

            {product.warnings && (
              <div className="bg-red-50 p-3.5 rounded-xl border border-red-200">
                <h4 className="font-bold text-red-900 mb-1 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-red-700" />
                  Cautions, Side Effects & Contraindications
                </h4>
                <p className="text-red-700">{product.warnings}</p>
              </div>
            )}

            {product.storageInfo && (
              <div className="text-xs text-slate-500">
                Storage: <strong className="text-slate-700">{product.storageInfo}</strong>
              </div>
            )}
          </div>

          {/* Doctor Callout */}
          <div className="bg-emerald-50 rounded-xl p-3.5 border border-emerald-200 flex items-center justify-between text-xs">
            <span className="text-emerald-900 font-medium">
              Have questions regarding this medicine? Consult our Kitale clinical pharmacist.
            </span>
            <a
              href="tel:07417758578"
              className="inline-flex items-center gap-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-3 py-1.5 rounded-lg shrink-0 transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>07417758578</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
