// Cloudflare Worker with Embedded Fullstack Frontend & Native D1 Database

type D1Database = any;
type Fetcher = any;
type ExecutionContext = any;

export interface Env {
  DB: D1Database;
  ASSETS?: Fetcher;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // 1. REST API Endpoints (Cloudflare D1 Database)
      if (url.pathname === '/api/products') {
        const { results } = await env.DB.prepare(
          'SELECT id, name, category_id as categoryId, price, original_price as originalPrice, description, image_url as imageUrl, in_stock as inStock, stock_status as stockStatus, is_promo as isPromo, promo_tag as promoTag, created_at as createdAt FROM products ORDER BY created_at DESC'
        ).all();
        return new Response(JSON.stringify({ products: results || [] }), {
          headers: { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders },
        });
      }

      if (url.pathname === '/api/products' && request.method === 'POST') {
        const body: any = await request.json();
        const id = body.id || 'prod_' + Date.now();
        await env.DB.prepare(`
          INSERT OR REPLACE INTO products (id, name, category_id, price, original_price, description, image_url, in_stock, stock_status, is_promo, promo_tag, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
        `).bind(
          id,
          body.name,
          body.categoryId || 'cat_snacks',
          body.price,
          body.originalPrice || null,
          body.description || '',
          body.imageUrl || 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&auto=format&fit=crop&q=80',
          body.stockStatus !== 'out_of_stock' ? 1 : 0,
          body.stockStatus || 'preorder',
          body.isPromo ? 1 : 0,
          body.promoTag || ''
        ).run();

        return new Response(JSON.stringify({ success: true, id }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      if (url.pathname === '/api/categories') {
        const { results } = await env.DB.prepare(
          'SELECT id, name, description, icon, display_order as displayOrder FROM categories ORDER BY display_order ASC'
        ).all();
        return new Response(JSON.stringify({ categories: results || [] }), {
          headers: { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders },
        });
      }

      if (url.pathname === '/api/flight-rounds') {
        const { results } = await env.DB.prepare(
          'SELECT id, round_name as roundName, order_close_date as orderCloseDate, return_date as returnDate, shipping_start_date as shippingStartDate, status, note, created_at as createdAt FROM flight_rounds ORDER BY created_at DESC'
        ).all();
        const activeRound = results.find((r: any) => r.status === 'active') || results[0] || null;
        return new Response(JSON.stringify({ flightRounds: results || [], activeRound }), {
          headers: { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders },
        });
      }

      if (url.pathname === '/api/shop-settings') {
        if (request.method === 'POST') {
          const body: any = await request.json();
          await env.DB.prepare(`
            INSERT OR REPLACE INTO shop_settings (id, shop_name, tagline, logo_url, theme_color, phone, line_id, line_url, facebook_url, instagram_url, support_hours, shop_address, top_announcement)
            VALUES ('default', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(
            body.shopName || '',
            body.tagline || '',
            body.logoUrl || '',
            body.themeColor || '#E63946',
            body.phone || '',
            body.lineId || '',
            body.lineUrl || '',
            body.facebookUrl || '',
            body.instagramUrl || '',
            body.supportHours || '',
            body.shopAddress || '',
            body.topAnnouncement || ''
          ).run();
          return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        const { results } = await env.DB.prepare('SELECT * FROM shop_settings LIMIT 1').all();
        const raw: any = results[0] || {};
        return new Response(
          JSON.stringify({
            shopSettings: {
              shopName: raw.shop_name || 'Japan Pre-Order Shop',
              tagline: raw.tagline || 'บริการรับหิ้วและสั่งซื้อสินค้าจากประเทศญี่ปุ่น ขนม เครื่องสำอาง ของแท้ 100% บินเองส่งไว',
              logoUrl: raw.logo_url || '',
              themeColor: raw.theme_color || '#E63946',
              phone: raw.phone || '081-234-5678',
              lineId: raw.line_id || '@japanpreorder',
              lineUrl: raw.line_url || 'https://line.me',
              facebookUrl: raw.facebook_url || '',
              instagramUrl: raw.instagram_url || '',
              supportHours: raw.support_hours || 'เปิดรับคำสั่งซื้อตลอด 24 ชม. • ตอบแชททุกวัน 09:00 - 22:00 น.',
              shopAddress: raw.shop_address || 'กรุงเทพมหานคร ประเทศไทย (พร้อมจัดส่งทั่วประเทศ)',
              topAnnouncement: raw.top_announcement || 'รับหิ้วสินค้าญี่ปุ่นของแท้ 100% บินเอง ส่งตรงถึงบ้านคุณ 🇯🇵',
            },
          }),
          { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      if (url.pathname === '/api/promotions') {
        const { results } = await env.DB.prepare(
          'SELECT id, title, description, banner_url as bannerUrl, discount_type as discountType, discount_value as discountValue, code, min_spend as minSpend, is_active as isActive FROM promotions WHERE is_active = 1'
        ).all();
        return new Response(JSON.stringify({ promotions: results || [] }), {
          headers: { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders },
        });
      }

      if (url.pathname === '/api/payment-settings') {
        const { results } = await env.DB.prepare('SELECT * FROM payment_settings LIMIT 1').all();
        const raw: any = results[0] || {};
        return new Response(
          JSON.stringify({
            paymentSettings: {
              promptPayNumber: raw.prompt_pay_number || '0812345678',
              promptPayName: raw.prompt_pay_name || 'Japan Pre-Order',
              bankName: raw.bank_name || 'ธนาคารกสิกรไทย',
              accountNumber: raw.account_number || '123-4-56789-0',
              accountName: raw.account_name || 'Japan Pre-Order',
              qrImageUrl: raw.qr_image_url || 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=00020101021129370016A000000677010111011300668123456785802TH53037646304',
              note: raw.note || 'เมื่อโอนเงินแล้ว กรุณาแนบรูปสลิปหลักฐานการโอนเงินเพื่อความรวดเร็วในการตรวจสอบ',
              shippingFee: raw.shipping_fee ?? 50,
              freeShippingMinAmount: raw.free_shipping_min_amount ?? 1000,
            },
          }),
          { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      if (url.pathname === '/api/orders') {
        if (request.method === 'POST') {
          const body: any = await request.json();
          const orderId = 'ord_' + Date.now();
          const orderNumber = 'JP' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + Math.floor(100 + Math.random() * 900);

          await env.DB.prepare(`
            INSERT INTO orders (id, order_number, user_id, customer_name, customer_phone, customer_line_id, shipping_address, items_json, subtotal, discount, shipping_fee, total_amount, payment_slip_url, status, flight_round_name, note, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending_verification', ?, ?, datetime('now'), datetime('now'))
          `).bind(
            orderId,
            orderNumber,
            body.userId || '',
            body.customerName || '',
            body.customerPhone || '',
            body.customerLineId || '',
            body.shippingAddress || '',
            JSON.stringify(body.items || []),
            body.subtotal || 0,
            body.discount || 0,
            body.shippingFee || 50,
            body.totalAmount || 0,
            body.paymentSlipUrl || '',
            body.flightRoundName || 'รอบบินโตเกียว & โอซาก้า 🌸',
            body.note || ''
          ).run();

          return new Response(JSON.stringify({ success: true, orderId, orderNumber }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        const { results } = await env.DB.prepare(
          'SELECT id, order_number as orderNumber, user_id as userId, customer_name as customerName, customer_phone as customerPhone, customer_line_id as customerLineId, shipping_address as shippingAddress, items_json as itemsJson, subtotal, discount, shipping_fee as shippingFee, total_amount as totalAmount, payment_slip_url as paymentSlipUrl, status, tracking_number as trackingNumber, flight_round_name as flightRoundName, note, created_at as createdAt, updated_at as updatedAt FROM orders ORDER BY created_at DESC'
        ).all();

        const formatted = results.map((r: any) => ({
          ...r,
          items: JSON.parse(r.itemsJson || '[]'),
        }));

        return new Response(JSON.stringify({ orders: formatted }), {
          headers: { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders },
        });
      }

      // 2. Fullstack Frontend UI
      return new Response('Japan Pre-Order API is live!', {
        headers: { 'Content-Type': 'text/plain; charset=utf-8', ...corsHeaders },
      });
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders },
      });
    }
  },
};
