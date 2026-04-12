import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ message: 'Logged out successfully' });
  
  // Clear cookies
   localStorage.removeItem('marhabaToken');
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
    localStorage.removeItem('tokenExpiry');
  
  return response;
}