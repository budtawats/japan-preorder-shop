'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { FlightRound } from '@/types';
import {
  Plane,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  Truck,
  CheckCircle,
  X,
  Sparkles,
} from 'lucide-react';

export default function AdminFlightRoundsPage() {
  const [rounds, setRounds] = useState<FlightRound[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRound, setEditingRound] = useState<FlightRound | null>(null);

  // Form
  const [roundName, setRoundName] = useState('');
  const [orderCloseDate, setOrderCloseDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [shippingStartDate, setShippingStartDate] = useState('');
  const [status, setStatus] = useState<'active' | 'closed' | 'completed'>('active');
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchRounds = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/flight-rounds');
      const data = await res.json();
      setRounds(data.flightRounds || []);
    } catch (err) {
      console.error('Error loading flight rounds:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRounds();
  }, []);

  const openAddModal = () => {
    setEditingRound(null);
    setRoundName('รอบบินโตเกียว 🌸');
    setOrderCloseDate('');
    setReturnDate('');
    setShippingStartDate('');
    setStatus('active');
    setNote('แม่ค้าบินเองของแท้ 100% ส่งตรงถึงไทย');
    setIsModalOpen(true);
  };

  const openEditModal = (r: FlightRound) => {
    setEditingRound(r);
    setRoundName(r.roundName);
    setOrderCloseDate(r.orderCloseDate);
    setReturnDate(r.returnDate);
    setShippingStartDate(r.shippingStartDate);
    setStatus(r.status);
    setNote(r.note || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roundName || !orderCloseDate || !returnDate || !shippingStartDate) return;

    try {
      setIsSaving(true);
      const payload = {
        roundName,
        orderCloseDate,
        returnDate,
        shippingStartDate,
        status,
        note,
      };

      let res;
      if (editingRound) {
        res = await fetch(`/api/flight-rounds/${editingRound.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/flight-rounds', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'บันทึกรอบบินไม่สำเร็จ');

      setIsModalOpen(false);
      fetchRounds();
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาด');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (roundId: string) => {
    if (!confirm('ต้องการลบรอบบินนี้หรือไม่?')) return;
    try {
      setRounds((prev) => prev.filter((r) => r.id !== roundId));
      const res = await fetch(`/api/flight-rounds/${roundId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('ลบรอบบินไม่สำเร็จ');
      fetchRounds();
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาด');
      fetchRounds();
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 flex items-center gap-2">
              <Plane className="w-8 h-8 text-rose-600" />
              กำหนดรอบบินกลับจากญี่ปุ่น
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              ระบุรอบบิน วันที่ปิดรับออเดอร์ วันที่ของบินถึงไทย และวันเริ่มส่งพัสดุ เพื่อแสดงให้ลูกค้าเห็นที่หน้าร้าน
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="px-4 py-2.5 bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-700 hover:to-red-600 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-200 transition-all flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>สร้างรอบบินใหม่</span>
          </button>
        </div>

        {/* Rounds Cards */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl p-6 border border-gray-100 animate-pulse h-36" />
            ))}
          </div>
        ) : rounds.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 space-y-3">
            <div className="text-3xl">✈️</div>
            <h3 className="font-bold text-gray-800 text-base">ยังไม่ได้กำหนดรอบบิน</h3>
            <p className="text-xs text-gray-400">กดปุ่ม &ldquo;สร้างรอบบินใหม่&rdquo; เพื่อกำหนดวันที่บินกลับไทย</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rounds.map((round) => (
              <div
                key={round.id}
                className={`bg-white rounded-3xl p-6 border shadow-sm transition-all space-y-4 relative overflow-hidden ${
                  round.status === 'active'
                    ? 'border-2 border-rose-300 shadow-rose-100/50 ring-2 ring-rose-50'
                    : 'border-gray-200 opacity-80'
                }`}
              >
                {/* Status Badge */}
                <div className="flex items-center justify-between">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      round.status === 'active'
                        ? 'bg-emerald-100 text-emerald-800 flex items-center gap-1.5'
                        : round.status === 'closed'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {round.status === 'active' && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    )}
                    {round.status === 'active'
                      ? '🟢 กำลังเปิดรับ (Active)'
                      : round.status === 'closed'
                      ? '🔴 ปิดรับออเดอร์แล้ว'
                      : '✓ สำเร็จรอบบินแล้ว'}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(round)}
                      className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="แก้ไข"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(round.id)}
                      className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      title="ลบ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Round Title */}
                <div>
                  <h3 className="text-base font-black text-gray-900">{round.roundName}</h3>
                  {round.note && <p className="text-xs text-gray-500 mt-1">💬 {round.note}</p>}
                </div>

                {/* Dates List */}
                <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-100 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-rose-500" />
                      วันปิดรับออเดอร์:
                    </span>
                    <span className="font-bold text-gray-900 bg-white px-2 py-0.5 rounded border border-rose-100">
                      {round.orderCloseDate}
                    </span>
                  </div>

                  <div className="flex justify-between items-center bg-rose-100/60 p-1.5 rounded-xl border border-rose-200">
                    <span className="text-rose-900 font-semibold flex items-center gap-1.5">
                      <Plane className="w-3.5 h-3.5 text-rose-600" />
                      วันที่ของบินกลับถึงไทย:
                    </span>
                    <span className="font-black text-rose-700 text-sm">
                      {round.returnDate}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-blue-500" />
                      วันเริ่มจัดส่งพัสดุในไทย:
                    </span>
                    <span className="font-bold text-gray-900 bg-white px-2 py-0.5 rounded border border-rose-100">
                      {round.shippingStartDate}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Flight Round Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 border border-rose-100 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                <Plane className="w-5 h-5 text-rose-600" />
                {editingRound ? 'แก้ไขรอบบิน' : 'กำหนดรอบบินใหม่'}
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
                  ชื่อรอบบิน <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น รอบบินโตเกียว & โอซาก้า 🌸"
                  value={roundName}
                  onChange={(e) => setRoundName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    วันปิดรับออเดอร์ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={orderCloseDate}
                    onChange={(e) => setOrderCloseDate(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    วันบินกลับถึงไทย <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    วันเริ่มจัดส่ง <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={shippingStartDate}
                    onChange={(e) => setShippingStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">สถานะรอบบิน</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-rose-500"
                >
                  <option value="active">🟢 เปิดรับออเดอร์ (แสดงหน้าร้าน)</option>
                  <option value="closed">🔴 ปิดรับออเดอร์แล้ว</option>
                  <option value="completed">✓ บินสำเร็จ/ส่งของครบแล้ว</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  ข้อความประชาสัมพันธ์ / หมายเหตุถึงลูกค้า
                </label>
                <textarea
                  rows={2}
                  placeholder="เช่น แม่ค้าบินเอง หิ้วจากช็อปโตเกียว แพ็คกล่องกันกระแทกอย่างดี"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-rose-500"
                />
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
                  {isSaving ? 'กำลังบันทึก...' : 'บันทึกรอบบิน'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
