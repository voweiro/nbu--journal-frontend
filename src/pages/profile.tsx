import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import Layout from '@/components/layout/Layout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { userAPI } from '@/utils/api';
import { useAuth } from '@/contexts/AuthContext';
import { getFileUrl } from '@/utils/fileHelper';

interface ProfileFormData {
  first_name: string;
  last_name: string;
  department: string;
}

interface PasswordChangeFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ProfilePage: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading, changePassword } = useAuth();
  const router = useRouter();
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { 
    register: registerProfile, 
    handleSubmit: handleProfileSubmit, 
    setValue: setProfileValue,
    formState: { errors: profileErrors } 
  } = useForm<ProfileFormData>();

  const { 
    register: registerPassword, 
    handleSubmit: handlePasswordSubmit, 
    watch: watchPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors } 
  } = useForm<PasswordChangeFormData>();

  const newPassword = watchPassword('newPassword', '');

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Set initial form values
  useEffect(() => {
    if (user) {
      setProfileValue('first_name', user.first_name);
      setProfileValue('last_name', user.last_name);
      setProfileValue('department', user.department || '');
      
      if (user.profile_picture) {
        // Handle both Google Drive files and local files
        setPreviewUrl(getFileUrl(user.profile_picture));
      }
    }
  }, [user, setProfileValue]);

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

  const onProfileSubmit = async (data: ProfileFormData) => {
    if (!user) return;
    
    try {
      setIsUpdating(true);
      setError(null);
      setSuccess(null);
      
      const formData = new FormData();
      formData.append('first_name', data.first_name);
      formData.append('last_name', data.last_name);
      formData.append('department', data.department);
      
      if (profileImage) {
        formData.append('profilePicture', profileImage);
      }
      
      await userAPI.updateUser(user.id, formData);
      
      setSuccess('Profile updated successfully');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordChangeFormData) => {
    try {
      setIsChangingPassword(true);
      setError(null);
      setSuccess(null);
      
      await changePassword(data.currentPassword, data.newPassword);
      
      setSuccess('Password changed successfully');
      resetPassword();
    } catch (error: any) {
      console.error('Error changing password:', error);
      setError(error.response?.data?.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <Layout title="My Profile | NBU Journal System">
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Information */}
            <div className="lg:col-span-2">
              <Card>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Information</h2>
                
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
                
                <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-6">
                  <div className="flex items-center space-x-6 mb-4">
                    <div className="flex-shrink-0">
                      <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200">
                        {previewUrl ? (
                          <Image 
                            src={previewUrl}
                            alt="Profile preview"
                            width={96}
                            height={96}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="flex items-center justify-center w-full h-full bg-primary-100 text-primary-600 font-medium text-2xl">
                            {user?.first_name.charAt(0)}
                            {user?.last_name.charAt(0)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
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
                        Change Profile Picture
                      </Button>
                      <p className="mt-1 text-sm text-gray-500">
                        JPG, PNG or GIF. Max size 2MB.
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="first_name" className="form-label">
                        First Name
                      </label>
                      <input
                        id="first_name"
                        type="text"
                        className={`form-input ${profileErrors.first_name ? 'border-red-500' : ''}`}
                        {...registerProfile('first_name', { 
                          required: 'First name is required'
                        })}
                      />
                      {profileErrors.first_name && (
                        <p className="form-error">{profileErrors.first_name.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="last_name" className="form-label">
                        Last Name
                      </label>
                      <input
                        id="last_name"
                        type="text"
                        className={`form-input ${profileErrors.last_name ? 'border-red-500' : ''}`}
                        {...registerProfile('last_name', { 
                          required: 'Last name is required'
                        })}
                      />
                      {profileErrors.last_name && (
                        <p className="form-error">{profileErrors.last_name.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="department" className="form-label">
                      Department
                    </label>
                    <input
                      id="department"
                      type="text"
                      className="form-input"
                      {...registerProfile('department')}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      variant="primary"
                      isLoading={isUpdating}
                    >
                      Update Profile
                    </Button>
                  </div>
                </form>
              </Card>
            </div>

            {/* Account Information */}
            <div>
              <Card className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Account Information</h2>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Username</span>
                    <p className="text-gray-900">{user?.username}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Email</span>
                    <p className="text-gray-900">{user?.email}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Role</span>
                    <p className="text-gray-900">
                      {user?.role ? user.role.replace('_', ' ').charAt(0).toUpperCase() + user.role.replace('_', ' ').slice(1) : ''}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Member Since</span>
                    <p className="text-gray-900">
                      {user?.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                    </p>
                  </div>
                </div>
              </Card>

              <Card>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Change Password</h2>
                <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
                  <div>
                    <label htmlFor="currentPassword" className="form-label">
                      Current Password
                    </label>
                    <input
                      id="currentPassword"
                      type="password"
                      className={`form-input ${passwordErrors.currentPassword ? 'border-red-500' : ''}`}
                      {...registerPassword('currentPassword', { 
                        required: 'Current password is required'
                      })}
                    />
                    {passwordErrors.currentPassword && (
                      <p className="form-error">{passwordErrors.currentPassword.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="newPassword" className="form-label">
                      New Password
                    </label>
                    <input
                      id="newPassword"
                      type="password"
                      className={`form-input ${passwordErrors.newPassword ? 'border-red-500' : ''}`}
                      {...registerPassword('newPassword', { 
                        required: 'New password is required',
                        minLength: {
                          value: 6,
                          message: 'Password must be at least 6 characters'
                        }
                      })}
                    />
                    {passwordErrors.newPassword && (
                      <p className="form-error">{passwordErrors.newPassword.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="form-label">
                      Confirm New Password
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      className={`form-input ${passwordErrors.confirmPassword ? 'border-red-500' : ''}`}
                      {...registerPassword('confirmPassword', { 
                        required: 'Please confirm your password',
                        validate: value => value === newPassword || "Passwords do not match"
                      })}
                    />
                    {passwordErrors.confirmPassword && (
                      <p className="form-error">{passwordErrors.confirmPassword.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    isLoading={isChangingPassword}
                  >
                    Change Password
                  </Button>
                </form>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
