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
} from 'lucide-react';

interface BuyingItem {
  productId: string;
  productName: string;
  imageUrl: string;
  categoryName: string;
  totalQuantity: number;
  customers: { customerName: string; phone: string; quantity: number; orderNumber: string }[];
}

export default function AdminBuyingListPage() {
  const [buyingList, setBuyingList] = useState<BuyingItem[]>([]);
  const [totalItemsCount, setTotalItemsCount] = useState(0);
  const [totalOrdersCount, setTotalOrdersCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [checkedMap, setCheckedMap] = useState<Record<string, boolean>>({});

  const fetchBuyingList = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/japan-buying-list');
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
    fetchBuyingList();
  }, []);

  const toggleCheck = (productId: string) => {
    setCheckedMap((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  const filteredList = buyingList.filter(
    (item) =>
      item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.categoryName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const boughtCount = Object.values(checkedMap).filter(Boolean).length;

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
              ระบบรวมยอดจำนวนชิ้นของสินค้าแต่ละตัวให้อัตโนมัติ เปิดดูหรือติ๊กเช็คลิสต์ขณะเดินช้อปปิ้งในญี่ปุ่นได้ทันที
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4 text-gray-500" />
              <span>พิมพ์ใบรายการ</span>
            </button>

            <button
              onClick={fetchBuyingList}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
            >
              🔄 รีเฟรชยอด
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
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              สถานะการซื้อของในทริป
            </span>
            <p className="text-2xl sm:text-3xl font-black text-emerald-600">
              {boughtCount} / {buyingList.length}
            </p>
            <span className="text-[11px] text-emerald-600 font-medium">
              ซื้อครบแล้ว {Math.round((boughtCount / (buyingList.length || 1)) * 100)}%
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาชื่อสินค้าที่ต้องซื้อ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-rose-500"
          />
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
            <h3 className="font-bold text-gray-800 text-base">ยังไม่มีสินค้าที่ต้องซื้อ</h3>
            <p className="text-xs text-gray-400">เมื่อมีลูกค้าสั่งซื้อและชำระเงิน รายการจะมาปรากฏที่นี่</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredList.map((item) => {
              const isChecked = !!checkedMap[item.productId];
              return (
                <div
                  key={item.productId}
                  className={`bg-white rounded-3xl p-5 sm:p-6 border transition-all space-y-4 shadow-sm ${
                    isChecked
                      ? 'bg-emerald-50/40 border-emerald-300 opacity-75'
                      : 'border-rose-100 hover:border-rose-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Checkbox + Image + Title */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleCheck(item.productId)}
                        className={`p-1.5 rounded-xl transition-colors shrink-0 ${
                          isChecked
                            ? 'text-emerald-600 bg-emerald-100'
                            : 'text-gray-300 hover:text-gray-500 bg-gray-100'
                        }`}
                        title={isChecked ? 'ติ๊กออก' : 'ทำเครื่องหมายว่าซื้อแล้ว'}
                      >
                        {isChecked ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : (
                          <Square className="w-6 h-6" />
                        )}
                      </button>

                      <img
                        src={item.imageUrl}
                        alt={item.productName}
                        className="w-14 h-14 rounded-2xl object-cover bg-gray-50 shrink-0 border border-gray-100"
                      />

                      <div>
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                          {item.categoryName}
                        </span>
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
                        <span className="text-[10px] text-rose-500 font-bold block">ต้องซื้อ</span>
                        <span className="text-xl font-black text-rose-600">
                          {item.totalQuantity} <span className="text-xs font-semibold">ชิ้น</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Customer breakdown */}
                  <div className="border-t border-gray-100 pt-3 text-xs">
                    <span className="text-gray-400 font-medium block mb-1.5">
                      รายชื่อลูกค้าที่สั่งสินค้านี้:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {item.customers.map((c, idx) => (
                        <span
                          key={idx}
                          className="bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-xl text-gray-700 flex items-center gap-1"
                        >
                          <span className="font-bold text-gray-900">{c.customerName}</span>
                          <span className="text-rose-600 font-bold">({c.quantity} ชิ้น)</span>
                          <span className="text-gray-400 text-[10px]">[{c.orderNumber}]</span>
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
