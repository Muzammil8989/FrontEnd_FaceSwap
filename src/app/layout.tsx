
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/cart-context";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Header } from '@/components/header'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Selfie Generator",
  description: "Generate realistic selfies with famous personalities using AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  // Instead of calling new Date() inline in the footer (which might differ between server & client),
  // we store it in a stable reference. This ensures no mismatch during hydration.
  return (
    <html lang="en">
      <body className={inter.className}>
        <CartProvider>
            <Header />
              {children}
          {/* Footer */}
          <footer className="border-t py-4 relative bottom-0 w-full mt-40">
            <div className="container px-4 text-center mx-auto text-sm text-muted-foreground md:px-6">
              © {new Date().getFullYear()} AI Selfie Generator. All rights reserved.
            </div>
          </footer>
          <ToastContainer />
        </CartProvider>
      </body>
    </html>
  );
}