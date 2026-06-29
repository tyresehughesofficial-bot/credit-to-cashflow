/** @type {import('next').NextConfig} */

// Three build targets, same UI/codebase:
//   • PAGES_EXPORT=true → fully static site for GitHub Pages (sub-path).
//   • Vercel (VERCEL=1) → default Next build (Vercel manages output natively;
//     API routes + middleware + SSR all work).
//   • else              → self-contained Node.js server (`output: standalone`)
//     for Docker / VPS self-hosting (`node .next/standalone/server.js`).
const isPages = process.env.PAGES_EXPORT === "true";
const isVercel = process.env.VERCEL === "1";
const repo = "credit-to-cashflow";

const securityHeaders = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Lint is run separately in CI; don't block production builds on it.
    ignoreDuringBuilds: true,
  },
  // Server-side security headers (Vercel / Node host; ignored on static export).
  ...(isPages
    ? {}
    : { async headers() { return [{ source: "/:path*", headers: securityHeaders }]; } }),
  ...(isPages
    ? {
        output: "export",
        basePath: `/${repo}`,
        assetPrefix: `/${repo}/`,
        images: { unoptimized: true },
        trailingSlash: true,
        env: { NEXT_PUBLIC_BASE_PATH: `/${repo}` },
      }
    : isVercel
      ? {} // Vercel handles output; enables API routes, middleware, SSR.
      : {
          // Node.js server build — bundles a minimal node_modules + server.js.
          output: "standalone",
        }),
};

export default nextConfig;
