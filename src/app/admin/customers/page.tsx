'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
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
  ArrowUpDown,
  RefreshCw,
  Trash2,
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
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/customers?_t=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.customers) {
        setCustomers(data.customers);
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 flex items-center gap-2">
              <Users className="w-8 h-8 text-rose-600" />
              รายชื่อลูกค้า & สมาชิกในระบบ
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              ดูข้อมูลลูกค้าที่ลงทะเบียน ที่อยู่จัดส่ง ช่องทางติดต่อ และประวัติการสั่งซื้อ
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

        {/* Customer List */}
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
                {/* Header: Name + Username + Delete */}
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

                {/* Footer: Stats & Registration Date */}
                <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span>สมัครเมื่อ: {new Date(c.createdAt).toLocaleDateString('th-TH')}</span>
                  </div>
                  <span className="font-bold text-gray-700">
                    ยอดซื้อสะสม: <span className="text-emerald-600">฿{c.totalSpent.toLocaleString()}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
