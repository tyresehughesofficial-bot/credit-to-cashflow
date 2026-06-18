/** @type {import('next').NextConfig} */

// Two build targets, same UI/codebase:
//   • PAGES_EXPORT=true → fully static site for GitHub Pages, served from the
//     project sub-path (/credit-to-cashflow).
//   • default          → a self-contained Node.js server (`output: standalone`)
//     that runs anywhere with `node .next/standalone/server.js`. This is the
//     real Node.js app: it can host API routes and hold server-side secrets.
const isPages = process.env.PAGES_EXPORT === "true";
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
    : {
        // Node.js server build — bundles a minimal node_modules + server.js.
        output: "standalone",
      }),
};

export default nextConfig;
