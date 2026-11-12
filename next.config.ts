import type { NextConfig } from "next";

// Content-Security-Policy: the browser may only load scripts, styles, fonts and images from our own site,
// and may only send data to our own site and Supabase. So even if someone slipped a script into a page,
// it couldn't load code from elsewhere or send your data anywhere else.
// shortcut: 'unsafe-inline' scripts stay allowed because Next.js adds small inline scripts to every page and
// nonces would turn off static pages; tighten with nonces if the app ever goes fully dynamic.
// The dev server also gets 'unsafe-eval', which its hot reload needs.
const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "production" ? "" : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "media-src 'self' blob:", // blob: = playing back your own recording on the Record page
  `connect-src 'self' ${supabase} ${supabase.replace(/^https/, "wss")}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

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
  // - only allow the microphone on our own pages (for the Record page), and block camera and location,
  // - only use HTTPS for a year after the first visit,
  // - never load plug-ins, never submit forms to other sites, and ignore injected <base> tags,
  // - only run code from our own site and only talk to our own site and Supabase (the csp above).
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(self), geolocation=()" },
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
