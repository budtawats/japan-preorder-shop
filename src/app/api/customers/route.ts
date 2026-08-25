import { NextResponse } from 'next/server';
import { readDbAsync } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// GET all registered customers with their order stats (Admin only)
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'merchant') {
      return NextResponse.json({ error: 'สงวนสิทธิ์สำหรับแม่ค้าเท่านั้น' }, { status: 403 });
    }

    const db = await readDbAsync();

    const customers = db.users
      .filter((u) => u.role === 'customer')
      .map((cust) => {
        // Calculate order statistics for this customer
        const custOrders = db.orders.filter(
          (o) => o.userId === cust.id || o.customerPhone === cust.phone
        );
        const totalSpent = custOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
        const latestOrder = custOrders[0] || null;

        const { passwordHash, ...safeCustomer } = cust;

        return {
          ...safeCustomer,
          orderCount: custOrders.length,
          totalSpent,
          latestOrderDate: latestOrder ? latestOrder.createdAt : null,
        };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ customers });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
