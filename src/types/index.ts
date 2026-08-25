export type UserRole = 'merchant' | 'customer';

export type ProductStockStatus = 'preorder' | 'in_stock' | 'out_of_stock';

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  role: UserRole;
  fullName: string;
  phone: string;
  lineId?: string;
  address?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  displayOrder: number;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  price: number;
  originalPrice?: number;
  description: string;
  imageUrl: string;
  inStock: boolean;
  stockStatus: ProductStockStatus;
  isPromo?: boolean;
  promoTag?: string;
  createdAt: string;
}

export interface FlightRound {
  id: string;
  roundName: string;
  orderCloseDate: string;
  returnDate: string;
  shippingStartDate: string;
  status: 'active' | 'closed' | 'completed';
  note?: string;
  createdAt: string;
}

export interface PaymentSettings {
  promptPayNumber: string;
  promptPayName: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  qrImageUrl: string;
  note?: string;
  shippingFee: number;
  freeShippingMinAmount?: number;
}

export interface ShopSettings {
  shopName: string;
  tagline: string;
  logoUrl?: string;
  themeColor?: string; // Theme color (e.g. #E63946, #10B981, #2563EB, #8B5CF6, #F97316, #1F2937)
  phone: string;
  lineId: string;
  lineUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  supportHours: string;
  shopAddress: string;
  topAnnouncement: string;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  bannerUrl?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  code?: string;
  minSpend?: number;
  isActive: boolean;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export type OrderStatus =
  | 'pending_payment'
  | 'pending_verification'
  | 'paid'
  | 'purchased'
  | 'shipped'
  | 'cancelled';

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  customerName: string;
  customerPhone: string;
  customerLineId: string;
  shippingAddress: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  totalAmount: number;
  paymentSlipUrl?: string;
  status: OrderStatus;
  trackingNumber?: string;
  flightRoundId?: string;
  flightRoundName?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
