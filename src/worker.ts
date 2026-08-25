// Cloudflare Worker D1 Database API Engine for KOI Japan Shop

export interface Env {
  DB: any;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
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
      // ----------------------------------------------------
      // 1. SYNC ALL DB DATA (GET & POST)
      // ----------------------------------------------------
      if (url.pathname === '/api/db/sync') {
        if (request.method === 'POST') {
          const body: any = await request.json();

          // 1. USERS SYNC
          if (body.users && Array.isArray(body.users)) {
            for (const u of body.users) {
              await env.DB.prepare(`
                INSERT OR REPLACE INTO users (id, username, password_hash, role, full_name, phone, line_id, address, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
              `).bind(
                u.id,
                u.username,
                u.passwordHash || u.password_hash || '',
                u.role || 'customer',
                u.fullName || u.full_name || '',
                u.phone || '',
                u.lineId || u.line_id || '',
                u.address || '',
                u.createdAt || u.created_at || new Date().toISOString()
              ).run();
            }
          }

          // 2. CATEGORIES SYNC
          if (body.categories && Array.isArray(body.categories)) {
            await env.DB.prepare('DELETE FROM categories').run();
            for (const c of body.categories) {
              await env.DB.prepare(`
                INSERT INTO categories (id, name, description, icon, display_order)
                VALUES (?, ?, ?, ?, ?)
              `).bind(
                c.id,
                c.name || '',
                c.description || '',
                c.icon || '🛍️',
                c.displayOrder || 1
              ).run();
            }
          }

          // 3. PRODUCTS SYNC
          if (body.products && Array.isArray(body.products)) {
            await env.DB.prepare('DELETE FROM products').run();
            for (const p of body.products) {
              await env.DB.prepare(`
                INSERT INTO products (id, name, category_id, price, original_price, description, image_url, in_stock, stock_status, is_promo, promo_tag, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              `).bind(
                p.id,
                p.name || '',
                p.categoryId || 'cat_snacks',
                Number(p.price) || 0,
                p.originalPrice ? Number(p.originalPrice) : null,
                p.description || '',
                p.imageUrl || '',
                p.inStock ? 1 : 0,
                p.stockStatus || (p.inStock ? 'preorder' : 'out_of_stock'),
                p.isPromo ? 1 : 0,
                p.promoTag || '',
                p.createdAt || new Date().toISOString()
              ).run();
            }
          }

          // 4. FLIGHT ROUNDS SYNC
          if (body.flightRounds && Array.isArray(body.flightRounds)) {
            await env.DB.prepare('DELETE FROM flight_rounds').run();
            for (const r of body.flightRounds) {
              await env.DB.prepare(`
                INSERT INTO flight_rounds (id, round_name, order_close_date, return_date, shipping_start_date, status, note, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
              `).bind(
                r.id,
                r.roundName || '',
                r.orderCloseDate || '',
                r.returnDate || '',
                r.shippingStartDate || '',
                r.status || 'active',
                r.note || '',
                r.createdAt || new Date().toISOString()
              ).run();
            }
          }

          // 5. PROMOTIONS SYNC
          if (body.promotions && Array.isArray(body.promotions)) {
            await env.DB.prepare('DELETE FROM promotions').run();
            for (const pr of body.promotions) {
              await env.DB.prepare(`
                INSERT INTO promotions (id, title, description, banner_url, discount_type, discount_value, code, min_spend, is_active, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              `).bind(
                pr.id,
                pr.title || '',
                pr.description || '',
                pr.bannerUrl || '',
                pr.discountType || 'fixed',
                Number(pr.discountValue) || 0,
                pr.code || '',
                Number(pr.minSpend) || 0,
                pr.isActive ? 1 : 0,
                pr.createdAt || new Date().toISOString()
              ).run();
            }
          }

          // 6. PAYMENT SETTINGS SYNC
          if (body.paymentSettings) {
            const pay = body.paymentSettings;
            await env.DB.prepare('DELETE FROM payment_settings').run();
            await env.DB.prepare(`
              INSERT INTO payment_settings (id, prompt_pay_number, prompt_pay_name, bank_name, account_number, account_name, qr_image_url, note, shipping_fee, free_shipping_min_amount)
              VALUES ('default', ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).bind(
              pay.promptPayNumber || '',
              pay.promptPayName || '',
              pay.bankName || '',
              pay.accountNumber || '',
              pay.accountName || '',
              pay.qrImageUrl || '',
              pay.note || '',
              Number(pay.shippingFee) || 50,
              pay.freeShippingMinAmount !== undefined ? Number(pay.freeShippingMinAmount) : 1000
            ).run();
          }

          // 7. SHOP SETTINGS SYNC
          if (body.shopSettings) {
            const s = body.shopSettings;
            await env.DB.prepare('DELETE FROM shop_settings').run();
            await env.DB.prepare(`
              INSERT INTO shop_settings (id, shop_name, tagline, logo_url, theme_color, phone, line_id, line_url, facebook_url, instagram_url, support_hours, shop_address, top_announcement)
              VALUES ('default', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).bind(
              s.shopName || 'KOI Japan Shop',
              s.tagline || '',
              s.logoUrl || '',
              s.themeColor || '#E63946',
              s.phone || '',
              s.lineId || '',
              s.lineUrl || '',
              s.facebookUrl || '',
              s.instagramUrl || '',
              s.supportHours || '',
              s.shopAddress || '',
              s.topAnnouncement || ''
            ).run();
          }

          // 8. ORDERS SYNC
          if (body.orders && Array.isArray(body.orders)) {
            for (const o of body.orders) {
              await env.DB.prepare(`
                INSERT OR REPLACE INTO orders (id, order_number, user_id, customer_name, customer_phone, customer_line_id, shipping_address, items_json, subtotal, discount, shipping_fee, total_amount, payment_slip_url, status, tracking_number, flight_round_id, flight_round_name, note, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              `).bind(
                o.id,
                o.orderNumber,
                o.userId || null,
                o.customerName || '',
                o.customerPhone || '',
                o.customerLineId || '',
                o.shippingAddress || '',
                JSON.stringify(o.items || []),
                Number(o.subtotal) || 0,
                Number(o.discount) || 0,
                Number(o.shippingFee) || 0,
                Number(o.totalAmount) || 0,
                o.paymentSlipUrl || null,
                o.status || 'pending_verification',
                o.trackingNumber || null,
                o.flightRoundId || null,
                o.flightRoundName || null,
                o.note || '',
                o.createdAt || new Date().toISOString(),
                o.updatedAt || new Date().toISOString()
              ).run();
            }
          }

          return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        // Fetch entire database state from D1
        const [usersRes, catRes, prodRes, roundRes, payRes, shopRes, promoRes, ordRes] = await Promise.all([
          env.DB.prepare('SELECT id, username, password_hash as passwordHash, role, full_name as fullName, phone, line_id as lineId, address, created_at as createdAt FROM users').all(),
          env.DB.prepare('SELECT id, name, description, icon, display_order as displayOrder FROM categories ORDER BY display_order ASC').all(),
          env.DB.prepare('SELECT id, name, category_id as categoryId, price, original_price as originalPrice, description, image_url as imageUrl, in_stock as inStock, stock_status as stockStatus, is_promo as isPromo, promo_tag as promoTag, created_at as createdAt FROM products ORDER BY created_at DESC').all(),
          env.DB.prepare('SELECT id, round_name as roundName, order_close_date as orderCloseDate, return_date as returnDate, shipping_start_date as shippingStartDate, status, note, created_at as createdAt FROM flight_rounds ORDER BY created_at DESC').all(),
          env.DB.prepare('SELECT * FROM payment_settings LIMIT 1').all(),
          env.DB.prepare('SELECT * FROM shop_settings LIMIT 1').all(),
          env.DB.prepare('SELECT id, title, description, banner_url as bannerUrl, discount_type as discountType, discount_value as discountValue, code, min_spend as minSpend, is_active as isActive, created_at as createdAt FROM promotions').all(),
          env.DB.prepare('SELECT id, order_number as orderNumber, user_id as userId, customer_name as customerName, customer_phone as customerPhone, customer_line_id as customerLineId, shipping_address as shippingAddress, items_json as itemsJson, subtotal, discount, shipping_fee as shippingFee, total_amount as totalAmount, payment_slip_url as paymentSlipUrl, status, tracking_number as trackingNumber, flight_round_id as flightRoundId, flight_round_name as flightRoundName, note, created_at as createdAt, updated_at as updatedAt FROM orders ORDER BY created_at DESC').all(),
        ]);

        const rawShop = shopRes.results?.[0] || {};
        const rawPay = payRes.results?.[0] || {};

        const fullData = {
          users: usersRes.results || [],
          categories: catRes.results || [],
          products: (prodRes.results || []).map((p: any) => ({
            ...p,
            inStock: Boolean(p.inStock),
            isPromo: Boolean(p.isPromo),
          })),
          flightRounds: roundRes.results || [],
          paymentSettings: {
            promptPayNumber: rawPay.prompt_pay_number !== undefined ? rawPay.prompt_pay_number : '0812345678',
            promptPayName: rawPay.prompt_pay_name !== undefined ? rawPay.prompt_pay_name : 'KOI Japan Shop',
            bankName: rawPay.bank_name !== undefined ? rawPay.bank_name : 'ธนาคารกสิกรไทย (K-Bank)',
            accountNumber: rawPay.account_number !== undefined ? rawPay.account_number : '123-4-56789-0',
            accountName: rawPay.account_name !== undefined ? rawPay.account_name : 'KOI Japan Shop',
            qrImageUrl: rawPay.qr_image_url || 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=00020101021129370016A000000677010111011300668123456785802TH53037646304',
            note: rawPay.note !== undefined ? rawPay.note : 'เมื่อโอนเงินแล้ว กรุณาแนบรูปสลิปหลักฐานการโอนเงินเพื่อความรวดเร็วในการตรวจสอบ',
            shippingFee: rawPay.shipping_fee ?? 50,
            freeShippingMinAmount: rawPay.free_shipping_min_amount ?? 1000,
          },
          shopSettings: {
            shopName: rawShop.shop_name || 'KOI Japan Shop',
            tagline: rawShop.tagline || 'บริการรับหิ้วและสั่งซื้อสินค้าจากประเทศญี่ปุ่น ขนม เครื่องสำอาง สกินแคร์ ฟิกเกอร์ ของแท้ 100% บินเองส่งไว',
            logoUrl: rawShop.logo_url || '',
            themeColor: rawShop.theme_color || '#E63946',
            phone: rawShop.phone || '081-234-5678',
            lineId: rawShop.line_id || '@koijapanshop',
            lineUrl: rawShop.line_url || 'https://line.me/ti/p/~@koijapanshop',
            facebookUrl: rawShop.facebook_url || 'https://facebook.com/koijapanshop',
            instagramUrl: rawShop.instagram_url || 'https://instagram.com/koijapanshop',
            supportHours: rawShop.support_hours || 'เปิดรับคำสั่งซื้อตลอด 24 ชม. • ตอบแชททุกวัน 09:00 - 22:00 น.',
            shopAddress: rawShop.shop_address || 'กรุงเทพมหานคร ประเทศไทย (พร้อมจัดส่งทั่วประเทศ)',
            topAnnouncement: rawShop.top_announcement || 'KOI Japan Shop รับหิ้วสินค้าญี่ปุ่นของแท้ 100% บินเอง ส่งตรงถึงบ้านคุณ 🇯🇵🌸',
          },
          promotions: (promoRes.results || []).map((pr: any) => ({
            ...pr,
            isActive: Boolean(pr.isActive),
          })),
          orders: (ordRes.results || []).map((o: any) => ({
            ...o,
            items: JSON.parse(o.itemsJson || '[]'),
          })),
        };

        return new Response(JSON.stringify(fullData), {
          headers: { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders },
        });
      }

      // ----------------------------------------------------
      // 2. USER REGISTER / UPDATE / PASSWORD
      // ----------------------------------------------------
      if (url.pathname === '/api/users/save' && request.method === 'POST') {
        const u: any = await request.json();
        await env.DB.prepare(`
          INSERT OR REPLACE INTO users (id, username, password_hash, role, full_name, phone, line_id, address, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          u.id,
          u.username,
          u.passwordHash || u.password_hash || '',
          u.role || 'customer',
          u.fullName || u.full_name || '',
          u.phone || '',
          u.lineId || u.line_id || '',
          u.address || '',
          u.createdAt || u.created_at || new Date().toISOString()
        ).run();

        return new Response(JSON.stringify({ success: true, user: u }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      return new Response(JSON.stringify({ status: 'Cloudflare D1 Backend Live' }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
  },
};
