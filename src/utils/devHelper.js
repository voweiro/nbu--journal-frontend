/**
 * Development Helper Utility
 * 
 * This utility helps with local development by providing functions to:
 * 1. Check if we're in development mode
 * 2. Log development-only messages
 * 3. Handle API connection issues gracefully
 */

// Check if we're in development mode
export const isDevelopment = process.env.NODE_ENV === 'development';

// Log development-only messages
export const devLog = (...args) => {
  if (isDevelopment) {
    console.log('[DEV]', ...args);
  }
};

// Handle API connection errors with helpful messages
export const handleApiConnectionError = (error) => {
  if (isDevelopment) {
    // In development, show more detailed error information
    console.error('[DEV] API Connection Error:', error);
    
    // Check if it's a CORS error
    if (error.message === 'Network Error') {
      console.error(`
        [DEV] Possible CORS issue detected. Please ensure:
        1. Your backend server is running at ${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}
        2. CORS is properly configured on your backend
        3. Check .env.local file for correct API URL configuration
        
        To run the backend locally:
        cd ../backend
        npm run dev
      `);
    }
    
    return {
      error: true,
      message: 'Development API connection error. See console for details.',
      details: error.message
    };
  }
  
  // In production, show a more user-friendly message
  return {
    error: true,
    message: 'Unable to connect to the server. Please try again later.',
  };
};

// Function to help with debugging API requests
export const debugApiRequest = (url, method, data) => {
  if (isDevelopment) {
    console.log(`[DEV] API Request: ${method} ${url}`);
    if (data) {
      console.log('[DEV] Request Data:', data);
    }
  }
};

// Export a default object with all helpers
export default {
  isDevelopment,
  devLog,
  handleApiConnectionError,
  debugApiRequest
};
