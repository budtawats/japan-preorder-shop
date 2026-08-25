'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Order } from '@/types';
import SlipModal from '@/components/SlipModal';
import {
  Package,
  Search,
  Clock,
  CheckCircle,
  Plane,
  Truck,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  User,
} from 'lucide-react';

export default function MyOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [phoneSearch, setPhoneSearch] = useState('');
  const [selectedSlip, setSelectedSlip] = useState<{ url: string; order: Order } | null>(null);

  const fetchOrders = async (phoneQuery?: string) => {
    try {
      setLoading(true);
      let url = '/api/orders';
      if (phoneQuery) {
        url += `?phone=${encodeURIComponent(phoneQuery)}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const handlePhoneSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneSearch.trim()) {
      fetchOrders(phoneSearch.trim());
    }
  };

  // Status mapping
  const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
    pending_payment: { label: 'รอชำระเงิน', bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700' },
    pending_verification: { label: 'รอตรวจสลิป', bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700' },
    paid: { label: 'ชำระเงินแล้ว', bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700' },
    purchased: { label: 'ซื้อของแล้วที่ญี่ปุ่น 🇯🇵', bg: 'bg-purple-50 border-purple-200', text: 'text-purple-700' },
    shipped: { label: 'จัดส่งพัสดุแล้ว 🚚', bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700' },
    cancelled: { label: 'ยกเลิก', bg: 'bg-red-50 border-red-200', text: 'text-red-700' },
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 flex items-center gap-2">
            <Package className="w-8 h-8 text-rose-600" />
            ติดตามคำสั่งซื้อของฉัน
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {user
              ? `สวัสดีคุณ ${user.fullName} คุณสามารถตรวจสอบสถานะการจัดส่งได้ด้านล่างนี้`
              : 'กรอกเบอร์โทรศัพท์ที่ใช้สั่งซื้อเพื่อค้นหาออเดอร์ของคุณ'}
          </p>
        </div>

        {/* Guest Phone Search if not logged in */}
        {!user && (
          <form onSubmit={handlePhoneSearch} className="flex gap-2">
            <input
              type="tel"
              placeholder="ค้นหาด้วยเบอร์โทรศัพท์..."
              value={phoneSearch}
              onChange={(e) => setPhoneSearch(e.target.value)}
              className="px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-rose-500 shadow-2xs"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition-colors shrink-0"
            >
              ค้นหา
            </button>
          </form>
        )}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-3xl p-6 border border-gray-100 animate-pulse space-y-3">
              <div className="h-4 bg-gray-100 rounded w-1/4" />
              <div className="h-8 bg-gray-100 rounded w-1/2" />
              <div className="h-4 bg-gray-100 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 bg-rose-50 text-rose-400 rounded-full flex items-center justify-center mx-auto text-2xl">
            📦
          </div>
          <h3 className="text-base font-bold text-gray-800">ยังไม่พบรายการคำสั่งซื้อ</h3>
          <p className="text-xs text-gray-400">
            {user
              ? 'คุณยังไม่มีคำสั่งซื้อในระบบ สามารถเริ่มช้อปสินค้าญี่ปุ่นได้ทันทีครับ'
              : 'ลองค้นหาด้วยเบอร์โทรศัพท์ที่ใช้สั่งซื้อ หรือเข้าสู่ระบบ'}
          </p>
          <div className="pt-2 flex flex-col sm:flex-row justify-center gap-2">
            <Link
              href="/"
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors"
            >
              เลือกซื้อสินค้าหน้าร้าน
            </Link>
            {!user && (
              <Link
                href="/auth"
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors"
              >
                เข้าสู่ระบบลูกค้า
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const statusInfo = statusConfig[order.status] || statusConfig.pending_verification;
            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl p-6 border border-rose-100/80 shadow-sm hover:shadow-md transition-shadow space-y-4"
              >
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-gray-900 text-base">
                        {order.orderNumber}
                      </span>
                      <span
                        className={`text-xs font-bold px-3 py-0.5 rounded-full border ${statusInfo.bg} ${statusInfo.text}`}
                      >
                        {statusInfo.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      สั่งซื้อเมื่อ: {new Date(order.createdAt).toLocaleString('th-TH')} • {order.flightRoundName || 'รอบบินญี่ปุ่น'}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-xs text-gray-400">ยอดชำระสุทธิ</span>
                    <p className="text-lg font-black text-rose-600">
                      ฿{order.totalAmount.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Tracking Number Callout */}
                {order.trackingNumber && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-900 font-semibold">
                        เลขพัสดุจัดส่ง (Tracking):
                      </span>
                      <span className="font-mono font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-100">
                        {order.trackingNumber}
                      </span>
                    </div>
                  </div>
                )}

                {/* Items List */}
                <div className="space-y-2.5">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs py-1">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.imageUrl}
                          alt={item.productName}
                          className="w-10 h-10 rounded-lg object-cover bg-gray-50 shrink-0"
                        />
                        <div>
                          <p className="font-semibold text-gray-800">{item.productName}</p>
                          <p className="text-gray-400">
                            ฿{item.price.toLocaleString()} × {item.quantity} ชิ้น
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-gray-900">
                        ฿{(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer / Actions */}
                <div className="border-t border-gray-100 pt-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    {order.paymentSlipUrl ? (
                      <button
                        onClick={() => setSelectedSlip({ url: order.paymentSlipUrl!, order })}
                        className="text-rose-600 font-semibold hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        ดูรูปสลิปที่แนบไว้
                      </button>
                    ) : (
                      <span className="text-amber-600 font-medium">⚠️ ยังไม่ได้แนบรูปสลิป</span>
                    )}
                  </div>

                  <Link
                    href={`/order-success/${order.id}`}
                    className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl font-bold flex items-center gap-1 transition-colors"
                  >
                    <span>ดูรายละเอียดและสถานะเต็ม</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Slip Modal */}
      {selectedSlip && (
        <SlipModal
          imageUrl={selectedSlip.url}
          orderNumber={selectedSlip.order.orderNumber}
          customerName={selectedSlip.order.customerName}
          totalAmount={selectedSlip.order.totalAmount}
          onClose={() => setSelectedSlip(null)}
        />
      )}
    </div>
  );
}
