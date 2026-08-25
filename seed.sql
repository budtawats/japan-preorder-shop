-- Cloudflare D1 Seed Data for Japan Pre-Order Shop

-- Admin and Customer accounts
INSERT OR REPLACE INTO users (id, username, password_hash, role, full_name, phone, line_id, address, created_at)
VALUES 
  ('user_admin_01', 'admin', '$2a$10$7Z2P1Q8Qj4m3QYkQZpP2OuG4lI3kP5n6Q7r8S9t0U1v2W3x4Y5z6A', 'merchant', 'แม่ค้าใจดี (เจ้าของร้าน)', '081-234-5678', '@japanpreorder', 'ร้าน Japan Pre-Order Shop กรุงเทพมหานคร', datetime('now')),
  ('user_cust_01', 'somchai', '$2a$10$8A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6B', 'customer', 'สมชาย รักญี่ปุ่น', '089-999-8888', 'somchai_jp', '123/45 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110', datetime('now'));

-- Categories
INSERT OR REPLACE INTO categories (id, name, description, icon, display_order)
VALUES 
  ('cat_snacks', 'ขนม & ของฝากญี่ปุ่น', 'ขนมยอดฮิต KitKat, Tokyo Banana, Shiroi Koibito', '🍪', 1),
  ('cat_cosmetics', 'เครื่องสำอาง & สกินแคร์', 'Hada Labo, Canmake, Cezanne, Anessa', '💄', 2),
  ('cat_vitamins', 'วิตามิน & อาหารเสริม', 'DHC, Orihiro, Meiji Collagen', '💊', 3),
  ('cat_figures', 'ฟิกเกอร์ & กาชาปอง', 'Anime Figures, Sanrio, Disney, Gashapon', '🧸', 4),
  ('cat_lifestyle', 'ของใช้ & ยาสามัญ', 'แผ่นแปะแก้ปวด, ยาหยอดตา Rohto, หน้ากากกันฝุ่น', '🛍️', 5);

-- Products
INSERT OR REPLACE INTO products (id, name, category_id, price, original_price, description, image_url, in_stock, stock_status, is_promo, promo_tag, created_at)
VALUES 
  ('prod_01', 'Tokyo Banana ขนมเค้กกล้วยยอดฮิต (กล่อง 8 ชิ้น)', 'cat_snacks', 490, 550, 'ขนมเค้กเนื้อฟูนุ่มสอดไส้ครีมคัสตาร์ดกล้วยหอมสดแท้ ของฝากอันดับ 1 จากสนามบินโตเกียว', 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&auto=format&fit=crop&q=80', 1, 'preorder', 1, '🔥 ยอดฮิต ลดพิเศษ', datetime('now')),
  ('prod_02', 'Shiroi Koibito คุกกี้ลิ้นแมวสอดไส้ไวท์ช็อกโกแลต (12 ชิ้น)', 'cat_snacks', 420, 480, 'คุกกี้ระดับพรีเมียมจากฮอกไกโด แป้งกรอบหอมเนย สอดไส้ช็อกโกแลตขาวสูตรเฉพาะ', 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=600&auto=format&fit=crop&q=80', 1, 'preorder', 1, '✨ แนะนำ', datetime('now')),
  ('prod_03', 'Canmake Tokyo Cream Cheek บลัชออนเนื้อครีม เบอร์ 16', 'cat_cosmetics', 290, 350, 'บลัชออนเนื้อครีมเนียนนุ่ม ให้แก้มดูมีเลือดฝาดเป็นธรรมชาติ ติดทนนาน', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80', 1, 'in_stock', 0, '⚡ พร้อมส่ง', datetime('now')),
  ('prod_04', 'Anessa Perfect UV Sunscreen Skincare Milk SPF50+ PA++++ 60ml', 'cat_cosmetics', 890, 1050, 'กันแดดเนื้อน้ำนมอันดับ 1 จากญี่ปุ่น ปกป้องผิวได้ดีเยี่ยม', 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80', 1, 'preorder', 1, '☀️ ขายดีอันดับ 1', datetime('now')),
  ('prod_05', 'DHC Vitamin C วิตามินซีเข้มข้น 1000mg สำหรับ 60 วัน', 'cat_vitamins', 220, 280, 'ช่วยเสริมภูมิต้านทาน ป้องกันหวัด บำรุงผิวพรรณให้กระจ่างใส', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80', 1, 'in_stock', 0, '⚡ พร้อมส่ง', datetime('now')),
  ('prod_06', 'Rohto Cool 40a ยาหยอดตาผสมวิตามิน เย็นสดชื่น ระดับ 5', 'cat_lifestyle', 180, 220, 'น้ำตาเทียมและยาหยอดตาผสมวิตามิน 4 ชนิด ช่วยบำรุงสายตา', 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=600&auto=format&fit=crop&q=80', 0, 'out_of_stock', 0, '', datetime('now')),
  ('prod_07', 'พวงกุญแจตุ๊กตา Sanrio Chiikawa / Hachiware ลิขสิทธิ์แท้', 'cat_figures', 550, 690, 'ตุ๊กตาห้อยกระเป๋าน่ารักสุดฮิตจากญี่ปุ่น ลิขสิทธิ์แท้ 100%', 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop&q=80', 1, 'preorder', 1, '🎌 ลิขสิทธิ์แท้ญี่ปุ่น', datetime('now'));

-- Flight Rounds
INSERT OR REPLACE INTO flight_rounds (id, round_name, order_close_date, return_date, shipping_start_date, status, note, created_at)
VALUES 
  ('round_01', 'รอบบินโตเกียว & โอซาก้า 🌸', '2026-09-10', '2026-09-15', '2026-09-17', 'active', 'แม่ค้าบินไปหิ้วด้วยตัวเอง การันตีของแท้ 100% จากช็อปญี่ปุ่น', datetime('now'));

-- Payment Settings
INSERT OR REPLACE INTO payment_settings (id, prompt_pay_number, prompt_pay_name, bank_name, account_number, account_name, qr_image_url, note, shipping_fee, free_shipping_min_amount)
VALUES 
  ('default', '0812345678', 'น.ส. สุชาวดี (Japan Pre-Order)', 'ธนาคารกสิกรไทย (K-Bank)', '123-4-56789-0', 'น.ส. สุชาวดี มีโชค', 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=00020101021129370016A000000677010111011300668123456785802TH53037646304', 'เมื่อโอนเงินแล้ว กรุณาแนบรูปสลิปหลักฐานการโอนเงินเพื่อความรวดเร็วในการตรวจสอบ', 50, 1000);

-- Shop Settings
INSERT OR REPLACE INTO shop_settings (id, shop_name, tagline, logo_url, theme_color, phone, line_id, line_url, facebook_url, instagram_url, support_hours, shop_address, top_announcement)
VALUES 
  ('default', 'Japan Pre-Order Shop', 'บริการรับหิ้วและสั่งซื้อสินค้าจากประเทศญี่ปุ่น ขนม เครื่องสำอาง สกินแคร์ ฟิกเกอร์ ของแท้ 100% บินเองส่งไว', '', '#E63946', '081-234-5678', '@japanpreorder', 'https://line.me/ti/p/~@japanpreorder', 'https://facebook.com/japanpreordershop', 'https://instagram.com/japanpreordershop', 'เปิดรับคำสั่งซื้อตลอด 24 ชม. • ตอบแชททุกวัน 09:00 - 22:00 น.', 'กรุงเทพมหานคร ประเทศไทย (พร้อมจัดส่งทั่วประเทศ)', 'รับหิ้วสินค้าญี่ปุ่นของแท้ 100% บินเอง ส่งตรงถึงบ้านคุณ 🇯🇵');

-- Promotions
INSERT OR REPLACE INTO promotions (id, title, description, banner_url, discount_type, discount_value, code, min_spend, is_active, created_at)
VALUES 
  ('promo_01', '🎉 ต้อนรับรอบบินใหม่ ลดทันที 50 บาท!', 'ใส่โค้ด JP50 เมื่อสั่งซื้อครบ 500 บาทขึ้นไป', 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&auto=format&fit=crop&q=80', 'fixed', 50, 'JP50', 500, 1, datetime('now')),
  ('promo_02', '🚚 ส่งฟรีทั่วประเทศ เมื่อสั่งซื้อครบ 1,000 บาท', 'ไม่ต้องใช้โค้ด ระบบคำนวณส่งฟรีให้อัตโนมัติเมื่อยอดครบ 1,000 บาท', '', 'fixed', 0, NULL, 0, 1, datetime('now'));
