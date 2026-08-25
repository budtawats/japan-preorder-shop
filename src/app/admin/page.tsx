'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/AdminLayout';
import { Order, Product, FlightRound } from '@/types';
import {
  Package,
  ShoppingBag,
  Plane,
  Clock,
  CheckCircle,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Truck,
  Users,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeRound, setActiveRound] = useState<FlightRound | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [ordRes, prodRes, roundRes] = await Promise.all([
          fetch('/api/orders'),
          fetch('/api/products'),
          fetch('/api/flight-rounds'),
        ]);

        const ordData = await ordRes.json();
        const prodData = await prodRes.json();
        const roundData = await roundRes.json();

        setOrders(ordData.orders || []);
        setProducts(prodData.products || []);
        setActiveRound(roundData.activeRound || null);
      } catch (err) {
        console.error('Error loading admin overview:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Stats Calculations
  const pendingSlips = orders.filter((o) => o.status === 'pending_verification').length;
  const paidOrders = orders.filter((o) => ['paid', 'purchased', 'shipped'].includes(o.status));
  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const activeOrdersCount = orders.filter((o) => o.status !== 'cancelled').length;

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
              ภาพรวมระบบจัดการร้านค้า (Admin)
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              ยินดีต้อนรับแม่ค้า! ตรวจสอบคำสั่งซื้อ ยอดขาย และเตรียมรอบบินหิ้วของญี่ปุ่น
            </p>
          </div>

          <Link
            href="/admin/buying-list"
            className="px-4 py-2.5 bg-gradient-to-r from-rose-600 to-red-500 text-white rounded-xl text-xs font-bold shadow-md hover:from-rose-700 hover:to-red-600 transition-all flex items-center gap-2 shrink-0"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>ดูรายการของที่ต้องซื้อที่ญี่ปุ่น</span>
          </Link>
        </div>

        {/* Pending Verification Notice */}
        {pendingSlips > 0 && (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-5 flex items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold text-lg">
                ⚠️
              </div>
              <div>
                <h3 className="font-bold text-amber-900 text-sm">
                  มีสลิปโอนเงินรอตรวจสอบ {pendingSlips} รายการ
                </h3>
                <p className="text-xs text-amber-700">
                  ลูกค้าได้แนบสลิปมาแล้ว กรุณาเข้าไปตรวจสอบและกดยืนยันการชำระเงิน
                </p>
              </div>
            </div>

            <Link
              href="/admin/orders"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shrink-0 transition-colors"
            >
              ไปตรวจสลิปทันที
            </Link>
          </div>
        )}

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Revenue */}
          <div className="bg-white rounded-3xl p-5 border border-rose-100 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-xs font-bold uppercase tracking-wider">ยอดขายรวม</span>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-gray-900">
              ฿{totalRevenue.toLocaleString()}
            </p>
            <span className="text-[11px] text-emerald-600 font-medium">
              จาก {paidOrders.length} ออเดอร์ที่ชำระเงินแล้ว
            </span>
          </div>

          {/* Orders */}
          <div className="bg-white rounded-3xl p-5 border border-rose-100 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-xs font-bold uppercase tracking-wider">คำสั่งซื้อทั้งหมด</span>
              <Package className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-gray-900">
              {activeOrdersCount}
            </p>
            <span className="text-[11px] text-gray-500 font-medium">
              รอตรวจสลิป {pendingSlips} รายการ
            </span>
          </div>

          {/* Products */}
          <div className="bg-white rounded-3xl p-5 border border-rose-100 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-xs font-bold uppercase tracking-wider">สินค้าในร้าน</span>
              <ShoppingBag className="w-4 h-4 text-rose-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-gray-900">
              {products.length}
            </p>
            <span className="text-[11px] text-rose-600 font-medium">
              พร้อมพรีออเดอร์
            </span>
          </div>

          {/* Flight Round */}
          <div className="bg-white rounded-3xl p-5 border border-rose-100 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-xs font-bold uppercase tracking-wider">รอบบินปัจจุบัน</span>
              <Plane className="w-4 h-4 text-purple-500" />
            </div>
            <p className="text-sm font-bold text-gray-900 truncate">
              {activeRound ? activeRound.roundName : 'ยังไม่ได้ตั้ง'}
            </p>
            <span className="text-[11px] text-purple-600 font-semibold">
              บินกลับ: {activeRound ? activeRound.returnDate : '-'}
            </span>
          </div>
        </div>

        {/* Quick Management Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/admin/orders"
            className="group bg-white rounded-3xl p-6 border border-gray-200 hover:border-rose-300 hover:shadow-md transition-all space-y-3"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-900 text-base">จัดการคำสั่งซื้อ</h3>
            <p className="text-xs text-gray-500">
              ตรวจสอบสลิปโอนเงิน อนุมัติการชำระเงิน และกรอกเลขพัสดุ
            </p>
          </Link>

          <Link
            href="/admin/products"
            className="group bg-white rounded-3xl p-6 border border-gray-200 hover:border-rose-300 hover:shadow-md transition-all space-y-3"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-900 text-base">จัดการสินค้า & หมวดหมู่</h3>
            <p className="text-xs text-gray-500">
              เพิ่มสินค้าใหม่ อัปโหลดรูป ตั้งราคาปกติและราคาโปรโมชั่น
            </p>
          </Link>

          <Link
            href="/admin/flight-rounds"
            className="group bg-white rounded-3xl p-6 border border-gray-200 hover:border-rose-300 hover:shadow-md transition-all space-y-3"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Plane className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-900 text-base">กำหนดรอบบินกลับไทย</h3>
            <p className="text-xs text-gray-500">
              ระบุวันปิดรับ วันบินกลับไทย และวันเริ่มส่งพัสดุ
            </p>
          </Link>
        </div>

        {/* Recent 5 Orders */}
        <div className="bg-white rounded-3xl p-6 border border-rose-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h3 className="font-bold text-gray-900 text-base">คำสั่งซื้อล่าสุด</h3>
              <p className="text-xs text-gray-400">รายการสั่งซื้อใหม่ล่าสุดที่เข้ามาในระบบ</p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1"
            >
              <span>ดูทั้งหมด ({orders.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-gray-100">
            {orders.slice(0, 5).map((order) => (
              <div
                key={order.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-gray-900">{order.orderNumber}</span>
                    <span className="text-gray-600 font-semibold">{order.customerName}</span>
                    <span className="text-gray-400">({order.customerPhone})</span>
                  </div>
                  <p className="text-gray-400 mt-0.5">
                    {order.items.length} รายการ • สั่งเมื่อ {new Date(order.createdAt).toLocaleString('th-TH')}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <span className="font-black text-rose-600 text-sm">
                    ฿{order.totalAmount.toLocaleString()}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      order.status === 'paid'
                        ? 'bg-emerald-100 text-emerald-800'
                        : order.status === 'pending_verification'
                        ? 'bg-blue-100 text-blue-800 animate-pulse'
                        : order.status === 'shipped'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {order.status === 'paid'
                      ? 'ชำระแล้ว'
                      : order.status === 'pending_verification'
                      ? 'รอตรวจสลิป'
                      : order.status === 'shipped'
                      ? 'จัดส่งแล้ว'
                      : order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
