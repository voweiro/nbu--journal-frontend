import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';

interface OTPVerificationFormProps {
  email: string;
  onVerify: (otp: string) => Promise<void>;
  onResend: () => Promise<void>;
  error: string | null;
  isLoading: boolean;
  onDismissError: () => void;
  emailError?: boolean;
}

const OTPVerificationForm: React.FC<OTPVerificationFormProps> = ({
  email,
  onVerify,
  onResend,
  error,
  isLoading,
  onDismissError,
  emailError,
}) => {
  const [otp, setOtp] = useState('');
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.trim().length === 0) return;
    
    await onVerify(otp);
  };

  const handleResend = async () => {
    await onResend();
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
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Verify Your Email</h2>
      
      {emailError && (
        <Alert 
          variant="warning" 
          dismissible 
          onDismiss={onDismissError}
        >
          There was an issue sending the verification email. You can try to resend it or contact support if the problem persists.
        </Alert>
      )}
      
      {error && (
        <Alert 
          variant="danger" 
          dismissible 
          onDismiss={onDismissError}
        >
          {error}
        </Alert>
      )}

      <div className="text-center">
        <p className="mt-2 text-gray-600">
          We've sent a verification code to <span className="font-medium">{email}</span>
        </p>
        <p className="mt-1 text-sm text-gray-500">
          Please check your inbox and enter the 6-digit code below to verify your email address.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 mt-4">
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
  );
};

export default OTPVerificationForm;
