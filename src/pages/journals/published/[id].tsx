import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Layout from '@/components/layout/Layout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { journalAPI } from '@/utils/api';
import { Journal, UserRole } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { getFileUrl } from '@/utils/fileHelper';
import { toast } from 'react-toastify';

const PublishedJournalDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user, isAuthenticated } = useAuth();
  
  const [journal, setJournal] = useState<Journal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const shareLinkRef = useRef<HTMLInputElement>(null);

  // Fetch published journal details
  useEffect(() => {
    const fetchJournal = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        console.log(`Fetching published journal with ID: ${id}`);
        
        // Use the journalAPI client instead of direct fetch
        const response = await journalAPI.getJournalById(Number(id));
        
        if (!response || !response.journal) {
          throw new Error('Invalid journal data received from server');
        }
        
        console.log('Journal data received:', response.journal);
        setJournal(response.journal);
      } catch (error: any) {
        console.error('Error fetching published journal:', error);
        
        // Handle different error types
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          if (error.response.status === 404) {
            setError('Journal not found. It may have been removed or unpublished.');
          } else {
            setError(`Server error: ${error.response.status}`);
          }
        } else if (error.request) {
          // The request was made but no response was received
          setError('No response from server. Please check your connection.');
        } else {
          // Something happened in setting up the request that triggered an Error
          setError(error.message || 'Failed to load journal details');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) {
      fetchJournal();
    }
  }, [id]);

  // Format date for display
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Check if user has permission to delete or unpublish journals
  const canDeleteJournal = () => {
    if (!isAuthenticated || !user) return false;
    return [
      UserRole.SUPER_ADMIN,
      UserRole.ADMIN,
      UserRole.REVIEWER
    ].includes(user.role);
  };
  
  // Handle journal publish/unpublish toggle
  const handlePublishToggle = async () => {
    if (!id) return;
    
    try {
      setIsDeleting(true); // Reuse the loading state
      
      if (journal?.status === 'published') {
        // Unpublish: Set the status to 'approved' which is the state before publishing
        await journalAPI.updateJournalStatus(Number(id), 'approved');
        toast.success('Journal unpublished successfully');
      } else {
        // Republish: If the journal was previously unpublished, republish it
        // We need the publication number that was previously assigned
        if (journal?.publication_number) {
          await journalAPI.publishJournal(Number(id), journal.publication_number);
          toast.success('Journal republished successfully');
          
          // Refresh the journal data to show updated status
          const response = await journalAPI.getJournalById(Number(id));
          if (response && response.journal) {
            setJournal(response.journal);
            return; // Don't redirect if we're republishing
          }
        } else {
          throw new Error('Cannot republish: Missing publication number');
        }
      }
      
      // Redirect to homepage after successful unpublish (only for unpublish)
      if (journal?.status === 'published') {
        router.push('/');
      }
    } catch (error: any) {
      console.error('Error toggling journal publish status:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update journal status';
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle journal deletion
  const handleDeleteJournal = async () => {
    if (!id) return;
    
    try {
      setIsDeleting(true);
      setDeleteError(null);
      
      await journalAPI.deleteJournal(Number(id));
      
      // Show success toast notification
      toast.success('Journal deleted successfully');
      
      // Redirect to homepage after successful deletion
      router.push('/');
    } catch (error) {
      console.error('Error deleting journal:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete journal';
      setDeleteError(errorMessage);
      toast.error(errorMessage);
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Layout 
      title={journal?.title || 'Journal Details'} 
      description="View published journal details"
      hideHero={true}>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        ) : journal ? (
          <div className="space-y-8">
            {/* Back button */}
            <div className="mb-6">
              <button 
                onClick={() => router.push('/')} 
                className="flex items-center text-primary-600 hover:text-primary-800 transition duration-150 ease-in-out"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Back to Journals</span>
              </button>
            </div>
            
            {/* Journal header with title and actions */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6 md:p-8 border-b border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge 
                        variant={journal.status === 'published' ? "success" : "warning"} 
                        className="px-3 py-1 text-sm"
                      >
                        {journal.status === 'published' ? 'Published' : 'Unpublished'}
                      </Badge>
                      <span className="text-sm text-gray-500 font-medium">
                        ID: {journal.publication_number || 'N/A'}
                      </span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">{journal.title}</h1>
                  </div>
                  
                  {canDeleteJournal() && (
                    <div className="flex space-x-2">
                      <Button 
                        variant="secondary" 
                        onClick={handlePublishToggle}
                        disabled={isDeleting}
                        className={`whitespace-nowrap ${journal.status === 'published' 
                          ? 'bg-amber-500 hover:bg-amber-600' 
                          : 'bg-green-500 hover:bg-green-600'} text-white`}
                      >
                        {isDeleting 
                          ? 'Processing...' 
                          : journal.status === 'published' 
                            ? 'Unpublish' 
                            : 'Republish'}
                      </Button>
                      <Button 
                        variant="danger" 
                        onClick={() => setShowDeleteModal(true)}
                        disabled={isDeleting}
                        className="whitespace-nowrap"
                      >
                        {isDeleting ? 'Processing...' : 'Delete'}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Publisher information */}
              <div className="bg-gray-50 px-6 py-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 border-2 border-white shadow-sm">
                      {journal.publisher_profile_picture ? (
                        <>
                          {typeof journal.publisher_profile_picture === 'string' && journal.publisher_profile_picture.startsWith('{') ? (
                            <Image 
                              src={JSON.parse(journal.publisher_profile_picture).downloadLink || '/default-avatar.png'}
                              alt={`${journal.publisher_first_name} ${journal.publisher_last_name}`}
                              width={48}
                              height={48}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <Image 
                              src={journal.publisher_profile_picture.startsWith('http') 
                                ? journal.publisher_profile_picture 
                                : `http://localhost:5000${journal.publisher_profile_picture}`}
                              alt={`${journal.publisher_first_name} ${journal.publisher_last_name}`}
                              width={48}
                              height={48}
                              className="object-cover w-full h-full"
                            />
                          )}
                        </>
                      ) : (
                        <div className="flex items-center justify-center w-full h-full bg-primary-100 text-primary-600 font-medium text-lg">
                          {journal.publisher_first_name?.charAt(0)}
                          {journal.publisher_last_name?.charAt(0)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">
                      Published by
                    </p>
                    <p className="text-base font-semibold text-primary-700">
                      {journal.publisher_first_name} {journal.publisher_last_name}
                    </p>
                  </div>
                  <div className="ml-auto flex space-x-4 text-sm text-gray-600">
                    <div className="flex flex-col items-center md:flex-row md:items-center">
                      <span className="font-medium md:mr-2">Published:</span>
                      <span>{formatDate(journal.published_date)}</span>
                    </div>
                    <div className="flex flex-col items-center md:flex-row md:items-center">
                      <span className="font-medium md:mr-2">Submitted:</span>
                      <span>{formatDate(journal.created_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Main content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left column - Abstract and Authors */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                      Abstract
                    </h2>
                    <div className="prose max-w-none text-gray-700">
                      <p className="leading-relaxed">{journal.abstract}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary-600" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                      </svg>
                      Authors
                    </h2>
                    <div className="text-gray-700">
                      {journal.author_names ? (
                        <p className="leading-relaxed">{journal.author_names}</p>
                      ) : (
                        <p className="text-gray-500 italic">No authors listed</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right column - Download and additional info */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      Download Journal
                    </h2>
                    <p className="text-gray-600 mb-6">
                      Access the full journal paper to read all the details and research findings.
                    </p>
                    <div className="space-y-3">
                      <button
                        onClick={() => journalAPI.downloadJournal(journal.id)}
                        className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition duration-150 ease-in-out"
                      >
                        <svg
                          className="mr-2 h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Download PDF
                      </button>
                      
                      <button
                        onClick={() => setShowShareModal(true)}
                        className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition duration-150 ease-in-out"
                      >
                        <svg
                          className="mr-2 h-5 w-5 text-primary-600"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                        </svg>
                        Share Journal
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      Journal Information
                    </h2>
                    <ul className="space-y-3">
                      <li className="flex justify-between">
                        <span className="text-gray-600">Publication ID:</span>
                        <span className="font-medium">{journal.publication_number || 'N/A'}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className="font-medium text-green-600">Published</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-600">Published:</span>
                        <span className="font-medium">{formatDate(journal.published_date)}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-600">Submitted:</span>
                        <span className="font-medium">{formatDate(journal.created_at)}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            The requested journal could not be found.
          </div>
        )}
        
        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Delete Journal"
        >
          <div className="space-y-4">
            <p className="text-gray-700">
              Are you sure you want to delete this journal? This action cannot be undone.
            </p>
            
            {deleteError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                {deleteError}
              </div>
            )}
            
            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteJournal}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </Modal>
        
        {/* Share Journal Modal */}
        <Modal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          title="Share Journal"
        >
          <div className="space-y-6">
            <p className="text-gray-700">
              Share this unique link to allow others to view and download this journal:
            </p>
            
            <div className="relative">
              <input
                ref={shareLinkRef}
                type="text"
                readOnly
                value={typeof window !== 'undefined' ? `${window.location.origin}/journals/published/${id}` : ''}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 pr-24"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <button
                onClick={() => {
                  if (shareLinkRef.current) {
                    shareLinkRef.current.select();
                    document.execCommand('copy');
                    toast.success('Link copied to clipboard!');
                  }
                }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Copy
              </button>
            </div>
            
            <div className="mt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Share on Social Media</h3>
              <div className="flex space-x-4">
                <a 
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(typeof window !== 'undefined' ? `${window.location.origin}/journals/published/${id}` : '')}&text=${encodeURIComponent(journal?.title || 'Check out this journal')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-blue-400 text-white rounded-full hover:bg-blue-500 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.1 10.1 0 01-3.127 1.184 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </a>
                <a 
                  href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(typeof window !== 'undefined' ? `${window.location.origin}/journals/published/${id}` : '')}&title=${encodeURIComponent(journal?.title || 'Check out this journal')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-blue-700 text-white rounded-full hover:bg-blue-800 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
                <a 
                  href={`mailto:?subject=${encodeURIComponent(journal?.title || 'Check out this journal')}&body=${encodeURIComponent(`I thought you might be interested in this journal: ${typeof window !== 'undefined' ? `${window.location.origin}/journals/published/${id}` : ''}`)}`}
                  className="p-2 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </a>
                <a 
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${journal?.title || 'Check out this journal'}: ${typeof window !== 'undefined' ? `${window.location.origin}/journals/published/${id}` : ''}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                </a>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button
                variant="primary"
                onClick={() => setShowShareModal(false)}
              >
                Done
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
};

export default PublishedJournalDetailPage;
