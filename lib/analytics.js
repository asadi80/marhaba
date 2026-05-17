import Cookies from 'js-cookie';
import { v4 as uuidv4 } from 'uuid';

// Get or create analytics session ID (persists in cookies)
export function getSessionId() {
  let sessionId = Cookies.get('analytics_session');
  if (!sessionId) {
    sessionId = uuidv4();
    // Set cookie for 30 days, available to all pages
    Cookies.set('analytics_session', sessionId, { 
      expires: 30, 
      path: '/',
      sameSite: 'Lax'
    });
  }
  return sessionId;
}

// Get auth token from cookie
export function getAuthToken() {
  return Cookies.get('auth_token'); // or 'token' depending on your setup
}

// Track page view (automatically includes auth token if logged in)
export async function trackPageView(path, referrer = null) {
  try {
    const sessionId = getSessionId();
    const token = getAuthToken();
    
    const response = await fetch('/api/analytics/page-view', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify({
        sessionId,
        path,
        referrer,
        userAgent: navigator.userAgent,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height
      })
    });
    
    return await response.json();
  } catch (error) {
    console.error('Analytics error:', error);
  }
}

// Track listing view (only for hosts, but tracks for everyone)
export async function trackListingView(listingId) {
  try {
    const sessionId = getSessionId();
    const token = getAuthToken();
    
    await fetch('/api/analytics/listing-view', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify({
        sessionId,
        listingId
      })
    });
  } catch (error) {
    console.error('Listing view tracking error:', error);
  }
}

// Track custom event
export async function trackEvent(eventName, metadata = {}) {
  try {
    const sessionId = getSessionId();
    const token = getAuthToken();
    
    await fetch('/api/analytics/event', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify({
        sessionId,
        eventType: eventName,
        metadata
      })
    });
  } catch (error) {
    console.error('Event tracking error:', error);
  }
}