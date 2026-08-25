'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Order, OrderStatus } from '@/types';
import SlipModal from '@/components/SlipModal';
import {
  Package,
  Search,
  CheckCircle,
  XCircle,
  Eye,
  Truck,
  ExternalLink,
  Filter,
  Save,
  Clock,
  Phone,
  MessageSquare,
  MapPin,
  Trash2,
  Check,
} from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Slip preview modal
  const [selectedSlip, setSelectedSlip] = useState<{ url: string; order: Order } | null>(null);

  // Edit tracking number per order
  const [trackingMap, setTrackingMap] = useState<Record<string, string>>({});
  const [savingMap, setSavingMap] = useState<Record<string, boolean>>({});

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/orders?_t=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();
      const rawOrders = data.orders || [];
      const ords: Order[] = rawOrders.map((o: any) => ({
        ...o,
        items: Array.isArray(o.items) ? o.items : [],
        orderNumber: o.orderNumber || '',
        customerName: o.customerName || '',
        customerPhone: o.customerPhone || '',
        customerLineId: o.customerLineId || '',
        shippingAddress: o.shippingAddress || '',
        totalAmount: Number(o.totalAmount) || 0,
        createdAt: o.createdAt || new Date().toISOString(),
      }));
      setOrders(ords);

      const tMap: Record<string, string> = {};
      ords.forEach((o) => {
        tMap[o.id] = o.trackingNumber || '';
      });
      setTrackingMap(tMap);
    } catch (err) {
      console.error('Error fetching admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'อัปเดตสถานะไม่สำเร็จ');

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาด');
    }
  };

  const handleSaveTracking = async (orderId: string) => {
    const tracking = trackingMap[orderId];
    try {
      setSavingMap((prev) => ({ ...prev, [orderId]: true }));
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackingNumber: tracking,
          status: tracking ? 'shipped' : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'บันทึกเลขพัสดุไม่สำเร็จ');

      fetchOrders();
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาด');
    } finally {
      setSavingMap((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const handleToggleItemPurchased = async (order: Order, itemIndex: number) => {
    const currentItems = Array.isArray(order.items) ? order.items : [];
    const updatedItems = currentItems.map((it, idx) =>
      idx === itemIndex ? { ...it, isPurchased: !it.isPurchased } : it
    );

    // Optimistic update in UI
    setOrders((prev) =>
      prev.map((o) => (o.id === order.id ? { ...o, items: updatedItems } : o))
    );

    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: updatedItems }),
      });
      if (!res.ok) throw new Error('อัปเดตสถานะสินค้าไม่สำเร็จ');
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาดในการบันทึกสถานะสินค้า');
      fetchOrders();
    }
  };

  const handleDeleteOrder = async (order: Order) => {
    if (
      !confirm(
        `คุณต้องการลบคำสั่งซื้อ #${order.orderNumber} ของคุณ "${order.customerName}" ออกจากระบบอย่างถาวรหรือไม่?`
      )
    ) {
      return;
    }

    try {
      setOrders((prev) => prev.filter((o) => o.id !== order.id));
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'ลบคำสั่งซื้อไม่สำเร็จ');

      fetchOrders();
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาดในการลบคำสั่งซื้อ');
      fetchOrders();
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchStatus = statusFilter === 'all' || order.status === statusFilter;
    const q = (searchQuery || '').trim().toLowerCase();
    if (!q) return matchStatus;

    const matchSearch =
      (order.orderNumber || '').toLowerCase().includes(q) ||
      (order.customerName || '').toLowerCase().includes(q) ||
      (order.customerPhone || '').includes(q) ||
      (order.customerLineId || '').toLowerCase().includes(q);

    return matchStatus && matchSearch;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 flex items-center gap-2">
              <Package className="w-8 h-8 text-rose-600" />
              จัดการคำสั่งซื้อ & สลิปโอนเงิน
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              ตรวจสอบสลิปการโอนเงินของลูกค้า อนุมัติยอด และอัปเดตสถานะจัดส่งพัสดุ
            </p>
          </div>

          <button
            onClick={fetchOrders}
            className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-bold shadow-2xs transition-colors self-start sm:self-auto"
          >
            🔄 รีเฟรชรายการ
          </button>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white rounded-3xl p-4 border border-rose-100 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาด้วยชื่อลูกค้า, เบอร์โทร, LINE ID หรือเลขออเดอร์..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-rose-500"
            />
          </div>

          {/* Status Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { key: 'all', label: 'ทั้งหมด', count: orders.length },
              { key: 'pending_verification', label: 'รอตรวจสลิป ⚠️', count: orders.filter((o) => o.status === 'pending_verification').length },
              { key: 'paid', label: 'ชำระแล้ว', count: orders.filter((o) => o.status === 'paid').length },
              { key: 'purchased', label: 'ซื้อของแล้ว 🇯🇵', count: orders.filter((o) => o.status === 'purchased').length },
              { key: 'shipped', label: 'จัดส่งแล้ว 🚚', count: orders.filter((o) => o.status === 'shipped').length },
              { key: 'cancelled', label: 'ยกเลิกแล้ว ❌', count: orders.filter((o) => o.status === 'cancelled').length },
            ].map((st) => (
              <button
                key={st.key}
                onClick={() => setStatusFilter(st.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  statusFilter === st.key
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {st.label} ({st.count})
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table / Cards */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl p-6 border border-gray-100 animate-pulse h-36" />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 space-y-3">
            <div className="text-3xl">🔍</div>
            <h3 className="font-bold text-gray-800 text-base">ไม่พบคำสั่งซื้อที่ค้นหา</h3>
            <p className="text-xs text-gray-400">ลองเปลี่ยนตัวกรองสถานะหรือคำค้นหาดูครับ</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const orderItems = Array.isArray(order.items) ? order.items : [];
              const allItemsPurchased =
                orderItems.length > 0 && orderItems.every((i) => Boolean(i.isPurchased));

              return (
                <div
                  key={order.id}
                  className={`bg-white rounded-3xl p-5 sm:p-6 border transition-shadow space-y-4 ${
                    order.status === 'cancelled'
                      ? 'border-red-200 bg-red-50/20 opacity-90'
                      : 'border-rose-100 shadow-sm hover:shadow-md'
                  }`}
                >
                  {/* Top: Order Info & Status Selector & Delete Button */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-black text-gray-900 text-base">
                          {order.orderNumber}
                        </span>
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                          {new Date(order.createdAt).toLocaleString('th-TH')}
                        </span>
                        <span className="text-xs bg-rose-50 text-rose-700 px-2 py-0.5 rounded font-semibold">
                          {order.flightRoundName || 'รอบบินญี่ปุ่น'}
                        </span>
                        {order.status === 'cancelled' && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold">
                            ❌ ยกเลิกคำสั่งซื้อแล้ว
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Status Dropdown & Delete Order Action */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">สถานะ:</span>
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateStatus(order.id, e.target.value as OrderStatus)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl border focus:outline-none ${
                          order.status === 'paid'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : order.status === 'pending_verification'
                            ? 'bg-blue-50 text-blue-800 border-blue-300'
                            : order.status === 'purchased'
                            ? 'bg-purple-50 text-purple-800 border-purple-300'
                            : order.status === 'shipped'
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-400'
                            : order.status === 'cancelled'
                            ? 'bg-red-50 text-red-800 border-red-300'
                            : 'bg-gray-50 text-gray-800 border-gray-300'
                        }`}
                      >
                        <option value="pending_payment">⏳ รอชำระเงิน</option>
                        <option value="pending_verification">⚠️ รอตรวจสลิป</option>
                        <option value="paid">✅ ชำระแล้ว (อนุมัติสลิป)</option>
                        <option value="purchased">🎌 ซื้อของแล้วที่ญี่ปุ่น</option>
                        <option value="shipped">🚚 จัดส่งพัสดุแล้ว</option>
                        <option value="cancelled">❌ ยกเลิกออเดอร์</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => handleDeleteOrder(order)}
                        className={`p-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 ${
                          order.status === 'cancelled'
                            ? 'bg-red-100 hover:bg-red-200 text-red-700 px-2.5 border border-red-200'
                            : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                        }`}
                        title="ลบคำสั่งซื้อนี้ออกจากระบบอย่างถาวร"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                        {order.status === 'cancelled' && <span>ลบออเดอร์นี้</span>}
                      </button>
                    </div>
                  </div>

                  {/* Middle: Customer Details, Items, and Slip */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                    {/* Customer & Address (4 cols) */}
                    <div className="md:col-span-4 space-y-2 text-xs bg-gray-50/70 p-4 rounded-2xl">
                      <p className="font-bold text-gray-900 text-sm">{order.customerName || 'ไม่ระบุชื่อ'}</p>
                      <p className="text-gray-600 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                        {order.customerPhone || '-'}
                      </p>
                      {order.customerLineId && (
                        <p className="text-gray-600 flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                          LINE: {order.customerLineId}
                        </p>
                      )}
                      <div className="pt-1 text-gray-600 flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                        <span className="whitespace-pre-line leading-relaxed">{order.shippingAddress || 'ไม่ระบุที่อยู่'}</span>
                      </div>
                      {order.note && (
                        <p className="text-rose-600 italic pt-1">หมายเหตุ: {order.note}</p>
                      )}
                    </div>

                    {/* Items List (5 cols) */}
                    <div className="md:col-span-5 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                          รายการสินค้า ({orderItems.length} รายการ)
                        </span>
                        <span className="text-[10px] text-gray-400">
                          (คลิกเพื่อติ๊กซื้อแล้ว)
                        </span>
                      </div>

                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {orderItems.map((item, idx) => (
                          <div
                            key={idx}
                            className={`flex items-center justify-between gap-2 p-2 rounded-xl border transition-all ${
                              item.isPurchased
                                ? 'bg-emerald-50/70 border-emerald-200'
                                : 'bg-white border-gray-100 hover:border-gray-200'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate flex-1">
                              {/* Checkbox button */}
                              <button
                                type="button"
                                onClick={() => handleToggleItemPurchased(order, idx)}
                                className={`w-6 h-6 rounded-lg border transition-all flex items-center justify-center shrink-0 ${
                                  item.isPurchased
                                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                                    : 'bg-white text-gray-400 border-gray-300 hover:border-emerald-500 hover:text-emerald-500'
                                }`}
                                title={item.isPurchased ? 'ซื้อแล้ว (คลิกเพื่อยกเลิก)' : 'คลิกเมื่อซื้อสินค้านี้แล้ว'}
                              >
                                <Check className={`w-3.5 h-3.5 ${item.isPurchased ? 'stroke-[3]' : ''}`} />
                              </button>

                              {item.imageUrl ? (
                                <img
                                  src={item.imageUrl}
                                  alt={item.productName}
                                  className={`w-8 h-8 rounded-lg object-cover bg-gray-50 shrink-0 ${
                                    item.isPurchased ? 'opacity-80' : ''
                                  }`}
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center text-[10px] text-gray-400 shrink-0">
                                  📦
                                </div>
                              )}

                              <div className="overflow-hidden flex-1">
                                <span
                                  className={`font-medium text-xs truncate block ${
                                    item.isPurchased ? 'line-through text-gray-400' : 'text-gray-800'
                                  }`}
                                >
                                  {item.productName}
                                </span>
                                <span className="text-[10px] text-gray-400">
                                  x{item.quantity || 1} • ฿{(Number(item.price || 0) * Number(item.quantity || 1)).toLocaleString()}
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleToggleItemPurchased(order, idx)}
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 transition-colors ${
                                item.isPurchased
                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              {item.isPurchased ? '✓ ซื้อแล้ว' : '⏳ รอซื้อ'}
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 flex justify-between font-black text-sm text-gray-900 border-t border-gray-100">
                        <span>ยอดรวมทั้งสิ้น:</span>
                        <span className="text-rose-600 text-base">฿{(order.totalAmount || 0).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Payment Slip Preview & Action (3 cols) */}
                    <div className="md:col-span-3 flex flex-col items-center justify-center p-3 bg-rose-50/40 rounded-2xl border border-rose-100 text-center space-y-2">
                      <span className="text-[11px] font-bold text-gray-600">สลิปโอนเงิน</span>

                      {order.paymentSlipUrl ? (
                        <div className="space-y-2 w-full flex flex-col items-center">
                          <div
                            onClick={() => setSelectedSlip({ url: order.paymentSlipUrl!, order })}
                            className="relative w-20 h-20 rounded-xl overflow-hidden cursor-pointer group shadow-sm border border-rose-200"
                          >
                            <img
                              src={order.paymentSlipUrl}
                              alt="สลิป"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                              <Eye className="w-4 h-4" />
                            </div>
                          </div>

                          <button
                            onClick={() => setSelectedSlip({ url: order.paymentSlipUrl!, order })}
                            className="text-[11px] font-bold text-rose-600 hover:underline"
                          >
                            คลิกดูสลิปเต็ม
                          </button>

                          {order.status === 'pending_verification' && (
                            <button
                              onClick={() => handleUpdateStatus(order.id, 'paid')}
                              className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              อนุมัติสลิปนี้
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="py-4 text-xs text-amber-600 font-medium">
                          ลูกค้ายังไม่ได้แนบสลิป
                        </div>
                      )}
                    </div>
                  </div>

                  {/* All Items Purchased Banner & Confirm Ready To Ship Button */}
                  {allItemsPurchased &&
                    order.status !== 'shipped' &&
                    order.status !== 'completed' &&
                    order.status !== 'cancelled' && (
                      <div className="p-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 rounded-2xl text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-3 border border-emerald-400">
                        <div className="flex items-center gap-2.5 text-xs">
                          <span className="text-xl">🎉</span>
                          <div>
                            <p className="font-black text-sm text-white">
                              ซื้อสินค้าครบทุกชิ้นแล้ว! (100%)
                            </p>
                            <p className="text-[11px] text-emerald-100 font-medium">
                              สินค้าของ {order.customerName} ครบแล้ว พร้อมแพ็กและจัดส่งพัสดุ
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(order.id, 'shipped')}
                          className="px-4 py-2 bg-white hover:bg-emerald-50 text-emerald-700 rounded-xl text-xs font-black shadow-md transition-all active:scale-95 shrink-0 flex items-center gap-1.5"
                        >
                          <Truck className="w-4 h-4 text-emerald-600" />
                          <span>คอนเฟิร์มออเดอร์พร้อมส่ง 🚚</span>
                        </button>
                      </div>
                    )}

                  {/* Bottom: Tracking Number Update Bar */}
                  <div className="pt-2 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Truck className="w-4 h-4 text-blue-500 shrink-0" />
                      <span className="font-bold text-gray-700 shrink-0">เลขพัสดุ (Tracking):</span>
                      <input
                        type="text"
                        placeholder="เช่น FLASH-1234567TH"
                        value={trackingMap[order.id] || ''}
                        onChange={(e) =>
                          setTrackingMap((prev) => ({ ...prev, [order.id]: e.target.value }))
                        }
                        className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:border-rose-500 w-48 sm:w-56"
                      />
                      <button
                        onClick={() => handleSaveTracking(order.id)}
                        disabled={savingMap[order.id]}
                        className="px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl transition-colors flex items-center gap-1 shrink-0"
                      >
                        <Save className="w-3 h-3" />
                        {savingMap[order.id] ? 'บันทึก...' : 'บันทึก'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Slip Modal */}
      {selectedSlip && (
        <SlipModal
          imageUrl={selectedSlip.url}
          orderNumber={selectedSlip.order?.orderNumber}
          customerName={selectedSlip.order?.customerName}
          totalAmount={selectedSlip.order?.totalAmount}
          onClose={() => setSelectedSlip(null)}
        />
      )}
    </AdminLayout>
  );
}
