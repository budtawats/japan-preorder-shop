import { NextResponse } from 'next/server';
import { readDbAsync } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// GET all registered customers with their full orders list & item statistics (Admin only)
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
        // Find all orders for this customer (by userId, phone, or name)
        const cleanCustPhone = cust.phone.replace(/[- ]/g, '');
        const custOrders = db.orders.filter(
          (o) =>
            o.userId === cust.id ||
            (o.customerPhone && o.customerPhone.replace(/[- ]/g, '') === cleanCustPhone) ||
            o.customerName.trim().toLowerCase() === cust.fullName.trim().toLowerCase()
        ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        const totalSpent = custOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
        const latestOrder = custOrders[0] || null;

        // Breakdown stats
        const paidOrders = custOrders.filter((o) => o.status === 'paid' || o.status === 'purchased' || o.status === 'shipped' || o.status === 'completed');
        const unpaidOrders = custOrders.filter((o) => o.status === 'pending_payment' || o.status === 'pending_verification');
        const pendingPurchaseOrders = custOrders.filter((o) => o.status === 'paid');
        const purchasedOrders = custOrders.filter((o) => o.status === 'purchased' || o.status === 'shipped' || o.status === 'completed');

        const { passwordHash, ...safeCustomer } = cust;

        return {
          ...safeCustomer,
          orderCount: custOrders.length,
          totalSpent,
          latestOrderDate: latestOrder ? latestOrder.createdAt : null,
          paidCount: paidOrders.length,
          unpaidCount: unpaidOrders.length,
          purchasedCount: purchasedOrders.length,
          pendingPurchaseCount: pendingPurchaseOrders.length,
          orders: custOrders,
        };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ customers });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
