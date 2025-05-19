import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { AxiosError } from 'axios';
import { toast } from 'react-toastify';
import Layout from '@/components/layout/Layout';
import JournalCard from '@/components/ui/JournalCard';
import { journalAPI } from '@/utils/api';
import { Journal, JournalFilters } from '@/types';

interface PaginationInfo {
  total: number;
  per_page: number;
  current_page: number;
  total_pages: number;
  has_more: boolean;
}

// Extend Window interface to include onUnpublishJournal
declare global {
  interface Window {
    onUnpublishJournal?: (journalId: number) => void;
  }
}

const AllJournalsPage: React.FC = () => {
  const router = useRouter();
  const [journals, setJournals] = useState<Journal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnpublishing, setIsUnpublishing] = useState<number | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    per_page: 20,
    current_page: 1,
    total_pages: 0,
    has_more: false
  });
  const [filters, setFilters] = useState<JournalFilters>({
    sort_by: 'published_date',
    sort_order: 'DESC',
    page: 1,
    limit: 20
  });

  // Fetch journals with pagination
  useEffect(() => {
    fetchJournals(filters);
  }, []);

  const fetchJournals = async (newFilters?: JournalFilters) => {
    try {
      setIsLoading(true);
      const appliedFilters = newFilters || filters;
      
      // Update filters state if new filters are provided
      if (newFilters) {
        setFilters(newFilters);
      }
      
      const data = await journalAPI.getPublishedJournals(appliedFilters);
      setJournals(data.journals);
      
      if (data.pagination) {
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching journals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    const newFilters = { ...filters, page };
    fetchJournals(newFilters);
    
    // Update URL with page parameter
    router.push({
      pathname: router.pathname,
      query: { ...router.query, page }
    }, undefined, { shallow: true });
  };

  const handleFilterChange = (newFilters: Partial<JournalFilters>) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 }; // Reset to page 1 when filters change
    fetchJournals(updatedFilters);
  };

  const handleUnpublishJournal = useCallback(async (journalId: number) => {
    if (!window.confirm('Are you sure you want to unpublish this journal? It will no longer be visible to the public.')) {
      return;
    }

    try {
      setIsUnpublishing(journalId);
      await journalAPI.unpublishJournal(journalId);
      
      // Update the journal list
      setJournals(prevJournals => 
        prevJournals.map(journal => 
          journal.id === journalId ? { ...journal, status: 'unpublished' } : journal
        )
      );
      
      toast.success('Journal has been unpublished successfully');
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      console.error('Error unpublishing journal:', error);
      toast.error(error.response?.data?.message || 'Failed to unpublish journal');
    } finally {
      setIsUnpublishing(null);
    }
  }, []);

  // Add unpublish handler to window for JournalCard
  useEffect(() => {
    window.onUnpublishJournal = handleUnpublishJournal;
    
    return () => {
      window.onUnpublishJournal = undefined;
    };
  }, [handleUnpublishJournal]);

  // Generate pagination links
  const renderPaginationLinks = () => {
    const pages = [];
    const { current_page, total_pages } = pagination;
    
    // Always show first page
    pages.push(
      <button
        key="first"
        onClick={() => handlePageChange(1)}
        className={`px-3 py-1 rounded-md ${current_page === 1 ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
        disabled={current_page === 1}
      >
        1
      </button>
    );
    
    // Show ellipsis if needed
    if (current_page > 3) {
      pages.push(
        <span key="ellipsis1" className="px-2">
          ...
        </span>
      );
    }
    
    // Show pages around current page
    for (let i = Math.max(2, current_page - 1); i <= Math.min(total_pages - 1, current_page + 1); i++) {
      if (i === 1 || i === total_pages) continue; // Skip first and last page as they're always shown
      
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 rounded-md ${current_page === i ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
        >
          {i}
        </button>
      );
    }
    
    // Show ellipsis if needed
    if (current_page < total_pages - 2) {
      pages.push(
        <span key="ellipsis2" className="px-2">
          ...
        </span>
      );
    }
    
    // Always show last page if there's more than one page
    if (total_pages > 1) {
      pages.push(
        <button
          key="last"
          onClick={() => handlePageChange(total_pages)}
          className={`px-3 py-1 rounded-md ${current_page === total_pages ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
          disabled={current_page === total_pages}
        >
          {total_pages}
        </button>
      );
    }
    
    return pages;
  };

  return (
    <Layout
      title="All Published Journals"
      description="Browse all academic journals published by Nigerian British University"
    >
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <Link href="/" className="flex items-center text-primary-600 hover:text-primary-800">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Homepage
            </Link>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">All Published Journals</h1>
          <p className="text-gray-600 mb-6">
            Showing {journals.length} of {pagination.total} journals
          </p>
          
          {/* Filters */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="sort_by" className="block text-sm font-medium text-gray-700 mb-1">
                  Sort By
                </label>
                <select
                  id="sort_by"
                  value={filters.sort_by}
                  onChange={(e) => handleFilterChange({ sort_by: e.target.value as any })}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                >
                  <option value="published_date">Publication Date</option>
                  <option value="title">Title</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="sort_order" className="block text-sm font-medium text-gray-700 mb-1">
                  Sort Order
                </label>
                <select
                  id="sort_order"
                  value={filters.sort_order}
                  onChange={(e) => handleFilterChange({ sort_order: e.target.value as 'ASC' | 'DESC' })}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                >
                  <option value="DESC">Newest First</option>
                  <option value="ASC">Oldest First</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="per_page" className="block text-sm font-medium text-gray-700 mb-1">
                  Items Per Page
                </label>
                <select
                  id="per_page"
                  value={filters.limit}
                  onChange={(e) => handleFilterChange({ limit: parseInt(e.target.value, 10) })}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                >
                  <option value={10}>10 per page</option>
                  <option value={20}>20 per page</option>
                  <option value={50}>50 per page</option>
                </select>
              </div>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          ) : journals.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  vectorEffect="non-scaling-stroke"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No journals found</h3>
              <p className="mt-1 text-sm text-gray-500">
                There are no published journals matching your criteria.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {journals.map((journal) => (
                  <JournalCard
                    key={journal.id}
                    journal={journal}
                    onUnpublish={handleUnpublishJournal}
                    isUnpublishing={isUnpublishing === journal.id}
                  />
                ))}
              </div>
              
              {/* Pagination */}
              {pagination.total_pages > 1 && (
                <div className="mt-8 flex justify-center">
                  <nav className="flex items-center space-x-1">
                    <button
                      onClick={() => handlePageChange(pagination.current_page - 1)}
                      disabled={pagination.current_page === 1}
                      className="p-2 rounded-md text-gray-400 hover:text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Previous</span>
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    
                    {renderPaginationLinks()}
                    
                    <button
                      onClick={() => handlePageChange(pagination.current_page + 1)}
                      disabled={pagination.current_page === pagination.total_pages}
                      className="p-2 rounded-md text-gray-400 hover:text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Next</span>
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AllJournalsPage;
