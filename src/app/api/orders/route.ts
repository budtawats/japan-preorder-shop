import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { Order, OrderItem } from '@/types';

// GET orders
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const flightRoundId = searchParams.get('flightRoundId');

    const db = readDb();
    let orders = [...db.orders];

    // If customer, only show their orders
    if (user?.role === 'customer') {
      orders = orders.filter((o) => o.userId === user.id || o.customerPhone === user.phone);
    } else if (!user || user.role !== 'merchant') {
      // Unauthenticated user requesting by phone number query
      const phone = searchParams.get('phone');
      if (phone) {
        orders = orders.filter((o) => o.customerPhone.replace(/\D/g, '') === phone.replace(/\D/g, ''));
      } else {
        return NextResponse.json({ orders: [] });
      }
    }

    if (status && status !== 'all') {
      orders = orders.filter((o) => o.status === status);
    }

    if (flightRoundId && flightRoundId !== 'all') {
      orders = orders.filter((o) => o.flightRoundId === flightRoundId);
    }

    if (search) {
      const q = search.toLowerCase();
      orders = orders.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.customerPhone.includes(q) ||
          o.customerLineId.toLowerCase().includes(q)
      );
    }

    // Sort newest first
    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ orders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST create order
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();
    const {
      customerName,
      customerPhone,
      customerLineId,
      shippingAddress,
      items,
      paymentSlipUrl,
      promoCode,
      note,
    } = body;

    if (!customerName || !customerPhone || !shippingAddress || !items || !items.length) {
      return NextResponse.json(
        { error: 'กรุณากรอกข้อมูลลูกค้า ที่อยู่ และเลือกสินค้าอย่างน้อย 1 ชิ้น' },
        { status: 400 }
      );
    }

    const db = readDb();

    // Calculate subtotal from current product prices
    let subtotal = 0;
    const validatedItems: OrderItem[] = [];

    for (const item of items) {
      const prod = db.products.find((p) => p.id === item.productId);
      const price = prod ? prod.price : item.price;
      const qty = Math.max(1, Number(item.quantity) || 1);
      subtotal += price * qty;

      validatedItems.push({
        productId: item.productId,
        productName: prod ? prod.name : item.productName,
        price,
        quantity: qty,
        imageUrl: prod ? prod.imageUrl : item.imageUrl,
      });
    }

    // Calculate promotion discount
    let discount = 0;
    if (promoCode) {
      const cleanCode = promoCode.trim().toUpperCase();
      const promo = db.promotions.find(
        (p) => p.isActive && p.code && p.code.toUpperCase() === cleanCode
      );
      if (promo && (!promo.minSpend || subtotal >= promo.minSpend)) {
        if (promo.discountType === 'percentage') {
          discount = Math.round((subtotal * promo.discountValue) / 100);
        } else {
          discount = promo.discountValue;
        }
      }
    }

    // Calculate shipping fee
    const paymentSettings = db.paymentSettings;
    let shippingFee = paymentSettings.shippingFee || 50;
    if (
      paymentSettings.freeShippingMinAmount &&
      subtotal >= paymentSettings.freeShippingMinAmount
    ) {
      shippingFee = 0;
    }

    const totalAmount = Math.max(0, subtotal - discount + shippingFee);

    // Get active flight round
    const activeRound = db.flightRounds.find((r) => r.status === 'active') || db.flightRounds[0];

    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `JP${todayStr}-${randomSuffix}`;

    const newOrder: Order = {
      id: `ord_${Date.now()}`,
      orderNumber,
      userId: user?.id || (user as any)?.userId || undefined,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerLineId: customerLineId ? customerLineId.trim() : '',
      shippingAddress: shippingAddress.trim(),
      items: validatedItems,
      subtotal,
      discount,
      shippingFee,
      totalAmount,
      paymentSlipUrl: paymentSlipUrl || undefined,
      status: paymentSlipUrl ? 'pending_verification' : 'pending_payment',
      flightRoundId: activeRound?.id,
      flightRoundName: activeRound?.roundName,
      note: note ? note.trim() : '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.orders.unshift(newOrder);
    writeDb(db);

    return NextResponse.json({ success: true, order: newOrder });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
