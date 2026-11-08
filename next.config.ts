import type { NextConfig } from "next";

/**
 * Fully static site: one prerendered page, all data bundled, all interaction
 * client-side. Exported to `out/` and served as static assets on Cloudflare
 * (see wrangler.jsonc), so there is no server runtime to fail.
 *
 * Cache Components / partial prefetching are intentionally off: nothing uses
 * them, and on the Cloudflare Workers runtime Cache Components hang the
 * request (Next.js warns about the Workers setTimeout implementation).
 */
const nextConfig: NextConfig = {
  output: "export",
  images: {
    // Static export has no image optimisation server; photos are pre-sized.
    unoptimized: true,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
