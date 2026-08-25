'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { PaymentSettings, Promotion } from '@/types';
import {
  ShoppingBag,
  CreditCard,
  QrCode,
  Upload,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Tag,
  Trash2,
  Check,
  ImageIcon,
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, subtotal, totalItems, clearCart } = useCart();
  const { user } = useAuth();

  // Form Fields
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerLineId, setCustomerLineId] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [note, setNote] = useState('');

  // Payment info from backend
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);

  // Promo Code
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<Promotion | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);

  // Slip Upload
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string | null>(null);
  const [uploadingSlip, setUploadingSlip] = useState(false);

  // Submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Autofill user info if logged in
  useEffect(() => {
    if (user) {
      if (user.fullName) setCustomerName(user.fullName);
      if (user.phone) setCustomerPhone(user.phone);
      if (user.lineId) setCustomerLineId(user.lineId);
      if (user.address) setShippingAddress(user.address);
    }
  }, [user]);

  // Fetch payment settings
  useEffect(() => {
    async function fetchPaymentSettings() {
      try {
        const res = await fetch('/api/payment-settings');
        const data = await res.json();
        if (data.paymentSettings) {
          setPaymentSettings(data.paymentSettings);
        }
      } catch (err) {
        console.error('Error loading payment settings:', err);
      }
    }
    fetchPaymentSettings();
  }, []);

  // Handle promo code apply
  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoError(null);

    try {
      const res = await fetch('/api/promotions');
      const data = await res.json();
      const promos: Promotion[] = data.promotions || [];

      const clean = promoCode.trim().toUpperCase();
      const matched = promos.find(
        (p) => p.isActive && p.code && p.code.toUpperCase() === clean
      );

      if (!matched) {
        setPromoError('ไม่พบคูปองส่วนลดนี้ หรือคูปองหมดอายุแล้ว');
        setAppliedPromo(null);
        return;
      }

      if (matched.minSpend && subtotal < matched.minSpend) {
        setPromoError(`คูปองนี้ใช้ได้เมื่อมียอดสั่งซื้อขั้นต่ำ ฿${matched.minSpend.toLocaleString()}`);
        setAppliedPromo(null);
        return;
      }

      setAppliedPromo(matched);
      setPromoError(null);
    } catch (err) {
      setPromoError('เกิดข้อผิดพลาดในการตรวจสอบคูปอง');
    }
  };

  // Calculate discount and shipping
  let discountAmount = 0;
  if (appliedPromo) {
    if (appliedPromo.discountType === 'percentage') {
      discountAmount = Math.round((subtotal * appliedPromo.discountValue) / 100);
    } else {
      discountAmount = appliedPromo.discountValue;
    }
  }

  let shippingFee = paymentSettings?.shippingFee ?? 50;
  if (
    paymentSettings?.freeShippingMinAmount &&
    subtotal >= paymentSettings.freeShippingMinAmount
  ) {
    shippingFee = 0;
  }

  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  // Handle Slip selection
  const handleSlipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSlipFile(file);
      const previewUrl = URL.createObjectURL(file);
      setSlipPreview(previewUrl);
    }
  };

  // Submit Order
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (cart.length === 0) {
      setErrorMsg('กรุณาเลือกสินค้าใส่ตะกร้าก่อนสั่งซื้อ');
      return;
    }

    if (!customerName || !customerPhone || !shippingAddress) {
      setErrorMsg('กรุณากรอกชื่อ-นามสกุล, เบอร์โทร และที่อยู่จัดส่งให้ครบถ้วน');
      return;
    }

    setIsSubmitting(true);

    try {
      let uploadedSlipUrl = '';

      // If slip attached, upload it first
      if (slipFile) {
        setUploadingSlip(true);
        const formData = new FormData();
        formData.append('file', slipFile);

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          throw new Error(uploadData.error || 'อัปโหลดสลิปไม่สำเร็จ');
        }
        uploadedSlipUrl = uploadData.url;
      }

      // Create Order
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerPhone,
          customerLineId,
          shippingAddress,
          items: cart.map((item) => ({
            productId: item.product.id,
            productName: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
            imageUrl: item.product.imageUrl,
          })),
          promoCode: appliedPromo?.code,
          paymentSlipUrl: uploadedSlipUrl || undefined,
          note,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.error || 'สร้างคำสั่งซื้อไม่สำเร็จ');
      }

      clearCart();
      router.push(`/order-success/${orderData.order.id}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการสั่งซื้อ');
    } finally {
      setIsSubmitting(false);
      setUploadingSlip(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-gray-200 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto text-2xl">
            🛒
          </div>
          <h2 className="text-xl font-bold text-gray-900">ไม่มีสินค้าในตะกร้า</h2>
          <p className="text-xs text-gray-500">
            คุณยังไม่มีรายการสินค้าในตะกร้า กรุณาเลือกสินค้าจากหน้าร้านก่อนทำการสั่งซื้อ
          </p>
          <Link
            href="/"
            className="inline-block py-3 px-6 bg-rose-600 text-white text-xs font-bold rounded-xl shadow-md hover:bg-rose-700 transition-colors"
          >
            เลือกซื้อสินค้าญี่ปุ่น
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900">ยืนยันคำสั่งซื้อ & ชำระเงิน</h1>
        <p className="text-xs text-gray-500 mt-1">
          กรอกข้อมูลที่อยู่จัดส่ง โอนเงินตาม QR Code และแนบสลิปหลักฐานการโอนเงิน
        </p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmitOrder}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Customer Form & Payment (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Section 1: Customer Information */}
            <div className="bg-white rounded-3xl p-6 border border-rose-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-rose-600 text-white text-xs flex items-center justify-center">1</span>
                  ข้อมูลผู้สั่งซื้อและที่อยู่จัดส่ง
                </h3>
                {!user && (
                  <Link href="/auth" className="text-xs text-rose-600 font-semibold hover:underline">
                    เข้าสู่ระบบเพื่อดึงข้อมูลอัตโนมัติ
                  </Link>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    ชื่อ - นามสกุล ผู้รับ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น น.ส. สุดา ใจดี"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    เบอร์โทรศัพท์ติดต่อ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="เช่น 089-123-4567"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  LINE ID <span className="text-gray-400 font-normal">(สำหรับส่งรูปของและแจ้งเตือน)</span>
                </label>
                <input
                  type="text"
                  placeholder="เช่น @suda_line"
                  value={customerLineId}
                  onChange={(e) => setCustomerLineId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  ที่อยู่จัดส่งพัสดุในไทย <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="บ้านเลขที่, หมู่บ้าน/อาคาร, ซอย, ถนน, ตำบล/แขวง, อำเภอ/เขต, จังหวัด, รหัสไปรษณีย์"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  หมายเหตุเพิ่มเติมถึงแม่ค้า
                </label>
                <input
                  type="text"
                  placeholder="เช่น ฝากเช็ควันหมดอายุ, ขอถุงช็อปด้วยค่ะ ฯลฯ"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            {/* Section 2: Payment & QR Code Display */}
            <div className="bg-white rounded-3xl p-6 border border-rose-100 shadow-sm space-y-4">
              <div className="border-b border-gray-100 pb-3">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-rose-600 text-white text-xs flex items-center justify-center">2</span>
                  ช่องทางการชำระเงิน (PromptPay / Bank Transfer)
                </h3>
              </div>

              {paymentSettings ? (
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center bg-rose-50/40 p-4 sm:p-6 rounded-2xl border border-rose-100">
                  {/* QR Code Container */}
                  <div className="sm:col-span-5 flex flex-col items-center justify-center bg-white p-4 rounded-2xl border border-rose-200 shadow-sm">
                    <div className="w-40 h-40 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center p-2 border border-gray-100">
                      <img
                        src={paymentSettings.qrImageUrl || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${paymentSettings.promptPayNumber}`}
                        alt="QR Code สำหรับชำระเงิน"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span className="text-[11px] font-bold text-rose-600 mt-2 flex items-center gap-1">
                      <QrCode className="w-3.5 h-3.5" /> สแกนจ่ายผ่านพร้อมเพย์
                    </span>
                  </div>

                  {/* Bank Account Details */}
                  <div className="sm:col-span-7 space-y-3 text-xs">
                    <div>
                      <span className="text-gray-400">ชื่อบัญชีพร้อมเพย์:</span>
                      <p className="font-bold text-gray-900 text-sm">{paymentSettings.promptPayName}</p>
                      <p className="font-mono text-rose-600 font-bold text-sm">{paymentSettings.promptPayNumber}</p>
                    </div>

                    <div className="pt-2 border-t border-rose-100">
                      <span className="text-gray-400">บัญชีธนาคาร:</span>
                      <p className="font-bold text-gray-900">{paymentSettings.bankName}</p>
                      <p className="font-mono text-gray-800 font-bold">{paymentSettings.accountNumber}</p>
                      <p className="text-gray-600">{paymentSettings.accountName}</p>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-rose-200">
                      <span className="text-gray-500 text-[11px]">ยอดเงินที่ต้องโอนสุทธิ:</span>
                      <p className="text-xl font-black text-rose-600">
                        ฿{grandTotal.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-400">กำลังโหลดข้อมูลชำระเงิน...</p>
              )}

              {/* Upload Slip Section */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-gray-700 mb-2 flex items-center justify-between">
                  <span>แนบรูปสลิปหลักฐานการโอนเงิน</span>
                  <span className="text-gray-400 font-normal">(สามารถแนบตอนนี้ หรือแนบภายหลังได้)</span>
                </label>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <label className="w-full sm:w-auto flex-1 cursor-pointer border-2 border-dashed border-rose-200 hover:border-rose-400 bg-rose-50/30 hover:bg-rose-50/60 p-4 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-colors">
                    <Upload className="w-6 h-6 text-rose-500" />
                    <span className="text-xs font-bold text-gray-700">คลิกเพื่อเลือกรูปสลิป</span>
                    <span className="text-[10px] text-gray-400">รองรับไฟล์ JPG, PNG</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleSlipChange}
                      className="hidden"
                    />
                  </label>

                  {/* Slip Preview Thumbnail */}
                  {slipPreview && (
                    <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-emerald-400 shadow-md shrink-0">
                      <img
                        src={slipPreview}
                        alt="ตัวอย่างสลิป"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-0 inset-x-0 bg-emerald-600 text-white text-[9px] font-bold text-center py-0.5">
                        แนบแล้ว
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-rose-100 shadow-sm space-y-5 sticky top-24">
              <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center justify-between">
                <span>สรุปรายการสั่งซื้อ</span>
                <span className="text-xs font-normal text-gray-500">{totalItems} รายการ</span>
              </h3>

              {/* Items List */}
              <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex gap-3 text-xs">
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-12 h-12 rounded-xl object-cover bg-gray-50 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{item.product.name}</p>
                      <p className="text-gray-400">
                        ฿{item.product.price.toLocaleString()} × {item.quantity}
                      </p>
                    </div>
                    <span className="font-bold text-gray-900">
                      ฿{(item.product.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Promo Code Input */}
              <div className="pt-3 border-t border-gray-100">
                <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-rose-500" /> โค้ดส่วนลดโปรโมชั่น
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="เช่น JP50"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs uppercase focus:bg-white focus:outline-none focus:border-rose-500"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    ใช้โค้ด
                  </button>
                </div>

                {appliedPromo && (
                  <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-semibold flex items-center justify-between">
                    <span>✓ ใช้โค้ด: {appliedPromo.code}</span>
                    <button
                      type="button"
                      onClick={() => setAppliedPromo(null)}
                      className="text-emerald-800 hover:underline"
                    >
                      ยกเลิก
                    </button>
                  </div>
                )}
                {promoError && (
                  <p className="mt-1 text-[11px] text-red-500">{promoError}</p>
                )}
              </div>

              {/* Price Calculation Summary */}
              <div className="space-y-2 text-xs border-t border-gray-100 pt-3">
                <div className="flex justify-between text-gray-500">
                  <span>ยอดรวมสินค้า</span>
                  <span>฿{subtotal.toLocaleString()}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>ส่วนลดโปรโมชั่น</span>
                    <span>-฿{discountAmount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-500">
                  <span>ค่าจัดส่งในไทย</span>
                  {shippingFee === 0 ? (
                    <span className="text-emerald-600 font-bold">ส่งฟรี 🎉</span>
                  ) : (
                    <span>฿{shippingFee.toLocaleString()}</span>
                  )}
                </div>

                <div className="flex justify-between text-gray-900 font-black text-base pt-3 border-t border-gray-200">
                  <span>ยอดชำระสุทธิ</span>
                  <span className="text-rose-600 text-xl">฿{grandTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-rose-600 via-red-500 to-rose-600 hover:from-rose-700 hover:to-red-600 text-white font-black text-sm rounded-2xl shadow-lg shadow-rose-200 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>กำลังบันทึกคำสั่งซื้อ...</span>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>ยืนยันการสั่งซื้อ • ฿{grandTotal.toLocaleString()}</span>
                  </>
                )}
              </button>

              <p className="text-[11px] text-center text-gray-400 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                ข้อมูลของคุณปลอดภัย จัดส่งสินค้าตรงเวลา
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
