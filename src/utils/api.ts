import { User, Journal, JournalStatus, JournalFilters } from '@/types';
import corsAwareApi from './corsAwareApi';

// Use the CORS-aware API client instead of creating a new one
const api = corsAwareApi;

// Export the base URL for use in other parts of the application
export const getApiBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  return 'https://nbu-journal-api.onrender.com/api';
};

// Export the API base URL for use in other components
export const BACKEND_URL = getApiBaseUrl();

// Auth API
export const authAPI = {
  register: async (formData: FormData) => {
    const response = await api.post('/auth/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  verifyEmail: async (email: string, otp: string) => {
    const response = await api.post('/auth/verify-email', { email, otp });
    return response.data;
  },

  resendOTP: async (email: string) => {
    const response = await api.post('/auth/resend-otp', { email });
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await api.put('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  resetPassword: async (userId: number, newPassword: string) => {
    const response = await api.put('/auth/reset-password', {
      userId,
      newPassword,
    });
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  verifyResetToken: async (email: string, token: string) => {
    const response = await api.post('/auth/verify-reset-token', { email, token });
    return response.data;
  },

  resetPasswordWithToken: async (email: string, token: string, password: string) => {
    const response = await api.post('/auth/reset-password-with-token', { email, token, password });
    return response.data;
  },
};

// User API
export const userAPI = {
  getAllUsers: async (role?: string) => {
    const response = await api.get('/users', {
      params: { role },
    });
    return response.data;
  },

  getUserById: async (id: number) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  createUser: async (userData: {
    username: string;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role: string;
    department?: string;
  }) => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  updateUser: async (id: number, formData: FormData) => {
    const response = await api.put(`/users/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteUser: async (id: number) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  resetPassword: async (userId: number, newPassword: string) => {
    const response = await api.post(`/auth/reset-password`, { userId, newPassword });
    return response.data;
  },
};

// Journal API
export const journalAPI = {
  getPublishedJournals: async (filters: JournalFilters = {}) => {
    // Use params object instead of manually constructing URL
    const response = await api.get('/journals/published', {
      params: {
        sort_by: filters.sort_by || 'published_date',
        sort_order: filters.sort_order || 'DESC',
        search: filters.search || '',
        limit: filters.limit || null,
        page: filters.page || null,
        _t: new Date().getTime() // Cache-busting parameter
      }
    });
    console.log('API response for published journals:', response.data);
    return response.data;
  },
  
  createJournal: async (formData: FormData) => {
    const response = await api.post('/journals', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getAllJournals: async (filters?: JournalFilters) => {
    const response = await api.get('/journals', {
      params: filters,
    });
    return response.data;
  },

  getJournalById: async (id: number) => {
    try {
      // First try to get the journal as a published journal (no auth required)
      const response = await api.get(`/journals/published/${id}`);
      return response.data;
    } catch (error) {
      // If that fails (e.g., journal is not published), fall back to the authenticated route
      const response = await api.get(`/journals/${id}`);
      return response.data;
    }
  },

  getAllReviewers: async () => {
    const response = await api.get('/journals/reviewers');
    return response.data;
  },

  assignReviewer: async (journalId: number, reviewerId: number) => {
    const response = await api.put(`/journals/${journalId}/assign`, {
      reviewer_id: reviewerId,
    });
    return response.data;
  },

  reviewJournal: async (journalId: number, status: 'approved' | 'rejected', comments: string) => {
    const response = await api.put(`/journals/${journalId}/review`, {
      status,
      comments,
    });
    return response.data;
  },

  getJournalFile: async (journalId: number) => {
    const response = await api.get(`/journals/${journalId}/file`);
    return response.data;
  },
  
  downloadJournal: async (journalId: number) => {
    try {
      // First try to get the journal to check if it's published
      const { journal } = await journalAPI.getJournalById(journalId);
      
      // For published journals, try to get file info from the public endpoint
      let fileInfo;
      try {
        // For published journals, we can try the public endpoint first
        if (journal.status === 'published') {
          // Try to get file info from the public endpoint
          const response = await api.get(`/journals/published/${journalId}/file`);
          fileInfo = response.data;
        } else {
          // For non-published journals, use the authenticated endpoint
          fileInfo = await journalAPI.getJournalFile(journalId);
        }
      } catch (error) {
        console.log('Could not get file info, proceeding with direct download', error);
      }
      
      // If we have Google Drive file info with a download URL, use that
      if (fileInfo && fileInfo.downloadUrl) {
        console.log('Using Google Drive download URL:', fileInfo.downloadUrl);
        window.open(fileInfo.downloadUrl, '_blank');
        return;
      }
      
      // If Google Drive info is not available, try direct download
      console.log('Falling back to direct download');
      
      // Create a temporary hidden anchor element
      const a = document.createElement('a');
      a.style.display = 'none';
      
      // Use the hardcoded backend URL to avoid any caching issues
      const apiBaseUrl = BACKEND_URL.replace('/api', '');
      
      // Use the public route for published journals, otherwise use the authenticated route
      if (journal.status === 'published') {
        a.href = `${apiBaseUrl}/api/journals/published/${journalId}/download`;
        // Try alternative path if API base URL doesn't include /api
        if (!apiBaseUrl.includes('/api')) {
          a.href = `${apiBaseUrl}/journals/published/${journalId}/download`;
        }
      } else {
        // Fallback to the authenticated route
        const token = localStorage.getItem('token');
        a.href = `${apiBaseUrl}/api/journals/${journalId}/download`;
        // Try alternative path if API base URL doesn't include /api
        if (!apiBaseUrl.includes('/api')) {
          a.href = `${apiBaseUrl}/journals/${journalId}/download`;
        }
        
        // Add the token as a query parameter
        if (token) {
          a.href += `?token=${token}`;
        }
      }
      
      console.log('Download URL:', a.href);
      
      // Append to body, click, and remove
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading journal:', error);
    }
  },
  
  deleteJournal: async (journalId: number) => {
    const response = await api.delete(`/journals/${journalId}`);
    return response.data;
  },
  
  updateJournalStatus: async (journalId: number, status: string) => {
    const response = await api.put(`/journals/${journalId}/status`, { status });
    return response.data;
  },
  
  publishJournal: async (journalId: number, publicationNumber: string) => {
    // Use publication_number to match the backend's expected parameter name
    const response = await api.put(`/journals/${journalId}/publish`, { publication_number: publicationNumber });
    return response.data;
  },
  unpublishJournal: async (journalId: number) => {
    const response = await api.put(`/journals/${journalId}/unpublish`);
    return response.data;
  },
};

// Review API
export const reviewAPI = {
  getJournalReviews: async (journalId: number) => {
    const response = await api.get(`/reviews/journal/${journalId}`);
    return response.data;
  },

  getAssignedReviews: async () => {
    const response = await api.get('/reviews/assigned');
    return response.data;
  },
};

export default api;
