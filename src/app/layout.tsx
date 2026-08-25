import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';

export const metadata: Metadata = {
  title: 'Japan Pre-Order Shop 🇯🇵 | บริการรับหิ้วสินค้าญี่ปุ่นแท้ 100%',
  description: 'สั่งซื้อสินค้าพรีออเดอร์จากญี่ปุ่น ขนม เครื่องสำอาง สกินแคร์ ฟิกเกอร์ บินเอง ส่งตรงถึงบ้าน',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className="min-h-screen flex flex-col bg-[#FBF9F5]">
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <CartDrawer />
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
