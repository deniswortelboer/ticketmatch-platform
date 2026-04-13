import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// ════════════════════════════════════════════════════════════
// MIDDLEWARE: Authentication + Rate Limiting
// - Protects /dashboard routes (redirect to login)
// - Redirects logged-in users away from /auth pages
// - Rate limits public API routes (60 req/min per IP)
// ════════════════════════════════════════════════════════════

// ── Simple in-memory rate limiter ──
// Note: Resets on cold start (serverless). For production at scale,
// consider Vercel KV or Upstash Redis.
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_WINDOW = 60_000; // 1 minute
const RATE_LIMIT_MAX = 60; // 60 requests per minute per IP

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }

  entry.count++;
  if (entry.count > RATE_LIMIT_MAX) {
    return true;
  }

  return false;
}

// Clean up old entries every 5 minutes to prevent memory leak
let lastCleanup = Date.now();
function cleanupRateLimitMap() {
  const now = Date.now();
  if (now - lastCleanup < 300_000) return; // every 5 min
  lastCleanup = now;
  for (const [key, val] of rateLimitMap) {
    if (now > val.resetTime) rateLimitMap.delete(key);
  }
}

// API routes that should be rate-limited (public endpoints)
const RATE_LIMITED_PATHS = [
  "/api/register",
  "/api/places",
  "/api/weather",
  "/api/busyness",
  "/api/viator",
  "/api/voucher",
  "/api/reseller/lookup",
  "/api/affiliate/lookup",
  "/api/hubspot",
  "/api/agent",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Rate limiting for public API routes ──
  if (RATE_LIMITED_PATHS.some((p) => pathname.startsWith(p))) {
    cleanupRateLimitMap();

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || request.headers.get("x-real-ip")
      || "unknown";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": "60",
            "X-RateLimit-Limit": String(RATE_LIMIT_MAX),
          },
        }
      );
    }
  }

  // ── Supabase auth session handling ──
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect dashboard routes — redirect to login if not authenticated
  if (!user && pathname.startsWith("/dashboard")) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  // Redirect logged-in users away from auth pages (except register — allow preview)
  if (
    user &&
    pathname.startsWith("/auth/") &&
    pathname !== "/auth/register"
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/auth/:path*",
    "/api/:path*",
  ],
};
