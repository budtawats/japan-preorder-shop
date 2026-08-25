import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { readDbAsync, writeDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// PUT update profile and/or change password
export async function PUT(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' }, { status: 401 });
    }

    const body = await request.json();
    const { fullName, username, phone, lineId, address, currentPassword, newPassword } = body;

    const db = await readDbAsync();
    const userIndex = db.users.findIndex((u) => u.id === currentUser.id);
    if (userIndex === -1) {
      return NextResponse.json({ error: 'ไม่พบบัญชีผู้ใช้' }, { status: 404 });
    }

    const user = db.users[userIndex];

    // If changing username, ensure it's not taken by another user
    if (username && username.trim().toLowerCase() !== user.username.toLowerCase()) {
      const cleanUsername = username.trim().toLowerCase();
      const existing = db.users.find(
        (u) => u.id !== user.id && u.username.toLowerCase() === cleanUsername
      );
      if (existing) {
        return NextResponse.json(
          { error: 'Username นี้มีผู้ใช้งานแล้ว กรุณาเลือก Username อื่น' },
          { status: 400 }
        );
      }
      user.username = cleanUsername;
    }

    // Update Profile Fields
    if (fullName !== undefined) user.fullName = fullName.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (lineId !== undefined) user.lineId = lineId.trim();
    if (address !== undefined) user.address = address.trim();

    // Change Password if requested
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: 'กรุณากรอกรหัสผ่านปัจจุบันเพื่อยืนยันการเปลี่ยนรหัสผ่าน' },
          { status: 400 }
        );
      }

      const isMatch = bcrypt.compareSync(currentPassword, user.passwordHash);
      if (!isMatch) {
        return NextResponse.json(
          { error: 'รหัสผ่านปัจจุบันไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง' },
          { status: 400 }
        );
      }

      if (newPassword.length < 4) {
        return NextResponse.json(
          { error: 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 4 ตัวอักษร' },
          { status: 400 }
        );
      }

      user.passwordHash = bcrypt.hashSync(newPassword, 10);
    }

    db.users[userIndex] = user;
    writeDb(db);

    const { passwordHash, ...safeUser } = user;

    return NextResponse.json({
      success: true,
      message: 'บันทึกข้อมูลเรียบร้อยแล้ว',
      user: safeUser,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล' },
      { status: 500 }
    );
  }
}
