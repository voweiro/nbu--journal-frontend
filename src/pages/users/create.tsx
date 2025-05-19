import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import Layout from '@/components/layout/Layout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { userAPI } from '@/utils/api';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';

interface CreateUserFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  department: string;
}

const CreateUserPage: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const { 
    register, 
    handleSubmit, 
    watch,
    reset,
    formState: { errors } 
  } = useForm<CreateUserFormData>();

  const password = watch('password', '');

  // Redirect if not authenticated or not super admin
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== UserRole.SUPER_ADMIN)) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router, user]);

  const onSubmit = async (data: CreateUserFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);
      
      // Create new user
      const { username, email, password, first_name, last_name, role, department } = data;
      
      await userAPI.createUser({
        username,
        email,
        password,
        first_name,
        last_name,
        role,
        department
      });
      
      // Show success message and reset form
      setSuccess('User created successfully');
      reset();
    } catch (error: any) {
      console.error('Error creating user:', error);
      setError(error.response?.data?.message || 'Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout title="Create User | NBU Journal System">
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Create New User</h1>
              <Button
                variant="outline"
                onClick={() => router.push('/users')}
              >
                Back to Users
              </Button>
            </div>
            
            <Card>
              {error && (
                <Alert 
                  variant="danger" 
                  className="mb-6" 
                  dismissible 
                  onDismiss={() => setError(null)}
                >
                  {error}
                </Alert>
              )}
              
              {success && (
                <Alert 
                  variant="success" 
                  className="mb-6" 
                  dismissible 
                  onDismiss={() => setSuccess(null)}
                >
                  {success}
                </Alert>
              )}
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                  <label htmlFor="username" className="form-label">
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    className={`form-input ${errors.username ? 'border-red-500' : ''}`}
                    {...register('username', { 
                      required: 'Username is required',
                      minLength: {
                        value: 3,
                        message: 'Username must be at least 3 characters'
                      },
                      maxLength: {
                        value: 50,
                        message: 'Username must be at most 50 characters'
                      },
                      pattern: {
                        value: /^[a-zA-Z0-9_]+$/,
                        message: 'Username can only contain letters, numbers, and underscores'
                      }
                    })}
                  />
                  {errors.username && (
                    <p className="form-error">{errors.username.message}</p>
                  )}
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
                        message: 'Invalid email address'
                      }
                    })}
                  />
                  {errors.email && (
                    <p className="form-error">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="role" className="form-label">
                    Role
                  </label>
                  <select
                    id="role"
                    className={`form-input ${errors.role ? 'border-red-500' : ''}`}
                    {...register('role', { 
                      required: 'Role is required'
                    })}
                  >
                    <option value="">Select a role</option>
                    <option value={UserRole.ADMIN}>Admin</option>
                    <option value={UserRole.REVIEWER}>Reviewer</option>
                    <option value={UserRole.PUBLISHER}>Publisher</option>
                  </select>
                  {errors.role && (
                    <p className="form-error">{errors.role.message}</p>
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
                    {...register('department')}
                  />
                  {errors.department && (
                    <p className="form-error">{errors.department.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    className={`form-input ${errors.password ? 'border-red-500' : ''}`}
                    {...register('password', { 
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters'
                      }
                    })}
                  />
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
                    type="password"
                    className={`form-input ${errors.confirmPassword ? 'border-red-500' : ''}`}
                    {...register('confirmPassword', { 
                      required: 'Please confirm your password',
                      validate: value => value === password || "Passwords do not match"
                    })}
                  />
                  {errors.confirmPassword && (
                    <p className="form-error">{errors.confirmPassword.message}</p>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isSubmitting}
                  >
                    Create User
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CreateUserPage;
