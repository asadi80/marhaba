// lib/adminAuth.js - POSTGRESQL VERSION
import jwt from 'jsonwebtoken';
import pool from '@/lib/postgres';

export async function verifyAdminFromCookie(request, requiredRole = 'admin') {
  try {
    // Get token from cookie
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return { error: 'Authentication required', status: 401 };
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from PostgreSQL
    const result = await pool.query(
      `SELECT id, name, email, phone_number, role, status, 
              email_verified, created_at, host_details, user_details
       FROM users 
       WHERE id = $1`,
      [decoded.userId]
    );
    
    if (result.rows.length === 0) {
      return { error: 'User not found', status: 401 };
    }
    
    const user = result.rows[0];
    
    // Check role permissions
    if (requiredRole === 'super_admin' && user.role !== 'super_admin') {
      return { error: 'Super admin access required', status: 403 };
    }
    
    if (requiredRole === 'admin' && !['admin', 'super_admin'].includes(user.role)) {
      return { error: 'Admin access required', status: 403 };
    }
    
    if (requiredRole === 'host' && user.role !== 'host') {
      return { error: 'Host access required', status: 403 };
    }
    
    // Format user object to match expected structure
    const formattedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phone_number,
      role: user.role,
      status: user.status,
      emailVerified: user.email_verified,
      createdAt: user.created_at,
      hostDetails: user.host_details,
      userDetails: user.user_details,
    };
    
    return { user: formattedUser };
  } catch (error) {
    console.error('Auth error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return { error: 'Invalid token', status: 401 };
    }
    if (error.name === 'TokenExpiredError') {
      return { error: 'Token expired', status: 401 };
    }
    
    return { error: 'Authentication failed', status: 401 };
  }
}

// Optional: Export a simplified version for just getting the current user
export async function getCurrentUser(request) {
  try {
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return null;
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const result = await pool.query(
      `SELECT id, name, email, phone_number, role, status, email_verified
       FROM users 
       WHERE id = $1`,
      [decoded.userId]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

// Optional: Check if user has specific role
export async function hasRole(request, allowedRoles = []) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return false;
    return allowedRoles.includes(user.role);
  } catch {
    return false;
  }
}

// Optional: Check if user is admin (including super_admin)
export async function isAdmin(request) {
  return hasRole(request, ['admin', 'super_admin']);
}

// Optional: Check if user is super admin
export async function isSuperAdmin(request) {
  return hasRole(request, ['super_admin']);
}

// Optional: Check if user is host
export async function isHost(request) {
  return hasRole(request, ['host']);
}