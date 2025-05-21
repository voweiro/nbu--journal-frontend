import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import ResetPasswordVerifyForm from '@/components/forms/ResetPasswordVerifyForm';
import ResetPasswordForm from '@/components/forms/ResetPasswordForm';
import Alert from '@/components/ui/Alert';
import Link from 'next/link';

const ResetPasswordPage: React.FC = () => {
  const router = useRouter();
  const { token, email } = router.query;
  const [isTokenVerified, setIsTokenVerified] = useState(false);
  
  // Handle token verification success
  const handleVerified = () => {
    setIsTokenVerified(true);
  };
  
  // Wait for router to be ready before checking params
  useEffect(() => {
    // Log the query parameters for debugging
    if (router.isReady) {
      console.log('Reset password query params:', router.query);
    }
  }, [router.isReady, router.query]);
  
  // Ensure we have both token and email
  const hasRequiredParams = typeof token === 'string' && typeof email === 'string';
  
  // If we don't have the required params, show an error
  if (router.isReady && !hasRequiredParams) {
    return (
      <Layout title="Reset Password | NBU Journal System">
        <div className="max-w-md mx-auto py-8">
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="px-6 py-8">
              <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
                Reset Password
              </h2>
              
              <Alert variant="danger">
                Invalid password reset link. Please request a new password reset.
              </Alert>
              
              <div className="mt-6 text-center">
                <Link href="/forgot-password" className="text-primary-600 hover:text-primary-800 font-medium">
                  Back to Forgot Password
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout title="Reset Password | NBU Journal System">
      <div className="max-w-md mx-auto py-8">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="px-6 py-8">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
              Reset Password
            </h2>
            
            {hasRequiredParams && !isTokenVerified && (
              <ResetPasswordVerifyForm 
                email={email as string} 
                token={token as string}
                onVerified={handleVerified}
              />
            )}
            
            {hasRequiredParams && isTokenVerified && (
              <>
                <p className="text-gray-600 text-center mb-8">
                  Please enter your new password below.
                </p>
                
                <ResetPasswordForm 
                  email={email as string} 
                  token={token as string} 
                />
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ResetPasswordPage;
