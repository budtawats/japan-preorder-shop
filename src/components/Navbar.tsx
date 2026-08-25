'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { ShopSettings } from '@/types';
import {
  ShoppingBag,
  Plane,
  User as UserIcon,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
  Package,
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { totalItems, setIsCartOpen } = useCart();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shopSettings, setShopSettings] = useState<ShopSettings | null>(null);

  const isAdminPage = pathname.startsWith('/admin');

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/shop-settings');
        const data = await res.json();
        if (data.shopSettings) setShopSettings(data.shopSettings);
      } catch (e) {
        // ignore
      }
    }
    loadSettings();
  }, []);

  const themeColor = shopSettings?.themeColor || '#E63946';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
      {/* Top Banner: Japanese Pre-order announcement with dynamic theme color */}
      <div
        className="text-white text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2 transition-colors"
        style={{ backgroundColor: themeColor }}
      >
        <span className="bg-white/20 px-2 py-0.5 rounded text-[11px] font-bold tracking-wider">
          {shopSettings?.announcementBadge || 'JAPAN PRE-ORDER 🇯🇵'}
        </span>
        <span>
          {shopSettings?.topAnnouncement || 'รับหิ้วสินค้าญี่ปุ่นของแท้ 100% บินเอง ส่งตรงถึงบ้านคุณ'}
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Shop Name */}
          <Link href="/" className="flex items-center gap-2.5 group">
            {shopSettings?.logoUrl ? (
              <img
                src={shopSettings.logoUrl}
                alt={shopSettings.shopName || 'Shop Logo'}
                className="w-10 h-10 rounded-xl object-contain border border-gray-200 shadow-xs group-hover:scale-105 transition-transform"
              />
            ) : (
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform"
                style={{ backgroundColor: themeColor }}
              >
                <span className="text-xl font-bold">日</span>
              </div>
            )}
            <div>
              <div className="font-bold text-gray-900 leading-tight flex items-center gap-1.5">
                <span style={{ color: themeColor }}>{shopSettings?.shopName || 'Japan Pre-Order'}</span>
                <span
                  className="text-xs px-1.5 py-0.2 rounded-full font-normal"
                  style={{
                    backgroundColor: `${themeColor}15`,
                    color: themeColor,
                    borderColor: `${themeColor}40`,
                    borderWidth: '1px',
                  }}
                >
                  หิ้วญี่ปุ่น
                </span>
              </div>
              <p className="text-[11px] text-gray-500">สั่งซื้อง่าย • เช็คสถานะได้ • ของแท้ 100%</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === '/'
                  ? 'font-semibold'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              style={pathname === '/' ? { color: themeColor, backgroundColor: `${themeColor}15` } : {}}
            >
              🛍️ หน้าร้านสินค้า
            </Link>

            <Link
              href="/#flight-schedule"
              className="px-3.5 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1.5"
            >
              <Plane className="w-4 h-4 text-purple-600" />
              รอบบินกลับไทย
            </Link>

            <Link
              href="/my-orders"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                pathname === '/my-orders'
                  ? 'font-semibold'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              style={pathname === '/my-orders' ? { color: themeColor, backgroundColor: `${themeColor}15` } : {}}
            >
              <Package className="w-4 h-4 text-blue-500" />
              ติดตามคำสั่งซื้อ
            </Link>

            {user?.role === 'merchant' && (
              <Link
                href="/admin"
                className="ml-2 px-3.5 py-2 rounded-lg text-sm font-semibold bg-gray-900 text-white hover:bg-gray-800 transition-all shadow-sm flex items-center gap-1.5"
              >
                <LayoutDashboard className="w-4 h-4 text-amber-400" />
                ระบบแม่ค้า (Admin)
              </Link>
            )}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2">
            {/* Cart Button */}
            {!isAdminPage && (
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2.5 rounded-xl transition-all flex items-center gap-2 border shadow-sm"
                style={{
                  backgroundColor: `${themeColor}10`,
                  color: themeColor,
                  borderColor: `${themeColor}30`,
                }}
                aria-label="ตะกร้าสินค้า"
              >
                <ShoppingBag className="w-5 h-5" />
                <span className="hidden sm:inline text-xs font-semibold">ตะกร้า</span>
                {totalItems > 0 && (
                  <span
                    className="absolute -top-1.5 -right-1.5 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-bounce"
                    style={{ backgroundColor: themeColor }}
                  >
                    {totalItems}
                  </span>
                )}
              </button>
            )}

            {/* User Profile / Login */}
            {user ? (
              <div className="relative flex items-center gap-2 pl-2 border-l border-gray-200">
                <div className="hidden lg:block text-right">
                  <p className="text-xs font-semibold text-gray-800 truncate max-w-[120px]">
                    {user.fullName || user.username}
                  </p>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                      user.role === 'merchant'
                        ? 'bg-amber-100 text-amber-800 font-bold'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {user.role === 'merchant' ? '👑 แม่ค้า' : '👤 ลูกค้า'}
                  </span>
                </div>
                <button
                  onClick={() => logout()}
                  title="ออกจากระบบ"
                  className="p-2 rounded-xl text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/auth"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-900 text-white hover:bg-gray-800 text-xs font-medium shadow-sm transition-all"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>เข้าสู่ระบบ</span>
              </Link>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 md:hidden"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-800 hover:bg-gray-50"
          >
            🛍️ หน้าร้านสินค้า
          </Link>
          <Link
            href="/#flight-schedule"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-800 hover:bg-gray-50"
          >
            ✈️ รอบบินกลับไทย
          </Link>
          <Link
            href="/my-orders"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-800 hover:bg-gray-50"
          >
            📦 ติดตามคำสั่งซื้อของฉัน
          </Link>
          {user?.role === 'merchant' && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-bold"
              style={{ color: themeColor, backgroundColor: `${themeColor}15` }}
            >
              👑 ระบบหลังบ้านแม่ค้า (Admin Dashboard)
            </Link>
          )}
          {!user && (
            <Link
              href="/auth"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-800 hover:bg-gray-100"
            >
              🔑 เข้าสู่ระบบ / สมัครสมาชิก
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
