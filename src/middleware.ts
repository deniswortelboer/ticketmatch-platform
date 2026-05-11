import { NextRequest, NextResponse } from "next/server";

const RESELLER_SUBDOMAINS: Record<string, string> = {
  w69travel: "w69travel",
};

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const subdomain = hostname.split(".")[0];

  if (
    subdomain &&
    subdomain !== "ticketmatch" &&
    subdomain !== "www" &&
    subdomain !== "localhost" &&
    RESELLER_SUBDOMAINS[subdomain]
  ) {
    const slug = RESELLER_SUBDOMAINS[subdomain];
    const url = request.nextUrl.clone();
    const path = url.pathname;

    if (!path.startsWith("/r/")) {
      url.pathname = `/r/${slug}${path === "/" ? "" : path}`;
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
