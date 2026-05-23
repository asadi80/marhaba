// middleware.js (NOT proxy.js)
import { NextResponse } from 'next/server';

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Public routes
  const publicRoutes = ['/', '/login', '/signup', '/verify-email-pending', '/resend-verification', '/forgot-password', '/reset-password'];
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }
  
  // Public API routes
  const publicApiRoutes = [
    '/api/auth/login',
    '/api/auth/signup',
    '/api/auth/verify-email',
    '/api/auth/resend-verification',
    '/api/auth/forgot-password',
    '/api/auth/reset-password',
    '/api/listings/nearby',
    '/api/admin/seed',
  ];
  
  if (publicApiRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }
  
  // Allow GET requests to /api/listings (for browsing listings)
  if (pathname.startsWith('/api/listings') && request.method === 'GET') {
    return NextResponse.next();
  }
  
  // Allow OPTIONS requests (for CORS preflight)
  if (request.method === 'OPTIONS') {
    return NextResponse.next();
  }
  
  // Get token from cookie
  const token = request.cookies.get('token')?.value;
  
  console.log("Middleware - path:", pathname);
  console.log("Middleware - token exists:", !!token);
  
  // If no token and trying to access protected route
  if (!token) {
    // For API routes, return proper JSON error (not HTML)
    if (pathname.startsWith('/api/')) {
      return new NextResponse(
        JSON.stringify({ message: 'Authentication required' }),
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }
    // For non-API routes, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Verify token is valid (optional - add token validation here)
  try {
    const jwt = await import('jsonwebtoken');
    jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    console.error('Invalid token:', error.message);
    // If token is invalid, treat as unauthorized
    if (pathname.startsWith('/api/')) {
      return new NextResponse(
        JSON.stringify({ message: 'Invalid or expired token' }),
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  console.log("Middleware - Allowing access to:", pathname);
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};