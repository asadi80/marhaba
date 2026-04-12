// Client-side only functions
export const setMarhabaToken = (token) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('MarhabaToken', token);
  }
};

export const getMarhabaToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('MarhabaToken');
  }
  return null;
};

export const removeMarhabaToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('MarhabaToken');
    localStorage.removeItem('userType');
    localStorage.removeItem('userData');
  }
};

export const getUserType = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('userType');
  }
  return null;
};

export const decodeMarhabaToken = (token) => {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

export const isMarhabaTokenValid = (token) => {
  if (!token) return false;
  try {
    const decoded = decodeMarhabaToken(token);
    if (!decoded) return false;
    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch (error) {
    return false;
  }
};