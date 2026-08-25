'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { ShopSettings } from '@/types';
import {
  Store,
  Phone,
  MessageSquare,
  MapPin,
  Clock,
  Save,
  CheckCircle,
  Sparkles,
  Megaphone,
  Palette,
  Upload,
  Image as ImageIcon,
  Trash2,
  Check,
} from 'lucide-react';

const PRESET_THEME_COLORS = [
  { name: 'ซากุระแดง (Sakura Red)', hex: '#E63946', bgClass: 'bg-[#E63946]' },
  { name: 'เขียวมัทฉะ (Matcha Green)', hex: '#10B981', bgClass: 'bg-[#10B981]' },
  { name: 'น้ำเงินคราม (Ocean Blue)', hex: '#2563EB', bgClass: 'bg-[#2563EB]' },
  { name: 'ม่วงลาเวนเดอร์ (Lavender)', hex: '#8B5CF6', bgClass: 'bg-[#8B5CF6]' },
  { name: 'ส้มคอรัล (Warm Coral)', hex: '#F97316', bgClass: 'bg-[#F97316]' },
  { name: 'โมเดิร์น ชาร์โคล (Modern Dark)', hex: '#1F2937', bgClass: 'bg-[#1F2937]' },
];

export default function AdminShopSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form Fields
  const [shopName, setShopName] = useState('');
  const [tagline, setTagline] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [themeColor, setThemeColor] = useState('#E63946');
  const [phone, setPhone] = useState('');
  const [lineId, setLineId] = useState('');
  const [lineUrl, setLineUrl] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [supportHours, setSupportHours] = useState('');
  const [shopAddress, setShopAddress] = useState('');
  const [topAnnouncement, setTopAnnouncement] = useState('');

  useEffect(() => {
    async function fetchSettings() {
      try {
        setLoading(true);
        const res = await fetch('/api/shop-settings');
        const data = await res.json();
        if (data.shopSettings) {
          const s: ShopSettings = data.shopSettings;
          setShopName(s.shopName || '');
          setTagline(s.tagline || '');
          setLogoUrl(s.logoUrl || '');
          setThemeColor(s.themeColor || '#E63946');
          setPhone(s.phone || '');
          setLineId(s.lineId || '');
          setLineUrl(s.lineUrl || '');
          setFacebookUrl(s.facebookUrl || '');
          setInstagramUrl(s.instagramUrl || '');
          setSupportHours(s.supportHours || '');
          setShopAddress(s.shopAddress || '');
          setTopAnnouncement(s.topAnnouncement || '');
        }
      } catch (err) {
        console.error('Error loading shop settings:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, []);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingLogo(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'อัปโหลดรูปโลโก้ไม่สำเร็จ');
      setLogoUrl(data.url);
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาดในการอัปโหลดรูปโลโก้');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSaving(true);
      setSuccessMsg(null);

      const payload: ShopSettings = {
        shopName,
        tagline,
        logoUrl,
        themeColor,
        phone,
        lineId,
        lineUrl,
        facebookUrl,
        instagramUrl,
        supportHours,
        shopAddress,
        topAnnouncement,
      };

      const res = await fetch('/api/shop-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'บันทึกข้อมูลไม่สำเร็จ');

      setSuccessMsg('บันทึกข้อมูลร้านค้า โลโก้ และธีมสีเว็บเรียบร้อยแล้ว!');
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 flex items-center gap-2">
            <Store className="w-8 h-8 text-rose-600" />
            ข้อมูลร้านค้า, โลโก้ & โทนสีเว็บไซต์
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            ปรับแต่งโลโก้ร้านค้า โทนสีหลักของเว็บไซต์ ชื่อร้าน สโลแกน และช่องทางการติดต่อของผู้ขาย
          </p>
        </div>

        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Section 1: Logo & Theme Color (New Feature) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-sm space-y-5 text-xs sm:text-sm">
            <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
              <Palette className="w-5 h-5 text-rose-600" />
              โลโก้ร้านค้า & โทนสีของเว็บไซต์ (Theme & Branding)
            </h3>

            {/* Logo Upload Box */}
            <div className="space-y-3">
              <label className="block font-bold text-gray-700">
                โลโก้ร้านค้า (Shop Logo)
              </label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-200">
                {/* Logo Preview */}
                <div className="relative w-20 h-20 rounded-2xl bg-white border border-gray-300 shadow-xs flex items-center justify-center overflow-hidden shrink-0">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt="Logo Preview"
                      className="w-full h-full object-contain p-1"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-400 text-center p-2">
                      <ImageIcon className="w-6 h-6 mb-1 text-gray-300" />
                      <span className="text-[10px]">ไม่มีโลโก้</span>
                    </div>
                  )}
                </div>

                {/* Upload & URL Inputs */}
                <div className="flex-1 space-y-2 w-full">
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="px-4 py-2 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 shadow-2xs">
                      <Upload className="w-4 h-4" />
                      <span>{uploadingLogo ? 'กำลังอัปโหลด...' : 'อัปโหลดไฟล์รูปภาพโลโก้'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>
                    {logoUrl && (
                      <button
                        type="button"
                        onClick={() => setLogoUrl('')}
                        className="px-3 py-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>ลบโลโก้</span>
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="หรือวาง URL รูปภาพโลโก้ที่นี่ (เช่น https://.../logo.png)"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-rose-500 text-xs font-mono"
                  />
                  <p className="text-[11px] text-gray-400">
                    แนะนำรูปทรงสี่เหลี่ยมจัตุรัส หรือวงกลม ขนาด 200x200px ขึ้นไป (ไฟล์ PNG/JPG)
                  </p>
                </div>
              </div>
            </div>

            {/* Theme Color Picker */}
            <div className="space-y-3 pt-2">
              <label className="block font-bold text-gray-700">
                โทนสีหลักของเว็บไซต์ (Website Theme Color)
              </label>
              <p className="text-xs text-gray-500">
                เลือกชุดสีที่เข้ากับแบรนด์ร้านค้าของคุณ ระบบจะปรับสีปุ่ม แถบประกาศ และส่วนเน้นต่างๆ ให้เข้ากันทั้งเว็บ
              </p>

              {/* Preset Color Swatches */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                {PRESET_THEME_COLORS.map((preset) => {
                  const isSelected = themeColor.toLowerCase() === preset.hex.toLowerCase();
                  return (
                    <button
                      key={preset.hex}
                      type="button"
                      onClick={() => setThemeColor(preset.hex)}
                      className={`p-3 rounded-2xl border-2 flex items-center gap-3 transition-all text-left ${
                        isSelected
                          ? 'border-gray-900 bg-gray-50 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <span
                        className="w-6 h-6 rounded-full shrink-0 shadow-sm flex items-center justify-center text-white"
                        style={{ backgroundColor: preset.hex }}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </span>
                      <span className="text-xs font-semibold text-gray-800 truncate">
                        {preset.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Color Input */}
              <div className="flex items-center gap-3 pt-2">
                <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-200">
                  <input
                    type="color"
                    value={themeColor}
                    onChange={(e) => setThemeColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                  />
                  <span className="text-xs font-bold text-gray-700">เลือกสีเอง (Custom):</span>
                  <input
                    type="text"
                    value={themeColor}
                    onChange={(e) => setThemeColor(e.target.value)}
                    className="w-24 px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs font-mono font-bold uppercase focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Shop Identity & Announcement */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-sm space-y-4 text-xs sm:text-sm">
            <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-rose-500" />
              ชื่อร้านค้าและข้อความประกาศหน้าเว็บ
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  ชื่อร้านค้า (Shop Name) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น Japan Pre-Order Shop"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  ข้อความแถบประกาศด้านบนสุด (Top Banner)
                </label>
                <input
                  type="text"
                  placeholder="เช่น รับหิ้วสินค้าญี่ปุ่นของแท้ 100% บินเอง ส่งตรงถึงบ้านคุณ 🇯🇵"
                  value={topAnnouncement}
                  onChange={(e) => setTopAnnouncement(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">
                สโลแกน / คำแนะนำร้านค้า (แสดงที่ส่วนท้ายเว็บ Footer)
              </label>
              <textarea
                rows={2}
                placeholder="เช่น บริการรับหิ้วและสั่งซื้อสินค้าจากประเทศญี่ปุ่น ขนม เครื่องสำอาง สกินแคร์ ฟิกเกอร์ ของแท้ 100% บินเองส่งไว"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          {/* Section 3: Contact Details */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-sm space-y-4 text-xs sm:text-sm">
            <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
              <Phone className="w-5 h-5 text-emerald-600" />
              ข้อมูลติดต่อผู้ขาย (แสดงให้ลูกค้าติดต่อ)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  เบอร์โทรศัพท์ติดต่อ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น 081-234-5678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  LINE Official / LINE ID <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น @japanpreorder หรือ suda_line"
                  value={lineId}
                  onChange={(e) => setLineId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  ลิงก์สำหรับกดแอดไลน์ (LINE Link)
                </label>
                <input
                  type="text"
                  placeholder="เช่น https://line.me/ti/p/~@japanpreorder"
                  value={lineUrl}
                  onChange={(e) => setLineUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-rose-500 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  เวลาเปิดรับออเดอร์ / ตอบแชท
                </label>
                <input
                  type="text"
                  placeholder="เช่น เปิดรับคำสั่งซื้อตลอด 24 ชม. • ตอบแชททุกวัน 09:00 - 22:00 น."
                  value={supportHours}
                  onChange={(e) => setSupportHours(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  ลิงก์ Facebook Page
                </label>
                <input
                  type="text"
                  placeholder="เช่น https://facebook.com/japanpreordershop"
                  value={facebookUrl}
                  onChange={(e) => setFacebookUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-rose-500 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  ลิงก์ Instagram (IG)
                </label>
                <input
                  type="text"
                  placeholder="เช่น https://instagram.com/japanpreordershop"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-rose-500 text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">
                ที่อยู่ร้านค้า / จังหวัด
              </label>
              <input
                type="text"
                placeholder="เช่น กรุงเทพมหานคร ประเทศไทย (พร้อมจัดส่งทั่วประเทศ)"
                value={shopAddress}
                onChange={(e) => setShopAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          {/* Live Preview Box with Dynamic Theme Color & Logo */}
          <div className="bg-gray-50 rounded-3xl p-6 border border-gray-200 space-y-3">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> ตัวอย่างการแสดงผลหน้าร้านจริง (Live Preview)
            </span>

            {/* Navbar Preview */}
            <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
              <div
                className="text-white text-[11px] py-1.5 px-4 text-center font-medium"
                style={{ backgroundColor: themeColor }}
              >
                {topAnnouncement || 'รับหิ้วสินค้าญี่ปุ่นของแท้ 100% บินเอง ส่งตรงถึงบ้านคุณ 🇯🇵'}
              </div>
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt="Logo"
                      className="w-10 h-10 rounded-xl object-contain border border-gray-200"
                    />
                  ) : (
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-sm"
                      style={{ backgroundColor: themeColor }}
                    >
                      日
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{shopName || 'Japan Pre-Order Shop'}</h4>
                    <p className="text-[11px] text-gray-400">สั่งซื้อง่าย • เช็คสถานะได้ • ของแท้ 100%</p>
                  </div>
                </div>

                <button
                  type="button"
                  className="text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs"
                  style={{ backgroundColor: themeColor }}
                >
                  ปุ่มตัวอย่าง
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              style={{ backgroundColor: themeColor }}
              className="px-8 py-3 text-white font-bold text-sm rounded-xl shadow-lg transition-all flex items-center gap-2 hover:opacity-90 active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'กำลังบันทึก...' : 'บันทึกข้อมูลร้านค้า & โทนสีเว็บ'}</span>
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
