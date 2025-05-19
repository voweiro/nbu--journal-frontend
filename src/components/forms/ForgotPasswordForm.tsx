import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

interface ForgotPasswordFormData {
  email: string;
}

const ForgotPasswordForm: React.FC = () => {
  const { forgotPassword, error, isLoading, clearError } = useAuth();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<ForgotPasswordFormData>();

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      clearError();
      setSuccessMessage(null);
      
      const result = await forgotPassword(data.email);
      
      if (result.success) {
        setSuccessMessage('Password reset instructions have been sent to your email. Please check your inbox.');
      } else {
        // The API will always return success for security reasons, even if the email doesn't exist
        setSuccessMessage('If your email is registered, you will receive password reset instructions.');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      // Error will be handled by the AuthContext
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <Alert 
          variant="danger" 
          dismissible 
          onDismiss={clearError}
        >
          {error}
        </Alert>
      )}
      
      {successMessage && (
        <Alert 
          variant="success" 
          dismissible 
          onDismiss={() => setSuccessMessage(null)}
        >
          {successMessage}
        </Alert>
      )}
      
      <div>
        <label htmlFor="email" className="form-label">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          className={`form-input ${errors.email ? 'border-red-500' : ''}`}
          {...register('email', { 
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Please enter a valid email address'
            }
          })}
        />
        {errors.email && (
          <p className="form-error">{errors.email.message}</p>
        )}
      </div>

      <div className="flex flex-col space-y-4">
        <Button
          type="submit"
          variant="primary"
          className="w-full"
          isLoading={isLoading}
        >
          Send Reset Instructions
        </Button>
        
        <div className="text-center">
          <Link href="/login" className="text-primary-600 hover:text-primary-800 font-medium">
            Back to Login
          </Link>
        </div>
      </div>
    </form>
  );
};

export default ForgotPasswordForm;
