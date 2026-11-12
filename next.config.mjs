/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    // Server Actions are enabled by default in Next 14; kept explicit for clarity.
    typedRoutes: false,
    // Keep @react-pdf/renderer (and its wasm/font assets) out of the bundle so
    // PDF route handlers work reliably on serverless (Vercel).
    serverComponentsExternalPackages: ["@react-pdf/renderer"],
  },
};

export default nextConfig;
