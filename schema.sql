-- Cloudflare D1 Database Schema for Japan Pre-Order Shop

DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer',
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  line_id TEXT,
  address TEXT,
  created_at TEXT NOT NULL
);

DROP TABLE IF EXISTS categories;
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  display_order INTEGER NOT NULL DEFAULT 1
);

DROP TABLE IF EXISTS products;
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category_id TEXT NOT NULL,
  price REAL NOT NULL,
  original_price REAL,
  description TEXT,
  image_url TEXT NOT NULL,
  in_stock INTEGER NOT NULL DEFAULT 1,
  stock_status TEXT NOT NULL DEFAULT 'preorder',
  is_promo INTEGER NOT NULL DEFAULT 0,
  promo_tag TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

DROP TABLE IF EXISTS flight_rounds;
CREATE TABLE flight_rounds (
  id TEXT PRIMARY KEY,
  round_name TEXT NOT NULL,
  order_close_date TEXT NOT NULL,
  return_date TEXT NOT NULL,
  shipping_start_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  note TEXT,
  created_at TEXT NOT NULL
);

DROP TABLE IF EXISTS payment_settings;
CREATE TABLE payment_settings (
  id TEXT PRIMARY KEY,
  prompt_pay_number TEXT NOT NULL,
  prompt_pay_name TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_name TEXT NOT NULL,
  qr_image_url TEXT NOT NULL,
  note TEXT,
  shipping_fee REAL NOT NULL DEFAULT 50,
  free_shipping_min_amount REAL DEFAULT 1000
);

DROP TABLE IF EXISTS shop_settings;
CREATE TABLE shop_settings (
  id TEXT PRIMARY KEY,
  shop_name TEXT NOT NULL,
  tagline TEXT,
  logo_url TEXT,
  theme_color TEXT DEFAULT '#E63946',
  phone TEXT NOT NULL,
  line_id TEXT NOT NULL,
  line_url TEXT,
  facebook_url TEXT,
  instagram_url TEXT,
  support_hours TEXT,
  shop_address TEXT,
  top_announcement TEXT
);

DROP TABLE IF EXISTS promotions;
CREATE TABLE promotions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  banner_url TEXT,
  discount_type TEXT NOT NULL DEFAULT 'fixed',
  discount_value REAL NOT NULL DEFAULT 0,
  code TEXT,
  min_spend REAL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);

DROP TABLE IF EXISTS orders;
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  user_id TEXT,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_line_id TEXT,
  shipping_address TEXT NOT NULL,
  items_json TEXT NOT NULL,
  subtotal REAL NOT NULL,
  discount REAL NOT NULL DEFAULT 0,
  shipping_fee REAL NOT NULL DEFAULT 50,
  total_amount REAL NOT NULL,
  payment_slip_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending_verification',
  tracking_number TEXT,
  flight_round_id TEXT,
  flight_round_name TEXT,
  note TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
