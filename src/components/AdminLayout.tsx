'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Plane,
  Gift,
  QrCode,
  CheckSquare,
  ArrowLeft,
  ShieldAlert,
  Store,
  KeyRound,
  UserCheck,
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  const navItems = [
    { href: '/admin', label: 'ภาพรวมระบบ', icon: LayoutDashboard },
    { href: '/admin/orders', label: 'คำสั่งซื้อ & สลิป', icon: Package },
    { href: '/admin/buying-list', label: '✨ รายการซื้อที่ญี่ปุ่น', icon: CheckSquare, badge: 'Japan' },
    { href: '/admin/products', label: 'จัดการสินค้า & หมวดหมู่', icon: ShoppingBag },
    { href: '/admin/flight-rounds', label: 'กำหนดรอบบินกลับไทย', icon: Plane },
    { href: '/admin/promotions', label: 'โปรโมชั่น & แบนเนอร์', icon: Gift },
    { href: '/admin/payment-settings', label: 'ตั้งค่า QR & ธนาคาร', icon: QrCode },
    { href: '/admin/shop-settings', label: 'ข้อมูลร้าน & ช่องทางติดต่อ', icon: Store },
    { href: '/admin/profile', label: 'บัญชีแม่ค้า & รหัสผ่าน', icon: KeyRound },
  ];

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-500 font-medium">กำลังโหลดข้อมูลระบบแม่ค้า...</p>
        </div>
      </div>
    );
  }

  // Access Control: Merchant only
  if (!user || user.role !== 'merchant') {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-rose-100 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">สงวนสิทธิ์เฉพาะแม่ค้า (Admin)</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            หน้านี้สำหรับเจ้าของร้านจัดการสินค้า รอบบิน และตรวจสอบสลิป กรุณาเข้าสู่ระบบด้วยบัญชีแม่ค้า
          </p>
          <div className="pt-2 space-y-2">
            <Link
              href="/auth"
              className="block w-full py-3 bg-gradient-to-r from-rose-600 to-red-500 text-white rounded-xl font-bold text-sm shadow-md hover:from-rose-700 hover:to-red-600 transition-all"
            >
              เข้าสู่ระบบแม่ค้า
            </Link>
            <Link
              href="/"
              className="block w-full py-2.5 text-gray-600 hover:text-gray-900 text-xs font-semibold"
            >
              กลับสู่หน้าร้าน
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 shrink-0 p-4 space-y-6 flex flex-col justify-between">
        <div className="space-y-4">
          {/* Admin Header */}
          <Link
            href="/admin/profile"
            className="block p-3 bg-rose-50 hover:bg-rose-100/70 rounded-2xl border border-rose-100 transition-colors group"
            title="คลิกเพื่อแก้ไขโปรไฟล์แม่ค้า"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-600 text-white font-bold flex items-center justify-center text-sm shadow-sm group-hover:scale-105 transition-transform">
                👑
              </div>
              <div className="overflow-hidden flex-1">
                <h3 className="font-bold text-gray-900 text-sm truncate">{user.fullName}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] bg-rose-200/60 text-rose-800 font-bold px-1.5 py-0.2 rounded">
                    @{user.username}
                  </span>
                  <span className="text-[10px] text-rose-600 font-semibold group-hover:underline">
                    แก้ไข
                  </span>
                </div>
              </div>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-200 font-bold'
                      : 'text-gray-600 hover:bg-rose-50 hover:text-rose-600'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                        isActive ? 'bg-white text-rose-600' : 'bg-rose-100 text-rose-600'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Back to storefront link */}
        <div className="pt-4 border-t border-gray-100 space-y-2">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Store className="w-4 h-4 text-gray-400" />
            <span>ดูหน้าร้าน (Storefront)</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-6xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
