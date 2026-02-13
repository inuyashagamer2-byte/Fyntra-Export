import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { LayoutDashboard, PlusCircle, Settings, ShoppingCart } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Market Manager",
  description: "Manage and export your products with AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <div className="flex h-screen bg-gray-100">
          {/* Sidebar */}
          <aside className="w-64 bg-white border-r">
            <div className="p-6">
              <h1 className="text-xl font-bold flex items-center gap-2">
                <ShoppingCart className="text-blue-600" />
                MarketAI
              </h1>
            </div>
            <nav className="mt-6 px-4">
              <Link href="/" className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                <LayoutDashboard size={20} />
                Dashboard
              </Link>
              <Link href="/add" className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors mt-2">
                <PlusCircle size={20} />
                Adicionar Item
              </Link>
              <Link href="/settings" className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors mt-2">
                <Settings size={20} />
                Configurações
              </Link>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
