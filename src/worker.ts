// Cloudflare Worker entrypoint with native D1 Database integration

export interface Env {
  DB: D1Database;
  ASSETS?: Fetcher;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Set CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // 1. API: Products
      if (url.pathname === '/api/products') {
        const { results } = await env.DB.prepare(
          'SELECT id, name, category_id as categoryId, price, original_price as originalPrice, description, image_url as imageUrl, in_stock as inStock, stock_status as stockStatus, is_promo as isPromo, promo_tag as promoTag, created_at as createdAt FROM products ORDER BY created_at DESC'
        ).all();

        return new Response(JSON.stringify({ products: results || [] }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      // 2. API: Categories
      if (url.pathname === '/api/categories') {
        const { results } = await env.DB.prepare(
          'SELECT id, name, description, icon, display_order as displayOrder FROM categories ORDER BY display_order ASC'
        ).all();

        return new Response(JSON.stringify({ categories: results || [] }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      // 3. API: Flight Rounds
      if (url.pathname === '/api/flight-rounds') {
        const { results } = await env.DB.prepare(
          'SELECT id, round_name as roundName, order_close_date as orderCloseDate, return_date as returnDate, shipping_start_date as shippingStartDate, status, note, created_at as createdAt FROM flight_rounds ORDER BY created_at DESC'
        ).all();

        const activeRound = results.find((r: any) => r.status === 'active') || results[0] || null;

        return new Response(JSON.stringify({ flightRounds: results || [], activeRound }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      // 4. API: Shop Settings & Branding (Logo & Theme Color)
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
              tagline: raw.tagline || '',
              logoUrl: raw.logo_url || '',
              themeColor: raw.theme_color || '#E63946',
              phone: raw.phone || '081-234-5678',
              lineId: raw.line_id || '@japanpreorder',
              lineUrl: raw.line_url || '',
              facebookUrl: raw.facebook_url || '',
              instagramUrl: raw.instagram_url || '',
              supportHours: raw.support_hours || '',
              shopAddress: raw.shop_address || '',
              topAnnouncement: raw.top_announcement || '',
            },
          }),
          { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      // 5. API: Promotions
      if (url.pathname === '/api/promotions') {
        const { results } = await env.DB.prepare(
          'SELECT id, title, description, banner_url as bannerUrl, discount_type as discountType, discount_value as discountValue, code, min_spend as minSpend, is_active as isActive FROM promotions WHERE is_active = 1'
        ).all();

        return new Response(JSON.stringify({ promotions: results || [] }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      // 6. API: Payment Settings
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
              qrImageUrl: raw.qr_image_url || '',
              note: raw.note || '',
              shippingFee: raw.shipping_fee ?? 50,
              freeShippingMinAmount: raw.free_shipping_min_amount ?? 1000,
            },
          }),
          { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      // 7. API: Orders & Create Order
      if (url.pathname === '/api/orders') {
        if (request.method === 'POST') {
          const body: any = await request.json();
          const orderId = 'ord_' + Date.now();
          const orderNumber = 'JP' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + Math.floor(100 + Math.random() * 900);

          await env.DB.prepare(`
            INSERT INTO orders (id, order_number, user_id, customer_name, customer_phone, customer_line_id, shipping_address, items_json, subtotal, discount, shipping_fee, total_amount, payment_slip_url, status, note, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending_verification', ?, datetime('now'), datetime('now'))
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
            body.note || ''
          ).run();

          return new Response(JSON.stringify({ success: true, order: { id: orderId, orderNumber } }), {
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
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      // 8. Serve static assets if present
      if (env.ASSETS) {
        return await env.ASSETS.fetch(request);
      }

      return new Response('Japan Pre-Order API & D1 Database are active!', {
        status: 200,
        headers: { 'Content-Type': 'text/plain; charset=utf-8', ...corsHeaders },
      });
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
  },
};
