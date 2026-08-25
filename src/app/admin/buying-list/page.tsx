'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import {
  CheckSquare,
  Square,
  Printer,
  ShoppingBag,
  Users,
  Search,
  Sparkles,
  CheckCircle,
  RefreshCw,
  Filter,
  Check,
} from 'lucide-react';

interface BuyingItem {
  productId: string;
  productName: string;
  imageUrl: string;
  categoryName: string;
  totalQuantity: number;
  purchasedQuantity: number;
  isPurchased: boolean;
  customers: { customerName: string; phone: string; quantity: number; orderNumber: string; isPurchased?: boolean }[];
}

export default function AdminBuyingListPage() {
  const [mounted, setMounted] = useState(false);
  const [buyingList, setBuyingList] = useState<BuyingItem[]>([]);
  const [totalItemsCount, setTotalItemsCount] = useState(0);
  const [totalOrdersCount, setTotalOrdersCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'bought'>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchBuyingList = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/japan-buying-list?_t=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();
      setBuyingList(data.buyingList || []);
      setTotalItemsCount(data.totalItemsCount || 0);
      setTotalOrdersCount(data.totalOrdersCount || 0);
    } catch (err) {
      console.error('Error fetching buying list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchBuyingList();
  }, []);

  const handleToggleCheck = async (item: BuyingItem) => {
    const nextState = !item.isPurchased;
    const confirmMessage = nextState
      ? `ยืนยันว่าได้ซื้อ "${item.productName}" ครบจำนวน ${item.totalQuantity} ชิ้นที่ญี่ปุ่นแล้วใช่ไหม?`
      : `ต้องการยกเลิกสถานะ "ซื้อแล้ว" ของ "${item.productName}" ใช่หรือไม่?`;

    if (!confirm(confirmMessage)) return;

    try {
      setUpdatingId(item.productId);
      // Optimistic update
      setBuyingList((prev) =>
        prev.map((it) => (it.productId === item.productId ? { ...it, isPurchased: nextState } : it))
      );

      const res = await fetch('/api/japan-buying-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: item.productId, isPurchased: nextState }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'บันทึกสถานะไม่สำเร็จ');

      fetchBuyingList();
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาดในการบันทึกสถานะ');
      fetchBuyingList();
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredList = buyingList.filter((item) => {
    const matchSearch =
      (item.productName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.categoryName || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'pending' && !item.isPurchased) ||
      (statusFilter === 'bought' && item.isPurchased);

    return matchSearch && matchStatus;
  });

  const boughtCount = buyingList.filter((i) => i.isPurchased).length;
  const progressPercent = buyingList.length > 0 ? Math.round((boughtCount / buyingList.length) * 100) : 0;

  if (!mounted) {
    return (
      <AdminLayout>
        <div className="py-16 text-center text-gray-400">กำลังโหลดรายการซื้อที่ญี่ปุ่น...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-amber-500" />
              สรุปรายการสินค้าที่ต้องไปซื้อที่ญี่ปุ่น (Buying Checklist)
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              ระบบรวมยอดจำนวนชิ้นที่ต้องซื้อทั้งหมดให้อัตโนมัติ ติ๊กบันทึกลงระบบทันทีเพื่อส่งต่อสถานะให้ลูกค้าทราบ
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4 text-gray-500" />
              <span>พิมพ์ใบรายการ</span>
            </button>

            <button
              onClick={fetchBuyingList}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>รีเฟรชยอด</span>
            </button>
          </div>
        </div>

        {/* 3 Overview Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-3xl p-5 border border-rose-100 shadow-sm space-y-1">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              สินค้าทั้งหมดที่ต้องซื้อ
            </span>
            <p className="text-2xl sm:text-3xl font-black text-rose-600">
              {totalItemsCount} <span className="text-sm text-gray-500 font-normal">ชิ้น</span>
            </p>
            <span className="text-[11px] text-gray-400">
              รวมจาก {totalOrdersCount} คำสั่งซื้อที่พร้อมหิ้ว
            </span>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-rose-100 shadow-sm space-y-1">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              จำนวนรายการสินค้า
            </span>
            <p className="text-2xl sm:text-3xl font-black text-gray-900">
              {buyingList.length} <span className="text-sm text-gray-500 font-normal">รายการ</span>
            </p>
            <span className="text-[11px] text-gray-400">จัดกลุ่มตามชนิดสินค้า</span>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-rose-100 shadow-sm space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                สถานะการซื้อของในทริป
              </span>
              <span className="text-xs font-bold text-emerald-600">{progressPercent}%</span>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-emerald-600">
              {boughtCount} / {buyingList.length} <span className="text-sm text-gray-500 font-normal">รายการ</span>
            </p>
            {/* Progress Bar */}
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden mt-1">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white rounded-3xl p-4 border border-rose-100 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาชื่อสินค้าที่ต้องซื้อ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === 'all'
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              ทั้งหมด ({buyingList.length})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === 'pending'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              ⏳ ยังไม่ซื้อ ({buyingList.filter((i) => !i.isPurchased).length})
            </button>
            <button
              onClick={() => setStatusFilter('bought')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === 'bought'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              ✓ ซื้อแล้ว ({boughtCount})
            </button>
          </div>
        </div>

        {/* Buying Checklist Cards */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl p-6 border border-gray-100 animate-pulse h-32" />
            ))}
          </div>
        ) : filteredList.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 space-y-3">
            <div className="text-3xl">🎉</div>
            <h3 className="font-bold text-gray-800 text-base">ไม่พบสินค้าในตัวกรองนี้</h3>
            <p className="text-xs text-gray-400">ลองเปลี่ยนตัวกรองสถานะหรือคำค้นหาดูครับ</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredList.map((item) => {
              const isChecked = item.isPurchased;
              return (
                <div
                  key={item.productId}
                  className={`bg-white rounded-3xl p-5 sm:p-6 border transition-all space-y-4 shadow-sm ${
                    isChecked
                      ? 'bg-emerald-50/40 border-emerald-300'
                      : 'border-rose-100 hover:border-rose-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Checkbox + Image + Title */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleCheck(item)}
                        disabled={updatingId === item.productId}
                        className={`w-9 h-9 rounded-xl transition-all flex items-center justify-center shrink-0 border ${
                          isChecked
                            ? 'text-white bg-emerald-600 border-emerald-600 shadow-sm'
                            : 'text-gray-400 hover:text-emerald-600 bg-white border-gray-300 hover:border-emerald-500 shadow-2xs'
                        }`}
                        title={isChecked ? 'คลิกเพื่อยกเลิกสถานะซื้อแล้ว' : 'คลิกเพื่อยืนยันว่าซื้อสินค้าชิ้นนี้แล้ว'}
                      >
                        {isChecked ? (
                          <Check className="w-5 h-5 stroke-[3]" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>

                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.productName}
                          className={`w-14 h-14 rounded-2xl object-cover bg-gray-50 shrink-0 border border-gray-100 ${
                            isChecked ? 'opacity-80' : ''
                          }`}
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-xl shrink-0">
                          🛍️
                        </div>
                      )}

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                            {item.categoryName}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isChecked ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {isChecked ? '✓ ซื้อแล้ว' : '⏳ รอซื้อ'}
                          </span>
                        </div>

                        <h3
                          className={`font-bold text-sm sm:text-base mt-1 ${
                            isChecked ? 'line-through text-gray-500' : 'text-gray-900'
                          }`}
                        >
                          {item.productName}
                        </h3>
                      </div>
                    </div>

                    {/* Total Quantity Pill */}
                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <div className="bg-rose-50 border border-rose-200 px-4 py-2 rounded-2xl text-center">
                        <span className="text-[10px] text-rose-500 font-bold block">ต้องซื้อรวม</span>
                        <span className="text-xl font-black text-rose-600">
                          {item.totalQuantity} <span className="text-xs font-semibold">ชิ้น</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Customer breakdown */}
                  <div className="border-t border-gray-100 pt-3 text-xs">
                    <span className="text-gray-400 font-medium block mb-1.5">
                      รายชื่อลูกค้าที่สั่งสินค้านี้ ({item.customers.length} คน):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {item.customers.map((c, idx) => (
                        <span
                          key={idx}
                          className={`border px-2.5 py-1 rounded-xl flex items-center gap-1.5 transition-colors ${
                            c.isPurchased || isChecked
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-medium'
                              : 'bg-gray-50 border-gray-200 text-gray-700'
                          }`}
                        >
                          <span className="font-bold text-gray-900">{c.customerName}</span>
                          <span className="text-rose-600 font-bold">({c.quantity} ชิ้น)</span>
                          <span className="text-gray-400 text-[10px]">[{c.orderNumber}]</span>
                          {(c.isPurchased || isChecked) && (
                            <span className="text-emerald-600 font-black text-xs">✓</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
