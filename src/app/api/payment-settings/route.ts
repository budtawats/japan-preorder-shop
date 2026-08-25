import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// GET payment settings
export async function GET() {
  try {
    const db = readDb();
    return NextResponse.json({ paymentSettings: db.paymentSettings });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST / PUT payment settings (Admin only)
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'merchant') {
      return NextResponse.json({ error: 'สงวนสิทธิ์สำหรับแม่ค้าเท่านั้น' }, { status: 403 });
    }

    const body = await request.json();
    const db = readDb();

    db.paymentSettings = {
      ...db.paymentSettings,
      ...body,
      shippingFee: Number(body.shippingFee ?? db.paymentSettings.shippingFee),
      freeShippingMinAmount: body.freeShippingMinAmount !== undefined ? Number(body.freeShippingMinAmount) : db.paymentSettings.freeShippingMinAmount,
    };

    writeDb(db);

    return NextResponse.json({ success: true, paymentSettings: db.paymentSettings });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
