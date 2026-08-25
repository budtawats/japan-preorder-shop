// Cloudflare Worker with Embedded Fullstack Frontend & Native D1 Database

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
      // ----------------------------------------------------
      // 1. REST API Endpoints (Cloudflare D1 Database)
      // ----------------------------------------------------

      // GET Products
      if (url.pathname === '/api/products') {
        const { results } = await env.DB.prepare(
          'SELECT id, name, category_id as categoryId, price, original_price as originalPrice, description, image_url as imageUrl, in_stock as inStock, stock_status as stockStatus, is_promo as isPromo, promo_tag as promoTag, created_at as createdAt FROM products ORDER BY created_at DESC'
        ).all();
        return new Response(JSON.stringify({ products: results || [] }), {
          headers: { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders },
        });
      }

      // POST Create/Update Product
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

      // GET Categories
      if (url.pathname === '/api/categories') {
        const { results } = await env.DB.prepare(
          'SELECT id, name, description, icon, display_order as displayOrder FROM categories ORDER BY display_order ASC'
        ).all();
        return new Response(JSON.stringify({ categories: results || [] }), {
          headers: { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders },
        });
      }

      // GET Flight Rounds
      if (url.pathname === '/api/flight-rounds') {
        const { results } = await env.DB.prepare(
          'SELECT id, round_name as roundName, order_close_date as orderCloseDate, return_date as returnDate, shipping_start_date as shippingStartDate, status, note, created_at as createdAt FROM flight_rounds ORDER BY created_at DESC'
        ).all();
        const activeRound = results.find((r: any) => r.status === 'active') || results[0] || null;
        return new Response(JSON.stringify({ flightRounds: results || [], activeRound }), {
          headers: { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders },
        });
      }

      // GET / POST Shop Settings
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
          { headers: { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders } }
        );
      }

      // GET Promotions
      if (url.pathname === '/api/promotions') {
        const { results } = await env.DB.prepare(
          'SELECT id, title, description, banner_url as bannerUrl, discount_type as discountType, discount_value as discountValue, code, min_spend as minSpend, is_active as isActive FROM promotions WHERE is_active = 1'
        ).all();
        return new Response(JSON.stringify({ promotions: results || [] }), {
          headers: { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders },
        });
      }

      // GET Payment Settings
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
          { headers: { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders } }
        );
      }

      // GET / POST Orders
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

      // ----------------------------------------------------
      // 2. Fullstack Frontend UI (Live Storefront & Admin)
      // ----------------------------------------------------
      const html = renderFullStorefrontHTML();
      return new Response(html, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders },
      });
    }
  },
};

function renderFullStorefrontHTML(): string {
  return `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Japan Pre-Order Shop 🇯🇵 | บริการรับหิ้วสินค้าญี่ปุ่นของแท้ 100%</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Prompt', sans-serif; }
    .animate-fadeIn { animation: fadeIn 0.2s ease-in-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
  </style>
</head>
<body class="bg-slate-50 text-gray-800 min-h-screen flex flex-col">

  <!-- Top Announcement Bar -->
  <div id="top-announcement" class="bg-rose-600 text-white text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2">
    <span class="bg-white/20 px-2 py-0.5 rounded text-[11px] font-bold">JAPAN PRE-ORDER 🇯🇵</span>
    <span id="announcement-text">รับหิ้วสินค้าญี่ปุ่นของแท้ 100% บินเอง ส่งตรงถึงบ้านคุณ</span>
  </div>

  <!-- Navbar -->
  <header class="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100 shadow-xs">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div id="shop-logo-box" class="w-10 h-10 rounded-xl bg-rose-600 text-white font-black text-xl flex items-center justify-center shadow-md">
          日
        </div>
        <div>
          <h1 id="navbar-shop-name" class="font-black text-gray-900 text-base leading-tight">Japan Pre-Order</h1>
          <p class="text-[11px] text-gray-400">สั่งซื้อง่าย • ของแท้ 100% • บินเองส่งไว</p>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <button onclick="toggleAdminView()" class="px-3 py-1.5 rounded-xl bg-gray-900 text-white hover:bg-gray-800 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5">
          <span>👑 ระบบแม่ค้า (Admin)</span>
        </button>

        <button onclick="toggleCartDrawer()" class="relative p-2.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 transition-all shadow-xs flex items-center gap-1.5">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
          <span class="text-xs font-bold">ตะกร้า</span>
          <span id="cart-badge" class="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md">0</span>
        </button>
      </div>
    </div>
  </header>

  <!-- Storefront View -->
  <main id="storefront-view" class="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 w-full">
    
    <!-- Hero & Flight Round -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center bg-gradient-to-br from-rose-50 via-orange-50/40 to-transparent p-6 sm:p-8 rounded-3xl border border-rose-100 shadow-sm">
      <div class="lg:col-span-7 space-y-3">
        <div class="inline-flex items-center gap-1.5 bg-white px-3 py-1 rounded-full border border-rose-200 text-xs font-bold text-rose-600 shadow-2xs">
          <span>✨ เปิดรับพรีออเดอร์รอบใหม่ล่าสุดจากญี่ปุ่น</span>
        </div>
        <h2 class="text-3xl sm:text-4xl font-black text-gray-900 leading-tight">
          ช้อปสินค้าญี่ปุ่นแท้ <br><span class="text-rose-600">บินเอง หิ้วสด</span> ส่งตรงถึงมือคุณ
        </h2>
        <p class="text-xs sm:text-sm text-gray-600 leading-relaxed">
          เลือกสินค้าใส่ตะกร้า โอนชำระเงินผ่าน QR Code พร้อมแนบสลิปได้ทันที แม่ค้าเช็คและอัปเดตสถานะให้ทุกขั้นตอน
        </p>
      </div>

      <!-- Flight Schedule Card -->
      <div class="lg:col-span-5 bg-white rounded-3xl p-5 border-2 border-rose-200 shadow-lg space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="p-2 bg-rose-600 text-white rounded-xl text-sm font-bold">✈️</span>
            <div>
              <span class="text-[10px] font-bold uppercase text-rose-600">รอบบินปัจจุบัน</span>
              <h3 id="round-name" class="text-sm font-bold text-gray-900">รอบบินโตเกียว & โอซาก้า 🌸</h3>
            </div>
          </div>
          <span class="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2.5 py-1 rounded-full">● เปิดรับออเดอร์</span>
        </div>

        <div class="bg-rose-50/60 rounded-2xl p-3 border border-rose-100 space-y-2 text-xs">
          <div class="flex justify-between">
            <span class="text-gray-500">ปิดรับออเดอร์:</span>
            <span id="order-close-date" class="font-bold text-gray-800">10 ก.ย. 2026</span>
          </div>
          <div class="flex justify-between bg-rose-100/70 p-1.5 rounded-xl">
            <span class="text-rose-900 font-bold">วันที่ของบินถึงไทย:</span>
            <span id="flight-return-date" class="font-black text-rose-600 text-sm">15 ก.ย. 2026</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">เริ่มส่งพัสดุในไทย:</span>
            <span id="shipping-start-date" class="font-bold text-gray-800">17 ก.ย. 2026</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Promo Banner -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div class="bg-gradient-to-r from-rose-500 to-red-500 text-white p-4 rounded-2xl shadow-md flex items-center justify-between">
        <div>
          <span class="bg-white/20 text-[10px] font-bold px-2 py-0.5 rounded">ลดทันที 50 บาท</span>
          <h4 class="font-bold text-sm mt-1">🎉 ต้อนรับรอบบินใหม่</h4>
          <p class="text-[11px] text-rose-100">ใส่โค้ด JP50 เมื่อสั่งครบ 500.-</p>
        </div>
        <button onclick="copyCode('JP50')" class="bg-white text-rose-600 font-black px-3 py-1.5 rounded-xl text-xs shadow-xs hover:bg-rose-50">
          JP50
        </button>
      </div>
      <div class="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-4 rounded-2xl shadow-md flex items-center justify-between">
        <div>
          <span class="bg-white/20 text-[10px] font-bold px-2 py-0.5 rounded">โปรโมชั่นส่งฟรี</span>
          <h4 class="font-bold text-sm mt-1">🚚 ส่งฟรีทั่วประเทศ</h4>
          <p class="text-[11px] text-amber-100">เมื่อสั่งซื้อครบ 1,000.- ขึ้นไป</p>
        </div>
        <span class="text-2xl">🎁</span>
      </div>
    </div>

    <!-- Filters & Search -->
    <div class="space-y-3">
      <div class="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <h3 class="text-xl font-black text-gray-900">สินค้าพรีออเดอร์ญี่ปุ่น</h3>
          <p class="text-xs text-gray-400">เลือกสินค้าใส่ตะกร้าและสั่งซื้อได้ทันที</p>
        </div>
        <input type="text" id="search-input" oninput="renderProducts()" placeholder="🔍 ค้นหาชื่อสินค้า, ขนม, สกินแคร์..." class="w-full sm:w-72 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-rose-500 shadow-2xs">
      </div>

      <!-- Stock Status Filter -->
      <div class="flex flex-wrap items-center gap-2 pt-1 text-xs">
        <span class="text-gray-400 font-bold mr-1">สถานะ:</span>
        <button onclick="setStockFilter('all')" id="btn-stock-all" class="px-3 py-1.5 rounded-xl font-bold bg-gray-900 text-white">ทั้งหมด</button>
        <button onclick="setStockFilter('preorder')" id="btn-stock-preorder" class="px-3 py-1.5 rounded-xl font-bold bg-white text-gray-600 hover:bg-gray-100 border border-gray-200">🎌 พรีออเดอร์ญี่ปุ่น</button>
        <button onclick="setStockFilter('in_stock')" id="btn-stock-in-stock" class="px-3 py-1.5 rounded-xl font-bold bg-white text-gray-600 hover:bg-gray-100 border border-gray-200">⚡ มีของพร้อมส่ง</button>
      </div>

      <!-- Categories Pills -->
      <div id="category-pills" class="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <!-- Injected via JS -->
      </div>
    </div>

    <!-- Product Grid -->
    <div id="product-grid" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      <div class="col-span-full text-center py-12 text-gray-400">กำลังโหลดรายการสินค้าจาก Cloudflare D1...</div>
    </div>

  </main>

  <!-- Admin View (Modal / View) -->
  <div id="admin-view" class="hidden flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 w-full">
    <div class="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-md space-y-6">
      <div class="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <h2 class="text-2xl font-black text-gray-900 flex items-center gap-2">
            <span>👑 ระบบหลังบ้านแม่ค้า (Cloudflare Admin)</span>
          </h2>
          <p class="text-xs text-gray-500">จัดการสินค้า, ตรวจสอบคำสั่งซื้อ และปรับแต่งข้อมูลร้านค้า</p>
        </div>
        <button onclick="toggleAdminView()" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold">
          ✕ ปิดหน้าต่างแม่ค้า
        </button>
      </div>

      <!-- Admin Tabs -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button onclick="showAdminTab('orders')" class="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700">
          📦 รายการคำสั่งซื้อ & สลิป
        </button>
        <button onclick="showAdminTab('products')" class="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700">
          🛍️ เพิ่ม/แก้ไขสินค้า
        </button>
        <button onclick="showAdminTab('settings')" class="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700">
          🏪 ข้อมูลร้าน, โลโก้ & ธีมสี
        </button>
      </div>

      <!-- Admin Content Area -->
      <div id="admin-content" class="space-y-4 text-xs">
        <div id="admin-orders-table">กำลังโหลดรายการออเดอร์...</div>
      </div>
    </div>
  </div>

  <!-- Cart Slide-Over Drawer -->
  <div id="cart-drawer" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs hidden justify-end">
    <div class="bg-white w-full max-w-md h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto">
      <div>
        <div class="flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 class="text-base font-black text-gray-900 flex items-center gap-2">
            <span>🛍️ ตะกร้าสินค้าของคุณ</span>
          </h3>
          <button onclick="toggleCartDrawer()" class="p-1 rounded-full hover:bg-gray-100 text-gray-400">✕</button>
        </div>
        <div id="cart-items-list" class="divide-y divide-gray-100 mt-4 max-h-[40vh] overflow-y-auto">
          <p class="text-xs text-gray-400 text-center py-8">ไม่มีสินค้าในตะกร้า</p>
        </div>
      </div>

      <div class="border-t border-gray-100 pt-4 space-y-3">
        <div class="flex justify-between text-xs text-gray-600">
          <span>ยอดรวมสินค้า:</span>
          <span id="cart-subtotal" class="font-bold text-gray-900">฿0</span>
        </div>
        <div class="flex justify-between text-sm font-black text-gray-900 border-t border-gray-100 pt-2">
          <span>ยอดชำระสุทธิ:</span>
          <span id="cart-total" class="text-rose-600 text-lg">฿0</span>
        </div>
        <button onclick="openCheckoutModal()" class="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-md transition-all">
          ดำเนินการชำระเงิน & แนบสลิป
        </button>
      </div>
    </div>
  </div>

  <!-- Checkout Modal -->
  <div id="checkout-modal" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs hidden items-center justify-center p-4">
    <div class="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
      <div class="flex justify-between items-center border-b pb-3">
        <h3 class="font-black text-base text-gray-900">ชำระเงิน & กรอกที่อยู่จัดส่ง</h3>
        <button onclick="closeCheckoutModal()" class="text-gray-400 hover:text-gray-600">✕</button>
      </div>

      <!-- Payment QR -->
      <div class="bg-rose-50/50 p-4 rounded-2xl border border-rose-100 text-center space-y-2">
        <span class="text-[11px] font-bold text-rose-700">สแกนชำระผ่าน PromptPay QR Code</span>
        <img id="checkout-qr" src="" alt="QR Code" class="w-40 h-40 mx-auto rounded-xl border bg-white p-1">
        <p class="text-xs text-gray-600">ธนาคารกสิกรไทย: <strong>123-4-56789-0</strong> (Japan Pre-Order)</p>
      </div>

      <!-- Checkout Form -->
      <form id="checkout-form" onsubmit="handlePlaceOrder(event)" class="space-y-3 text-xs">
        <div>
          <label class="block font-bold mb-1">ชื่อ - นามสกุล ผู้รับ <span class="text-rose-500">*</span></label>
          <input type="text" id="cust-name" required placeholder="เช่น สมชาย รักญี่ปุ่น" class="w-full p-2.5 bg-gray-50 border rounded-xl">
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold mb-1">เบอร์โทรศัพท์ <span class="text-rose-500">*</span></label>
            <input type="tel" id="cust-phone" required placeholder="089-999-8888" class="w-full p-2.5 bg-gray-50 border rounded-xl">
          </div>
          <div>
            <label class="block font-bold mb-1">LINE ID</label>
            <input type="text" id="cust-line" placeholder="somchai_jp" class="w-full p-2.5 bg-gray-50 border rounded-xl">
          </div>
        </div>
        <div>
          <label class="block font-bold mb-1">ที่อยู่จัดส่งสินค้า <span class="text-rose-500">*</span></label>
          <textarea id="cust-address" required rows="2" placeholder="บ้านเลขที่ ถนน แขวง เขต จังหวัด รหัสไปรษณีย์" class="w-full p-2 bg-gray-50 border rounded-xl"></textarea>
        </div>
        <button type="submit" id="btn-submit-order" class="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md transition-all text-xs">
          ยืนยันการสั่งซื้อ
        </button>
      </form>
    </div>
  </div>

  <!-- Footer -->
  <footer class="bg-white border-t border-gray-100 mt-16 py-8 text-gray-500 text-xs">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="flex items-center gap-2">
        <div class="w-6 h-6 rounded bg-rose-600 text-white font-bold flex items-center justify-center text-xs">日</div>
        <span id="footer-shop-name" class="font-bold text-gray-800">Japan Pre-Order Shop</span>
        <span>• สินค้าญี่ปุ่นของแท้ 100% บินเองหิ้วสด</span>
      </div>
      <p id="footer-contact">📞 โทร: 081-234-5678 | 💬 LINE: @japanpreorder</p>
    </div>
  </footer>

  <!-- Core Client App Logic -->
  <script>
    let allProducts = [];
    let allCategories = [];
    let cart = [];
    let selectedCat = 'all';
    let stockFilter = 'all';
    let shopSettings = {};

    async function initApp() {
      try {
        const [prodRes, catRes, roundRes, shopRes, payRes] = await Promise.all([
          fetch('/api/products').then(r => r.json()),
          fetch('/api/categories').then(r => r.json()),
          fetch('/api/flight-rounds').then(r => r.json()),
          fetch('/api/shop-settings').then(r => r.json()),
          fetch('/api/payment-settings').then(r => r.json())
        ]);

        allProducts = prodRes.products || [];
        allCategories = catRes.categories || [];
        shopSettings = shopRes.shopSettings || {};

        // Update Branding
        if (shopSettings.shopName) {
          document.getElementById('navbar-shop-name').innerText = shopSettings.shopName;
          document.getElementById('footer-shop-name').innerText = shopSettings.shopName;
        }
        if (shopSettings.topAnnouncement) {
          document.getElementById('announcement-text').innerText = shopSettings.topAnnouncement;
        }
        if (shopSettings.themeColor) {
          document.getElementById('top-announcement').style.backgroundColor = shopSettings.themeColor;
          document.getElementById('shop-logo-box').style.backgroundColor = shopSettings.themeColor;
        }
        if (shopSettings.phone || shopSettings.lineId) {
          document.getElementById('footer-contact').innerText = '📞 โทร: ' + shopSettings.phone + ' | 💬 LINE: ' + shopSettings.lineId;
        }

        // Flight round
        if (roundRes.activeRound) {
          document.getElementById('round-name').innerText = roundRes.activeRound.roundName;
          document.getElementById('order-close-date').innerText = roundRes.activeRound.orderCloseDate;
          document.getElementById('flight-return-date').innerText = roundRes.activeRound.returnDate;
          document.getElementById('shipping-start-date').innerText = roundRes.activeRound.shippingStartDate;
        }

        // Payment QR
        if (payRes.paymentSettings?.qrImageUrl) {
          document.getElementById('checkout-qr').src = payRes.paymentSettings.qrImageUrl;
        }

        renderCategories();
        renderProducts();
      } catch (err) {
        console.error('Init error:', err);
      }
    }

    function renderCategories() {
      const pills = document.getElementById('category-pills');
      let html = '<button onclick="setCatFilter(\\'all\\')" class="px-4 py-1.5 rounded-xl font-bold whitespace-nowrap text-xs ' + (selectedCat === 'all' ? 'bg-rose-600 text-white shadow-xs' : 'bg-white text-gray-600 border border-gray-200') + '">ทั้งหมด (' + allProducts.length + ')</button>';
      allCategories.forEach(cat => {
        const count = allProducts.filter(p => p.categoryId === cat.id).length;
        html += '<button onclick="setCatFilter(\\'' + cat.id + '\\')" class="px-4 py-1.5 rounded-xl font-bold whitespace-nowrap text-xs flex items-center gap-1 ' + (selectedCat === cat.id ? 'bg-rose-600 text-white shadow-xs' : 'bg-white text-gray-600 border border-gray-200') + '"><span>' + cat.icon + '</span><span>' + cat.name + '</span><span class=\"opacity-70 text-[10px]\">(' + count + ')</span></button>';
      });
      pills.innerHTML = html;
    }

    function setCatFilter(catId) {
      selectedCat = catId;
      renderCategories();
      renderProducts();
    }

    function setStockFilter(status) {
      stockFilter = status;
      document.getElementById('btn-stock-all').className = 'px-3 py-1.5 rounded-xl font-bold ' + (status === 'all' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border');
      document.getElementById('btn-stock-preorder').className = 'px-3 py-1.5 rounded-xl font-bold ' + (status === 'preorder' ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 border');
      document.getElementById('btn-stock-in-stock').className = 'px-3 py-1.5 rounded-xl font-bold ' + (status === 'in_stock' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-600 border');
      renderProducts();
    }

    function renderProducts() {
      const query = document.getElementById('search-input').value.toLowerCase();
      const filtered = allProducts.filter(p => {
        const matchCat = selectedCat === 'all' || p.categoryId === selectedCat;
        const matchStock = stockFilter === 'all' || p.stockStatus === stockFilter;
        const matchSearch = !query || p.name.toLowerCase().includes(query) || (p.description && p.description.toLowerCase().includes(query));
        return matchCat && matchStock && matchSearch;
      });

      const grid = document.getElementById('product-grid');
      if (filtered.length === 0) {
        grid.innerHTML = '<div class="col-span-full bg-white p-12 rounded-3xl border text-center text-gray-400">🔍 ไม่พบสินค้าตามเงื่อนไข</div>';
        return;
      }

      grid.innerHTML = filtered.map(p => {
        const isOutOfStock = p.stockStatus === 'out_of_stock';
        const isPreorder = p.stockStatus === 'preorder';
        const isInStock = p.stockStatus === 'in_stock';

        let badge = '';
        if (isPreorder) badge = '<span class="bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">🎌 พรีออเดอร์</span>';
        if (isInStock) badge = '<span class="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">⚡ พร้อมส่ง</span>';
        if (isOutOfStock) badge = '<span class="bg-gray-800 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">❌ สินค้าหมด</span>';

        return \`
          <div class="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between \${isOutOfStock ? 'opacity-70' : ''}">
            <div class="relative aspect-square bg-gray-50">
              <img src="\${p.imageUrl}" alt="\${p.name}" class="w-full h-full object-cover">
              <div class="absolute top-2.5 left-2.5 flex flex-col gap-1">\${badge}</div>
            </div>
            <div class="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <h4 class="font-bold text-gray-900 text-xs sm:text-sm line-clamp-2 leading-snug">\${p.name}</h4>
                <p class="text-gray-400 text-[11px] line-clamp-1 mt-1">\${p.description || ''}</p>
              </div>
              <div class="flex items-center justify-between border-t border-gray-50 pt-2">
                <div>
                  <span class="text-base font-black text-rose-600">฿\${p.price.toLocaleString()}</span>
                  \${p.originalPrice ? '<span class="text-[11px] text-gray-400 line-through ml-1">฿' + p.originalPrice.toLocaleString() + '</span>' : ''}
                </div>
                <button onclick="addToCart('\${p.id}')" \${isOutOfStock ? 'disabled' : ''} class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all \${isOutOfStock ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white border border-rose-200'}">
                  \${isOutOfStock ? 'หมด' : '+ ตะกร้า'}
                </button>
              </div>
            </div>
          </div>
        \`;
      }).join('');
    }

    function addToCart(prodId) {
      const prod = allProducts.find(p => p.id === prodId);
      if (!prod) return;
      const existing = cart.find(item => item.product.id === prodId);
      if (existing) {
        existing.quantity += 1;
      } else {
        cart.push({ product: prod, quantity: 1 });
      }
      updateCartUI();
    }

    function updateCartUI() {
      const count = cart.reduce((sum, item) => sum + item.quantity, 0);
      const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      document.getElementById('cart-badge').innerText = count;
      document.getElementById('cart-subtotal').innerText = '฿' + subtotal.toLocaleString();
      document.getElementById('cart-total').innerText = '฿' + subtotal.toLocaleString();

      const list = document.getElementById('cart-items-list');
      if (cart.length === 0) {
        list.innerHTML = '<p class="text-xs text-gray-400 text-center py-8">ไม่มีสินค้าในตะกร้า</p>';
      } else {
        list.innerHTML = cart.map((item, idx) => \`
          <div class="py-3 flex items-center justify-between text-xs">
            <div class="flex items-center gap-2">
              <img src="\${item.product.imageUrl}" class="w-10 h-10 rounded-lg object-cover">
              <div>
                <p class="font-bold text-gray-900 line-clamp-1">\${item.product.name}</p>
                <p class="text-gray-400">฿\${item.product.price.toLocaleString()} × \${item.quantity}</p>
              </div>
            </div>
            <button onclick="removeFromCart(\${idx})" class="text-red-500 font-bold hover:underline">ลบ</button>
          </div>
        \`).join('');
      }
    }

    function removeFromCart(idx) {
      cart.splice(idx, 1);
      updateCartUI();
    }

    function toggleCartDrawer() {
      const drawer = document.getElementById('cart-drawer');
      drawer.classList.toggle('hidden');
      drawer.classList.toggle('flex');
    }

    function openCheckoutModal() {
      if (cart.length === 0) {
        alert('กรุณาเลือกสินค้าใส่ตะกร้าก่อนทำรายการครับ');
        return;
      }
      toggleCartDrawer();
      const modal = document.getElementById('checkout-modal');
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }

    function closeCheckoutModal() {
      const modal = document.getElementById('checkout-modal');
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }

    async function handlePlaceOrder(e) {
      e.preventDefault();
      const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      const payload = {
        customerName: document.getElementById('cust-name').value,
        customerPhone: document.getElementById('cust-phone').value,
        customerLineId: document.getElementById('cust-line').value,
        shippingAddress: document.getElementById('cust-address').value,
        items: cart.map(i => ({ productId: i.product.id, productName: i.product.name, price: i.product.price, quantity: i.quantity, imageUrl: i.product.imageUrl })),
        subtotal: subtotal,
        totalAmount: subtotal >= 1000 ? subtotal : subtotal + 50,
        shippingFee: subtotal >= 1000 ? 0 : 50
      };

      try {
        const btn = document.getElementById('btn-submit-order');
        btn.innerText = 'กำลังบันทึกคำสั่งซื้อ...';
        btn.disabled = true;

        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          alert('🎉 บันทึกคำสั่งซื้อสำเร็จ! เลขที่ออเดอร์: ' + data.orderNumber);
          cart = [];
          updateCartUI();
          closeCheckoutModal();
        } else {
          alert('เกิดข้อผิดพลาด: ' + data.error);
        }
      } catch (err) {
        alert('เกิดข้อผิดพลาดในการสั่งซื้อ');
      } finally {
        document.getElementById('btn-submit-order').innerText = 'ยืนยันการสั่งซื้อ';
        document.getElementById('btn-submit-order').disabled = false;
      }
    }

    function copyCode(code) {
      navigator.clipboard.writeText(code);
      alert('✓ คัดลอกโค้ด ' + code + ' แล้ว!');
    }

    function toggleAdminView() {
      const storefront = document.getElementById('storefront-view');
      const admin = document.getElementById('admin-view');
      storefront.classList.toggle('hidden');
      admin.classList.toggle('hidden');
      if (!admin.classList.contains('hidden')) {
        loadAdminOrders();
      }
    }

    async function loadAdminOrders() {
      const content = document.getElementById('admin-orders-table');
      try {
        const res = await fetch('/api/orders');
        const data = await res.json();
        const orders = data.orders || [];
        if (orders.length === 0) {
          content.innerHTML = '<p class="text-gray-400 py-6 text-center">ยังไม่มีรายการสั่งซื้อ</p>';
          return;
        }
        content.innerHTML = orders.map(o => \`
          <div class="bg-gray-50 p-4 rounded-2xl border space-y-2">
            <div class="flex justify-between items-center font-bold">
              <span>ออเดอร์ #\${o.orderNumber} - \${o.customerName}</span>
              <span class="text-rose-600">฿\${o.totalAmount.toLocaleString()}</span>
            </div>
            <p class="text-gray-500">โทร: \${o.customerPhone} | ที่อยู่: \${o.shippingAddress}</p>
            <p class="text-gray-400">สถานะ: \${o.status}</p>
          </div>
        \`).join('');
      } catch (err) {
        content.innerHTML = '<p class="text-red-500">โหลดข้อมูลไม่สำเร็จ</p>';
      }
    }

    window.onload = initApp;
  </script>
</body>
</html>`;
}
