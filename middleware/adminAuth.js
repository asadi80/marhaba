// middleware/adminAuth.js
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';

export async function verifyAdmin(req, requiredRole = 'admin') {
  try {
    // Get token from Authorization header ONLY (no cookies)
    // Client should send: Authorization: Bearer <token>
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    
    if (!token) {
      return { error: 'Authentication required', status: 401 };
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Connect to database
    await connectToDatabase();
    
    // Get user
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return { error: 'User not found', status: 401 };
    }
    
    // Check role permissions
    if (requiredRole === 'super_admin' && user.role !== 'super_admin') {
      return { error: 'Super admin access required', status: 403 };
    }
    
    if (requiredRole === 'admin' && !['admin', 'super_admin'].includes(user.role)) {
      return { error: 'Admin access required', status: 403 };
    }
    
    return { user };
  } catch (error) {
    console.error('Auth error:', error);
    
    // Handle specific JWT errors
    if (error.name === 'JsonWebTokenError') {
      return { error: 'Invalid token', status: 401 };
    }
    if (error.name === 'TokenExpiredError') {
      return { error: 'Token expired', status: 401 };
    }
    
    return { error: 'Authentication failed', status: 401 };
  }
}

// Optional: Create a wrapper for API routes
export function withAdminAuth(handler, requiredRole = 'admin') {
  return async (req) => {
    const auth = await verifyAdmin(req, requiredRole);
    
    if (auth.error) {
      return new Response(
        JSON.stringify({ message: auth.error }),
        { 
          status: auth.status,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Add user to request object for use in handler
    req.user = auth.user;
    return handler(req);
  };
}