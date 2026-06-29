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

const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Lint is run separately in CI; don't block production builds on it.
    ignoreDuringBuilds: true,
  },
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
