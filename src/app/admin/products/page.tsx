'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Product, Category, ProductStockStatus } from '@/types';
import {
  ShoppingBag,
  Plus,
  Edit2,
  Trash2,
  Upload,
  X,
  Tag,
  Check,
  Search,
  FolderPlus,
  ImageIcon,
  Plane,
  Zap,
  XCircle,
} from 'lucide-react';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [stockFilter, setStockFilter] = useState<'all' | ProductStockStatus>('all');

  // Product Modal (Add / Edit)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form fields for Product
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [originalPrice, setOriginalPrice] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [stockStatus, setStockStatus] = useState<ProductStockStatus>('preorder');
  const [isPromo, setIsPromo] = useState(false);
  const [promoTag, setPromoTag] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);

  // Category Modal (Add)
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDescription, setNewCatDescription] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('🛍️');
  const [savingCat, setSavingCat] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories'),
      ]);
      const prodData = await prodRes.json();
      const catData = await catRes.json();
      setProducts(prodData.products || []);
      setCategories(catData.categories || []);
    } catch (err) {
      console.error('Error loading products & categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setCategoryId(categories[0]?.id || '');
    setPrice('');
    setOriginalPrice('');
    setDescription('');
    setImageUrl('');
    setStockStatus('preorder');
    setIsPromo(false);
    setPromoTag('');
    setIsProductModalOpen(true);
  };

  const openEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    setCategoryId(prod.categoryId);
    setPrice(prod.price);
    setOriginalPrice(prod.originalPrice ?? '');
    setDescription(prod.description);
    setImageUrl(prod.imageUrl);
    setStockStatus(prod.stockStatus || (prod.inStock ? 'preorder' : 'out_of_stock'));
    setIsPromo(!!prod.isPromo);
    setPromoTag(prod.promoTag || '');
    setIsProductModalOpen(true);
  };

  // Quick toggle stock status directly from table/card
  const handleQuickStockChange = async (productId: string, newStatus: ProductStockStatus) => {
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stockStatus: newStatus,
          inStock: newStatus !== 'out_of_stock',
        }),
      });
      if (!res.ok) throw new Error('อัปเดตสถานะไม่สำเร็จ');

      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, stockStatus: newStatus, inStock: newStatus !== 'out_of_stock' } : p))
      );
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาดในการเปลี่ยนสถานะ');
    }
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'อัปโหลดรูปไม่สำเร็จ');
      setImageUrl(data.url);
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาดในการอัปโหลดรูป');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !categoryId || price === '') return;

    try {
      setSavingProduct(true);
      const payload = {
        name,
        categoryId,
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : undefined,
        description,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80',
        stockStatus,
        inStock: stockStatus !== 'out_of_stock',
        isPromo,
        promoTag,
      };

      let res;
      if (editingProduct) {
        res = await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'บันทึกสินค้าไม่สำเร็จ');

      setIsProductModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบสินค้านี้?')) return;

    try {
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('ลบสินค้าไม่สำเร็จ');
      fetchData();
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาดในการลบ');
      fetchData();
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;

    try {
      setSavingCat(true);
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCatName,
          description: newCatDescription,
          icon: newCatIcon,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'สร้างหมวดหมู่ไม่สำเร็จ');

      setNewCatName('');
      setNewCatDescription('');
      setIsCatModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาดในการสร้างหมวดหมู่');
    } finally {
      setSavingCat(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchCat = selectedCat === 'all' || p.categoryId === selectedCat;
    const pStock = p.stockStatus || (p.inStock ? 'preorder' : 'out_of_stock');
    const matchStock = stockFilter === 'all' || pStock === stockFilter;
    const matchSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchStock && matchSearch;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 flex items-center gap-2">
              <ShoppingBag className="w-8 h-8 text-rose-600" />
              จัดการสินค้า & หมวดหมู่
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              กำหนดสถานะสินค้า (พรีออเดอร์ รอซื้อที่ญี่ปุ่น / มีของพร้อมส่ง / สินค้าหมด), แก้ไขราคา และรูปภาพ
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCatModalOpen(true)}
              className="px-3.5 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-bold shadow-2xs transition-colors flex items-center gap-1.5"
            >
              <FolderPlus className="w-4 h-4 text-gray-500" />
              <span>เพิ่มประเภทสินค้า</span>
            </button>

            <button
              onClick={openAddModal}
              className="px-4 py-2.5 bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-700 hover:to-red-600 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-200 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มสินค้าใหม่</span>
            </button>
          </div>
        </div>

        {/* Categories and Stock Status Filters */}
        <div className="bg-white rounded-3xl p-5 border border-rose-100 shadow-sm space-y-3">
          {/* Stock Quick Filters */}
          <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-gray-100">
            <span className="text-xs font-bold text-gray-500 mr-1">สถานะสต็อก:</span>
            <button
              onClick={() => setStockFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                stockFilter === 'all'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              ทั้งหมด ({products.length})
            </button>
            <button
              onClick={() => setStockFilter('preorder')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                stockFilter === 'preorder'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Plane className="w-3.5 h-3.5" />
              <span>พรีออเดอร์ รอซื้อที่ญี่ปุ่น ({products.filter((p) => (p.stockStatus || 'preorder') === 'preorder').length})</span>
            </button>
            <button
              onClick={() => setStockFilter('in_stock')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                stockFilter === 'in_stock'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>พร้อมส่งในไทย ({products.filter((p) => p.stockStatus === 'in_stock').length})</span>
            </button>
            <button
              onClick={() => setStockFilter('out_of_stock')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                stockFilter === 'out_of_stock'
                  ? 'bg-gray-700 text-white shadow-xs'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>สินค้าหมด ({products.filter((p) => p.stockStatus === 'out_of_stock').length})</span>
            </button>
          </div>

          {/* Categories Horizontal Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1">
            <button
              onClick={() => setSelectedCat('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCat === 'all'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              หมวดหมู่ทั้งหมด
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1 transition-all ${
                  selectedCat === cat.id
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ค้นหาชื่อสินค้าหรือคำอธิบาย..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-rose-500"
              />
            </div>
            <span className="text-xs text-gray-400">พบ {filteredProducts.length} รายการ</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-3xl p-4 border border-gray-100 animate-pulse h-44" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 space-y-3">
              <div className="text-3xl">🛍️</div>
              <h3 className="font-bold text-gray-800 text-base">ไม่พบสินค้าตามเงื่อนไข</h3>
              <p className="text-xs text-gray-400">ลองเปลี่ยนตัวกรอง หรือกดปุ่ม &ldquo;เพิ่มสินค้าใหม่&rdquo;</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredProducts.map((product) => {
                const cat = categories.find((c) => c.id === product.categoryId);
                const currentStock = product.stockStatus || (product.inStock ? 'preorder' : 'out_of_stock');
                return (
                  <div
                    key={product.id}
                    className={`bg-white rounded-3xl p-4 border transition-all flex flex-col justify-between space-y-3 shadow-sm ${
                      currentStock === 'out_of_stock'
                        ? 'border-gray-200 bg-gray-50/60 opacity-80'
                        : 'border-rose-100 hover:shadow-md'
                    }`}
                  >
                    <div className="flex gap-3">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className={`w-20 h-20 rounded-2xl object-cover bg-gray-50 shrink-0 border border-gray-100 ${
                          currentStock === 'out_of_stock' ? 'grayscale-40' : ''
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        {cat && (
                          <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-100">
                            {cat.icon} {cat.name}
                          </span>
                        )}
                        <h3 className="font-bold text-gray-900 text-xs sm:text-sm line-clamp-2 mt-1">
                          {product.name}
                        </h3>
                        <div className="flex items-baseline gap-1.5 mt-1">
                          <span className="text-sm font-black text-rose-600">
                            ฿{product.price.toLocaleString()}
                          </span>
                          {product.originalPrice && (
                            <span className="text-[11px] text-gray-400 line-through">
                              ฿{product.originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Stock Status Selector Bar (1-Click Change) */}
                    <div className="bg-gray-50 p-2 rounded-2xl border border-gray-100 flex items-center justify-between gap-1 text-[11px]">
                      <span className="text-gray-400 font-medium px-1">สถานะ:</span>
                      <select
                        value={currentStock}
                        onChange={(e) => handleQuickStockChange(product.id, e.target.value as ProductStockStatus)}
                        className={`font-bold px-2 py-1 rounded-xl border text-xs focus:outline-none ${
                          currentStock === 'preorder'
                            ? 'bg-purple-50 text-purple-800 border-purple-200'
                            : currentStock === 'in_stock'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-gray-100 text-gray-700 border-gray-300'
                        }`}
                      >
                        <option value="preorder">🎌 พรีออเดอร์ (รอซื้อที่ญี่ปุ่น)</option>
                        <option value="in_stock">⚡ มีของพร้อมส่งในไทย</option>
                        <option value="out_of_stock">❌ สินค้าหมดจาก Stock</option>
                      </select>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between border-t border-gray-50 pt-2 text-xs">
                      {product.promoTag ? (
                        <span className="text-[10px] bg-rose-600 text-white font-bold px-2 py-0.5 rounded-full">
                          {product.promoTag}
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-400">ราคาปกติ</span>
                      )}

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(product)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="แก้ไขสินค้า"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="ลบสินค้า"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Product Add / Edit Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div
            className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-5 border border-rose-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-rose-600" />
                {editingProduct ? 'แก้ไขข้อมูลสินค้า' : 'เพิ่มสินค้าพรีออเดอร์ใหม่'}
              </h2>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs sm:text-sm">
              {/* Name */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  ชื่อสินค้า <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น Tokyo Banana ขนมเค้กกล้วยยอดฮิต"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Category & Price */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    ประเภทสินค้า <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-rose-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.icon} {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    ราคาขาย (บาท) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="เช่น 490"
                    value={price}
                    onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    ราคาปกติ/ราคาเต็ม <span className="text-gray-400 font-normal">(ถ้ามี)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="เช่น 550"
                    value={originalPrice}
                    onChange={(e) =>
                      setOriginalPrice(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">รายละเอียดสินค้า</label>
                <textarea
                  rows={3}
                  placeholder="ระบุรสชาติ, ขนาดบรรจุ, วิธีใช้ หรือเงื่อนไขพรีออเดอร์"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Stock Status Selection (พรีออเดอร์ / พร้อมส่ง / สินค้าหมด) */}
              <div className="bg-rose-50/40 p-4 rounded-2xl border border-rose-100 space-y-2">
                <label className="block font-bold text-gray-800 text-xs">
                  สถานะสินค้าในสต็อก (Stock Status) <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <label
                    className={`p-3 rounded-xl border-2 flex items-center gap-2 cursor-pointer transition-all ${
                      stockStatus === 'preorder'
                        ? 'border-purple-500 bg-purple-50 text-purple-900 font-bold'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-purple-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="stockStatus"
                      value="preorder"
                      checked={stockStatus === 'preorder'}
                      onChange={() => setStockStatus('preorder')}
                      className="hidden"
                    />
                    <Plane className="w-4 h-4 text-purple-600 shrink-0" />
                    <div>
                      <p className="text-xs">พรีออเดอร์ 🇯🇵</p>
                      <p className="text-[10px] text-gray-400 font-normal">รอซื้อของที่ญี่ปุ่น</p>
                    </div>
                  </label>

                  <label
                    className={`p-3 rounded-xl border-2 flex items-center gap-2 cursor-pointer transition-all ${
                      stockStatus === 'in_stock'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-emerald-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="stockStatus"
                      value="in_stock"
                      checked={stockStatus === 'in_stock'}
                      onChange={() => setStockStatus('in_stock')}
                      className="hidden"
                    />
                    <Zap className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <p className="text-xs">มีของพร้อมส่ง ⚡</p>
                      <p className="text-[10px] text-gray-400 font-normal">จัดส่งในไทยทันที</p>
                    </div>
                  </label>

                  <label
                    className={`p-3 rounded-xl border-2 flex items-center gap-2 cursor-pointer transition-all ${
                      stockStatus === 'out_of_stock'
                        ? 'border-red-500 bg-red-50 text-red-900 font-bold'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-red-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="stockStatus"
                      value="out_of_stock"
                      checked={stockStatus === 'out_of_stock'}
                      onChange={() => setStockStatus('out_of_stock')}
                      className="hidden"
                    />
                    <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <div>
                      <p className="text-xs">สินค้าหมด ❌</p>
                      <p className="text-[10px] text-gray-400 font-normal">งดรับออเดอร์ชั่วคราว</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Image URL & Upload */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">รูปภาพสินค้า</label>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <input
                    type="text"
                    placeholder="ใส่ URL รูปภาพ หรือกดปุ่มอัปโหลดรูปด้านขวา"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="flex-1 w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-rose-500 text-xs"
                  />
                  <label className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center gap-1 shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingImage ? 'กำลังอัปโหลด...' : 'อัปโหลดรูป'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {imageUrl && (
                  <div className="mt-2 flex items-center gap-2">
                    <img
                      src={imageUrl}
                      alt="ตัวอย่าง"
                      className="w-12 h-12 rounded-lg object-cover border border-gray-200 shadow-2xs"
                    />
                    <span className="text-[11px] text-gray-400">รูปตัวอย่าง</span>
                  </div>
                )}
              </div>

              {/* Promo tag & Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    ข้อความป้ายโปรโมชั่น <span className="text-gray-400 font-normal">(เช่น 🔥 ยอดฮิต, ✨ แนะนำ)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น 🔥 ขายดีอันดับ 1"
                    value={promoTag}
                    onChange={(e) => setPromoTag(e.target.value)}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="flex items-center gap-4 pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPromo}
                      onChange={(e) => setIsPromo(e.target.checked)}
                      className="w-4 h-4 text-rose-600 rounded"
                    />
                    <span className="font-semibold text-gray-700 text-xs">เป็นสินค้าโปรโมชั่น</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-bold transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={savingProduct}
                  className="px-6 py-2.5 bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-700 hover:to-red-600 text-white rounded-xl font-bold shadow-md shadow-rose-200 transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{savingProduct ? 'กำลังบันทึก...' : 'บันทึกสินค้า'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div
            className="bg-white rounded-3xl max-w-md w-full shadow-2xl p-6 space-y-4 border border-rose-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-rose-600" />
                เพิ่มประเภทสินค้าใหม่
              </h2>
              <button
                onClick={() => setIsCatModalOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  ไอคอน Emoji <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น 🍪, 💄, 🧸, 💊, 🍵"
                  value={newCatIcon}
                  onChange={(e) => setNewCatIcon(e.target.value)}
                  className="w-20 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-center text-lg focus:bg-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  ชื่อหมวดหมู่ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ขนม & ของฝากญี่ปุ่น"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">คำอธิบายย่อ</label>
                <input
                  type="text"
                  placeholder="เช่น ขนมยอดฮิตจากโตเกียว โอซาก้า ฮอกไกโด"
                  value={newCatDescription}
                  onChange={(e) => setNewCatDescription(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCatModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-bold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={savingCat}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-md transition-colors"
                >
                  {savingCat ? 'กำลังบันทึก...' : 'เพิ่มหมวดหมู่'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
