import { NextResponse } from 'next/server';
import { readDbAsync, writeDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// GET single order
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const db = await readDbAsync();
    const order = db.orders.find((o) => o.id === id || o.orderNumber === id);

    if (!order) {
      return NextResponse.json({ error: 'ไม่พบคำสั่งซื้อนี้' }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT update order (Status, Tracking Number, Payment Slip)
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    const { id } = params;
    const body = await request.json();
    const db = await readDbAsync();

    const orderIndex = db.orders.findIndex((o) => o.id === id || o.orderNumber === id);
    if (orderIndex === -1) {
      return NextResponse.json({ error: 'ไม่พบคำสั่งซื้อนี้' }, { status: 404 });
    }

    const currentOrder = db.orders[orderIndex];

    // If customer updating: only allow uploading slip
    if (user?.role === 'customer' || !user) {
      if (body.paymentSlipUrl) {
        db.orders[orderIndex] = {
          ...currentOrder,
          paymentSlipUrl: body.paymentSlipUrl,
          status: 'pending_verification',
          updatedAt: new Date().toISOString(),
        };
        await writeDb(db);
        return NextResponse.json({ success: true, order: db.orders[orderIndex] });
      }
    }

    // Merchant can update any fields (status, trackingNumber, notes)
    if (user?.role === 'merchant') {
      db.orders[orderIndex] = {
        ...currentOrder,
        ...body,
        updatedAt: new Date().toISOString(),
      };
      await writeDb(db);
      return NextResponse.json({ success: true, order: db.orders[orderIndex] });
    }

    return NextResponse.json({ error: 'ไม่มีสิทธิ์แก้ไขคำสั่งซื้อนี้' }, { status: 403 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
