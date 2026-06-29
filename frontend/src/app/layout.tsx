import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import QueryProvider from "@/providers/QueryProvider";

const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });

export const metadata: Metadata = {
  metadataBase: process.env.NEXT_PUBLIC_APP_URL
    ? new URL(process.env.NEXT_PUBLIC_APP_URL)
    : undefined,
  title: {
    default: "BranchBrew ERP",
    template: "%s | BranchBrew",
  },
  description: "Multi-branch cafe ERP — POS, inventory, kitchen, and payroll",
  applicationName: "BranchBrew",
  authors: [{ name: "BranchBrew" }],
  creator: "BranchBrew",
  openGraph: {
    type: "website",
    siteName: "BranchBrew",
    title: "BranchBrew ERP",
    description: "Multi-branch cafe ERP — POS, inventory, kitchen, and payroll",
  },
  twitter: {
    card: "summary",
    title: "BranchBrew ERP",
    description: "Multi-branch cafe ERP — POS, inventory, kitchen, and payroll",
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon.svg", type: "image/svg+xml" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${plusJakarta.className} flex min-h-screen bg-background text-foreground bg-[url('/bg-pattern.svg')] dark:bg-none bg-fixed antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <QueryProvider>
              {children}
              <Toaster />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
