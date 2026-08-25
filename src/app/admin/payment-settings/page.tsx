'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { PaymentSettings } from '@/types';
import {
  QrCode,
  CreditCard,
  Truck,
  Upload,
  Save,
  CheckCircle,
  AlertCircle,
  ImageIcon,
} from 'lucide-react';

export default function AdminPaymentSettingsPage() {
  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Form Fields
  const [promptPayNumber, setPromptPayNumber] = useState('');
  const [promptPayName, setPromptPayName] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [qrImageUrl, setQrImageUrl] = useState('');
  const [note, setNote] = useState('');
  const [shippingFee, setShippingFee] = useState<number | ''>(50);
  const [freeShippingMinAmount, setFreeShippingMinAmount] = useState<number | ''>(1000);

  const [uploadingQr, setUploadingQr] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSettings() {
      try {
        setLoading(true);
        const res = await fetch('/api/payment-settings');
        const data = await res.json();
        if (data.paymentSettings) {
          const s = data.paymentSettings;
          setSettings(s);
          setPromptPayNumber(s.promptPayNumber || '');
          setPromptPayName(s.promptPayName || '');
          setBankName(s.bankName || '');
          setAccountNumber(s.accountNumber || '');
          setAccountName(s.accountName || '');
          setQrImageUrl(s.qrImageUrl || '');
          setNote(s.note || '');
          setShippingFee(s.shippingFee ?? 50);
          setFreeShippingMinAmount(s.freeShippingMinAmount ?? 1000);
        }
      } catch (err) {
        console.error('Error loading payment settings:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, []);

  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingQr(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'อัปโหลดรูป QR Code ไม่สำเร็จ');

      setQrImageUrl(data.url);
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาด');
    } finally {
      setUploadingQr(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSaving(true);
      setSuccessMsg(null);

      const payload = {
        promptPayNumber,
        promptPayName,
        bankName,
        accountNumber,
        accountName,
        qrImageUrl,
        note,
        shippingFee: Number(shippingFee || 0),
        freeShippingMinAmount: freeShippingMinAmount ? Number(freeShippingMinAmount) : undefined,
      };

      const res = await fetch('/api/payment-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'บันทึกการตั้งค่าไม่สำเร็จ');

      setSuccessMsg('บันทึกการตั้งค่าช่องทางชำระเงินและค่าจัดส่งเรียบร้อยแล้ว!');
      setTimeout(() => setSuccessMsg(null), 3000);
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
            <QrCode className="w-8 h-8 text-rose-600" />
            ตั้งค่า QR Code ชำระเงิน & ค่าจัดส่ง
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            อัปโหลดรูป QR Code พร้อมเพย์ กำหนดบัญชีธนาคาร และอัตราค่าจัดส่งพัสดุสำหรับลูกค้า
          </p>
        </div>

        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Section 1: PromptPay & Bank Info */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-sm space-y-5">
            <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-rose-500" />
              ข้อมูลพร้อมเพย์และบัญชีธนาคาร
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* QR Image Upload Box (4 cols) */}
              <div className="md:col-span-4 flex flex-col items-center space-y-3 bg-rose-50/40 p-4 rounded-2xl border border-rose-100">
                <span className="text-xs font-bold text-gray-700">รูป QR Code พร้อมเพย์</span>

                <div className="w-40 h-40 bg-white rounded-2xl border-2 border-dashed border-rose-200 overflow-hidden flex items-center justify-center p-2 relative shadow-xs">
                  {qrImageUrl ? (
                    <img
                      src={qrImageUrl}
                      alt="QR Code"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-xs text-gray-400 text-center">ยังไม่มีรูป QR Code</span>
                  )}
                </div>

                <label className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer text-center transition-colors flex items-center justify-center gap-1.5 shadow-sm">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingQr ? 'กำลังอัปโหลด...' : 'อัปโหลดรูป QR'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleQrUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Bank text fields (8 cols) */}
              <div className="md:col-span-8 space-y-4 text-xs sm:text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      เบอร์โทร / เลขพร้อมเพย์ <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="เช่น 0812345678"
                      value={promptPayNumber}
                      onChange={(e) => setPromptPayNumber(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      ชื่อบัญชีพร้อมเพย์ <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="เช่น น.ส. สุดา ใจดี (Japan Pre-Order)"
                      value={promptPayName}
                      onChange={(e) => setPromptPayName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">ชื่อธนาคาร</label>
                    <input
                      type="text"
                      placeholder="เช่น ธนาคารกสิกรไทย (K-Bank)"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">เลขที่บัญชี</label>
                    <input
                      type="text"
                      placeholder="เช่น 123-4-56789-0"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono focus:bg-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">ชื่อบัญชีธนาคาร</label>
                  <input
                    type="text"
                    placeholder="เช่น น.ส. สุดา ใจดี"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Shipping Settings & Notes */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-sm space-y-5">
            <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
              <Truck className="w-5 h-5 text-blue-500" />
              การตั้งค่าค่าจัดส่งและคำแนะนำ
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  ค่าจัดส่งมาตรฐาน (บาท) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  placeholder="เช่น 50"
                  value={shippingFee}
                  onChange={(e) =>
                    setShippingFee(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  ยอดสั่งซื้อขั้นต่ำสำหรับส่งฟรี (บาท)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="เช่น 1000 (หากไม่ต้องการส่งฟรีให้เว้นว่าง)"
                  value={freeShippingMinAmount}
                  onChange={(e) =>
                    setFreeShippingMinAmount(
                      e.target.value === '' ? '' : Number(e.target.value)
                    )
                  }
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1 text-xs sm:text-sm">
                ข้อความแจ้งเตือนการโอนเงินถึงลูกค้า
              </label>
              <textarea
                rows={2}
                placeholder="เช่น เมื่อโอนเงินแล้ว กรุณาแนบรูปสลิปเพื่อความรวดเร็วในการยืนยันออเดอร์"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-8 py-3 bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-700 hover:to-red-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-rose-200 transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่าทั้งหมด'}</span>
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
