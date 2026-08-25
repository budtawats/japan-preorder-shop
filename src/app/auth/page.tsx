'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  User as UserIcon,
  ShieldCheck,
  Lock,
  Phone,
  MessageSquare,
  MapPin,
  Sparkles,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  HelpCircle,
  ExternalLink,
  KeyRound,
  X,
} from 'lucide-react';

export default function AuthPage() {
  const router = useRouter();
  const { login: setAuthUser } = useAuth();

  // Role: 'customer' | 'merchant'
  const [role, setRole] = useState<'customer' | 'merchant'>('customer');

  // Mode for customer: 'login' | 'register'
  const [customerMode, setCustomerMode] = useState<'login' | 'register'>('login');

  // Form states for login
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Form states for customer registration (6 exact fields)
  const [fullName, setFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [lineId, setLineId] = useState('');
  const [address, setAddress] = useState('');

  // Form states for Forgot Password Modal
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetUsername, setResetUsername] = useState('');
  const [resetPhone, setResetPhone] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [showResetNewPassword, setShowResetNewPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Handle Login (Customer or Merchant)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: loginUsername,
          password: loginPassword,
          role,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'เข้าสู่ระบบไม่สำเร็จ');
      }

      setAuthUser(data.user);
      setSuccessMsg('เข้าสู่ระบบสำเร็จ กำลังพาคุณไปยังหน้าหลัก...');

      setTimeout(() => {
        if (role === 'merchant') {
          router.push('/admin');
        } else {
          router.push('/');
        }
      }, 800);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Customer Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          username: regUsername,
          password: regPassword,
          phone,
          lineId,
          address,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'สมัครสมาชิกไม่สำเร็จ');
      }

      setAuthUser(data.user);
      setSuccessMsg('สมัครสมาชิกสำเร็จ ยินดีต้อนรับครับ!');

      setTimeout(() => {
        router.push('/');
      }, 1000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Reset Password Submission
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    setResetSuccess(null);
    setResetLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: resetUsername,
          phone: resetPhone,
          newPassword: resetNewPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'รีเซ็ตรหัสผ่านไม่สำเร็จ');

      setResetSuccess(data.message);
      setLoginUsername(resetUsername);
      setLoginPassword(resetNewPassword);

      setTimeout(() => {
        setShowForgotModal(false);
        setResetSuccess(null);
        setResetUsername('');
        setResetPhone('');
        setResetNewPassword('');
        setSuccessMsg('รีเซ็ตรหัสผ่านสำเร็จ กรุณากดเข้าสู่ระบบได้เลยครับ!');
      }, 2500);
    } catch (err: any) {
      setResetError(err.message);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] py-10 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-xl w-full bg-white rounded-3xl border border-rose-100 shadow-xl overflow-hidden">
        {/* Header with Japanese Emblem */}
        <div className="bg-gradient-to-r from-rose-600 via-red-500 to-rose-600 p-6 text-white text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-2xl mx-auto shadow-inner">
            🇯🇵
          </div>
          <h1 className="text-xl sm:text-2xl font-black">KOI Japan Shop</h1>
          <p className="text-xs text-rose-100">
            ระบบสั่งซื้อและจัดการสินค้าพรีออเดอร์จากญี่ปุ่น
          </p>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Main Role Selector: Customer vs Merchant */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 text-center">
              เลือกประเภทผู้ใช้งาน
            </label>
            <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1.5 rounded-2xl">
              <button
                type="button"
                onClick={() => {
                  setRole('customer');
                  setError(null);
                  setSuccessMsg(null);
                }}
                className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  role === 'customer'
                    ? 'bg-white text-rose-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <UserIcon className="w-4 h-4" />
                <span>ลูกค้า (Customer)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRole('merchant');
                  setError(null);
                  setSuccessMsg(null);
                }}
                className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  role === 'merchant'
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>แม่ค้า (Merchant/Admin)</span>
              </button>
            </div>
          </div>

          {/* Customer Sub-Mode: Login vs Register */}
          {role === 'customer' && (
            <div className="flex border-b border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setCustomerMode('login');
                  setError(null);
                  setSuccessMsg(null);
                }}
                className={`flex-1 pb-3 text-sm font-bold transition-colors relative ${
                  customerMode === 'login'
                    ? 'text-rose-600 border-b-2 border-rose-600'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                เข้าสู่ระบบลูกค้า
              </button>
              <button
                type="button"
                onClick={() => {
                  setCustomerMode('register');
                  setError(null);
                  setSuccessMsg(null);
                }}
                className={`flex-1 pb-3 text-sm font-bold transition-colors relative ${
                  customerMode === 'register'
                    ? 'text-rose-600 border-b-2 border-rose-600'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                สมัครสมาชิกใหม่
              </button>
            </div>
          )}

          {/* Feedback Messages */}
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* A. MERCHANT LOGIN FORM */}
          {role === 'merchant' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Username แม่ค้า
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น admin"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  รหัสผ่าน (Password)
                </label>
                <div className="relative">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    placeholder="กรอกรหัสผ่านแม่ค้า"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-4 pr-11 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-gray-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors p-1"
                    title={showLoginPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mt-4"
              >
                {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบแม่ค้า (Admin)'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* B. CUSTOMER LOGIN FORM */}
          {role === 'customer' && customerMode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Username หรือ เบอร์โทรศัพท์
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น somchai หรือ 0899998888"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-gray-700">
                    รหัสผ่าน (Password)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotModal(true);
                      setResetError(null);
                      setResetSuccess(null);
                    }}
                    className="text-xs text-rose-600 hover:text-rose-700 font-semibold hover:underline flex items-center gap-1"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>ลืมรหัสผ่าน?</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    placeholder="กรอกรหัสผ่านของคุณ"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-4 pr-11 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-rose-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors p-1"
                    title={showLoginPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-700 hover:to-red-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-rose-200 transition-all flex items-center justify-center gap-2 mt-4"
              >
                {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบลูกค้า'}
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-between text-xs pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-gray-500 hover:text-rose-600"
                >
                  ลืมรหัสผ่านใช่ไหม?
                </button>
                <button
                  type="button"
                  onClick={() => setCustomerMode('register')}
                  className="text-rose-600 font-bold hover:underline"
                >
                  สมัครสมาชิกใหม่ →
                </button>
              </div>
            </form>
          )}

          {/* C. CUSTOMER REGISTRATION FORM (6 Fields) */}
          {role === 'customer' && customerMode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="text-xs text-gray-500 bg-rose-50/60 p-3 rounded-xl border border-rose-100">
                ✨ สมัครสมาชิกง่ายๆ เพื่อความสะดวกในการสั่งซื้อและติดตามสถานะออเดอร์
              </div>

              {/* 1. Full Name */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  1. ชื่อจริง - นามสกุล <span className="text-rose-500">*</span>{' '}
                  <span className="text-gray-400 font-normal">(สำหรับจ่าหน้าพัสดุ)</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น นาย สมชาย รักชาติ"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* 2. Username */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  2. Username <span className="text-rose-500">*</span>{' '}
                  <span className="text-gray-400 font-normal">(สำหรับใช้ล็อกอินเข้าสู่ระบบ)</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น somchai_jp"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* 3. Password */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  3. รหัสผ่าน (Password) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    placeholder="กำหนดรหัสผ่านสำหรับเข้าสู่ระบบ"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full pl-4 pr-11 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-rose-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors p-1"
                    title={showRegPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                  >
                    {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* 4. Phone */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  4. เบอร์โทรศัพท์ติดต่อ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="เช่น 089-123-4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* 5. Line ID */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  5. LINE ID <span className="text-gray-400 font-normal">(สำหรับติดต่อส่งรูป/แจ้งเตือน)</span>
                </label>
                <input
                  type="text"
                  placeholder="เช่น @somchai หรือ somchai_line"
                  value={lineId}
                  onChange={(e) => setLineId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* 6. Shipping Address */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  6. ที่อยู่จัดส่งสินค้า{' '}
                  <span className="text-gray-400 font-normal">(ระบบจะจำไว้ให้อัตโนมัติ ตอนสั่งซื้อไม่ต้องพิมพ์ใหม่)</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="บ้านเลขที่, ซอย, ถนน, ตำบล/แขวง, อำเภอ/เขต, จังหวัด, รหัสไปรษณีย์"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-700 hover:to-red-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-rose-200 transition-all flex items-center justify-center gap-2 mt-4"
              >
                {loading ? 'กำลังลงทะเบียน...' : 'ยืนยันการสมัครสมาชิก'}
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setCustomerMode('login')}
                  className="text-xs text-rose-600 font-semibold hover:underline"
                >
                  มีบัญชีอยู่แล้ว? คลิกเข้าสู่ระบบ
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* D. FORGOT PASSWORD MODAL */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-rose-100 relative animate-fadeIn">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-black text-base text-gray-900 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-rose-600" />
                <span>ลืมรหัสผ่านเข้าสู่ระบบ</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick LINE Contact Banner */}
            <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl text-xs space-y-2">
              <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>วิธีที่สะดวกที่สุด: ติดต่อแม่ค้าเพื่อรีเซ็ต</span>
              </div>
              <p className="text-[11px] text-emerald-700 leading-relaxed">
                คุณสามารถทักแชทหาแม่ค้าเพื่อขอรีเซ็ตรหัสผ่านได้ทันที โดยแจ้งชื่อหรือเบอร์โทรศัพท์ที่ลงทะเบียนไว้
              </p>
              <a
                href="https://line.me/ti/p/~@koijapanshop"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
              >
                <span>💬 แชทแจ้งแม่ค้าทาง LINE (@koijapanshop)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink mx-3 text-gray-400 text-[11px] font-medium">หรือรีเซ็ตรหัสผ่านด้วยตนเอง</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            {/* Reset Form Feedback */}
            {resetError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{resetError}</span>
              </div>
            )}
            {resetSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{resetSuccess}</span>
              </div>
            )}

            {/* Self-service Reset Form */}
            <form onSubmit={handleResetPassword} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  1. Username ที่ใช้สมัคร <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น somchai"
                  value={resetUsername}
                  onChange={(e) => setResetUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  2. เบอร์โทรศัพท์ที่ลงทะเบียนไว้ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="เช่น 089-999-8888"
                  value={resetPhone}
                  onChange={(e) => setResetPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  3. ตั้งรหัสผ่านใหม่ <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showResetNewPassword ? 'text' : 'password'}
                    required
                    placeholder="กรอกรหัสผ่านใหม่ที่ต้องการ"
                    value={resetNewPassword}
                    onChange={(e) => setResetNewPassword(e.target.value)}
                    className="w-full pl-3.5 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-rose-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetNewPassword(!showResetNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showResetNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-700 hover:to-red-600 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{resetLoading ? 'กำลังตรวจสอบ...' : 'ยืนยันตั้งรหัสผ่านใหม่'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
