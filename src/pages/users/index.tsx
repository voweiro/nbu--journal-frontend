import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Layout from '@/components/layout/Layout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { userAPI } from '@/utils/api';
import { useAuth } from '@/contexts/AuthContext';
import { User, UserRole } from '@/types';

const UsersPage: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [passwordResetError, setPasswordResetError] = useState<string | null>(null);

  // Redirect if not authenticated or not super admin
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== UserRole.SUPER_ADMIN)) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router, user]);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      if (!isAuthenticated || user?.role !== UserRole.SUPER_ADMIN) {
        return;
      }
      
      try {
        setIsLoading(true);
        setError(null);
        
        const { users: fetchedUsers } = await userAPI.getAllUsers(selectedRole || undefined);
        setUsers(fetchedUsers);
      } catch (error: any) {
        console.error('Error fetching users:', error);
        setError(error.response?.data?.message || 'Failed to fetch users');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [isAuthenticated, user, selectedRole]);

  const handleRoleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRole(e.target.value);
  };

  const handleResetPassword = (userId: number) => {
    setSelectedUserId(userId);
    setNewPassword('');
    setPasswordResetError(null);
    setShowResetPasswordModal(true);
  };

  const handleDeleteUser = async (userId: number) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await userAPI.deleteUser(userId);
        
        // Update users list
        setUsers(users.filter(u => u.id !== userId));
      } catch (error: any) {
        console.error('Error deleting user:', error);
        setError(error.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const submitPasswordReset = async () => {
    if (!selectedUserId || !newPassword) return;
    
    try {
      setIsResettingPassword(true);
      setPasswordResetError(null);
      
      await userAPI.resetPassword(selectedUserId, newPassword);
      
      // Close modal and reset state
      setShowResetPasswordModal(false);
      setSelectedUserId(null);
      setNewPassword('');
    } catch (error: any) {
      console.error('Error resetting password:', error);
      setPasswordResetError(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsResettingPassword(false);
    }
  };

  const getRoleBadge = (role: string) => {
    let bgColor = '';
    let textColor = '';
    
    switch (role) {
      case UserRole.SUPER_ADMIN:
        bgColor = 'bg-purple-100';
        textColor = 'text-purple-800';
        break;
      case UserRole.ADMIN:
        bgColor = 'bg-blue-100';
        textColor = 'text-blue-800';
        break;
      case UserRole.REVIEWER:
        bgColor = 'bg-green-100';
        textColor = 'text-green-800';
        break;
      case UserRole.PUBLISHER:
        bgColor = 'bg-yellow-100';
        textColor = 'text-yellow-800';
        break;
      default:
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-800';
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
        {role.replace('_', ' ')}
      </span>
    );
  };

  return (
    <Layout title="User Management | NBU Journal System">
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <Button
              variant="primary"
              onClick={() => router.push('/users/create')}
            >
              Add New User
            </Button>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <div className="flex items-center">
              <div>
                <label htmlFor="role-filter" className="form-label">
                  Filter by Role
                </label>
                <select
                  id="role-filter"
                  className="form-input py-2"
                  value={selectedRole}
                  onChange={handleRoleFilterChange}
                >
                  <option value="">All Roles</option>
                  <option value={UserRole.ADMIN}>Admin</option>
                  <option value={UserRole.REVIEWER}>Reviewer</option>
                  <option value={UserRole.PUBLISHER}>Publisher</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Error message */}
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

          {/* Users list */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <Card>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Department
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.length > 0 ? (
                      users.map((user) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden bg-gray-200">
                                {user.profile_picture ? (
                                  <Image 
                                    src={`http://localhost:5000${user.profile_picture}`}
                                    alt={`${user.first_name} ${user.last_name}`}
                                    width={40}
                                    height={40}
                                    className="object-cover w-full h-full"
                                  />
                                ) : (
                                  <div className="flex items-center justify-center w-full h-full bg-primary-100 text-primary-600 font-medium text-sm">
                                    {user.first_name.charAt(0)}
                                    {user.last_name.charAt(0)}
                                  </div>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.first_name} {user.last_name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  @{user.username}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{user.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getRoleBadge(user.role)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{user.department || '-'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleResetPassword(user.id)}
                              >
                                Reset Password
                              </Button>
                              
                              {/* Don't allow deleting super admin users */}
                              {user.role !== UserRole.SUPER_ADMIN && (
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => handleDeleteUser(user.id)}
                                >
                                  Delete
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                          No users found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Reset Password Modal */}
      {showResetPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Reset User Password</h3>
            
            {passwordResetError && (
              <Alert 
                variant="danger" 
                className="mb-4" 
                dismissible 
                onDismiss={() => setPasswordResetError(null)}
              >
                {passwordResetError}
              </Alert>
            )}
            
            <div className="mb-4">
              <label htmlFor="new-password" className="form-label">
                New Password
              </label>
              <input
                id="new-password"
                type="password"
                className="form-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={6}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Password must be at least 6 characters long
              </p>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowResetPasswordModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={submitPasswordReset}
                isLoading={isResettingPassword}
                disabled={!newPassword || newPassword.length < 6}
              >
                Reset Password
              </Button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default UsersPage;
