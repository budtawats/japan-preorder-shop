import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { Promotion } from '@/types';

// GET all promotions
export async function GET() {
  try {
    const db = readDb();
    return NextResponse.json({ promotions: db.promotions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST create promotion (Admin only)
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'merchant') {
      return NextResponse.json({ error: 'สงวนสิทธิ์สำหรับแม่ค้าเท่านั้น' }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, bannerUrl, discountType, discountValue, code, minSpend, isActive } = body;

    if (!title) {
      return NextResponse.json({ error: 'กรุณาระบุชื่อโปรโมชั่น' }, { status: 400 });
    }

    const db = readDb();
    const newPromo: Promotion = {
      id: `promo_${Date.now()}`,
      title: title.trim(),
      description: description ? description.trim() : '',
      bannerUrl: bannerUrl || '',
      discountType: discountType || 'fixed',
      discountValue: Number(discountValue || 0),
      code: code ? code.trim().toUpperCase() : undefined,
      minSpend: minSpend ? Number(minSpend) : 0,
      isActive: isActive !== undefined ? isActive : true,
      createdAt: new Date().toISOString(),
    };

    db.promotions.unshift(newPromo);
    writeDb(db);

    return NextResponse.json({ success: true, promotion: newPromo });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
