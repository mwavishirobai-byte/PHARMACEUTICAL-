import React, { useState } from 'react';
import { ShoppingBag, Eye, AlertCircle, CheckCircle2, Pill } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';

interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const { addItem } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const currentPrice =
    product.discountPrice !== undefined && product.discountPrice > 0
      ? product.discountPrice
      : product.price;

  const isOutOfStock = (product.stockQuantity || 0) <= 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    addItem(product, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  return (
    <div
      id={`product-card-${product.id}`}
      onClick={() => onQuickView(product)}
      className="group bg-white rounded-2xl border border-slate-200/80 hover:border-emerald-500/50 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer relative"
    >
      {/* Top Image & Badges */}
      <div className="relative aspect-4/3 bg-slate-50 overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Badges Container */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-start justify-between gap-1 pointer-events-none">
          <div className="flex flex-col gap-1">
            {product.prescriptionRequired && (
              <span className="bg-amber-600/90 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Prescription
              </span>
            )}
            {product.discountPrice && (
              <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                Save KSh {(product.price - product.discountPrice).toLocaleString()}
              </span>
            )}
          </div>

          <span className="bg-white/90 backdrop-blur-xs text-slate-700 text-[10px] font-medium px-2 py-0.5 rounded-md shadow-xs border border-slate-200">
            {product.categoryName || 'Medicine'}
          </span>
        </div>

        {/* Quick View Floating Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onQuickView(product);
          }}
          className="absolute bottom-2.5 right-2.5 bg-white/90 hover:bg-white text-slate-800 p-2 rounded-xl shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1 text-xs font-semibold"
          title="Quick View"
          aria-label={`Quick view ${product.name}`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Details</span>
        </button>
      </div>

      {/* Info Section */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
              {product.brand}
            </span>
            <span className="text-[11px] text-slate-500 flex items-center gap-0.5">
              <Pill className="w-3 h-3 text-slate-400" />
              {product.dosageForm}
            </span>
          </div>

          <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-emerald-800 transition-colors line-clamp-2">
            {product.name}
          </h3>

          {product.activeIngredient && (
            <p className="text-xs text-slate-500 mt-1 line-clamp-1">
              Active: <span className="text-slate-700 font-medium">{product.activeIngredient}</span>
            </p>
          )}

          <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price & Action Row */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] text-slate-500 block uppercase font-medium">Price</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-emerald-800">
                KSh {currentPrice.toLocaleString()}
              </span>
              {product.discountPrice && (
                <span className="text-xs text-slate-400 line-through">
                  KSh {product.price.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          {isOutOfStock ? (
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
              Out of stock
            </span>
          ) : (
            <button
              id={`add-product-${product.id}-btn`}
              onClick={handleAdd}
              disabled={isOutOfStock}
              className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                justAdded
                  ? 'bg-emerald-800 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white shadow-sm hover:shadow-md'
              }`}
              aria-label={`Add ${product.name} to cart`}
            >
              {justAdded ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
