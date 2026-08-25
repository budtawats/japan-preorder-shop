import { NextResponse } from 'next/server';
import { readDbAsync, writeDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { Product, ProductStockStatus } from '@/types';

// GET all products (with optional filtering by category, search query, promo, or stockStatus)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const search = searchParams.get('search');
    const promoOnly = searchParams.get('promoOnly');
    const stockStatus = searchParams.get('stockStatus');

    const db = await readDbAsync();
    let products = [...db.products];

    if (categoryId && categoryId !== 'all') {
      products = products.filter((p) => p.categoryId === categoryId);
    }

    if (promoOnly === 'true') {
      products = products.filter((p) => p.isPromo);
    }

    if (stockStatus && stockStatus !== 'all') {
      products = products.filter((p) => (p.stockStatus || 'preorder') === stockStatus);
    }

    if (search) {
      const q = search.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.promoTag && p.promoTag.toLowerCase().includes(q))
      );
    }

    return NextResponse.json({ products });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST create product (Admin only)
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'merchant') {
      return NextResponse.json({ error: 'สงวนสิทธิ์สำหรับแม่ค้าเท่านั้น' }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      categoryId,
      price,
      originalPrice,
      description,
      imageUrl,
      inStock,
      stockStatus,
      isPromo,
      promoTag,
    } = body;

    if (!name || !categoryId || price === undefined) {
      return NextResponse.json({ error: 'กรุณากรอกชื่อสินค้า, หมวดหมู่ และราคา' }, { status: 400 });
    }

    const validStockStatus: ProductStockStatus =
      stockStatus || (inStock === false ? 'out_of_stock' : 'preorder');

    const db = readDb();
    const newProduct: Product = {
      id: `prod_${Date.now()}`,
      name: name.trim(),
      categoryId,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      description: description ? description.trim() : '',
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80',
      inStock: validStockStatus !== 'out_of_stock',
      stockStatus: validStockStatus,
      isPromo: !!isPromo,
      promoTag: promoTag ? promoTag.trim() : '',
      createdAt: new Date().toISOString(),
    };

    db.products.unshift(newProduct);
    writeDb(db);

    return NextResponse.json({ success: true, product: newProduct });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
