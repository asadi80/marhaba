// lib/auth.js
import jwt from 'jsonwebtoken';

export function verifyToken(request) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { error: 'No token provided', status: 401 };
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    return { user: decoded };
  } catch (error) {
    console.error('Token verification error:', error);
    return { error: 'Invalid token', status: 401 };
  }
}