'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Order, OrderStatus } from '@/types';
import {
  Users,
  Search,
  Phone,
  MessageSquare,
  MapPin,
  Calendar,
  ShoppingBag,
  Copy,
  Check,
  ExternalLink,
  UserCheck,
  RefreshCw,
  Trash2,
  Package,
  CheckCircle,
  Clock,
  Plane,
  Truck,
  Eye,
  X,
  CreditCard,
  AlertCircle,
  ChevronRight,
  Filter,
} from 'lucide-react';

interface CustomerData {
  id: string;
  username: string;
  fullName: string;
  phone: string;
  lineId?: string;
  address?: string;
  createdAt: string;
  orderCount: number;
  totalSpent: number;
  latestOrderDate?: string | null;
  paidCount: number;
  unpaidCount: number;
  purchasedCount: number;
  pendingPurchaseCount: number;
  orders: Order[];
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Selected customer for detailed modal
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerData | null>(null);
  const [orderFilter, setOrderFilter] = useState<'all' | 'unpaid' | 'paid' | 'purchased' | 'shipped'>('all');
  const [viewingSlipUrl, setViewingSlipUrl] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/customers?_t=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.customers) {
        setCustomers(data.customers);
        // If modal is open, refresh selected customer data
        if (selectedCustomer) {
          const updated = data.customers.find((c: CustomerData) => c.id === selectedCustomer.id);
          if (updated) setSelectedCustomer(updated);
        }
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteCustomer = async (cust: CustomerData) => {
    if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบบัญชีลูกค้า "${cust.fullName}" (@${cust.username}) ออกจากระบบ?`)) {
      return;
    }

    try {
      setDeletingId(cust.id);
      setCustomers((prev) => prev.filter((c) => c.id !== cust.id));
      if (selectedCustomer?.id === cust.id) setSelectedCustomer(null);

      const res = await fetch(`/api/customers/${cust.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'ลบลูกค้าไม่สำเร็จ');

      fetchCustomers();
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาดในการลบลูกค้า');
      fetchCustomers();
    } finally {
      setDeletingId(null);
    }
  };

  // Quick change order status from inside customer details modal
  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      setUpdatingOrderId(orderId);
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'อัปเดตสถานะไม่สำเร็จ');

      fetchCustomers();
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาดในการอัปเดตสถานะ');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Filter customers by search
  const filteredCustomers = customers.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.fullName.toLowerCase().includes(q) ||
      c.username.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      (c.lineId && c.lineId.toLowerCase().includes(q)) ||
      (c.address && c.address.toLowerCase().includes(q))
    );
  });

  const totalRegistered = customers.length;
  const totalOrdersSum = customers.reduce((sum, c) => sum + c.orderCount, 0);
  const totalSalesSum = customers.reduce((sum, c) => sum + c.totalSpent, 0);

  // Status Badge Helper
  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending_payment':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3" />
            <span>รอชำระเงิน</span>
          </span>
        );
      case 'pending_verification':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3 h-3 text-blue-500" />
            <span>รอตรวจสลิป</span>
          </span>
        );
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            <span>ชำระแล้ว (รอซื้อที่ญี่ปุ่น)</span>
          </span>
        );
      case 'purchased':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Plane className="w-3 h-3 text-indigo-600" />
            <span>ซื้อของแล้วที่ญี่ปุ่น 🇯🇵</span>
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <Truck className="w-3 h-3 text-purple-600" />
            <span>จัดส่งพัสดุแล้ว</span>
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200">
            <CheckCircle className="w-3 h-3" />
            <span>สำเร็จเรียบร้อย</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
            <X className="w-3 h-3" />
            <span>ยกเลิก</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 flex items-center gap-2">
              <Users className="w-8 h-8 text-rose-600" />
              รายชื่อลูกค้า & เช็กสถานะรายบุคคล
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              ดูข้อมูลลูกค้าแต่ละคน สั่งสินค้าอะไรบ้าง อันไหนจ่ายแล้ว/ยังไม่จ่าย และอันไหนได้ของแล้ว
            </p>
          </div>

          <button
            type="button"
            onClick={fetchCustomers}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-xs transition-colors self-start sm:self-auto"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>รีเฟรชข้อมูล</span>
          </button>
        </div>

        {/* Summary Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-rose-100 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-black text-xl">
              👥
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">ลูกค้าที่สมัครสมาชิกทั้งหมด</p>
              <p className="text-2xl font-black text-gray-900">{totalRegistered} <span className="text-xs font-normal text-gray-400">คน</span></p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-rose-100 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-black text-xl">
              📦
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">คำสั่งซื้อรวมจากลูกค้า</p>
              <p className="text-2xl font-black text-gray-900">{totalOrdersSum} <span className="text-xs font-normal text-gray-400">ออเดอร์</span></p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-rose-100 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-xl">
              💰
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">ยอดสั่งซื้อรวมทั้งหมด</p>
              <p className="text-2xl font-black text-emerald-600">฿{totalSalesSum.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-xs">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาชื่อลูกค้า, Username, เบอร์โทร, LINE ID หรือที่อยู่จัดส่ง..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-rose-500"
            />
          </div>
        </div>

        {/* Customer List Cards */}
        {loading ? (
          <div className="py-12 text-center text-gray-400">กำลังโหลดรายชื่อลูกค้า...</div>
        ) : filteredCustomers.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-xs space-y-3">
            <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto text-2xl">
              🔍
            </div>
            <h3 className="font-bold text-gray-700">ไม่พบข้อมูลลูกค้า</h3>
            <p className="text-xs text-gray-400">
              {search ? 'ลองค้นหาด้วยคำค้นอื่น' : 'ยังไม่มีลูกค้าลงทะเบียนในระบบ'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCustomers.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-rose-100 shadow-xs hover:shadow-md transition-shadow space-y-4 flex flex-col justify-between"
              >
                {/* Top: Name + Username + Delete */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-red-400 text-white font-black text-lg flex items-center justify-center shadow-xs">
                      {c.fullName.charAt(0) || '👤'}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-base">{c.fullName}</h3>
                      <p className="text-xs text-gray-400 font-mono">@{c.username}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="px-2.5 py-1 bg-rose-50 text-rose-600 rounded-full text-[11px] font-bold border border-rose-100 shrink-0">
                      🛍️ {c.orderCount} ออเดอร์
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteCustomer(c)}
                      disabled={deletingId === c.id}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      title="ลบข้อมูลลูกค้านี้"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Quick Status Chips (จ่ายแล้ว/ยังไม่จ่าย/ได้ของแล้ว) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px] font-semibold">
                  <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 p-2 rounded-xl text-center">
                    <span className="block text-[10px] text-emerald-600/80 font-normal">จ่ายเงินแล้ว</span>
                    <span className="font-bold text-xs">{c.paidCount}</span> ออเดอร์
                  </div>
                  <div className="bg-amber-50 border border-amber-100 text-amber-700 p-2 rounded-xl text-center">
                    <span className="block text-[10px] text-amber-600/80 font-normal">รอจ่าย/ตรวจสลิป</span>
                    <span className="font-bold text-xs">{c.unpaidCount}</span> ออเดอร์
                  </div>
                  <div className="bg-indigo-50 border border-indigo-100 text-indigo-700 p-2 rounded-xl text-center">
                    <span className="block text-[10px] text-indigo-600/80 font-normal">ซื้อที่ญี่ปุ่นแล้ว</span>
                    <span className="font-bold text-xs">{c.purchasedCount}</span> ออเดอร์
                  </div>
                  <div className="bg-purple-50 border border-purple-100 text-purple-700 p-2 rounded-xl text-center">
                    <span className="block text-[10px] text-purple-600/80 font-normal">ยอดซื้อรวม</span>
                    <span className="font-bold text-xs">฿{c.totalSpent.toLocaleString()}</span>
                  </div>
                </div>

                {/* Contact Info & Address */}
                <div className="space-y-2 text-xs text-gray-600 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">
                  {/* Phone */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-gray-700 font-medium">
                      <Phone className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span>{c.phone}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <a
                        href={`tel:${c.phone}`}
                        className="px-2 py-0.5 bg-white hover:bg-gray-100 text-gray-700 rounded-lg text-[10px] font-bold border border-gray-200"
                      >
                        📞 โทร
                      </a>
                      <button
                        type="button"
                        onClick={() => handleCopy(c.phone, `phone_${c.id}`)}
                        className="p-1 text-gray-400 hover:text-gray-700"
                        title="คัดลอกเบอร์โทร"
                      >
                        {copiedId === `phone_${c.id}` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* LINE ID */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-gray-700 font-medium">
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>LINE: {c.lineId || '-'}</span>
                    </div>
                    {c.lineId && (
                      <a
                        href={`https://line.me/ti/p/~${c.lineId.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-bold border border-emerald-200 inline-flex items-center gap-1"
                      >
                        <span>แชท LINE</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>

                  {/* Shipping Address */}
                  <div className="pt-1 border-t border-gray-200/60">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-1.5 text-gray-600">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">
                          {c.address || <span className="text-gray-400">ยังไม่ระบุที่อยู่</span>}
                        </span>
                      </div>
                      {c.address && (
                        <button
                          type="button"
                          onClick={() => handleCopy(`${c.fullName} (${c.phone})\n${c.address}`, `addr_${c.id}`)}
                          className="px-2 py-1 bg-white hover:bg-gray-100 text-rose-600 rounded-lg text-[10px] font-bold border border-rose-200 shrink-0 flex items-center gap-1 shadow-2xs"
                          title="คัดลอกชื่อ เบอร์โทร และที่อยู่สำหรับจ่าหน้ากล่องพัสดุ"
                        >
                          {copiedId === `addr_${c.id}` ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-500" />
                              <span className="text-emerald-600">คัดลอกแล้ว</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>ก๊อปปี้จ่าหน้าพัสดุ</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Primary Action: View Customer Orders Breakdown */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCustomer(c);
                    setOrderFilter('all');
                  }}
                  className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
                >
                  <Package className="w-4 h-4 text-rose-400" />
                  <span>ดูรายการสินค้า & ออเดอร์ทั้งหมด ({c.orders?.length || 0} รายการ)</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* INDIVIDUAL CUSTOMER ORDER & ITEM INSPECTOR MODAL */}
        {/* ---------------------------------------------------- */}
        {selectedCustomer && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-rose-100 overflow-hidden animate-fadeIn">
              {/* Modal Header */}
              <div className="p-5 sm:p-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white font-black text-xl flex items-center justify-center shadow-inner">
                    {selectedCustomer.fullName.charAt(0) || '👤'}
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black">{selectedCustomer.fullName}</h2>
                    <p className="text-xs text-gray-300 font-mono">
                      @{selectedCustomer.username} • 📞 {selectedCustomer.phone} {selectedCustomer.lineId ? `• LINE: ${selectedCustomer.lineId}` : ''}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedCustomer(null)}
                  className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Summary Pill Bar */}
              <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-700">ตัวกรองคำสั่งซื้อ:</span>
                  <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200">
                    <button
                      type="button"
                      onClick={() => setOrderFilter('all')}
                      className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                        orderFilter === 'all' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      ทั้งหมด ({selectedCustomer.orders.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderFilter('unpaid')}
                      className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                        orderFilter === 'unpaid' ? 'bg-amber-600 text-white' : 'text-amber-700 hover:bg-amber-50'
                      }`}
                    >
                      รอจ่าย/รอตรวจ ({selectedCustomer.unpaidCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderFilter('paid')}
                      className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                        orderFilter === 'paid' ? 'bg-emerald-600 text-white' : 'text-emerald-700 hover:bg-emerald-50'
                      }`}
                    >
                      จ่ายแล้ว ({selectedCustomer.paidCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderFilter('purchased')}
                      className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                        orderFilter === 'purchased' ? 'bg-indigo-600 text-white' : 'text-indigo-700 hover:bg-indigo-50'
                      }`}
                    >
                      ซื้อที่ญี่ปุ่นแล้ว ({selectedCustomer.purchasedCount})
                    </button>
                  </div>
                </div>

                <div className="text-xs font-bold text-gray-700">
                  ยอดสั่งซื้อรวม: <span className="text-emerald-600 text-sm">฿{selectedCustomer.totalSpent.toLocaleString()}</span>
                </div>
              </div>

              {/* Modal Body: Orders List */}
              <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
                {selectedCustomer.orders.length === 0 ? (
                  <div className="py-12 text-center text-gray-400 space-y-2">
                    <Package className="w-12 h-12 text-gray-300 mx-auto" />
                    <p className="font-bold text-gray-600">ลูกค้ารายนี้ยังไม่มีประวัติการสั่งซื้อ</p>
                  </div>
                ) : (
                  selectedCustomer.orders
                    .filter((o) => {
                      if (orderFilter === 'unpaid') return o.status === 'pending_payment' || o.status === 'pending_verification';
                      if (orderFilter === 'paid') return o.status === 'paid';
                      if (orderFilter === 'purchased') return o.status === 'purchased' || o.status === 'shipped' || o.status === 'completed';
                      return true;
                    })
                    .map((order) => (
                      <div
                        key={order.id}
                        className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden space-y-3 p-4 sm:p-5"
                      >
                        {/* Order Header Bar */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-sm text-gray-900">#{order.orderNumber}</span>
                            <span className="text-xs text-gray-400">
                              • {new Date(order.createdAt).toLocaleString('th-TH')}
                            </span>
                            {order.flightRoundName && (
                              <span className="text-[10px] bg-rose-50 text-rose-600 font-bold px-2 py-0.5 rounded-full border border-rose-100">
                                ✈️ {order.flightRoundName}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {getStatusBadge(order.status)}

                            {/* Change status dropdown */}
                            <select
                              value={order.status}
                              disabled={updatingOrderId === order.id}
                              onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                              className="text-[11px] font-bold bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:border-rose-500"
                            >
                              <option value="pending_payment">รอชำระเงิน</option>
                              <option value="pending_verification">รอตรวจสลิป</option>
                              <option value="paid">ชำระแล้ว (รอซื้อ)</option>
                              <option value="purchased">ซื้อแล้วที่ญี่ปุ่น 🇯🇵</option>
                              <option value="shipped">จัดส่งพัสดุแล้ว 🚚</option>
                              <option value="completed">สำเร็จเรียบร้อย</option>
                              <option value="cancelled">ยกเลิก</option>
                            </select>
                          </div>
                        </div>

                        {/* Items in this Order */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            รายการสินค้าที่ลูกค้าสั่งซื้อ ({order.items.length} รายการ):
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {order.items.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100"
                              >
                                {item.imageUrl ? (
                                  <img
                                    src={item.imageUrl}
                                    alt={item.productName}
                                    className="w-12 h-12 rounded-lg object-cover border border-gray-200 shrink-0"
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center text-xs text-gray-400 shrink-0">
                                    📦
                                  </div>
                                )}
                                <div className="overflow-hidden flex-1">
                                  <h5 className="font-bold text-xs text-gray-900 truncate">
                                    {item.productName}
                                  </h5>
                                  <p className="text-[11px] text-gray-500">
                                    จำนวน: <span className="font-bold text-gray-900">x{item.quantity}</span> • ฿{item.price.toLocaleString()}/ชิ้น
                                  </p>
                                </div>
                                <span className="text-xs font-bold text-rose-600 shrink-0">
                                  ฿{(item.price * item.quantity).toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Order Footer: Payment Slip & Total Summary */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 border-t border-gray-100 gap-2 text-xs">
                          {/* Payment Slip Button */}
                          <div>
                            {order.paymentSlipUrl ? (
                              <button
                                type="button"
                                onClick={() => setViewingSlipUrl(order.paymentSlipUrl!)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl font-bold transition-colors border border-blue-200"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>ดูสลิปหลักฐานการโอนเงิน</span>
                              </button>
                            ) : (
                              <span className="text-gray-400 italic text-[11px]">
                                ลูกค้ายังไม่ได้แนบสลิป
                              </span>
                            )}
                          </div>

                          {/* Tracking Number if any */}
                          {order.trackingNumber && (
                            <div className="text-purple-700 font-mono font-bold bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
                              🚚 Tracking: {order.trackingNumber}
                            </div>
                          )}

                          {/* Order Price Totals */}
                          <div className="text-right">
                            <span className="text-gray-400 text-[11px]">ยอดสุทธิ: </span>
                            <span className="text-sm font-black text-rose-600">
                              ฿{order.totalAmount.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedCustomer(null)}
                  className="px-5 py-2 bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* PAYMENT SLIP VIEWER MODAL */}
        {/* ---------------------------------------------------- */}
        {viewingSlipUrl && (
          <div className="fixed inset-0 z-60 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-5 space-y-4 shadow-2xl relative animate-fadeIn">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span>สลิปหลักฐานการโอนเงิน</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setViewingSlipUrl(null)}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="rounded-2xl overflow-hidden border border-gray-200 bg-black/5 flex items-center justify-center max-h-[70vh]">
                <img
                  src={viewingSlipUrl}
                  alt="สลิปการโอนเงิน"
                  className="max-h-[65vh] w-auto object-contain rounded-xl"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setViewingSlipUrl(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-colors"
                >
                  ปิด
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
