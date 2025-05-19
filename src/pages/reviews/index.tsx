import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Alert from '@/components/ui/Alert';
import { reviewAPI } from '@/utils/api';
import { useAuth } from '@/contexts/AuthContext';
import { Journal, UserRole, JournalStatus } from '@/types';

const ReviewsPage: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  
  const [assignedJournals, setAssignedJournals] = useState<Journal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated or not a reviewer
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== UserRole.REVIEWER)) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router, user]);

  // Fetch assigned journals
  useEffect(() => {
    const fetchAssignedJournals = async () => {
      if (!isAuthenticated || user?.role !== UserRole.REVIEWER) {
        return;
      }
      
      try {
        setIsLoading(true);
        setError(null);
        
        const { journals } = await reviewAPI.getAssignedReviews();
        setAssignedJournals(journals);
      } catch (error: any) {
        console.error('Error fetching assigned journals:', error);
        setError(error.response?.data?.message || 'Failed to fetch assigned journals');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignedJournals();
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
    switch (status) {
      case 'submitted':
        return <Badge variant="default">Submitted</Badge>;
      case 'under_review':
        return <Badge variant="info">Under Review</Badge>;
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'rejected':
        return <Badge variant="danger">Rejected</Badge>;
      default:
        return null;
    }
  };

  return (
    <Layout title="My Reviews | NBU Journal System">
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">My Assigned Reviews</h1>

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

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : assignedJournals.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {assignedJournals.map((journal) => (
                <Card key={journal.id} className="overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h2 className="text-xl font-bold text-gray-900">{journal.title}</h2>
                      {getStatusBadge(journal.status)}
                    </div>
                    
                    <p className="text-gray-700 mb-4 line-clamp-2">{journal.abstract}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <span className="text-sm font-medium text-gray-500">Publisher:</span>
                        <p className="text-gray-900">
                          {journal.publisher_first_name} {journal.publisher_last_name}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Submitted:</span>
                        <p className="text-gray-900">{formatDate(journal.created_at)}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Status:</span>
                        <p className="text-gray-900">
                          {journal.status.charAt(0).toUpperCase() + journal.status.slice(1).replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-3">
                      <Button
                        variant="outline"
                        onClick={() => router.push(`/journals/${journal.id}`)}
                      >
                        View Details
                      </Button>
                      
                      {journal.status === JournalStatus.BEING_REVIEWED && (
                        <Button
                          variant="primary"
                          onClick={() => router.push(`/journals/${journal.id}`)}
                        >
                          Review Journal
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <div className="text-center py-8">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No journals assigned for review</h3>
                <p className="text-gray-500">
                  You don't have any journals assigned to you for review at the moment.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ReviewsPage;
