'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Promotion } from '@/types';
import {
  Gift,
  Plus,
  Edit2,
  Trash2,
  Tag,
  Check,
  X,
  Sparkles,
} from 'lucide-react';

export default function AdminPromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);

  // Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'fixed' | 'percentage'>('fixed');
  const [discountValue, setDiscountValue] = useState<number | ''>('');
  const [code, setCode] = useState('');
  const [minSpend, setMinSpend] = useState<number | ''>('');
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchPromos = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/promotions');
      const data = await res.json();
      setPromotions(data.promotions || []);
    } catch (err) {
      console.error('Error loading promotions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromos();
  }, []);

  const openAddModal = () => {
    setEditingPromo(null);
    setTitle('');
    setDescription('');
    setDiscountType('fixed');
    setDiscountValue('');
    setCode('');
    setMinSpend('');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (p: Promotion) => {
    setEditingPromo(p);
    setTitle(p.title);
    setDescription(p.description);
    setDiscountType(p.discountType);
    setDiscountValue(p.discountValue);
    setCode(p.code || '');
    setMinSpend(p.minSpend ?? '');
    setIsActive(p.isActive);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    try {
      setIsSaving(true);
      const payload = {
        title,
        description,
        discountType,
        discountValue: Number(discountValue || 0),
        code: code ? code.trim().toUpperCase() : undefined,
        minSpend: minSpend ? Number(minSpend) : 0,
        isActive,
      };

      let res;
      if (editingPromo) {
        res = await fetch(`/api/promotions/${editingPromo.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/promotions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) throw new Error('บันทึกโปรโมชั่นไม่สำเร็จ');

      setIsModalOpen(false);
      fetchPromos();
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาด');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('ต้องการลบโปรโมชั่นนี้หรือไม่?')) return;
    try {
      const res = await fetch(`/api/promotions/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('ลบไม่สำเร็จ');
      fetchPromos();
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาด');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 flex items-center gap-2">
              <Gift className="w-8 h-8 text-rose-600" />
              จัดการโปรโมชั่น & คูปองส่วนลด
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              สร้างแบนเนอร์โปรโมชั่นหน้าแรก กำหนดโค้ดส่วนลด และยอดสั่งซื้อขั้นต่ำ
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="px-4 py-2.5 bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-700 hover:to-red-600 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-200 transition-all flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>สร้างโปรโมชั่นใหม่</span>
          </button>
        </div>

        {/* Promotions Grid */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl p-6 border border-gray-100 animate-pulse h-32" />
            ))}
          </div>
        ) : promotions.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 space-y-3">
            <div className="text-3xl">🎁</div>
            <h3 className="font-bold text-gray-800 text-base">ยังไม่มีโปรโมชั่น</h3>
            <p className="text-xs text-gray-400">กดปุ่ม &ldquo;สร้างโปรโมชั่นใหม่&rdquo; เพื่อเพิ่มคูปองส่วนลดให้ลูกค้า</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {promotions.map((promo) => (
              <div
                key={promo.id}
                className="bg-white rounded-3xl p-6 border border-rose-100 shadow-sm space-y-4 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`px-3 py-0.5 rounded-full text-xs font-bold ${
                      promo.isActive
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {promo.isActive ? '🟢 ใช้งานอยู่' : '⚪ ปิดการใช้งาน'}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(promo)}
                      className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="แก้ไข"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(promo.id)}
                      className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      title="ลบ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 text-base">{promo.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">{promo.description}</p>
                </div>

                <div className="bg-rose-50/50 p-3.5 rounded-2xl border border-rose-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-gray-400">มูลค่าส่วนลด:</span>
                    <p className="font-bold text-rose-600 text-sm">
                      {promo.discountType === 'percentage'
                        ? `ลด ${promo.discountValue}%`
                        : promo.discountValue > 0
                        ? `ลด ฿${promo.discountValue}`
                        : 'โปรโมชั่นแบนเนอร์'}
                    </p>
                  </div>

                  {promo.code && (
                    <div className="text-right">
                      <span className="text-gray-400">โค้ดคูปอง:</span>
                      <p className="font-mono font-black text-gray-900 bg-white px-2 py-0.5 rounded border border-rose-200">
                        {promo.code}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 border border-rose-100 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                <Gift className="w-5 h-5 text-rose-600" />
                {editingPromo ? 'แก้ไขโปรโมชั่น' : 'สร้างโปรโมชั่นใหม่'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  ชื่อโปรโมชั่น <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น 🎉 ต้อนรับรอบบินใหม่ ลดทันที 50 บาท!"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">คำอธิบายโปรโมชั่น</label>
                <input
                  type="text"
                  placeholder="เช่น ใส่โค้ด JP50 เมื่อสั่งซื้อครบ 500 บาทขึ้นไป"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">ประเภทส่วนลด</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="fixed">บาท (Fixed Amount)</option>
                    <option value="percentage">เปอร์เซ็นต์ (%)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">มูลค่าส่วนลด</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="เช่น 50 หรือ 10"
                    value={discountValue}
                    onChange={(e) =>
                      setDiscountValue(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    รหัสโค้ดคูปอง <span className="text-gray-400 font-normal">(ถ้ามี)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น JP50"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl uppercase font-mono focus:bg-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    ยอดสั่งซื้อขั้นต่ำ (บาท)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="เช่น 500"
                    value={minSpend}
                    onChange={(e) =>
                      setMinSpend(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-rose-600 rounded"
                  />
                  <span className="font-bold text-gray-700 text-xs">เปิดใช้งานโปรโมชั่นนี้</span>
                </label>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-bold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-md transition-colors"
                >
                  {isSaving ? 'กำลังบันทึก...' : 'บันทึกโปรโมชั่น'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
