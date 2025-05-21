import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { GetServerSideProps } from 'next';
import Layout from '@/components/layout/Layout';
import JournalCard from '@/components/ui/JournalCard';
import HeroSlider from '@/components/ui/HeroSlider';
import { journalAPI } from '@/utils/api';
import { Journal, JournalFilters } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import home from "../../public/images/home2.png"
import Image from 'next/image';

interface HomeProps {
  initialJournals: Journal[];
}

export default function Home({ initialJournals }: HomeProps) {
  console.log('Initial journals on client:', initialJournals);
  const { isAuthenticated } = useAuth();
  const [journals, setJournals] = useState<Journal[]>(initialJournals || []);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<JournalFilters>({
    sort_by: 'published_date',
    sort_order: 'DESC',
  });
  
  // Fetch journals on component mount - limit to 6 for homepage
  useEffect(() => {
    console.log('Fetching journals on mount - limited to 6');
    fetchJournals({ limit: 6 });
  }, []);
  
  // Debug effect to log journals whenever they change
  useEffect(() => {
    console.log('Current journals state:', journals);
  }, [journals]);

  const fetchJournals = async (newFilters?: JournalFilters) => {
    try {
      setIsLoading(true);
      const appliedFilters = newFilters || filters;
      const response = await journalAPI.getPublishedJournals(appliedFilters);
      
      // Handle different response structures
      const fetchedJournals = response.journals || response.data?.journals || [];
      
      // Filter to ensure only journals with 'published' status are shown
      const onlyPublishedJournals = fetchedJournals.filter((journal: Journal) => journal.status === 'published');
      console.log('Filtered published journals:', onlyPublishedJournals);
      
      setJournals(onlyPublishedJournals);
    } catch (error) {
      console.error('Error fetching journals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (newFilters: Partial<JournalFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    fetchJournals(updatedFilters);
  };

  return (
    <Layout
      title="Nigerian British University Journal Publication System"
      description="Browse the latest academic journals published by Nigerian British University"
      showHero={true}
    >

      {/* Journals Section */}
      <section className="py-6 sm:py-8 md:py-12 bg-gray-50">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="mb-6 sm:mb-8">
            {/* Header with responsive layout */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Published Journals</h2>
              <div className="flex w-full sm:w-auto gap-2">
                <button 
                  onClick={() => fetchJournals({ limit: 6 })} 
                  className="flex-1 sm:flex-auto px-3 py-1.5 sm:px-4 sm:py-2 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
                <Link href="/journals" 
                  className="flex-1 sm:flex-auto px-3 py-1.5 sm:px-4 sm:py-2 text-sm bg-white border border-primary-600 text-primary-600 rounded-md hover:bg-primary-50 transition-colors flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  View All
                </Link>
              </div>
            </div>
            
            {/* Simplified Filters for Mobile */}
            <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm mb-4 sm:mb-6">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="sort-by" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Sort By
                  </label>
                  <select
                    id="sort-by"
                    className="w-full text-sm rounded-md border-gray-300 shadow-sm py-1.5 px-2"
                    value={filters.sort_by}
                    onChange={(e) => handleFilterChange({ sort_by: e.target.value as any })}
                  >
                    <option value="published_date">Publication Date</option>
                    <option value="title">Title</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="sort-order" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Order
                  </label>
                  <select
                    id="sort-order"
                    className="w-full text-sm rounded-md border-gray-300 shadow-sm py-1.5 px-2"
                    value={filters.sort_order}
                    onChange={(e) => handleFilterChange({ sort_order: e.target.value as any })}
                  >
                    <option value="DESC">Newest to Oldest</option>
                    <option value="ASC">Oldest to Newest</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Journal Grid - Optimized for mobile with 2 columns */}
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-t-2 border-b-2 border-primary-600"></div>
              </div>
            ) : journals.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                {journals.map((journal) => (
                  <JournalCard key={journal.id} journal={journal} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-white rounded-lg shadow-sm">
                <p className="text-gray-500 text-sm sm:text-base">No published journals found</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* About Section - Only shown to non-authenticated users */}
      {!isAuthenticated && (
        <section className="py-12 bg-blue-600">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-white mb-8 text-center">About Our Journal System</h2>
            
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col md:flex-row items-center gap-8">
                {/* Image on the left for medium screens and up, centered on mobile */}
                <div className="md:w-1/2 flex justify-center">
                  <Image 
                    src={home} 
                    alt="NBU Journal Students" 
                    className="rounded-lg shadow-lg max-w-full h-auto" 
                    width={500} 
                    height={400}
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                
                {/* Text content on the right for medium screens and up */}
                <div className="md:w-1/2 text-white">
                  <div className="prose prose-lg prose-invert max-w-none">
                    <p>
                      The Nigerian British University Journal Publication System is a platform for academic
                      research and scholarly publications. Our system enables researchers, lecturers, and
                      students to submit their work for peer review and publication.
                    </p>
                    <p>
                      All published journals undergo a rigorous review process to ensure high-quality
                      academic standards. Our diverse collection covers various fields of study and
                      research areas.
                    </p>
                    <p>
                      If you are a lecturer or researcher at Nigerian British University and would like to
                      publish your work, please register for an account and submit your journal through our
                      online system.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    console.log('Fetching published journals for homepage...');
    
    // Try the direct test endpoint first
    try {
      console.log('Trying direct test endpoint...');
      const directResponse = await fetch('http://localhost:5000/api/test/published-journals');
      const directData = await directResponse.json();
      
      console.log('Direct API Response:', directData);
      
      if (directData.journals && directData.journals.length > 0) {
        console.log('Found journals from direct test endpoint:', directData.journals);
        return {
          props: {
            initialJournals: directData.journals || [],
          },
        };
      }
    } catch (directError) {
      console.error('Error with direct endpoint, falling back to regular endpoint:', directError);
    }
    
    // Fall back to the regular endpoint if direct endpoint fails
    console.log('Falling back to regular endpoint...');
    const response = await journalAPI.getPublishedJournals({
      sort_by: 'published_date',
      sort_order: 'DESC',
    });
    
    console.log('Regular API Response:', response);
    console.log('Journals from regular API:', response.journals);
    
    return {
      props: {
        initialJournals: response.journals || [],
      },
    };
  } catch (error) {
    console.error('Error fetching journals:', error);
    return {
      props: {
        initialJournals: [],
      },
    };
  }
};
