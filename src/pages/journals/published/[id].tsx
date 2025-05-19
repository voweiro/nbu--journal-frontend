import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Layout from '@/components/layout/Layout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Alert from '@/components/ui/Alert';
import Modal from '@/components/ui/Modal';
import { journalAPI } from '@/utils/api';
import { Journal, UserRole } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { getFileUrl } from '@/utils/fileHelper';

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

  // Fetch published journal details
  useEffect(() => {
    const fetchJournal = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        console.log(`Fetching published journal with ID: ${id}`);
        
        // Use a direct fetch to the public endpoint
        const response = await fetch(`/api/journals/published/${id}`);
        const data = await response.json();
        
        if (!response.ok) {
          if (response.status === 404) {
            // Handle 404 with more detailed message
            const errorMessage = data.message || 'Journal not found';
            const statusInfo = data.status ? ` (Status: ${data.status})` : '';
            throw new Error(`${errorMessage}${statusInfo}`);
          }
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        if (!data.journal) {
          throw new Error('Invalid journal data received from server');
        }
        
        console.log('Journal data received:', data.journal);
        setJournal(data.journal);
      } catch (error) {
        console.error('Error fetching published journal:', error);
        const errorMessage = error instanceof Error 
          ? error.message 
          : 'Failed to load journal. The journal may not exist or may not be published yet.';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchJournal();
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

  // Check if user has permission to delete journals
  const canDeleteJournal = () => {
    if (!isAuthenticated || !user) return false;
    return [
      UserRole.SUPER_ADMIN,
      UserRole.ADMIN,
      UserRole.REVIEWER
    ].includes(user.role);
  };

  // Handle journal deletion
  const handleDeleteJournal = async () => {
    if (!id) return;
    
    try {
      setIsDeleting(true);
      setDeleteError(null);
      
      await journalAPI.deleteJournal(Number(id));
      
      // Redirect to homepage after successful deletion
      router.push('/');
    } catch (error) {
      console.error('Error deleting journal:', error);
      setDeleteError(error instanceof Error ? error.message : 'Failed to delete journal');
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
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : journal ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center mb-2">
                  <button 
                    onClick={() => router.push('/')} 
                    className="flex items-center text-primary-600 hover:text-primary-800 mr-4"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Back to Journals
                  </button>
                </div>
                <h1 className="text-3xl font-bold text-gray-900">{journal.title}</h1>
                <div className="mt-2 flex items-center">
                  <Badge variant="success">Published</Badge>
                  <span className="ml-4 text-sm text-gray-500">
                    Publication #: {journal.publication_number || 'N/A'}
                  </span>
                </div>
              </div>
              
              {canDeleteJournal() && (
                <div>
                  <Button 
                    variant="danger" 
                    onClick={() => setShowDeleteModal(true)}
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete Journal'}
                  </Button>
                </div>
              )}
            </div>
            
            <Card>
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Abstract</h2>
                  <p className="mt-2 text-gray-600">{journal.abstract}</p>
                </div>
                
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Authors</h2>
                  <p className="mt-2 text-gray-600">{journal.author_names || 'No authors listed'}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Publication Details</h3>
                    <div className="mt-2 space-y-2">
                      <div className="flex">
                        <span className="w-32 text-sm font-medium text-gray-500">Published Date:</span>
                        <span className="text-sm text-gray-900">{formatDate(journal.published_date)}</span>
                      </div>
                      <div className="flex">
                        <span className="w-32 text-sm font-medium text-gray-500">Submitted Date:</span>
                        <span className="text-sm text-gray-900">{formatDate(journal.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Publisher Information</h3>
                    <div className="mt-2 flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                          {journal.publisher_profile_picture ? (
                            <>
                              {typeof journal.publisher_profile_picture === 'string' && journal.publisher_profile_picture.startsWith('{') ? (
                                // Handle Google Drive profile picture (JSON string)
                                <Image 
                                  src={JSON.parse(journal.publisher_profile_picture).downloadLink || '/default-avatar.png'}
                                  alt={`${journal.publisher_first_name} ${journal.publisher_last_name}`}
                                  width={40}
                                  height={40}
                                  className="object-cover w-full h-full"
                                />
                              ) : (
                                // Handle local file path
                                <Image 
                                  src={journal.publisher_profile_picture.startsWith('http') 
                                    ? journal.publisher_profile_picture 
                                    : `http://localhost:5000${journal.publisher_profile_picture}`}
                                  alt={`${journal.publisher_first_name} ${journal.publisher_last_name}`}
                                  width={40}
                                  height={40}
                                  className="object-cover w-full h-full"
                                />
                              )}
                            </>
                          ) : (
                            <div className="flex items-center justify-center w-full h-full bg-primary-100 text-primary-600 font-medium text-sm">
                              {journal.publisher_first_name?.charAt(0)}
                              {journal.publisher_last_name?.charAt(0)}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {journal.publisher_first_name} {journal.publisher_last_name}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
            
            <Card>
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">Download Journal</h2>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      Download the full journal paper to read all the details.
                    </p>
                  </div>
                  <a
                    href="#"
                    onClick={() => journalAPI.downloadJournal(journal.id)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg
                      className="-ml-1 mr-2 h-5 w-5"
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
                  </a>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          <Alert variant="danger">The requested journal could not be found.</Alert>
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
              <Alert variant="danger">{deleteError}</Alert>
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
      </div>
    </Layout>
  );
};

export default PublishedJournalDetailPage;
