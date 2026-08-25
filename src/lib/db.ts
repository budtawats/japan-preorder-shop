import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import {
  User,
  Category,
  Product,
  FlightRound,
  PaymentSettings,
  ShopSettings,
  Promotion,
  Order,
} from '@/types';

export interface DatabaseData {
  users: User[];
  categories: Category[];
  products: Product[];
  flightRounds: FlightRound[];
  paymentSettings: PaymentSettings;
  shopSettings: ShopSettings;
  promotions: Promotion[];
  orders: Order[];
}

const CLOUDFLARE_D1_API = 'https://japan-preorder-shop.budtawat-s.workers.dev/api/db/sync';
const isVercel = process.env.VERCEL === '1' || !!process.env.AWS_LAMBDA_FUNCTION_NAME;
const BUNDLED_DB_FILE = path.join(process.cwd(), 'data', 'db.json');
const DATA_DIR = isVercel ? '/tmp' : path.join(process.cwd(), 'data');
const DB_FILE = isVercel ? path.join('/tmp', 'db.json') : path.join(DATA_DIR, 'db.json');

try {
  if (!isVercel && !fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (e) {
  // Ignore
}

function getInitialShopSettings(): ShopSettings {
  return {
    shopName: 'KOI Japan Shop',
    tagline: 'บริการรับหิ้วและสั่งซื้อสินค้าจากประเทศญี่ปุ่น ขนม เครื่องสำอาง สกินแคร์ ฟิกเกอร์ ของแท้ 100% บินเองส่งไว',
    logoUrl: '',
    themeColor: '#E63946',
    phone: '081-234-5678',
    lineId: '@koijapanshop',
    lineUrl: 'https://line.me/ti/p/~@koijapanshop',
    facebookUrl: 'https://facebook.com/koijapanshop',
    instagramUrl: 'https://instagram.com/koijapanshop',
    supportHours: 'เปิดรับคำสั่งซื้อตลอด 24 ชม. • ตอบแชททุกวัน 09:00 - 22:00 น.',
    shopAddress: 'กรุงเทพมหานคร ประเทศไทย (พร้อมจัดส่งทั่วประเทศ)',
    topAnnouncement: 'KOI Japan Shop รับหิ้วสินค้าญี่ปุ่นของแท้ 100% บินเอง ส่งตรงถึงบ้านคุณ 🇯🇵🌸',
  };
}

function getInitialData(): DatabaseData {
  const adminPasswordHash = '$2a$10$EFLbWz/MMVX1qDTgoLisQuiqQMumSYxq2brpRLu/4P4RSib52AyBG';
  const sampleCustomerHash = '$2a$10$q4vg8eGIx.ZXrwe4kyU9nuxgksurI0mVFXYshodYZ6b8j0LBObymO';

  return {
    users: [
      {
        id: 'user_admin_01',
        username: 'admin',
        passwordHash: adminPasswordHash,
        role: 'merchant',
        fullName: 'แม่ค้าใจดี (เจ้าของร้าน)',
        phone: '081-234-5678',
        lineId: '@koijapanshop',
        address: 'ร้าน KOI Japan Shop กรุงเทพมหานคร',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'user_cust_01',
        username: 'somchai',
        passwordHash: sampleCustomerHash,
        role: 'customer',
        fullName: 'สมชาย รักญี่ปุ่น',
        phone: '089-999-8888',
        lineId: 'somchai_jp',
        address: '123/45 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110',
        createdAt: new Date().toISOString(),
      },
    ],
    categories: [
      { id: 'cat_snacks', name: 'ขนม & ของฝากญี่ปุ่น', description: 'ขนมยอดฮิต KitKat, Tokyo Banana, Shiroi Koibito', icon: '🍪', displayOrder: 1 },
      { id: 'cat_cosmetics', name: 'เครื่องสำอาง & สกินแคร์', description: 'Hada Labo, Canmake, Cezanne, Anessa', icon: '💄', displayOrder: 2 },
      { id: 'cat_vitamins', name: 'วิตามิน & อาหารเสริม', description: 'DHC, Orihiro, Meiji Collagen', icon: '💊', displayOrder: 3 },
      { id: 'cat_figures', name: 'ฟิกเกอร์ & กาชาปอง', description: 'Anime Figures, Sanrio, Disney, Gashapon', icon: '🧸', displayOrder: 4 },
      { id: 'cat_lifestyle', name: 'ของใช้ & ยาสามัญ', description: 'แผ่นแปะแก้ปวด, ยาหยอดตา Rohto, หน้ากากกันฝุ่น', icon: '🛍️', displayOrder: 5 },
    ],
    products: [
      {
        id: 'prod_01',
        name: 'Tokyo Banana ขนมเค้กกล้วยยอดฮิต (กล่อง 8 ชิ้น)',
        categoryId: 'cat_snacks',
        price: 490,
        originalPrice: 550,
        description: 'ขนมเค้กเนื้อฟูนุ่มสอดไส้ครีมคัสตาร์ดกล้วยหอมสดแท้ ของฝากอันดับ 1 จากสนามบินโตเกียว ทานเย็นๆ ยิ่งอร่อย',
        imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&auto=format&fit=crop&q=80',
        inStock: true,
        stockStatus: 'preorder',
        isPromo: true,
        promoTag: '🔥 ยอดฮิต ลดพิเศษ',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'prod_02',
        name: 'Shiroi Koibito คุกกี้ลิ้นแมวสอดไส้ไวท์ช็อกโกแลต (12 ชิ้น)',
        categoryId: 'cat_snacks',
        price: 420,
        originalPrice: 480,
        description: 'คุกกี้ระดับพรีเมียมจากฮอกไกโด แป้งกรอบหอมเนย สอดไส้ช็อกโกแลตขาวสูตรเฉพาะ ละลายในปาก',
        imageUrl: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=600&auto=format&fit=crop&q=80',
        inStock: true,
        stockStatus: 'preorder',
        isPromo: true,
        promoTag: '✨ แนะนำ',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'prod_03',
        name: 'Canmake Tokyo Cream Cheek บลัชออนเนื้อครีม เบอร์ 16',
        categoryId: 'cat_cosmetics',
        price: 290,
        originalPrice: 350,
        description: 'บลัชออนเนื้อครีมเนียนนุ่ม ให้แก้มดูมีเลือดฝาดเป็นธรรมชาติ ติดทนนานตลอดวัน กันน้ำกันเหงื่อ',
        imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80',
        inStock: true,
        stockStatus: 'in_stock',
        isPromo: false,
        promoTag: '⚡ พร้อมส่ง',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'prod_04',
        name: 'Anessa Perfect UV Sunscreen Skincare Milk SPF50+ PA++++ 60ml',
        categoryId: 'cat_cosmetics',
        price: 890,
        originalPrice: 1050,
        description: 'กันแดดเนื้อน้ำนมอันดับ 1 จากญี่ปุ่น เทคโนโลยี Auto Booster ปกป้องผิวได้ดีขึ้นเมื่อโดนเหงื่อ น้ำ และความร้อน',
        imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80',
        inStock: true,
        stockStatus: 'preorder',
        isPromo: true,
        promoTag: '☀️ ขายดีอันดับ 1',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'prod_05',
        name: 'DHC Vitamin C วิตามินซีเข้มข้น 1000mg สำหรับ 60 วัน',
        categoryId: 'cat_vitamins',
        price: 220,
        originalPrice: 280,
        description: 'ช่วยเสริมภูมิต้านทาน ผิวกระจ่างใส สุขภาพดี ทานวันละ 2 เม็ด หลังอาหารเช้า-เย็น',
        imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
        inStock: true,
        stockStatus: 'in_stock',
        isPromo: false,
        promoTag: '⚡ พร้อมส่ง',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'prod_06',
        name: 'Rohto Cool 40a ยาหยอดตาผสมวิตามิน เย็นสดชื่นระดับ 5',
        categoryId: 'cat_lifestyle',
        price: 180,
        originalPrice: 220,
        description: 'บำรุงดวงตาเหนื่อยล้าจากการจ้องจอนานๆ มีวิตามิน 4 ชนิด ช่วยให้ดวงตาสดชื่น ผ่อนคลาย',
        imageUrl: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=600&auto=format&fit=crop&q=80',
        inStock: false,
        stockStatus: 'out_of_stock',
        isPromo: false,
        promoTag: '',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'prod_07',
        name: 'ตุ๊กตาพวงกุญแจ Sanrio Chiikawa / Hachiware ลิขสิทธิ์แท้',
        categoryId: 'cat_figures',
        price: 550,
        originalPrice: 690,
        description: 'พวงกุญแจตุ๊กตาขนนุ่ม นำเข้าจากร้าน Kiddyland โตเกียว ลิขสิทธิ์แท้ 100% หายากมาก',
        imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop&q=80',
        inStock: true,
        stockStatus: 'preorder',
        isPromo: true,
        promoTag: '💖 ลิขสิทธิ์แท้',
        createdAt: new Date().toISOString(),
      },
    ],
    flightRounds: [
      {
        id: 'round_01',
        roundName: 'รอบบินโตเกียว & โอซาก้า 🌸',
        orderCloseDate: '2026-09-10',
        returnDate: '2026-09-15',
        shippingStartDate: '2026-09-17',
        status: 'active',
        note: 'แม่ค้าเดินทางไปหิ้วสินค้าด้วยตัวเอง รับประกันของแท้ทุกชิ้นจากญี่ปุ่น 100%',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'round_02',
        roundName: 'รอบบินฟุกุโอกะ 🍁 (เปิดรับล่วงหน้า)',
        orderCloseDate: '2026-10-05',
        returnDate: '2026-10-10',
        shippingStartDate: '2026-10-12',
        status: 'upcoming',
        note: 'เน้นขนมราเม็งฮากาตะ และสกินแคร์ชื่อดังจากคิวชู',
        createdAt: new Date().toISOString(),
      },
    ],
    paymentSettings: {
      promptPayNumber: '0812345678',
      promptPayName: 'KOI Japan Shop',
      bankName: 'ธนาคารกสิกรไทย (K-Bank)',
      accountNumber: '123-4-56789-0',
      accountName: 'KOI Japan Shop',
      qrImageUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=00020101021129370016A000000677010111011300668123456785802TH53037646304',
      note: 'เมื่อโอนเงินแล้ว กรุณาแนบรูปสลิปหลักฐานการโอนเงินเพื่อความรวดเร็วในการตรวจสอบและยืนยันออเดอร์',
      shippingFee: 50,
      freeShippingMinAmount: 1000,
    },
    shopSettings: getInitialShopSettings(),
    promotions: [
      {
        id: 'promo_01',
        title: '🎉 ต้อนรับรอบบินใหม่ ลดทันที 50 บาท!',
        description: 'ใส่โค้ด JP50 เมื่อสั่งซื้อครบ 500 บาทขึ้นไป',
        bannerUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&auto=format&fit=crop&q=80',
        discountType: 'fixed',
        discountValue: 50,
        code: 'JP50',
        minSpend: 500,
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'promo_02',
        title: '🚚 ส่งฟรีทั่วประเทศ เมื่อสั่งซื้อครบ 1,000 บาท',
        description: 'ไม่ต้องใช้โค้ด ระบบคำนวณส่งฟรีให้อัตโนมัติเมื่อยอดครบ 1,000 บาท',
        discountType: 'fixed',
        discountValue: 0,
        isActive: true,
        createdAt: new Date().toISOString(),
      },
    ],
    orders: [],
  };
}

export function readDb(): DatabaseData {
  try {
    if (!fs.existsSync(DB_FILE)) {
      let initial: DatabaseData;
      if (fs.existsSync(BUNDLED_DB_FILE)) {
        try {
          initial = JSON.parse(fs.readFileSync(BUNDLED_DB_FILE, 'utf-8'));
        } catch (e) {
          initial = getInitialData();
        }
      } else {
        initial = getInitialData();
      }
      try {
        fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      } catch (err) {
        // Ignore in read-only environment
      }
      return initial;
    }
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    const data: DatabaseData = JSON.parse(content);

    if (!data.shopSettings) {
      data.shopSettings = getInitialShopSettings();
    } else {
      if (!data.shopSettings.themeColor) data.shopSettings.themeColor = '#E63946';
      if (data.shopSettings.logoUrl === undefined) data.shopSettings.logoUrl = '';
    }

    if (data.products) {
      data.products.forEach((p) => {
        if (!p.stockStatus) {
          p.stockStatus = p.inStock ? 'preorder' : 'out_of_stock';
        }
      });
    }

    return data;
  } catch (error) {
    console.error('Error reading DB:', error);
    return getInitialData();
  }
}

export async function readDbAsync(): Promise<DatabaseData> {
  // Try fetching fresh data from Cloudflare D1 first
  try {
    const res = await fetch(CLOUDFLARE_D1_API, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    if (res.ok) {
      const data: DatabaseData = await res.json();
      if (data && data.users && data.users.length > 0) {
        // Cache to local file
        try {
          fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
        } catch (e) {}
        return data;
      }
    }
  } catch (err) {
    console.warn('Cloudflare D1 sync fallback to local cache:', err);
  }

  return readDb();
}

export function writeDb(data: DatabaseData): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing local DB:', error);
  }

  // Push updates to Cloudflare D1 asynchronously
  try {
    fetch(CLOUDFLARE_D1_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).catch((e) => console.warn('D1 write sync error:', e));
  } catch (err) {
    // Ignore async error
  }
}
