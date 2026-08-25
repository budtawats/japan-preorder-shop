import { NextResponse } from 'next/server';
import { readDbAsync, writeDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// PUT update promotion
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

    const promoIndex = db.promotions.findIndex((p) => p.id === id);
    if (promoIndex === -1) {
      return NextResponse.json({ error: 'ไม่พบโปรโมชั่นนี้' }, { status: 404 });
    }

    db.promotions[promoIndex] = {
      ...db.promotions[promoIndex],
      ...body,
      discountValue: Number(body.discountValue ?? db.promotions[promoIndex].discountValue),
      code: body.code ? body.code.trim().toUpperCase() : undefined,
    };

    await writeDb(db);

    return NextResponse.json({ success: true, promotion: db.promotions[promoIndex] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE promotion
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

    const filtered = db.promotions.filter((p) => p.id !== id);
    if (filtered.length === db.promotions.length) {
      return NextResponse.json({ error: 'ไม่พบโปรโมชั่นนี้' }, { status: 404 });
    }

    db.promotions = filtered;
    await writeDb(db);

    return NextResponse.json({ success: true, message: 'ลบโปรโมชั่นเรียบร้อยแล้ว' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
