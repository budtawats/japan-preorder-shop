'use client';

import React, { useEffect, useState } from 'react';
import { Product, Category, FlightRound, Promotion } from '@/types';
import ProductCard from '@/components/ProductCard';
import ProductModal from '@/components/ProductModal';
import {
  Plane,
  Calendar,
  Truck,
  Search,
  Sparkles,
  Tag,
  Gift,
  ShieldCheck,
  Flame,
  ChevronRight,
  Clock,
  Zap,
  CheckCircle,
} from 'lucide-react';

export default function StorefrontPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeRound, setActiveRound] = useState<FlightRound | null>(null);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [stockFilter, setStockFilter] = useState<'all' | 'preorder' | 'in_stock'>('all');
  const [promoOnly, setPromoOnly] = useState<boolean>(false);

  // Modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Copied code toast
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [prodRes, catRes, roundRes, promoRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/categories'),
          fetch('/api/flight-rounds'),
          fetch('/api/promotions'),
        ]);

        const prodData = await prodRes.json();
        const catData = await catRes.json();
        const roundData = await roundRes.json();
        const promoData = await promoRes.json();

        setProducts(prodData.products || []);
        setCategories(catData.categories || []);
        setActiveRound(roundData.activeRound || null);
        setPromotions((promoData.promotions || []).filter((p: Promotion) => p.isActive));
      } catch (err) {
        console.error('Error fetching storefront data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Filtered Products
  const filteredProducts = products.filter((product) => {
    const matchCategory =
      selectedCategory === 'all' || product.categoryId === selectedCategory;
    const matchPromo = !promoOnly || product.isPromo;
    const pStockStatus = product.stockStatus || (product.inStock ? 'preorder' : 'out_of_stock');
    const matchStock = stockFilter === 'all' || pStockStatus === stockFilter;
    const matchSearch =
      !searchQuery ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.promoTag && product.promoTag.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchCategory && matchPromo && matchStock && matchSearch;
  });

  return (
    <div className="space-y-10 pb-16">
      {/* 1. Hero & Active Flight Round Section */}
      <section className="bg-gradient-to-b from-rose-100/60 via-orange-50/40 to-transparent pt-8 pb-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left: Store Intro */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full border border-rose-200 shadow-sm text-xs font-semibold text-rose-600">
                <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                <span>เปิดรับพรีออเดอร์รอบใหม่ล่าสุดจากญี่ปุ่น</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight leading-tight">
                ช้อปสินค้าญี่ปุ่นแท้ <br />
                <span className="text-rose-600">บินเอง หิ้วสด</span> ส่งตรงถึงมือคุณ
              </h1>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-xl">
                เลือกสินค้าใส่ตะกร้า โอนชำระเงินผ่าน QR Code พร้อมแนบสลิปได้ทันที แม่ค้าเช็คและอัปเดตสถานะให้ทุกขั้นตอน
              </p>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-medium text-gray-700">
                <span className="flex items-center gap-1.5 bg-white/80 px-3 py-1.5 rounded-xl border border-gray-200 shadow-2xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" /> ของแท้ 100%
                </span>
                <span className="flex items-center gap-1.5 bg-white/80 px-3 py-1.5 rounded-xl border border-gray-200 shadow-2xs">
                  <Plane className="w-4 h-4 text-purple-500" /> พรีออเดอร์หิ้วสด
                </span>
                <span className="flex items-center gap-1.5 bg-white/80 px-3 py-1.5 rounded-xl border border-gray-200 shadow-2xs">
                  <Zap className="w-4 h-4 text-amber-500" /> มีของพร้อมส่งในไทย
                </span>
              </div>
            </div>

            {/* Right: Flight Round Card (ระบุวันที่บินกลับไทยที่แม่ค้าใส่เอง) */}
            <div id="flight-schedule" className="lg:col-span-5">
              <div className="bg-white rounded-3xl p-6 border-2 border-rose-200/80 shadow-xl shadow-rose-100/50 relative overflow-hidden">
                {/* Decorative Background Pattern */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-bl-full -z-0 opacity-60" />

                <div className="relative z-10 space-y-4">
                  {/* Round Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="p-2 bg-rose-600 text-white rounded-xl shadow-sm">
                        <Plane className="w-5 h-5" />
                      </span>
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600">
                          รอบบินปัจจุบัน
                        </span>
                        <h3 className="text-base font-bold text-gray-900">
                          {activeRound ? activeRound.roundName : 'รอบบินพิเศษ โตเกียว-โอซาก้า'}
                        </h3>
                      </div>
                    </div>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      เปิดรับออเดอร์
                    </span>
                  </div>

                  {/* Dates Timeline */}
                  {activeRound ? (
                    <div className="bg-rose-50/50 rounded-2xl p-4 border border-rose-100/80 space-y-3">
                      {/* Close Date */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-rose-500" />
                          ปิดรับออเดอร์:
                        </span>
                        <span className="font-bold text-gray-900 bg-white px-2 py-0.5 rounded border border-rose-100">
                          {activeRound.orderCloseDate}
                        </span>
                      </div>

                      {/* Flight Return Date */}
                      <div className="flex items-center justify-between text-xs bg-rose-100/60 p-2 rounded-xl border border-rose-200">
                        <span className="text-rose-900 font-semibold flex items-center gap-1.5">
                          <Plane className="w-4 h-4 text-rose-600" />
                          วันที่ของบินกลับถึงไทย:
                        </span>
                        <span className="font-black text-rose-600 text-sm">
                          {activeRound.returnDate}
                        </span>
                      </div>

                      {/* Shipping Date */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 flex items-center gap-1.5">
                          <Truck className="w-4 h-4 text-blue-500" />
                          เริ่มจัดส่งพัสดุในไทย:
                        </span>
                        <span className="font-bold text-gray-900 bg-white px-2 py-0.5 rounded border border-rose-100">
                          {activeRound.shippingStartDate}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic">แม่ค้ายังไม่ได้ระบุรอบบิน</p>
                  )}

                  {activeRound?.note && (
                    <p className="text-xs text-gray-500 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                      💬 <span className="font-medium text-gray-700">ข้อความจากแม่ค้า:</span> {activeRound.note}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* 2. Promotions Banner & Coupons Section */}
        {promotions.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-amber-500 text-white rounded-lg">
                  <Gift className="w-4 h-4" />
                </span>
                <h2 className="text-lg font-bold text-gray-900">โปรโมชั่น & โค้ดส่วนลดพิเศษ</h2>
              </div>
              {copiedCode && (
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 animate-fadeIn">
                  ✓ คัดลอกโค้ด {copiedCode} แล้ว!
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {promotions.map((promo) => (
                <div
                  key={promo.id}
                  className="bg-gradient-to-r from-rose-500 via-red-500 to-rose-600 rounded-2xl p-4 sm:p-5 text-white shadow-md flex items-center justify-between gap-4 overflow-hidden relative"
                >
                  <div className="space-y-1 relative z-10">
                    <span className="bg-white/20 text-white text-[11px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs inline-block">
                      {promo.discountType === 'percentage'
                        ? `ส่วนลด ${promo.discountValue}%`
                        : promo.discountValue > 0
                        ? `ลดทันที ฿${promo.discountValue}`
                        : 'โปรโมชั่นพิเศษ'}
                    </span>
                    <h3 className="font-bold text-base sm:text-lg">{promo.title}</h3>
                    <p className="text-xs text-rose-100">{promo.description}</p>
                  </div>

                  {promo.code && (
                    <button
                      onClick={() => handleCopyCode(promo.code!)}
                      className="bg-white hover:bg-rose-50 text-rose-600 font-bold px-3.5 py-2 rounded-xl text-xs shadow-md transition-all shrink-0 border border-rose-200 active:scale-95 flex flex-col items-center"
                    >
                      <span className="text-[10px] text-gray-400 font-normal">คลิกเพื่อใช้</span>
                      <span className="text-sm font-black text-rose-600">{promo.code}</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 3. Filter & Category Selection Section */}
        <section className="space-y-4 pt-2">
          {/* Header & Search Input */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-gray-900">สินค้าพรีออเดอร์ญี่ปุ่น</h2>
              <p className="text-xs text-gray-500">เลือกดูสินค้าและกดเพิ่มลงในตะกร้าได้ทันที</p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search Bar */}
              <div className="relative min-w-[260px]">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ค้นหาชื่อสินค้า, หมวดหมู่, แบรนด์..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-rose-500 shadow-2xs"
                />
              </div>

              {/* Promo Only Toggle */}
              <button
                onClick={() => setPromoOnly(!promoOnly)}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                  promoOnly
                    ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Flame className={`w-4 h-4 ${promoOnly ? 'text-amber-300' : 'text-rose-500'}`} />
                <span>เฉพาะโปรโมชั่น</span>
              </button>
            </div>
          </div>

          {/* Stock Type Filter Badges (ทั้งหมด / พรีออเดอร์ / พร้อมส่ง) */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-bold text-gray-400 mr-1">สถานะสินค้า:</span>
            <button
              onClick={() => setStockFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                stockFilter === 'all'
                  ? 'bg-gray-900 text-white shadow-xs'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              ทั้งหมด
            </button>
            <button
              onClick={() => setStockFilter('preorder')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                stockFilter === 'preorder'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Plane className="w-3.5 h-3.5" />
              <span>พรีออเดอร์ (รอซื้อที่ญี่ปุ่น 🇯🇵)</span>
            </button>
            <button
              onClick={() => setStockFilter('in_stock')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                stockFilter === 'in_stock'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>มีของพร้อมส่งในไทย ⚡</span>
            </button>
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none pt-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === 'all'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-200'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              หมวดหมู่ทั้งหมด ({products.length})
            </button>
            {categories.map((cat) => {
              const count = products.filter((p) => p.categoryId === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-200'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                  <span className="text-[10px] opacity-75">({count})</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 4. Product Grid */}
        <section>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 space-y-3 animate-pulse border border-gray-100">
                  <div className="aspect-square bg-gray-100 rounded-xl" />
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                  <div className="h-6 bg-gray-100 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 max-w-md mx-auto space-y-3">
              <div className="text-4xl">🔍</div>
              <h3 className="font-bold text-gray-800 text-base">ไม่พบสินค้าตามเงื่อนไข</h3>
              <p className="text-xs text-gray-400">
                ลองค้นหาด้วยคำอื่น หรือกดล้างตัวกรองเพื่อดูสินค้าทั้งหมด
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setStockFilter('all');
                  setSearchQuery('');
                  setPromoOnly(false);
                }}
                className="mt-2 text-xs text-rose-600 font-bold hover:underline"
              >
                ล้างการค้นหาทั้งหมด
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onViewDetails={(prod) => setSelectedProduct(prod)}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Product Details Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          category={categories.find((c) => c.id === selectedProduct.categoryId)}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}
