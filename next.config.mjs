/** @type {import('next').NextConfig} */

// When PAGES_EXPORT=true we emit a fully static site for GitHub Pages, served
// from a project sub-path (/credit-to-cashflow). The normal build (Vercel /
// local dev) is untouched.
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
    : {}),
};

export default nextConfig;
