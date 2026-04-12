import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Public paths
  const publicPaths = ['/login', '/signup', '/'];
  const isPublicPath = publicPaths.includes(pathname);
  
  // Protected paths that require authentication
  const userProtectedPaths = ['/dashboard'];
  const hostProtectedPaths = ['/host-dashboard'];
  
  // Get token
  const token = request.cookies.get('MarhabaToken')?.value;
  
  if (!token && !isPublicPath) {
    const url = new URL('/login', request.url);
    return NextResponse.redirect(url);
  }
  
  if (token) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');
      const { payload } = await jwtVerify(token, secret);
      const userType = payload.userType;
      
      // Redirect to appropriate dashboard if trying to access login/signup
      if (isPublicPath && pathname !== '/') {
        if (userType === 'host') {
          const url = new URL('/host-dashboard', request.url);
          return NextResponse.redirect(url);
        } else {
          const url = new URL('/dashboard', request.url);
          return NextResponse.redirect(url);
        }
      }
      
      // Check role-based access
      if (pathname.startsWith('/dashboard') && userType === 'host') {
        const url = new URL('/host-dashboard', request.url);
        return NextResponse.redirect(url);
      }
      
      if (pathname.startsWith('/host-dashboard') && userType === 'user') {
        const url = new URL('/dashboard', request.url);
        return NextResponse.redirect(url);
      }
      
    } catch (error) {
      // Invalid token
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('MarhabaToken');
      response.cookies.delete('userType');
      return response;
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
  ],
};
