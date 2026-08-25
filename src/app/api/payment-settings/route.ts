import { NextResponse } from 'next/server';
import { readDbAsync, writeDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// GET payment settings
export async function GET() {
  try {
    const db = await readDbAsync();
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
    const db = await readDbAsync();

    db.paymentSettings = {
      ...db.paymentSettings,
      ...body,
      shippingFee: body.shippingFee !== undefined ? Number(body.shippingFee) : (db.paymentSettings.shippingFee ?? 0),
      freeShippingMinAmount: body.freeShippingMinAmount !== undefined && body.freeShippingMinAmount !== '' ? Number(body.freeShippingMinAmount) : undefined,
    };

    await writeDb(db);

    return NextResponse.json({ success: true, paymentSettings: db.paymentSettings });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
