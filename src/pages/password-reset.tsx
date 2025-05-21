import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import ResetPasswordVerifyForm from '@/components/forms/ResetPasswordVerifyForm';
import ResetPasswordForm from '@/components/forms/ResetPasswordForm';
import Alert from '@/components/ui/Alert';
import Link from 'next/link';

const PasswordResetPage: React.FC = () => {
  const router = useRouter();
  const [isTokenVerified, setIsTokenVerified] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  
  // Parse query parameters on load
  useEffect(() => {
    if (router.isReady) {
      console.log('Password reset query params:', router.query);
      
      // Extract email and token from query parameters
      if (router.query.email) {
        setEmail(router.query.email as string);
      }
      
      if (router.query.token) {
        setToken(router.query.token as string);
      }
      
      // Also try to extract from the URL path if they're not in query params
      // This handles cases where the URL structure is different
      const urlPath = window.location.pathname;
      const urlSearch = window.location.search;
      console.log('URL path:', urlPath, 'Search:', urlSearch);
      
      // Try to parse URL parameters from the search string
      const searchParams = new URLSearchParams(urlSearch);
      if (!email && searchParams.has('email')) {
        setEmail(searchParams.get('email'));
      }
      if (!token && searchParams.has('token')) {
        setToken(searchParams.get('token'));
      }
      
      // If still not found, try to extract from the hash
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      if (!email && hashParams.has('email')) {
        setEmail(hashParams.get('email'));
      }
      if (!token && hashParams.has('token')) {
        setToken(hashParams.get('token'));
      }
    }
  }, [router.isReady, router.query]);
  
  // Handle token verification success
  const handleVerified = () => {
    setIsTokenVerified(true);
  };
  
  // Check if we have the required parameters
  const hasRequiredParams = !!email && !!token;
  
  // If we don't have the required params, show an error
  if (router.isReady && !hasRequiredParams) {
    return (
      <Layout title="Password Reset | NBU Journal System">
        <div className="max-w-md mx-auto py-8">
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="px-6 py-8">
              <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
                Password Reset
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
    <Layout title="Password Reset | NBU Journal System">
      <div className="max-w-md mx-auto py-8">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="px-6 py-8">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
              Reset Password
            </h2>
            
            {!isTokenVerified ? (
              <>
                <p className="text-gray-600 text-center mb-8">
                  Verifying your reset token...
                </p>
                
                {email && token && (
                  <ResetPasswordVerifyForm 
                    email={email} 
                    token={token} 
                    onVerified={handleVerified} 
                  />
                )}
              </>
            ) : (
              <>
                <p className="text-gray-600 text-center mb-8">
                  Please enter your new password below.
                </p>
                
                {email && token && (
                  <ResetPasswordForm 
                    email={email} 
                    token={token} 
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PasswordResetPage;
