import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { authAPI } from '@/utils/api';
import { User, AuthState, UserRole } from '@/types';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (formData: FormData) => Promise<{ requiresVerification: boolean; email: string; emailError?: boolean }>;
  verifyEmail: (email: string, otp: string) => Promise<void>;
  resendOTP: (email: string) => Promise<{ success: boolean; emailError?: boolean }>;
  logout: () => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  resetPassword: (userId: number, newPassword: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<{ success: boolean; email?: string }>;
  verifyResetToken: (email: string, token: string) => Promise<{ valid: boolean }>;
  resetPasswordWithToken: (email: string, token: string, password: string) => Promise<void>;
  clearError: () => void;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  isResendLoading: false,
  error: null,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>(initialState);
  const router = useRouter();

  // Load user from localStorage on initial load
  useEffect(() => {
    const loadUser = async () => {
      try {
        // Check if running in browser environment
        if (typeof window === 'undefined') {
          setState({
            ...initialState,
            isLoading: false,
          });
          return;
        }
        
        const token = localStorage.getItem('token');
        
        if (!token) {
          setState({
            ...initialState,
            isLoading: false,
          });
          return;
        }

        // Get user profile
        const { user } = await authAPI.getProfile();
        
        setState({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
          isResendLoading: false,
          error: null,
        });
      } catch (error) {
        console.error('Auth load error:', error);
        localStorage.removeItem('token');
        setState({
          ...initialState,
          isLoading: false,
        });
      }
    };

    loadUser();
  }, []);

  // Login user
  const login = async (email: string, password: string) => {
    try {
      setState({ ...state, isLoading: true });
      
      const { token, user } = await authAPI.login(email, password);
      
      // Save both token and user details to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setState({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        isResendLoading: false,
        error: null,
      });

      // Redirect based on user role
      if (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ADMIN) {
        router.push('/dashboard');
      } else if (user.role === UserRole.REVIEWER) {
        router.push('/reviews');
      } else {
        router.push('/journals');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Check if the error is related to email verification
      if (error.response?.data?.requiresVerification) {
        setState({
          ...state,
          isLoading: false,
          isResendLoading: false,
          error: error.response.data.message || 'Email verification required. Please verify your email to continue.',
        });
        
        // Store the email that needs verification in localStorage
        // This will help if the user refreshes the verification page
        if (error.response?.data?.email) {
          localStorage.setItem('pendingVerificationEmail', error.response.data.email);
        }
        
        // Pass the error up to the component to handle verification flow
        throw error;
      } else {
        setState({
          ...state,
          isLoading: false,
          isResendLoading: false,
          error: error.response?.data?.message || 'Login failed',
        });
      }
    }
  };

  // Register user
  const register = async (formData: FormData) => {
    try {
      setState({ ...state, isLoading: true });
      
      const response = await authAPI.register(formData);
      
      // Check if email verification is required
      if (response.requiresVerification) {
        setState({
          ...state,
          isLoading: false,
          isResendLoading: false,
          error: null,
        });
        
        return {
          requiresVerification: true,
          email: response.email,
          emailError: response.emailError || false,
        };
      }
      
      // If no verification required, proceed with login
      const { token, user } = response;
      
      localStorage.setItem('token', token);
      
      setState({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        isResendLoading: false,
        error: null,
      });

      router.push('/journals');
      
      return {
        requiresVerification: false,
        email: response.email,
      };
    } catch (error: any) {
      console.error('Register error:', error);
      setState({
        ...state,
        isLoading: false,
        isResendLoading: false,
        error: error.response?.data?.message || 'Registration failed',
      });
      
      throw error;
    }
  };
  
  // Verify email with OTP
  const verifyEmail = async (email: string, otp: string) => {
    try {
      setState({ ...state, isLoading: true });
      
      const { token, user } = await authAPI.verifyEmail(email, otp);
      
      localStorage.setItem('token', token);
      
      setState({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        isResendLoading: false,
        error: null,
      });

      router.push('/journals');
    } catch (error: any) {
      console.error('Email verification error:', error);
      setState({
        ...state,
        isLoading: false,
        isResendLoading: false,
        error: error.response?.data?.message || 'Email verification failed',
      });
      
      throw error;
    }
  };
  
  // Resend OTP for email verification
  const resendOTP = async (email: string) => {
    try {
      setState({ ...state, isResendLoading: true });
      
      const response = await authAPI.resendOTP(email);
      
      setState({
        ...state,
        isResendLoading: false,
        error: null,
      });
      
      return {
        success: true,
        emailError: response.emailError || false
      };
    } catch (error: any) {
      console.error('Resend OTP error:', error);
      setState({
        ...state,
        isResendLoading: false,
        error: error.response?.data?.message || 'Failed to resend verification code',
      });
      
      return {
        success: false,
        emailError: true
      };
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setState({
      ...initialState,
      isLoading: false,
    });
    router.push('/login');
  };

  // Change password
  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      setState({ ...state, isLoading: true });
      
      await authAPI.changePassword(currentPassword, newPassword);
      
      setState({
        ...state,
        isLoading: false,
        isResendLoading: false,
        error: null,
      });
    } catch (error: any) {
      console.error('Change password error:', error);
      setState({
        ...state,
        isLoading: false,
        isResendLoading: false,
        error: error.response?.data?.message || 'Password change failed',
      });
      throw error;
    }
  };

  // Reset password (for super admin)
  const resetPassword = async (userId: number, newPassword: string) => {
    try {
      setState({ ...state, isLoading: true });
      
      await authAPI.resetPassword(userId, newPassword);
      
      setState({
        ...state,
        isLoading: false,
        isResendLoading: false,
        error: null,
      });
    } catch (error: any) {
      console.error('Reset password error:', error);
      setState({
        ...state,
        isLoading: false,
        isResendLoading: false,
        error: error.response?.data?.message || 'Password reset failed',
      });
      throw error;
    }
  };
  
  // Forgot password - request password reset
  const forgotPassword = async (email: string) => {
    try {
      setState({ ...state, isLoading: true });
      
      const response = await authAPI.forgotPassword(email);
      
      setState({
        ...state,
        isLoading: false,
        isResendLoading: false,
        error: null,
      });
      
      return { success: true, email: response.email };
    } catch (error: any) {
      console.error('Forgot password error:', error);
      setState({
        ...state,
        isLoading: false,
        isResendLoading: false,
        error: error.response?.data?.message || 'Failed to process password reset request',
      });
      return { success: false };
    }
  };
  
  // Verify password reset token
  const verifyResetToken = async (email: string, token: string) => {
    try {
      setState({ ...state, isLoading: true });
      
      const response = await authAPI.verifyResetToken(email, token);
      
      setState({
        ...state,
        isLoading: false,
        isResendLoading: false,
        error: null,
      });
      
      return { valid: response.valid };
    } catch (error: any) {
      console.error('Verify reset token error:', error);
      setState({
        ...state,
        isLoading: false,
        isResendLoading: false,
        error: error.response?.data?.message || 'Invalid or expired reset token',
      });
      return { valid: false };
    }
  };
  
  // Reset password with token (from forgot password flow)
  const resetPasswordWithToken = async (email: string, token: string, password: string) => {
    try {
      setState({ ...state, isLoading: true });
      
      await authAPI.resetPasswordWithToken(email, token, password);
      
      setState({
        ...state,
        isLoading: false,
        isResendLoading: false,
        error: null,
      });
    } catch (error: any) {
      console.error('Reset password with token error:', error);
      setState({
        ...state,
        isLoading: false,
        isResendLoading: false,
        error: error.response?.data?.message || 'Failed to reset password',
      });
      throw error;
    }
  };

  // Clear error
  const clearError = () => {
    setState({
      ...state,
      error: null,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        verifyEmail,
        resendOTP,
        logout,
        changePassword,
        resetPassword,
        forgotPassword,
        verifyResetToken,
        resetPasswordWithToken,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
