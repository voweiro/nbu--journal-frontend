import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import LoginForm from '@/components/forms/LoginForm';
import Card from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';

const LoginPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/journals');
    }
  }, [isAuthenticated, router]);

  return (
    <Layout title="Login | NBU Journal System">
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <Card className="mb-4">
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Login to Your Account</h1>
                <p className="text-gray-600 mt-2">
                  Enter your credentials to access the journal system
                </p>
              </div>
              
              <LoginForm />
            </Card>
            
            <div className="text-center">
              <p className="text-gray-600">
                Don&apos;t have an account?{' '}
                <Link href="/register" className="text-primary-600 hover:text-primary-800 font-medium">
                  Register here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LoginPage;
