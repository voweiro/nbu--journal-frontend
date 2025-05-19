import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import RegisterForm from '@/components/forms/RegisterForm';
import Card from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';

const RegisterPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/journals');
    }
  }, [isAuthenticated, router]);

  return (
    <Layout title="Register | NBU Journal System">
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="mb-4">
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Create a Publisher Account</h1>
                <p className="text-gray-600 mt-2">
                  Register to submit and manage your journal publications
                </p>
              </div>
              
              <RegisterForm />
            </Card>
            
            <div className="text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link href="/login" className="text-primary-600 hover:text-primary-800 font-medium">
                  Login here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RegisterPage;
