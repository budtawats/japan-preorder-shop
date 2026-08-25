import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { Category } from '@/types';

// GET all categories
export async function GET() {
  try {
    const db = readDb();
    const categories = db.categories.sort((a, b) => a.displayOrder - b.displayOrder);
    return NextResponse.json({ categories });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST create or update categories (Admin only)
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'merchant') {
      return NextResponse.json({ error: 'สงวนสิทธิ์สำหรับแม่ค้าเท่านั้น' }, { status: 403 });
    }

    const { name, description, icon } = await request.json();
    if (!name) {
      return NextResponse.json({ error: 'กรุณากรอกชื่อหมวดหมู่' }, { status: 400 });
    }

    const db = readDb();
    const newCat: Category = {
      id: `cat_${Date.now()}`,
      name: name.trim(),
      description: description ? description.trim() : '',
      icon: icon || '🏷️',
      displayOrder: db.categories.length + 1,
    };

    db.categories.push(newCat);
    writeDb(db);

    return NextResponse.json({ success: true, category: newCat });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
