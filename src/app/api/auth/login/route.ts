import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { readDb } from '@/lib/db';
import { signToken, AUTH_COOKIE_NAME } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { username, password, role } = await request.json();

    if (!username || !password || !role) {
      return NextResponse.json(
        { error: 'กรุณากรอกข้อมูล Username, Password และเลือกประเภทผู้ใช้' },
        { status: 400 }
      );
    }

    const db = readDb();
    const cleanUsername = username.trim().toLowerCase();

    // Find user matching username and role
    const user = db.users.find(
      (u) =>
        (u.username.toLowerCase() === cleanUsername || (role === 'customer' && u.phone === cleanUsername)) &&
        u.role === role
    );

    if (!user) {
      return NextResponse.json(
        {
          error:
            role === 'merchant'
              ? 'ไม่พบบัญชีผู้ดูแลระบบ (แม่ค้า) หรือข้อมูลไม่ถูกต้อง'
              : 'ไม่พบบัญชีลูกค้า กรุณาตรวจสอบ Username / เบอร์โทร หรือสมัครสมาชิกใหม่',
        },
        { status: 401 }
      );
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง' },
        { status: 401 }
      );
    }

    const token = signToken(user);

    // Filter out passwordHash
    const { passwordHash, ...safeUser } = user;

    const response = NextResponse.json({
      success: true,
      message: 'เข้าสู่ระบบสำเร็จ',
      user: safeUser,
      token,
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: 'lax',
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' },
      { status: 500 }
    );
  }
}
