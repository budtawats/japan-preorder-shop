import { NextResponse } from 'next/server';
import { readDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'merchant') {
      return NextResponse.json({ error: 'สงวนสิทธิ์สำหรับแม่ค้าเท่านั้น' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const flightRoundId = searchParams.get('flightRoundId');

    const db = readDb();

    // Filter active orders that are paid or pending verification or purchased
    let relevantOrders = db.orders.filter(
      (o) => o.status === 'paid' || o.status === 'pending_verification' || o.status === 'purchased'
    );

    if (flightRoundId && flightRoundId !== 'all') {
      relevantOrders = relevantOrders.filter((o) => o.flightRoundId === flightRoundId);
    }

    // Map: productId -> aggregated info
    const itemsMap = new Map<
      string,
      {
        productId: string;
        productName: string;
        imageUrl: string;
        categoryName: string;
        totalQuantity: number;
        customers: { customerName: string; phone: string; quantity: number; orderNumber: string }[];
      }
    >();

    for (const order of relevantOrders) {
      for (const item of order.items) {
        const prod = db.products.find((p) => p.id === item.productId);
        const cat = prod ? db.categories.find((c) => c.id === prod.categoryId) : null;
        const categoryName = cat ? cat.name : 'ทั่วไป';

        if (!itemsMap.has(item.productId)) {
          itemsMap.set(item.productId, {
            productId: item.productId,
            productName: item.productName,
            imageUrl: item.imageUrl,
            categoryName,
            totalQuantity: 0,
            customers: [],
          });
        }

        const entry = itemsMap.get(item.productId)!;
        entry.totalQuantity += item.quantity;
        entry.customers.push({
          customerName: order.customerName,
          phone: order.customerPhone,
          quantity: item.quantity,
          orderNumber: order.orderNumber,
        });
      }
    }

    const buyingList = Array.from(itemsMap.values()).sort(
      (a, b) => b.totalQuantity - a.totalQuantity
    );

    return NextResponse.json({
      buyingList,
      totalItemsCount: buyingList.reduce((sum, item) => sum + item.totalQuantity, 0),
      totalOrdersCount: relevantOrders.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
