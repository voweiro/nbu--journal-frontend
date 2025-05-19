import React from 'react';
import Layout from '@/components/layout/Layout';
import ForgotPasswordForm from '@/components/forms/ForgotPasswordForm';

const ForgotPasswordPage: React.FC = () => {
  return (
    <Layout title="Forgot Password | NBU Journal System">
      <div className="max-w-md mx-auto py-8">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="px-6 py-8">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
              Forgot Password
            </h2>
            <p className="text-gray-600 text-center mb-8">
              Enter your email address and we'll send you instructions to reset your password.
            </p>
            
            <ForgotPasswordForm />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ForgotPasswordPage;
