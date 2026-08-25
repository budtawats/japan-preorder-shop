import { NextResponse } from 'next/server';
import { readDbAsync, writeDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// DELETE customer account (Admin only)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'merchant') {
      return NextResponse.json({ error: 'สงวนสิทธิ์สำหรับแม่ค้าเท่านั้น' }, { status: 403 });
    }

    const { id } = params;
    const db = await readDbAsync();

    // Prevent deleting merchant/admin
    const targetUser = db.users.find((u) => u.id === id);
    if (!targetUser) {
      return NextResponse.json({ error: 'ไม่พบข้อมูลลูกค้านี้' }, { status: 404 });
    }

    if (targetUser.role === 'merchant') {
      return NextResponse.json({ error: 'ไม่สามารถลบบัญชีผู้ดูแลระบบ (แม่ค้า) ได้' }, { status: 400 });
    }

    db.users = db.users.filter((u) => u.id !== id);
    await writeDb(db);

    return NextResponse.json({ success: true, message: 'ลบข้อมูลลูกค้าเรียบร้อยแล้ว' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
