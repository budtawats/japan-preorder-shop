'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Order } from '@/types';
import SlipModal from '@/components/SlipModal';
import {
  CheckCircle,
  Clock,
  Plane,
  Package,
  Truck,
  Upload,
  ArrowRight,
  Printer,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  FileText,
} from 'lucide-react';

export default function OrderSuccessPage() {
  const params = useParams();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Late slip upload
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showSlipModal, setShowSlipModal] = useState(false);

  useEffect(() => {
    async function fetchOrder() {
      try {
        setLoading(true);
        const res = await fetch(`/api/orders/${orderId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'ไม่พบคำสั่งซื้อ');
        setOrder(data.order);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (orderId) fetchOrder();
  }, [orderId]);

  const handleUploadLateSlip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slipFile || !order) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', slipFile);

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error('อัปโหลดสลิปไม่สำเร็จ');

      // Update Order
      const updateRes = await fetch(`/api/orders/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentSlipUrl: uploadData.url }),
      });
      const updateData = await updateRes.json();
      if (!updateRes.ok) throw new Error('อัปเดตคำสั่งซื้อไม่สำเร็จ');

      setOrder(updateData.order);
      setSlipFile(null);
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาดในการแนบสลิป');
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-500 font-medium">กำลังโหลดข้อมูลคำสั่งซื้อ...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center border border-gray-200 space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold text-gray-900">ไม่พบข้อมูลคำสั่งซื้อ</h2>
          <p className="text-xs text-gray-500">{error || 'อาจเป็นเพราะเลขออเดอร์ไม่ถูกต้อง'}</p>
          <Link
            href="/"
            className="inline-block py-2.5 px-5 bg-rose-600 text-white rounded-xl text-xs font-bold"
          >
            กลับสู่หน้าหลัก
          </Link>
        </div>
      </div>
    );
  }

  // Status mapping
  const statusConfig: Record<string, { label: string; bg: string; text: string; icon: any }> = {
    pending_payment: { label: 'รอชำระเงิน', bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', icon: Clock },
    pending_verification: { label: 'รอแม่ค้าตรวจสลิป', bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', icon: Clock },
    paid: { label: 'ชำระเงินเรียบร้อยแล้ว', bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', icon: CheckCircle },
    purchased: { label: 'แม่ค้าซื้อของแล้วที่ญี่ปุ่น 🇯🇵', bg: 'bg-purple-50 border-purple-200', text: 'text-purple-700', icon: Plane },
    shipped: { label: 'จัดส่งพัสดุแล้ว 🚚', bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', icon: Truck },
    cancelled: { label: 'ยกเลิกคำสั่งซื้อ', bg: 'bg-red-50 border-red-200', text: 'text-red-700', icon: AlertCircle },
  };

  const statusInfo = statusConfig[order.status] || statusConfig.pending_verification;
  const StatusIcon = statusInfo.icon;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-md text-center space-y-3 relative overflow-hidden">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle className="w-9 h-9" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
          บันทึกคำสั่งซื้อสำเร็จ!
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 max-w-lg mx-auto">
          ขอบพระคุณที่ไว้วางใจสั่งสินค้าพรีออเดอร์กับเรา แม่ค้าจะดำเนินการตรวจสอบและเตรียมหิ้วสินค้าให้ตามรอบบินครับ
        </p>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs">
          <span className="bg-gray-100 px-3 py-1.5 rounded-xl text-gray-700 font-mono">
            เลขออเดอร์: <strong>{order.orderNumber}</strong>
          </span>
          <span className="bg-rose-50 border border-rose-100 px-3 py-1.5 rounded-xl text-rose-700 font-semibold">
            {order.flightRoundName || 'รอบบินญี่ปุ่น'}
          </span>
        </div>
      </div>

      {/* Live Order Status Bar */}
      <div className={`rounded-3xl p-6 border ${statusInfo.bg} shadow-sm space-y-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StatusIcon className={`w-6 h-6 ${statusInfo.text}`} />
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                สถานะคำสั่งซื้อ
              </span>
              <h3 className={`text-lg font-black ${statusInfo.text}`}>
                {statusInfo.label}
              </h3>
            </div>
          </div>

          {order.trackingNumber && (
            <div className="text-right bg-white px-3 py-1.5 rounded-xl border border-emerald-200">
              <span className="text-[10px] text-gray-400 font-medium">เลขพัสดุจัดส่ง (Tracking):</span>
              <p className="text-xs sm:text-sm font-mono font-bold text-emerald-700">{order.trackingNumber}</p>
            </div>
          )}
        </div>

        {/* Status Steps Progress */}
        <div className="grid grid-cols-4 gap-2 pt-2 text-center text-[10px] sm:text-xs">
          <div className={`p-2 rounded-xl border ${order.status !== 'pending_payment' ? 'bg-white border-emerald-300 font-bold text-emerald-700' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
            1. สั่งซื้อ / แนบสลิป
          </div>
          <div className={`p-2 rounded-xl border ${['paid', 'purchased', 'shipped'].includes(order.status) ? 'bg-white border-emerald-300 font-bold text-emerald-700' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
            2. ชำระเงินแล้ว
          </div>
          <div className={`p-2 rounded-xl border ${['purchased', 'shipped'].includes(order.status) ? 'bg-white border-purple-300 font-bold text-purple-700' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
            3. ซื้อของแล้ว 🇯🇵
          </div>
          <div className={`p-2 rounded-xl border ${order.status === 'shipped' ? 'bg-white border-emerald-300 font-bold text-emerald-700' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
            4. ส่งพัสดุในไทย 🚚
          </div>
        </div>
      </div>

      {/* Slip Upload if Missing */}
      {!order.paymentSlipUrl && (
        <div className="bg-white rounded-3xl p-6 border-2 border-dashed border-amber-300 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-amber-700">
            <Clock className="w-5 h-5" />
            <h3 className="text-sm font-bold">คุณยังไม่ได้แนบรูปสลิปการโอนเงิน</h3>
          </div>
          <p className="text-xs text-gray-500">
            หากคุณโอนเงินเรียบร้อยแล้ว กรุณาแนบรูปสลิปหลักฐานเพื่อความรวดเร็วในการยืนยันออเดอร์ครับ
          </p>

          <form onSubmit={handleUploadLateSlip} className="flex flex-col sm:flex-row items-center gap-3">
            <input
              type="file"
              accept="image/*"
              required
              onChange={(e) => setSlipFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100"
            />
            <button
              type="submit"
              disabled={isUploading || !slipFile}
              className="w-full sm:w-auto px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shrink-0 transition-colors disabled:opacity-50"
            >
              {isUploading ? 'กำลังอัปโหลด...' : 'แนบสลิปตอนนี้'}
            </button>
          </form>
        </div>
      )}

      {/* Order Details & Summary Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-sm space-y-6">
        <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
          <FileText className="w-5 h-5 text-rose-500" />
          รายละเอียดรายการสินค้าที่สั่งซื้อ
        </h3>

        <div className="divide-y divide-gray-100">
          {order.items.map((item, idx) => (
            <div
              key={idx}
              className={`py-3.5 px-3 rounded-2xl flex items-center justify-between gap-4 text-xs sm:text-sm transition-all ${
                item.isPurchased ? 'bg-emerald-50/60' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <img
                  src={item.imageUrl}
                  alt={item.productName}
                  className="w-14 h-14 rounded-xl object-cover bg-white border border-gray-100 shrink-0"
                />
                <div>
                  <p className="font-bold text-gray-900">{item.productName}</p>
                  <p className="text-gray-400 text-xs">
                    ฿{item.price.toLocaleString()} × {item.quantity} ชิ้น
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="font-black text-gray-900 block text-sm">
                  ฿{(item.price * item.quantity).toLocaleString()}
                </span>
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full mt-1.5 ${
                    item.isPurchased
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {item.isPurchased ? '✓ ซื้อของแล้ว 🇯🇵' : '⏳ รอแม่ค้าไปซื้อ'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Calculation breakdown */}
        <div className="border-t border-gray-100 pt-4 space-y-2 text-xs">
          <div className="flex justify-between text-gray-500">
            <span>ยอดรวมสินค้า</span>
            <span>฿{order.subtotal.toLocaleString()}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-emerald-600 font-semibold">
              <span>ส่วนลด</span>
              <span>-฿{order.discount.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between text-gray-500">
            <span>ค่าจัดส่ง</span>
            <span>{order.shippingFee === 0 ? 'ฟรี' : `฿${order.shippingFee.toLocaleString()}`}</span>
          </div>
          <div className="flex justify-between text-gray-900 font-black text-base pt-3 border-t border-gray-200">
            <span>ยอดชำระสุทธิ</span>
            <span className="text-rose-600 text-xl">฿{order.totalAmount.toLocaleString()}</span>
          </div>
        </div>

        {/* Customer Shipping Info */}
        <div className="border-t border-gray-100 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-gray-50 p-4 rounded-2xl">
          <div>
            <span className="text-gray-400 font-medium">ชื่อผู้รับ:</span>
            <p className="font-bold text-gray-900">{order.customerName}</p>
            <p className="text-gray-600">โทร: {order.customerPhone}</p>
            {order.customerLineId && <p className="text-gray-600">LINE ID: {order.customerLineId}</p>}
          </div>

          <div>
            <span className="text-gray-400 font-medium">ที่อยู่จัดส่ง:</span>
            <p className="text-gray-700 whitespace-pre-line">{order.shippingAddress}</p>
            {order.note && <p className="text-rose-600 mt-1">หมายเหตุ: {order.note}</p>}
          </div>
        </div>

        {/* View Slip Thumbnail if present */}
        {order.paymentSlipUrl && (
          <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
            <span className="text-xs text-gray-500">รูปสลิปหลักฐานการโอนเงิน:</span>
            <button
              onClick={() => setShowSlipModal(true)}
              className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              คลิกเพื่อดูรูปสลิปที่แนบไว้
            </button>
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link
          href="/my-orders"
          className="w-full sm:w-auto px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
        >
          <Package className="w-4 h-4" />
          <span>ดูประวัติการสั่งซื้อทั้งหมด</span>
        </Link>

        <Link
          href="/"
          className="w-full sm:w-auto px-6 py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
        >
          <span>กลับไปเลือกซื้อสินค้าเพิ่ม</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Slip Preview Modal */}
      {showSlipModal && order.paymentSlipUrl && (
        <SlipModal
          imageUrl={order.paymentSlipUrl}
          orderNumber={order.orderNumber}
          customerName={order.customerName}
          totalAmount={order.totalAmount}
          onClose={() => setShowSlipModal(false)}
        />
      )}
    </div>
  );
}
