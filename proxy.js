// proxy.js
import { NextResponse } from "next/server";

export function proxy(request) {
  const { pathname } = request.nextUrl;

  // Allow ALL static files first - before anything else
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/icons/") ||
    pathname === "/favicon.ico" ||
    pathname === "/sw.js" ||
    pathname === "/manifest.webmanifest" ||
    pathname === "/manifest.json" ||
    pathname === "/icon-192x192.png" ||    // ← explicit
    pathname === "/icon-512x512.png" ||    // ← explicit
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".jpeg") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".ico") ||
    pathname.endsWith(".webp") ||
    pathname.endsWith(".json") ||
    pathname.endsWith(".txt") ||
    pathname.endsWith(".xml")
  ) {
    return NextResponse.next();
  }

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

  if (pathname.startsWith("/api/listings") && request.method === "GET") {
    return NextResponse.next();
  }

  if (request.method === "OPTIONS") {
    return NextResponse.next();
  }

  const token = request.cookies.get("token")?.value;

  if (!token) {
    if (pathname.startsWith("/api/")) {
      return new NextResponse(
        JSON.stringify({ message: "Authentication required" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],  // ← simplified matcher
};