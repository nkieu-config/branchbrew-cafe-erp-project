import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const isDev = process.env.NODE_ENV === "development";

const publicApiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
const apiIsProxied = publicApiUrl.startsWith("/");

const apiOrigin = (() => {
  if (apiIsProxied) return "";
  try {
    return new URL(publicApiUrl).origin;
  } catch {
    return "http://localhost:3000";
  }
})();
const apiWsOrigin = apiOrigin.replace(/^http/, "ws");

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src 'self'${apiOrigin ? ` ${apiOrigin} ${apiWsOrigin}` : ""}${isDev ? " ws://localhost:*" : ""}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    optimizePackageImports: ['lucide-react', 'antd', 'recharts', '@ant-design/icons'],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  async rewrites() {
    const target = process.env.INTERNAL_API_URL;
    if (!target) return [];
    return [{ source: "/backend/:path*", destination: `${target}/:path*` }];
  },
  async redirects() {
    return [
      { source: "/users", destination: "/organization/users", permanent: false },
      { source: "/branches", destination: "/organization/branches", permanent: false },
      { source: "/inventory/stock", destination: "/inventory/batches", permanent: false },
      { source: "/procurement/transfers", destination: "/inventory/transfers", permanent: false },
      { source: "/assets/equipment", destination: "/assets", permanent: false },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
