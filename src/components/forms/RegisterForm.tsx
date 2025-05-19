import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { useAuth } from '@/contexts/AuthContext';
import OTPVerificationForm from './OTPVerificationForm';

interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  first_name: string;
  last_name: string;
  department: string;
}

interface VerificationState {
  requiresVerification: boolean;
  email: string;
  emailError?: boolean;
}

const RegisterForm: React.FC = () => {
  const { register: registerUser, verifyEmail, resendOTP, error, isLoading, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [verificationState, setVerificationState] = useState<VerificationState | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { 
    register, 
    handleSubmit, 
    watch,
    formState: { errors } 
  } = useForm<RegisterFormData>();

  const password = useRef({});
  password.current = watch("password", "");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: RegisterFormData) => {
    try {
      
      const formData = new FormData();
      formData.append('email', data.email);
      formData.append('password', data.password);
      formData.append('first_name', data.first_name);
      formData.append('last_name', data.last_name);
      formData.append('department', data.department);
      
      if (profileImage) {
        formData.append('profilePicture', profileImage);
      }
      
      const result = await registerUser(formData);
      
      // If verification is required, set the verification state
      if (result.requiresVerification) {
        setVerificationState({
          requiresVerification: true,
          email: result.email,
          emailError: result.emailError || false
        });
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      // The error will be handled by the AuthContext
    }
  };

  // Handle OTP verification
  const handleVerifyEmail = async (otp: string) => {
    if (!verificationState) return;
    
    try {
      await verifyEmail(verificationState.email, otp);
    } catch (error) {
      console.error('Verification error:', error);
      // Error will be handled by the AuthContext
    }
  };
  
  // Handle resend OTP
  const handleResendOTP = async () => {
    if (!verificationState) return;
    
    try {
      const result = await resendOTP(verificationState.email);
      
      // Update verification state with new emailError status
      if (result.emailError) {
        setVerificationState({
          ...verificationState,
          emailError: true
        });
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      // Error will be handled by the AuthContext
    }
  };
  
  // If verification is required, show the OTP verification form
  if (verificationState?.requiresVerification) {
    return (
      <OTPVerificationForm
        email={verificationState.email}
        onVerify={handleVerifyEmail}
        onResend={handleResendOTP}
        error={error}
        isLoading={isLoading}
        onDismissError={clearError}
        emailError={verificationState.emailError}
      />
    );
  }
  
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="first_name" className="form-label">
            First Name
          </label>
          <input
            id="first_name"
            type="text"
            className={`form-input ${errors.first_name ? 'border-red-500' : ''}`}
            {...register('first_name', { 
              required: 'First name is required'
            })}
          />
          {errors.first_name && (
            <p className="form-error">{errors.first_name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="last_name" className="form-label">
            Last Name
          </label>
          <input
            id="last_name"
            type="text"
            className={`form-input ${errors.last_name ? 'border-red-500' : ''}`}
            {...register('last_name', { 
              required: 'Last name is required'
            })}
          />
          {errors.last_name && (
            <p className="form-error">{errors.last_name.message}</p>
          )}
        </div>
      </div>

      <div>
      </div>

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
        <p className="mt-1 text-xs text-gray-500">Please enter a valid email address</p>
        {errors.email && (
          <p className="form-error">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="department" className="form-label">
          Department
        </label>
        <input
          id="department"
          type="text"
          className={`form-input ${errors.department ? 'border-red-500' : ''}`}
          {...register('department', { 
            required: 'Department is required'
          })}
        />
        {errors.department && (
          <p className="form-error">{errors.department.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="form-label">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            className={`form-input ${errors.password ? 'border-red-500' : ''}`}
            {...register('password', { 
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters'
              }
            })}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
        {errors.password && (
          <p className="form-error">{errors.password.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="form-label">
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          type={showPassword ? 'text' : 'password'}
          className={`form-input ${errors.confirmPassword ? 'border-red-500' : ''}`}
          {...register('confirmPassword', { 
            required: 'Please confirm your password',
            validate: value => value === password.current || "Passwords do not match"
          })}
        />
        {errors.confirmPassword && (
          <p className="form-error">{errors.confirmPassword.message}</p>
        )}
      </div>

      <div>
        <label className="form-label">Profile Picture</label>
        <div className="flex items-center space-x-4">
          {previewUrl && (
            <div className="w-20 h-20 rounded-full overflow-hidden">
              <img 
                src={previewUrl} 
                alt="Profile preview" 
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              {profileImage ? 'Change Picture' : 'Upload Picture'}
            </Button>
            <p className="mt-1 text-sm text-gray-500">
              JPG, PNG or GIF. Max size 2MB.
            </p>
          </div>
        </div>
      </div>

      <div>
        <Button 
          type="submit" 
          variant="primary" 
          fullWidth 
          isLoading={isLoading}
        >
          Register
        </Button>
      </div>
    </form>
  );
};

export default RegisterForm;
