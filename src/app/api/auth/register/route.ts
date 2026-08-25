import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { readDbAsync, writeDb } from '@/lib/db';
import { signToken, AUTH_COOKIE_NAME } from '@/lib/auth';
import { User } from '@/types';

export async function POST(request: Request) {
  try {
    const { fullName, username, password, phone, lineId, address } = await request.json();

    if (!fullName || !username || !password || !phone) {
      return NextResponse.json(
        { error: 'กรุณากรอกข้อมูลที่จำเป็น: ชื่อ-นามสกุล, Username, รหัสผ่าน และเบอร์โทรศัพท์' },
        { status: 400 }
      );
    }

    const db = await readDbAsync();
    const cleanUsername = username.trim().toLowerCase();
    const cleanPhone = phone.trim();

    // Check if username already exists
    const existingUser = db.users.find(
      (u) => u.username.toLowerCase() === cleanUsername
    );
    if (existingUser) {
      return NextResponse.json(
        { error: 'Username นี้มีผู้ใช้งานแล้ว กรุณาเลือก Username อื่น' },
        { status: 400 }
      );
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const newUser: User = {
      id: `user_cust_${Date.now()}`,
      username: cleanUsername,
      passwordHash,
      role: 'customer',
      fullName: fullName.trim(),
      phone: cleanPhone,
      lineId: lineId ? lineId.trim() : '',
      address: address ? address.trim() : '',
      createdAt: new Date().toISOString(),
    };

    db.users.push(newUser);
    await writeDb(db);

    const token = signToken(newUser);
    const { passwordHash: _, ...safeUser } = newUser;

    const response = NextResponse.json({
      success: true,
      message: 'สมัครสมาชิกสำเร็จ ยินดีต้อนรับสู่ Japan Pre-Order Shop!',
      user: safeUser,
      token,
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก' },
      { status: 500 }
    );
  }
}
