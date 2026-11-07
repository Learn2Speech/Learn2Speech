import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // Security headers sent with every page. They tell the browser to:
  // - never show our pages inside another site's frame (stops "clickjacking" tricks),
  // - not guess file types (stops a file being run as something it isn't),
  // - send only our domain, not full page addresses, when users follow links to other sites,
  // - block the camera, microphone and location, which the app never uses,
  // - only use HTTPS for a year after the first visit,
  // - never load plug-ins, never submit forms to other sites, and ignore injected <base> tags.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
        ],
      },
      // pages and data that need a login must not be kept by shared caches or the back button
      {
        source: "/:path(history|upload|api)/:rest*",
        headers: [{ key: "Cache-Control", value: "private, no-store" }],
      },
    ];
  },
};

export default nextConfig;
