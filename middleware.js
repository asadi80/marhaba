import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Public routes
  const publicRoutes = ['/', '/login', '/signup'];
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }
  
  // Public API routes - ADD /api/listings/nearby here
  if (pathname.startsWith('/api/auth/login') || 
      pathname.startsWith('/api/auth/signup') ||
      pathname === '/api/listings/nearby' ||
      pathname.startsWith('/api/listings/nearby?')) {  // Handle query params
    return NextResponse.next();
  }
  
  // Get token from cookie
  const token = request.cookies.get('token')?.value;
  
  console.log("Middleware - path:", pathname);
  console.log("Middleware - token exists:", !!token);
  
  // If no token and trying to access protected route, redirect to login
  if (!token) {
    console.log("Middleware - No token, redirecting to login");
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  console.log("Middleware - Allowing access to:", pathname);
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};