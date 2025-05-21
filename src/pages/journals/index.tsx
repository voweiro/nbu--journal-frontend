import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import JournalCard from '@/components/ui/JournalCard';
import Alert from '@/components/ui/Alert';
import { journalAPI } from '@/utils/api';
import { useAuth } from '@/contexts/AuthContext';
import { Journal, JournalFilters, JournalStatus, UserRole } from '@/types';

const JournalsPage: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [journals, setJournals] = useState<Journal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<JournalFilters>({
    status: undefined,
    sort_by: 'created_at',
    sort_order: 'DESC',
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Fetch journals
  useEffect(() => {
    const fetchJournals = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const { journals: fetchedJournals } = await journalAPI.getAllJournals(filters);
        setJournals(fetchedJournals);
      } catch (error: any) {
        console.error('Error fetching journals:', error);
        setError(error.response?.data?.message || 'Failed to fetch journals');
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchJournals();
    }
  }, [isAuthenticated, filters]);

  const handleFilterChange = (newFilters: Partial<JournalFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  // Get page title based on user role
  const getPageTitle = () => {
    if (!user) return 'Journals';
    
    switch (user.role) {
      case UserRole.SUPER_ADMIN:
      case UserRole.ADMIN:
        return 'All Journals';
      case UserRole.REVIEWER:
        return 'Journals for Review';
      case UserRole.PUBLISHER:
        return 'My Journals';
      default:
        return 'Journals';
    }
  };

  return (
    <Layout title={`${getPageTitle()} | NBU Journal System`}>
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{getPageTitle()}</h1>
            
            {/* Show submit button only for publishers */}
            {user?.role === UserRole.PUBLISHER && (
              <Button
                variant="primary"
                onClick={() => router.push('/journals/submit')}
              >
                Submit New Journal
              </Button>
            )}
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <div className="flex flex-wrap gap-4">
              <div>
                <label htmlFor="status-filter" className="form-label">
                  Status
                </label>
                <select
                  id="status-filter"
                  className="form-input py-2"
                  value={filters.status || ''}
                  onChange={(e) => 
                    handleFilterChange({ 
                      status: e.target.value ? e.target.value as JournalStatus : undefined 
                    })
                  }
                >
                  <option value="">All</option>
                  <option value={JournalStatus.SUBMITTED}>Submitted</option>
                  <option value={JournalStatus.RECEIVED}>Received</option>
                  <option value={JournalStatus.ASSIGNED}>Assigned</option>
                  <option value={JournalStatus.BEING_REVIEWED}>Being Reviewed</option>
                  <option value={JournalStatus.APPROVED}>Approved</option>
                  <option value={JournalStatus.REJECTED}>Rejected</option>
                  <option value={JournalStatus.PUBLISHED}>Published</option>
                </select>
              </div>

              <div>
                <label htmlFor="sort-by" className="form-label">
                  Sort By
                </label>
                <select
                  id="sort-by"
                  className="form-input py-2"
                  value={filters.sort_by}
                  onChange={(e) => handleFilterChange({ sort_by: e.target.value as any })}
                >
                  <option value="created_at">Submission Date</option>
                  <option value="title">Title</option>
                  {filters.status === JournalStatus.APPROVED && (
                    <option value="published_date">Publication Date</option>
                  )}
                </select>
              </div>

              <div>
                <label htmlFor="sort-order" className="form-label">
                  Order
                </label>
                <select
                  id="sort-order"
                  className="form-input py-2"
                  value={filters.sort_order}
                  onChange={(e) => handleFilterChange({ sort_order: e.target.value as any })}
                >
                  <option value="DESC">Newest First</option>
                  <option value="ASC">Oldest First</option>
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

          {/* Journals list */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : journals.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
              {journals.map((journal) => (
                <JournalCard key={journal.id} journal={journal} />
              ))}
            </div>
          ) : (
            <Card>
              <div className="text-center py-8">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No journals found</h3>
                <p className="text-gray-500 mb-4">
                  {user?.role === UserRole.PUBLISHER
                    ? "You haven't submitted any journals yet."
                    : "There are no journals matching your filters."}
                </p>
                {user?.role === UserRole.PUBLISHER && (
                  <Button
                    variant="primary"
                    onClick={() => router.push('/journals/submit')}
                  >
                    Submit Your First Journal
                  </Button>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default JournalsPage;
