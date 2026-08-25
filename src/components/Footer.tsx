'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShopSettings } from '@/types';
import { Plane, ShieldCheck, Heart, Sparkles, Phone, MessageSquare, Clock, MapPin, ExternalLink } from 'lucide-react';

export default function Footer() {
  const [shopSettings, setShopSettings] = useState<ShopSettings | null>(null);

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
    <footer className="bg-white border-t border-gray-200 mt-20 pt-12 pb-8 text-gray-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Shop Brand & Logo */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2.5">
              {shopSettings?.logoUrl ? (
                <img
                  src={shopSettings.logoUrl}
                  alt={shopSettings.shopName || 'Logo'}
                  className="w-9 h-9 rounded-xl object-contain border border-gray-200 shadow-2xs"
                />
              ) : (
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-xs"
                  style={{ backgroundColor: themeColor }}
                >
                  日
                </div>
              )}
              <span className="font-bold text-gray-900 text-base">
                {shopSettings?.shopName || 'Japan Pre-Order'}
              </span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              {shopSettings?.tagline ||
                'บริการรับหิ้วและสั่งซื้อสินค้าจากประเทศญี่ปุ่น ขนม เครื่องสำอาง สกินแคร์ ฟิกเกอร์ และของใช้ยอดฮิต ของแท้ 100% บินเองส่งไว'}
            </p>
            {shopSettings?.shopAddress && (
              <p className="text-[11px] text-gray-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: themeColor }} />
                <span>{shopSettings.shopAddress}</span>
              </p>
            )}
          </div>

          {/* Col 2: Highlights */}
          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-gray-900 text-sm mb-3">จุดเด่นของร้านเรา</h4>
            <div className="flex items-center gap-2 text-gray-600">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>การันตีสินค้าแท้ 100% จากญี่ปุ่น</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Plane className="w-4 h-4 shrink-0" style={{ color: themeColor }} />
              <span>ระบุรอบบินและวันส่งของชัดเจน</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span>แพ็คแน่นหนา บับเบิ้ลกันกระแทกทุกชิ้น</span>
            </div>
          </div>

          {/* Col 3: Quick Links */}
          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-gray-900 text-sm mb-3">เมนูด่วน</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:underline transition-colors">
                  🛍️ เลือกดูสินค้าทั้งหมด
                </Link>
              </li>
              <li>
                <Link href="/#flight-schedule" className="hover:underline transition-colors">
                  ✈️ ตารางรอบบินและวันส่ง
                </Link>
              </li>
              <li>
                <Link href="/my-orders" className="hover:underline transition-colors">
                  📦 ติดตามสถานะคำสั่งซื้อ
                </Link>
              </li>
              <li>
                <Link href="/auth" className="hover:underline transition-colors">
                  🔑 เข้าสู่ระบบ / แม่ค้าล็อกอิน
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Seller Contact Details */}
          <div className="space-y-2.5 text-xs">
            <h4 className="font-bold text-gray-900 text-sm mb-3">ช่องทางติดต่อผู้ขาย</h4>
            
            {/* LINE */}
            <div className="flex items-center gap-2 text-gray-700">
              <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>LINE: <strong>{shopSettings?.lineId || '@japanpreorder'}</strong></span>
              {shopSettings?.lineUrl && (
                <a
                  href={shopSettings.lineUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-bold hover:underline ml-1"
                  style={{ color: themeColor }}
                >
                  [แอดไลน์]
                </a>
              )}
            </div>

            {/* Phone */}
            <div className="flex items-center gap-2 text-gray-700">
              <Phone className="w-4 h-4 shrink-0" style={{ color: themeColor }} />
              <span>โทร: <strong>{shopSettings?.phone || '081-234-5678'}</strong></span>
            </div>

            {/* Support Hours */}
            <div className="flex items-start gap-2 text-gray-500 pt-1">
              <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>{shopSettings?.supportHours || 'เปิดรับคำสั่งซื้อตลอด 24 ชม. ตอบแชททุกวัน 09:00 - 22:00 น.'}</span>
            </div>

            {/* Social Links */}
            {(shopSettings?.facebookUrl || shopSettings?.instagramUrl) && (
              <div className="flex items-center gap-3 pt-2">
                {shopSettings.facebookUrl && (
                  <a
                    href={shopSettings.facebookUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" /> Facebook
                  </a>
                )}
                {shopSettings.instagramUrl && (
                  <a
                    href={shopSettings.instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-pink-600 hover:underline flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" /> Instagram
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-gray-100 pt-6 text-center text-xs text-gray-400 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} {shopSettings?.shopName || 'Japan Pre-Order Shop'}. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 fill-current" style={{ color: themeColor }} /> for Japan Lovers
          </p>
        </div>
      </div>
    </footer>
  );
}
