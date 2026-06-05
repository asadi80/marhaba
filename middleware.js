// middleware.js 
import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Public routes
  const publicRoutes = [
    "/",
    "/login",
    "/signup",
    "/privacy",
    "/terms",
    "/how-to-book",
    "/contact",
    "/pricing-tips",
    "/safety-info",
    "/travel-tips",
    "/start-hosting",
    "/payment-methods",
    "/host-resources",
    "/verify-email-pending",
    "/resend-verification",
    "/forgot-password",
    "/reset-password",
  ];
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Public API routes
  const publicApiRoutes = [
    "/api/auth/login",
    "/api/auth/signup",
    "/api/auth/verify-email",
    "/api/auth/resend-verification",
    "/api/auth/forgot-password",
    "/api/auth/reset-password",
    "/api/listings/nearby",
    "/api/admin/seed",
    "/api/stats",
    "/api/contact",
  ];

  if (publicApiRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Allow GET requests to /api/listings (for browsing listings)
  if (pathname.startsWith("/api/listings") && request.method === "GET") {
    return NextResponse.next();
  }

  // Allow OPTIONS requests (for CORS preflight)
  if (request.method === "OPTIONS") {
    return NextResponse.next();
  }

  // Allow static assets
  if (
    pathname.includes("/_next/") ||
    pathname.includes("/favicon.ico") ||
    pathname === "/sw.js" ||
    pathname === "/manifest.webmanifest" ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".ico") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".webp")
  ) {
    return NextResponse.next();
  }

  // ONLY check if token exists - DON'T verify it here
  const token = request.cookies.get("token")?.value;

  // If no token and trying to access protected route
  if (!token) {
    // For API routes, return proper JSON error
    if (pathname.startsWith("/api/")) {
      return new NextResponse(
        JSON.stringify({ message: "Authentication required" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    // For non-API routes, redirect to login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Token exists - allow the request
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.*|sw\\.js|manifest.*|.*\\.png|.*\\.ico|.*\\.svg|.*\\.jpg|.*\\.webp|.*\\.json).*)",
  ],
};