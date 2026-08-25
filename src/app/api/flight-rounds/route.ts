import { NextResponse } from 'next/server';
import { readDbAsync, writeDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { FlightRound } from '@/types';

// GET flight rounds (all, or active one)
export async function GET() {
  try {
    const db = await readDbAsync();
    return NextResponse.json({
      flightRounds: db.flightRounds,
      activeRound: db.flightRounds.find((r) => r.status === 'active') || null,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST create flight round (Admin only)
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'merchant') {
      return NextResponse.json({ error: 'สงวนสิทธิ์สำหรับแม่ค้าเท่านั้น' }, { status: 403 });
    }

    const { roundName, orderCloseDate, returnDate, shippingStartDate, note, status } = await request.json();

    if (!roundName || !orderCloseDate || !returnDate || !shippingStartDate) {
      return NextResponse.json(
        { error: 'กรุณาระบุชื่อรอบบิน, วันที่ปิดรับออเดอร์, วันที่บินกลับ และวันที่เริ่มส่งของ' },
        { status: 400 }
      );
    }

    const db = await readDbAsync();

    // If new round is active, set other rounds to closed
    if (status === 'active') {
      db.flightRounds.forEach((r) => {
        if (r.status === 'active') r.status = 'closed';
      });
    }

    const newRound: FlightRound = {
      id: `round_${Date.now()}`,
      roundName: roundName.trim(),
      orderCloseDate,
      returnDate,
      shippingStartDate,
      status: status || 'active',
      note: note ? note.trim() : '',
      createdAt: new Date().toISOString(),
    };

    db.flightRounds.unshift(newRound);
    await writeDb(db);

    return NextResponse.json({ success: true, flightRound: newRound });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
