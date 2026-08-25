import { NextResponse } from 'next/server';
import { readDbAsync, writeDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// GET Japan Buying Checklist with aggregated quantities and purchase status
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'merchant') {
      return NextResponse.json({ error: 'สงวนสิทธิ์สำหรับแม่ค้าเท่านั้น' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const flightRoundId = searchParams.get('flightRoundId');

    const db = await readDbAsync();

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
        purchasedQuantity: number;
        isPurchased: boolean;
        customers: { customerName: string; phone: string; quantity: number; orderNumber: string; isPurchased?: boolean }[];
      }
    >();

    for (const order of relevantOrders) {
      for (const item of (order.items || [])) {
        const prod = db.products.find((p) => p.id === item.productId);
        const cat = prod ? db.categories.find((c) => c.id === prod.categoryId) : null;
        const categoryName = cat ? cat.name : 'ทั่วไป';

        if (!itemsMap.has(item.productId)) {
          itemsMap.set(item.productId, {
            productId: item.productId,
            productName: item.productName,
            imageUrl: item.imageUrl || (prod ? prod.imageUrl : ''),
            categoryName,
            totalQuantity: 0,
            purchasedQuantity: 0,
            isPurchased: false,
            customers: [],
          });
        }

        const entry = itemsMap.get(item.productId)!;
        entry.totalQuantity += item.quantity;
        if (item.isPurchased) {
          entry.purchasedQuantity += item.quantity;
        }

        entry.customers.push({
          customerName: order.customerName,
          phone: order.customerPhone,
          quantity: item.quantity,
          orderNumber: order.orderNumber,
          isPurchased: item.isPurchased,
        });
      }
    }

    // Determine if product is fully purchased
    const buyingList = Array.from(itemsMap.values()).map((item) => ({
      ...item,
      isPurchased: item.totalQuantity > 0 && item.purchasedQuantity >= item.totalQuantity,
    })).sort((a, b) => b.totalQuantity - a.totalQuantity);

    const totalItemsCount = buyingList.reduce((sum, item) => sum + item.totalQuantity, 0);
    const boughtItemsCount = buyingList.filter((item) => item.isPurchased).length;

    return NextResponse.json({
      buyingList,
      totalItemsCount,
      boughtItemsCount,
      totalOrdersCount: relevantOrders.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST toggle/update purchase status of a product across all active orders
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'merchant') {
      return NextResponse.json({ error: 'สงวนสิทธิ์สำหรับแม่ค้าเท่านั้น' }, { status: 403 });
    }

    const body = await request.json();
    const { productId, isPurchased } = body;

    if (!productId) {
      return NextResponse.json({ error: 'ระบุ productId' }, { status: 400 });
    }

    const db = await readDbAsync();

    // Update all active orders containing this product
    let updatedOrdersCount = 0;
    for (const order of db.orders) {
      if (order.status !== 'cancelled' && Array.isArray(order.items)) {
        let hasModified = false;
        order.items = order.items.map((it) => {
          if (it.productId === productId) {
            hasModified = true;
            return { ...it, isPurchased: Boolean(isPurchased) };
          }
          return it;
        });

        if (hasModified) {
          updatedOrdersCount++;
        }
      }
    }

    await writeDb(db);

    return NextResponse.json({
      success: true,
      productId,
      isPurchased: Boolean(isPurchased),
      updatedOrdersCount,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
