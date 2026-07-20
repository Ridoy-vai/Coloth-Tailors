import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies"; // lightweight, no DB call

const PROTECTED_PREFIXES = ["/dashboard", "/profile", "/settings", "/cart"];
const AUTH_ROUTES = ["/login", "/register"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Cookie-only check — does NOT touch the DB or load the Better Auth adapter
  const sessionCookie = getSessionCookie(request);

  // Logged-in users shouldn't see /login or /register
  if (AUTH_ROUTES.includes(pathname)) {
    if (sessionCookie) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  if (!sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Forward the pathname to the layout via a header, so the shared
  // app/dashboard/layout.tsx can do role-based redirects itself.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);
  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile",
    "/settings",
    "/cart",
    "/login",
    "/register",
  ],
};