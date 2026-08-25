import { NextResponse } from 'next/server';
import { readDbAsync, writeDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// GET shop settings (Public)
export async function GET() {
  try {
    const db = await readDbAsync();
    return NextResponse.json({ shopSettings: db.shopSettings });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST / PUT update shop settings (Admin only)
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'merchant') {
      return NextResponse.json({ error: 'สงวนสิทธิ์สำหรับแม่ค้าเท่านั้น' }, { status: 403 });
    }

    const body = await request.json();
    const db = await readDbAsync();

    db.shopSettings = {
      ...db.shopSettings,
      ...body,
    };

    await writeDb(db);

    return NextResponse.json({ success: true, shopSettings: db.shopSettings });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
