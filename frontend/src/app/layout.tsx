import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Toaster } from "@/components/ui/sonner";

import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });

export const metadata: Metadata = {
  title: "CafeSync ERP",
  description: "Enterprise POS and Management Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${plusJakarta.className} flex min-h-screen bg-slate-50 dark:bg-slate-950 bg-[url('/bg-pattern.svg')] bg-fixed text-slate-900 antialiased`}>
        <AuthProvider>
          <ProtectedRoute>
            <Sidebar />
            <main className="flex-1 p-8 overflow-auto h-screen relative z-10">
              {children}
            </main>
            <Toaster />
          </ProtectedRoute>
        </AuthProvider>
      </body>
    </html>
  );
}
