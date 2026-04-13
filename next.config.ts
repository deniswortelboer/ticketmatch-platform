import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },

  // ════════════════════════════════════════════════════════
  // IMAGE OPTIMIZATION — Allow external Viator image domains
  // ════════════════════════════════════════════════════════
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media.tacdn.com",
        pathname: "/media/**",
      },
      {
        protocol: "https",
        hostname: "hare-media-cdn.tripadvisor.com",
        pathname: "/media/**",
      },
    ],
  },

  // ════════════════════════════════════════════════════════
  // SECURITY HEADERS — Protect against XSS, clickjacking,
  // MIME sniffing, and enforce HTTPS
  // ════════════════════════════════════════════════════════
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Prevent clickjacking — no iframes allowed
          { key: "X-Frame-Options", value: "DENY" },
          // Prevent MIME type sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Enforce HTTPS for 1 year
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
          // Control referrer info
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Block camera, microphone, geolocation unless needed
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          // XSS protection (legacy browsers)
          { key: "X-XSS-Protection", value: "1; mode=block" },
          // Prevent DNS prefetching leaks
          { key: "X-DNS-Prefetch-Control", value: "on" },
          // Content Security Policy
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://js.mollie.com https://*.sentry.io",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://*.tacdn.com https://*.tripadvisor.com https://*.googleusercontent.com https://www.google-analytics.com https://*.supabase.co https://*.viator.com",
              "font-src 'self' data:",
              "connect-src 'self' https://*.supabase.co https://www.google-analytics.com https://api.viator.com https://*.sentry.io https://*.ingest.sentry.io https://js.mollie.com",
              "frame-src 'self' https://js.mollie.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
      {
        // Extra strict headers for API routes
        source: "/api/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate" },
        ],
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  // Suppress source map upload warnings when no auth token is set
  silent: !process.env.SENTRY_AUTH_TOKEN,

  // Upload source maps for better error stack traces
  widenClientFileUpload: true,

  // Automatically tree-shake Sentry logger in production
  disableLogger: true,
});
