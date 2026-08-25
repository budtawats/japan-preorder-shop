'use client';

import React from 'react';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { Plus, Check, Eye, Plane, Zap, XCircle } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
}

export default function ProductCard({ product, onViewDetails }: ProductCardProps) {
  const { addToCart } = useCart();
  const [added, setAdded] = React.useState(false);

  const stockStatus = product.stockStatus || (product.inStock ? 'preorder' : 'out_of_stock');
  const isOutOfStock = stockStatus === 'out_of_stock';
  const isPreorder = stockStatus === 'preorder';
  const isInStock = stockStatus === 'in_stock';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  return (
    <div
      onClick={() => onViewDetails(product)}
      className={`group bg-white rounded-3xl border overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col cursor-pointer ${
        isOutOfStock
          ? 'border-gray-200 opacity-75'
          : 'border-gray-100 hover:border-rose-200'
      }`}
    >
      {/* Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-gray-50">
        <img
          src={product.imageUrl || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80'}
          alt={product.name}
          className={`w-full h-full object-cover object-center transition-transform duration-300 ${
            isOutOfStock ? 'grayscale-40' : 'group-hover:scale-105'
          }`}
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {/* Stock / Pre-order Status Badge */}
          {isPreorder && (
            <span className="bg-purple-600/90 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1">
              <Plane className="w-3 h-3" /> พรีออเดอร์ญี่ปุ่น
            </span>
          )}

          {isInStock && (
            <span className="bg-emerald-600/90 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-300" /> พร้อมส่งในไทย
            </span>
          )}

          {isOutOfStock && (
            <span className="bg-gray-800/90 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1">
              <XCircle className="w-3 h-3 text-red-400" /> สินค้าหมด
            </span>
          )}

          {/* Promo Tag */}
          {product.promoTag && !isOutOfStock && (
            <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm w-fit">
              {product.promoTag}
            </span>
          )}
          {discountPercent && !isOutOfStock && (
            <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm w-fit">
              ลด {discountPercent}%
            </span>
          )}
        </div>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none">
            <span className="bg-white/95 text-gray-800 text-xs font-black px-3.5 py-1.5 rounded-full shadow-md border border-gray-200">
              ❌ สินค้าหมดชั่วคราว
            </span>
          </div>
        )}

        {/* Quick View overlay icon */}
        {!isOutOfStock && (
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
            <span className="bg-white/90 text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-full shadow flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" /> ดูรายละเอียด
            </span>
          </div>
        )}
      </div>

      {/* Details Container */}
      <div className="p-3.5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 leading-snug group-hover:text-rose-600 transition-colors">
            {product.name}
          </h3>
          <p className="text-xs text-gray-400 mt-1 line-clamp-1">
            {product.description}
          </p>
        </div>

        {/* Price & Action */}
        <div className="mt-3 pt-2.5 border-t border-gray-50 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold text-rose-600">
                ฿{product.price.toLocaleString()}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs text-gray-400 line-through">
                  ฿{product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>

            {/* Sub-label */}
            {isPreorder && (
              <span className="text-[10px] text-purple-600 font-medium">● รอซื้อของที่ญี่ปุ่น</span>
            )}
            {isInStock && (
              <span className="text-[10px] text-emerald-600 font-medium">● มีสินค้าพร้อมส่ง</span>
            )}
            {isOutOfStock && (
              <span className="text-[10px] text-gray-400 font-medium">● สินค้าหมดชั่วคราว</span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`p-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center ${
              isOutOfStock
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                : added
                ? 'bg-emerald-500 text-white'
                : 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white border border-rose-200'
            }`}
            title={isOutOfStock ? 'สินค้าหมด' : 'เพิ่มลงตะกร้า'}
          >
            {isOutOfStock ? (
              <span className="text-[10px] font-bold px-1">หมด</span>
            ) : added ? (
              <Check className="w-4 h-4" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
