// Frontend configuration

// Get the base URL for the frontend
export const getFrontendBaseUrl = (): string => {
  // In production, use the actual domain
  if (process.env.NEXT_PUBLIC_FRONTEND_URL) {
    return process.env.NEXT_PUBLIC_FRONTEND_URL;
  }
  
  // In development, use localhost
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // Default fallback - use the correct Vercel deployment URL
  return 'https://nbu-journal-frontend.vercel.app';
};

// Get the full URL for password reset
export const getPasswordResetUrl = (email: string, token: string): string => {
  return `${getFrontendBaseUrl()}/password-reset?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`;
};

// Get the base URL for the backend API
export const getBackendBaseUrl = (): string => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // Default to the Render backend
  return 'https://nbu-journal-backend.onrender.com/api';
};

export default {
  getFrontendBaseUrl,
  getPasswordResetUrl,
  getBackendBaseUrl
};
