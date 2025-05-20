/**
 * CORS-Aware API Client
 * 
 * This utility creates an API client that can handle CORS issues in both
 * development and production environments.
 */

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

// Determine if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Get the appropriate API URL based on environment variables
const getApiBaseUrl = (): string => {
  // Use environment variable if available
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // Fallback to production URL
  return 'https://nbu-journal-api.onrender.com/api';
};

// Create the API client
const createApiClient = (): AxiosInstance => {
  const baseURL = getApiBaseUrl();
  
  console.log('Creating API client with base URL:', baseURL);
  
  // Create axios instance
  const api = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    withCredentials: true,
  });
  
  // Add request interceptor to handle auth tokens
  api.interceptors.request.use(
    (config) => {
      // Only try to get token in browser environment
      if (isBrowser) {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      
      // Log request details in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
      }
      
      return config;
    },
    (error) => Promise.reject(error)
  );
  
  // Add response interceptor for better error handling
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      // Handle CORS errors specifically
      if (error.message === 'Network Error') {
        console.error('[API] CORS or Network Error:', error);
        
        // Log helpful information for debugging
        if (process.env.NODE_ENV === 'development' && isBrowser) {
          console.error(`
            [API] Possible CORS issue detected:
            - Frontend Origin: ${window.location.origin}
            - API Endpoint: ${baseURL}
            
            Make sure your backend CORS configuration includes:
            - ${window.location.origin}
            
            If using local development:
            1. Make sure your backend is running
            2. Check CORS configuration in backend/server.js
          `);
        }
      }
      
      return Promise.reject(error);
    }
  );
  
  return api;
};

// Create and export the API client
const api = createApiClient();

export default api;
