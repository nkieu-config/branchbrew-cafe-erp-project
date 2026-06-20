import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Toaster } from "@/components/ui/sonner";

import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });

import { ThemeProvider } from "@/components/theme-provider";

import { SocketProvider } from "@/context/SocketContext";

export const metadata: Metadata = {
  title: "QafaCafe ERP",
  description: "Enterprise POS and Management Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${plusJakarta.className} flex min-h-screen bg-slate-50 dark:bg-slate-950 bg-[url('/bg-pattern.svg')] dark:bg-none bg-fixed text-slate-900 dark:text-slate-50 antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <SocketProvider>
              <ProtectedRoute>
                <Sidebar />
                <main className="flex-1 h-screen relative z-10 flex flex-col overflow-hidden">
                  <Topbar />
                  <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                    {children}
                  </div>
                </main>
                <Toaster />
              </ProtectedRoute>
            </SocketProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
