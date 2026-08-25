import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { readDbAsync, writeDb } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { username, phone, newPassword } = await request.json();

    if (!username || !phone || !newPassword) {
      return NextResponse.json(
        { error: 'กรุณากรอก Username, เบอร์โทรศัพท์ และรหัสผ่านใหม่ให้ครบถ้วน' },
        { status: 400 }
      );
    }

    if (newPassword.length < 4) {
      return NextResponse.json(
        { error: 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 4 ตัวอักษร' },
        { status: 400 }
      );
    }

    const db = await readDbAsync();
    const cleanUsername = username.trim().toLowerCase();
    const cleanPhone = phone.trim().replace(/[- ]/g, '');

    // Find matching customer
    const userIndex = db.users.findIndex(
      (u) =>
        u.role === 'customer' &&
        u.username.toLowerCase() === cleanUsername &&
        u.phone.replace(/[- ]/g, '') === cleanPhone
    );

    if (userIndex === -1) {
      return NextResponse.json(
        {
          error:
            'ข้อมูลไม่ถูกต้อง ไม่พบบัญชีลูกค้าที่ตรงกับ Username และเบอร์โทรศัพท์นี้ (หากจำข้อมูลไม่ได้ กรุณาติดต่อแม่ค้าทาง LINE ครับ)',
        },
        { status: 404 }
      );
    }

    // Update password
    db.users[userIndex].passwordHash = bcrypt.hashSync(newPassword, 10);
    writeDb(db);

    return NextResponse.json({
      success: true,
      message: 'รีเซ็ตรหัสผ่านสำเร็จเรียบร้อยแล้ว! สามารถใช้รหัสผ่านใหม่เข้าสู่ระบบได้ทันที',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน' },
      { status: 500 }
    );
  }
}
