import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { journalAPI, userAPI } from '@/utils/api';
import { useAuth } from '@/contexts/AuthContext';
import { Journal, User, UserRole, JournalStatus } from '@/types';

const DashboardPage: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  
  const [stats, setStats] = useState({
    totalJournals: 0,
    publishedJournals: 0,
    pendingJournals: 0,
    totalPublishers: 0,
    totalReviewers: 0
  });
  
  const [recentJournals, setRecentJournals] = useState<Journal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Redirect if not authenticated or not admin/super admin
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || 
        (user?.role !== UserRole.ADMIN && user?.role !== UserRole.SUPER_ADMIN))) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router, user]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!isAuthenticated || (user?.role !== UserRole.ADMIN && user?.role !== UserRole.SUPER_ADMIN)) {
        return;
      }
      
      try {
        setIsLoading(true);
        
        // Fetch all journals
        const { journals: allJournals } = await journalAPI.getAllJournals();
        
        // Fetch users
        const { users: publishers } = await userAPI.getAllUsers(UserRole.PUBLISHER);
        const { users: reviewers } = await userAPI.getAllUsers(UserRole.REVIEWER);
        
        // Calculate stats
        const publishedJournals = allJournals.filter((j: any) => 
          j.status === JournalStatus.APPROVED || j.status === JournalStatus.PUBLISHED
        );
        const pendingJournals = allJournals.filter((j: any) => 
          j.status === JournalStatus.SUBMITTED || 
          j.status === JournalStatus.RECEIVED || 
          j.status === JournalStatus.ASSIGNED || 
          j.status === JournalStatus.BEING_REVIEWED
        );
        
        setStats({
          totalJournals: allJournals.length,
          publishedJournals: publishedJournals.length,
          pendingJournals: pendingJournals.length,
          totalPublishers: publishers.length,
          totalReviewers: reviewers.length
        });
        
        // Get recent journals (limit to 5)
        const sortedJournals = [...allJournals].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setRecentJournals(sortedJournals.slice(0, 5));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAuthenticated, user]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    let bgColor = '';
    let textColor = '';
    
    switch (status) {
      case 'submitted':
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-800';
        break;
      case 'under_review':
        bgColor = 'bg-blue-100';
        textColor = 'text-blue-800';
        break;
      case 'approved':
        bgColor = 'bg-green-100';
        textColor = 'text-green-800';
        break;
      case 'rejected':
        bgColor = 'bg-red-100';
        textColor = 'text-red-800';
        break;
      default:
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-800';
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
        {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
      </span>
    );
  };

  return (
    <Layout title="Dashboard | NBU Journal System">
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            
            {user?.role === UserRole.SUPER_ADMIN && (
              <Button
                variant="primary"
                onClick={() => router.push('/users/create')}
              >
                Add New User
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
                <Card className="bg-white shadow-sm">
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-500">Total Journals</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalJournals}</p>
                  </div>
                </Card>
                
                <Card className="bg-white shadow-sm">
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-500">Published</h3>
                    <p className="text-3xl font-bold text-green-600 mt-2">{stats.publishedJournals}</p>
                  </div>
                </Card>
                
                <Card className="bg-white shadow-sm">
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-500">Pending</h3>
                    <p className="text-3xl font-bold text-blue-600 mt-2">{stats.pendingJournals}</p>
                  </div>
                </Card>
                
                <Card className="bg-white shadow-sm">
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-500">Publishers</h3>
                    <p className="text-3xl font-bold text-purple-600 mt-2">{stats.totalPublishers}</p>
                  </div>
                </Card>
                
                <Card className="bg-white shadow-sm">
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-500">Reviewers</h3>
                    <p className="text-3xl font-bold text-orange-600 mt-2">{stats.totalReviewers}</p>
                  </div>
                </Card>
              </div>

              {/* Recent Journals */}
              <Card className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Recent Journal Submissions</h2>
                  <Button
                    variant="outline"
                    onClick={() => router.push('/journals')}
                  >
                    View All
                  </Button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Title
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Publisher
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentJournals.length > 0 ? (
                        recentJournals.map((journal: any) => (
                          <tr key={journal.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                                {journal.title}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {journal.publisher_first_name} {journal.publisher_last_name}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {formatDate(journal.created_at)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getStatusBadge(journal.status)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push(`/journals/${journal.id}`)}
                              >
                                View
                              </Button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                            No journals found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      fullWidth
                      onClick={() => router.push('/journals?status=submitted')}
                    >
                      View Submitted Journals
                    </Button>
                    <Button
                      variant="outline"
                      fullWidth
                      onClick={() => router.push('/journals?status=under_review')}
                    >
                      View Journals Under Review
                    </Button>
                    {user?.role === UserRole.SUPER_ADMIN && (
                      <>
                        <Button
                          variant="outline"
                          fullWidth
                          onClick={() => router.push('/users')}
                        >
                          Manage Users
                        </Button>
                        <Button
                          variant="outline"
                          fullWidth
                          onClick={() => router.push('/users/create')}
                        >
                          Add New User
                        </Button>
                      </>
                    )}
                  </div>
                </Card>
                
                <Card>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">System Overview</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Journal Status Distribution</h3>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        {stats.totalJournals > 0 && (
                          <>
                            <div 
                              className="bg-green-600 h-2.5 rounded-full" 
                              style={{ 
                                width: `${(stats.publishedJournals / stats.totalJournals) * 100}%`,
                                float: 'left'
                              }}
                            />
                            <div 
                              className="bg-blue-600 h-2.5 rounded-full" 
                              style={{ 
                                width: `${(stats.pendingJournals / stats.totalJournals) * 100}%`,
                                float: 'left'
                              }}
                            />
                          </>
                        )}
                      </div>
                      <div className="flex justify-between text-xs mt-1">
                        <span>Published: {stats.publishedJournals}</span>
                        <span>Pending: {stats.pendingJournals}</span>
                        <span>
                          Rejected: {stats.totalJournals - stats.publishedJournals - stats.pendingJournals}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">System Status</h3>
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                        <span className="text-sm text-gray-700">All systems operational</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
