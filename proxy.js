// proxy.js
import { NextResponse } from 'next/server';

// ✅ Change this: function name must be "proxy" (not "middleware")
export function proxy(request) {
  const { pathname } = request.nextUrl;
  
  // Public routes
  const publicRoutes = ['/', '/login', '/signup', '/verify-email-pending', '/resend-verification'];
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }
  
  // Public API routes
  if (pathname.startsWith('/api/auth/login') || 
      pathname.startsWith('/api/auth/signup') ||
      pathname.startsWith('/api/auth/verify-email') ||
      pathname.startsWith('/api/auth/resend-verification') ||
      pathname.startsWith('/api/auth/forgot-password') ||
      pathname.startsWith('/api/auth/reset-password') ||
      pathname === '/api/listings/nearby' ||
      pathname.startsWith('/api/listings/nearby?')) {
    return NextResponse.next();
  }
  
  // Allow GET requests to /api/listings (for browsing listings)
  if (pathname.startsWith('/api/listings') && request.method === 'GET') {
    return NextResponse.next();
  }
  
  // Get token from cookie
  const token = request.cookies.get('token')?.value;
  
  console.log("Proxy - path:", pathname);
  console.log("Proxy - token exists:", !!token);
  
  // If no token and trying to access protected route, redirect to login
  if (!token) {
    // For API routes, return 401 instead of redirect
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  console.log("Proxy - Allowing access to:", pathname);
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};