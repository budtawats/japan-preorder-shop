'use client';

import React, { useState } from 'react';
import { Product, Category } from '@/types';
import { useCart } from '@/context/CartContext';
import { X, Plus, Minus, ShoppingBag, ShieldCheck, Plane, Zap, XCircle } from 'lucide-react';

interface ProductModalProps {
  product: Product | null;
  category?: Category;
  onClose: () => void;
}

export default function ProductModal({ product, category, onClose }: ProductModalProps) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const stockStatus = product.stockStatus || (product.inStock ? 'preorder' : 'out_of_stock');
  const isOutOfStock = stockStatus === 'out_of_stock';
  const isPreorder = stockStatus === 'preorder';
  const isInStock = stockStatus === 'in_stock';

  const handleAdd = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 800);
  };

  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative flex flex-col md:flex-row overflow-hidden border border-rose-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-20 bg-white/80 hover:bg-white text-gray-700 p-2 rounded-full shadow-md transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Image Section */}
        <div className="md:w-1/2 bg-gray-50 relative min-h-[260px] md:min-h-full">
          <img
            src={product.imageUrl || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80'}
            alt={product.name}
            className={`w-full h-full object-cover object-center ${isOutOfStock ? 'grayscale-30' : ''}`}
          />
          <div className="absolute top-4 left-4 flex flex-col gap-1.5">
            {isPreorder && (
              <span className="bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow flex items-center gap-1">
                <Plane className="w-3.5 h-3.5" /> พรีออเดอร์ (รอซื้อที่ญี่ปุ่น 🇯🇵)
              </span>
            )}
            {isInStock && (
              <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-300" /> มีของพร้อมส่งในไทย ⚡
              </span>
            )}
            {isOutOfStock && (
              <span className="bg-gray-900 text-white text-xs font-bold px-3 py-1 rounded-full shadow flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5 text-red-400" /> สินค้าหมดชั่วคราว ❌
              </span>
            )}
            {product.promoTag && !isOutOfStock && (
              <span className="bg-rose-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow w-fit">
                {product.promoTag}
              </span>
            )}
          </div>
        </div>

        {/* Product Details Section */}
        <div className="md:w-1/2 p-6 flex flex-col justify-between">
          <div>
            {category && (
              <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-100 inline-block mb-2">
                {category.icon} {category.name}
              </span>
            )}
            <h2 className="text-xl font-bold text-gray-900 leading-snug">
              {product.name}
            </h2>

            {/* Price */}
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-rose-600">
                ฿{product.price.toLocaleString()}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-sm text-gray-400 line-through">
                  ฿{product.originalPrice.toLocaleString()}
                </span>
              )}
              {discountPercent && (
                <span className="bg-rose-100 text-rose-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  ประหยัด {discountPercent}%
                </span>
              )}
            </div>

            {/* Description */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                รายละเอียดสินค้า
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {product.description || 'สินค้าพรีออเดอร์จากญี่ปุ่น ลิขสิทธิ์แท้ 100% สภาพใหม่แกะกล่อง'}
              </p>
            </div>

            {/* Status Information Box */}
            <div className="mt-4 space-y-1.5 bg-gray-50 p-3 rounded-2xl text-xs text-gray-600">
              {isPreorder && (
                <div className="flex items-center gap-2 text-purple-700 font-semibold">
                  <Plane className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>สินค้าพรีออเดอร์: แม่ค้าจะไปซื้อของที่ญี่ปุ่นให้ตามรอบบิน</span>
                </div>
              )}
              {isInStock && (
                <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                  <Zap className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>สินค้ามีในสต็อก: พร้อมจัดส่งทันทีไม่ต้องรอรอบบิน</span>
                </div>
              )}
              {isOutOfStock && (
                <div className="flex items-center gap-2 text-red-600 font-semibold">
                  <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>สินค้าหมดชั่วคราว: ไม่สามารถสั่งซื้อได้ในขณะนี้</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-500 pt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>การันตีสินค้าแท้ 100% จากช็อปญี่ปุ่น</span>
              </div>
            </div>
          </div>

          {/* Action Section */}
          <div className="mt-6 pt-4 border-t border-gray-100 space-y-3">
            {/* Quantity Selector (Disabled if out of stock) */}
            {!isOutOfStock && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">จำนวนที่ต้องการ:</span>
                <div className="flex items-center border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-2 hover:bg-gray-100 text-gray-600 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 text-sm font-bold text-gray-800 min-w-[2.5rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="p-2 hover:bg-gray-100 text-gray-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Add to Cart Button */}
            <button
              onClick={handleAdd}
              disabled={isOutOfStock}
              className={`w-full py-3.5 px-4 rounded-2xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
                isOutOfStock
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed shadow-none'
                  : added
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-700 hover:to-red-600 text-white shadow-rose-200'
              }`}
            >
              {isOutOfStock ? (
                <span>สินค้าหมดชั่วคราว</span>
              ) : added ? (
                <span>เพิ่มลงในตะกร้าแล้ว!</span>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>เพิ่มลงตะกร้า • ฿{(product.price * quantity).toLocaleString()}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
