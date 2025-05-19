import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

interface ResetPasswordVerifyFormProps {
  email: string;
  token: string;
  onVerified: () => void;
}

const ResetPasswordVerifyForm: React.FC<ResetPasswordVerifyFormProps> = ({ 
  email, 
  token,
  onVerified 
}) => {
  const { verifyResetToken, error, isLoading, clearError } = useAuth();
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const verifyToken = async () => {
      try {
        clearError();
        setVerifying(true);
        
        const result = await verifyResetToken(email, token);
        
        if (result.valid) {
          setVerified(true);
          onVerified();
        } else {
          setVerified(false);
        }
      } catch (error) {
        console.error('Verify token error:', error);
        setVerified(false);
        // Error will be handled by the AuthContext
      } finally {
        setVerifying(false);
      }
    };
    
    verifyToken();
  }, [email, token, verifyResetToken, clearError, onVerified]);
  
  const handleBackToForgotPassword = () => {
    router.push('/forgot-password');
  };
  
  if (verifying) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-700">Verifying your reset token...</p>
      </div>
    );
  }
  
  if (!verified) {
    return (
      <div className="space-y-6">
        {error && (
          <Alert 
            variant="danger" 
            dismissible 
            onDismiss={clearError}
          >
            {error}
          </Alert>
        )}
        
        <Alert variant="danger">
          Invalid or expired password reset token. Please request a new password reset link.
        </Alert>
        
        <div className="flex flex-col space-y-4">
          <Button
            type="button"
            variant="primary"
            className="w-full"
            onClick={handleBackToForgotPassword}
          >
            Request New Reset Link
          </Button>
          
          <div className="text-center">
            <Link href="/login" className="text-primary-600 hover:text-primary-800 font-medium">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  // If verified, the parent component will handle showing the reset form
  return null;
};

export default ResetPasswordVerifyForm;
