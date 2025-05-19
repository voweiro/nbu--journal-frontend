import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { useAuth } from '@/contexts/AuthContext';

const VerifyEmailPage: React.FC = () => {
  const router = useRouter();
  const { email } = router.query;
  const { verifyEmail, resendOTP, error, isLoading, clearError } = useAuth();
  
  const [otp, setOtp] = useState('');
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [localError, setLocalError] = useState<string | null>(null);
  const [verificationEmail, setVerificationEmail] = useState<string>('');
  const [isResending, setIsResending] = useState(false); // Local state for resend loading

  // Reset error state and check for stored email when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);
  
  // Handle email initialization separately to avoid dependency issues
  useEffect(() => {
    // Determine which email to use for verification
    if (email && typeof email === 'string') {
      // Use email from URL query parameter
      setVerificationEmail(email);
    } else if (typeof window !== 'undefined') {
      // Try to get email from localStorage
      const storedEmail = localStorage.getItem('pendingVerificationEmail');
      if (storedEmail && !verificationEmail) {
        setVerificationEmail(storedEmail);
        // Redirect to the same page but with the email in the URL for better UX
        router.replace(`/verify-email?email=${encodeURIComponent(storedEmail)}`);
      }
    }
  }, [email, router, verificationEmail]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if we have a valid verification email
    if (!verificationEmail) {
      setLocalError('Email address is missing. Please check the URL or try again.');
      return;
    }
    
    if (otp.trim().length === 0) {
      setLocalError('Please enter the verification code.');
      return;
    }
    
    try {
      setLocalError(null);
      await verifyEmail(verificationEmail, otp);
      setVerificationSuccess(true);
      
      // Clear the stored email from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('pendingVerificationEmail');
      }
      
      // Redirect to journals page after successful verification
      setTimeout(() => {
        router.push('/journals');
      }, 3000);
    } catch (error) {
      // Error is handled by the AuthContext
    }
  };

  const handleResend = async () => {
    // Check if we have a valid verification email
    if (!verificationEmail) {
      setLocalError('Email address is missing. Please check the URL or try again.');
      return;
    }
    
    try {
      setLocalError(null);
      setIsResending(true); // Set local loading state
      
      // Log for debugging
      console.log('Resending OTP to:', verificationEmail);
      
      const result = await resendOTP(verificationEmail);
      
      // Always turn off loading state when complete
      setIsResending(false);
      
      if (result.emailError) {
        setLocalError('Failed to send email. Please try again later.');
      } else {
        setResendDisabled(true);
        
        // Set a 60-second countdown for resend button
        setCountdown(60);
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              setResendDisabled(false);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (error) {
      // Error is handled by the AuthContext
    }
  };

  return (
    <Layout title="Verify Email | NBU Journal System">
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <Card>
              {verificationSuccess ? (
                <div className="text-center py-8">
                  <div className="mb-4 flex justify-center">
                    <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h2>
                  <p className="text-gray-600 mb-6">
                    Your email has been successfully verified. You will be redirected to the journals page shortly.
                  </p>
                  <Button
                    variant="primary"
                    onClick={() => router.push('/journals')}
                  >
                    Go to Journals
                  </Button>
                </div>
              ) : (
                <div className="p-6">
                  <div className="text-center py-4">
                    <h2 className="text-2xl font-bold mb-4">Verify Your Email</h2>
                    <p className="text-gray-600 mb-2">
                      Please enter the verification code sent to your email:
                    </p>
                    <p className="text-blue-600 font-medium mb-4">
                      {verificationEmail || 'your email'}
                    </p>
                  </div>
                  {(error || localError) && (
                    <Alert 
                      variant="danger" 
                      dismissible 
                      onDismiss={() => {
                        clearError();
                        setLocalError(null);
                      }}
                    >
                      {error || localError}
                    </Alert>
                  )}
                  
                  <form onSubmit={handleVerify} className="space-y-6">
                    <div>
                      <label htmlFor="otp" className="form-label">
                        Verification Code
                      </label>
                      <input
                        id="otp"
                        type="text"
                        className="form-input"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                        autoComplete="one-time-code"
                        required
                      />
                    </div>
                    
                    <div className="flex flex-col space-y-3">
                      <Button 
                        type="submit" 
                        variant="primary" 
                        fullWidth 
                        isLoading={isLoading}
                      >
                        Verify Email
                      </Button>
                      
                      <div className="text-center">
                        <button
                          type="button"
                          className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                          onClick={handleResend}
                          disabled={resendDisabled}
                        >
                          {resendDisabled 
                            ? `Resend code in ${countdown} seconds` 
                            : "Didn't receive a code? Resend"}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default VerifyEmailPage;
