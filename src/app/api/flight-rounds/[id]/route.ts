import { NextResponse } from 'next/server';
import { readDbAsync, writeDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// PUT update flight round (Admin only)
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'merchant') {
      return NextResponse.json({ error: 'สงวนสิทธิ์สำหรับแม่ค้าเท่านั้น' }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();
    const db = await readDbAsync();

    const roundIndex = db.flightRounds.findIndex((r) => r.id === id);
    if (roundIndex === -1) {
      return NextResponse.json({ error: 'ไม่พบรอบบินนี้' }, { status: 404 });
    }

    if (body.status === 'active') {
      db.flightRounds.forEach((r) => {
        if (r.id !== id && r.status === 'active') r.status = 'closed';
      });
    }

    db.flightRounds[roundIndex] = {
      ...db.flightRounds[roundIndex],
      ...body,
    };

    await writeDb(db);

    return NextResponse.json({ success: true, flightRound: db.flightRounds[roundIndex] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE flight round
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

    const filtered = db.flightRounds.filter((r) => r.id !== id);
    if (filtered.length === db.flightRounds.length) {
      return NextResponse.json({ error: 'ไม่พบรอบบินนี้' }, { status: 404 });
    }

    db.flightRounds = filtered;
    await writeDb(db);

    return NextResponse.json({ success: true, message: 'ลบรอบบินเรียบร้อยแล้ว' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
