import { NextResponse } from 'next/server';
import { readDbAsync, writeDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// PUT update product (Admin only)
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

    const productIndex = db.products.findIndex((p) => p.id === id);
    if (productIndex === -1) {
      return NextResponse.json({ error: 'ไม่พบสินค้านี้' }, { status: 404 });
    }

    const updatedStockStatus =
      body.stockStatus ||
      (body.inStock === false ? 'out_of_stock' : db.products[productIndex].stockStatus || 'preorder');

    db.products[productIndex] = {
      ...db.products[productIndex],
      ...body,
      price: Number(body.price !== undefined ? body.price : db.products[productIndex].price),
      originalPrice: body.originalPrice !== undefined ? (body.originalPrice ? Number(body.originalPrice) : undefined) : db.products[productIndex].originalPrice,
      stockStatus: updatedStockStatus,
      inStock: updatedStockStatus !== 'out_of_stock',
    };

    await writeDb(db);

    return NextResponse.json({ success: true, product: db.products[productIndex] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE product (Admin only)
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

    const filtered = db.products.filter((p) => p.id !== id);
    if (filtered.length === db.products.length) {
      return NextResponse.json({ error: 'ไม่พบสินค้านี้' }, { status: 404 });
    }

    db.products = filtered;
    await writeDb(db);

    return NextResponse.json({ success: true, message: 'ลบสินค้าเรียบร้อยแล้ว' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
