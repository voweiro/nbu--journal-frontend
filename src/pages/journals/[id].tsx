import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Layout from '@/components/layout/Layout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Alert from '@/components/ui/Alert';
import { journalAPI, reviewAPI } from '@/utils/api';
import { useAuth } from '@/contexts/AuthContext';
import { getFileUrl } from '@/utils/fileHelper';
import { Journal, JournalStatus, UserRole, JournalReview } from '@/types';

const JournalDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [journal, setJournal] = useState<Journal | null>(null);
  const [reviews, setReviews] = useState<JournalReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewStatus, setReviewStatus] = useState<'approved' | 'rejected'>('approved');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [selectedReviewer, setSelectedReviewer] = useState<number | null>(null);
  const [isAssigningReviewer, setIsAssigningReviewer] = useState(false);
  const [reviewers, setReviewers] = useState<any[]>([]);
  const [isLoadingReviewers, setIsLoadingReviewers] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [publicationNumber, setPublicationNumber] = useState('');

  // Only redirect if not authenticated for non-published journals
  useEffect(() => {
    // Don't redirect immediately - we'll check if it's a published journal first
    // If it's not published, then we'll require authentication
    const checkJournalAndAuth = async () => {
      if (authLoading || !id) return;
      
      try {
        // Try to fetch the journal first
        const { journal: fetchedJournal } = await journalAPI.getJournalById(Number(id));
        
        // Allow access to published journals without authentication
        // Only redirect for non-published journals if user is not authenticated
        if (fetchedJournal.status !== 'published' && !isAuthenticated) {
          router.push('/login');
        }
      } catch (error) {
        console.error('Error checking journal:', error);
        // Only redirect on error if trying to access a non-public journal
        // This allows public access to published journals even if there's an error
      }
    };
    
    checkJournalAndAuth();
  }, [isAuthenticated, authLoading, router, id]);

  // Fetch journal details
  useEffect(() => {
    const fetchJournal = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const { journal: fetchedJournal } = await journalAPI.getJournalById(Number(id));
        setJournal(fetchedJournal);
        
        // Only fetch reviews if user is authenticated
        if (isAuthenticated) {
          if (fetchedJournal.reviews) {
            setReviews(fetchedJournal.reviews);
          } else {
            // Fetch reviews separately if not included in journal response
            const { reviews: fetchedReviews } = await reviewAPI.getJournalReviews(Number(id));
            setReviews(fetchedReviews || []);
          }
          
          // Fetch reviewers if user is admin
          if ((user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN) && 
              fetchedJournal.status === JournalStatus.SUBMITTED) {
            fetchReviewers();
            
            // When admin views a submitted journal, update status to RECEIVED
            if (fetchedJournal.status === JournalStatus.SUBMITTED) {
              updateJournalStatus(JournalStatus.RECEIVED);
            }
          }
        }
      } catch (error: any) {
        console.error('Error fetching journal:', error);
        setError(error.response?.data?.message || 'Failed to fetch journal details');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchJournal();
  }, [id, isAuthenticated, user?.role]);
  
  // Function to update journal status
  const updateJournalStatus = async (status: JournalStatus) => {
    if (!journal) return;
    
    try {
      await journalAPI.updateJournalStatus(journal.id, status);
      
      // Refresh journal data
      const { journal: updatedJournal } = await journalAPI.getJournalById(journal.id);
      setJournal(updatedJournal);
    } catch (error: any) {
      console.error('Error updating journal status:', error);
      setError(error.response?.data?.message || 'Failed to update journal status');
    }
  };
  
  const handlePublishJournal = async () => {
    if (!journal) return;
    
    // Validate publication number
    if (!publicationNumber.trim()) {
      alert('Please enter a publication number');
      return;
    }
    
    try {
      setIsPublishing(true);
      setError(null);
      
      // Call the publish API with publication number
      await journalAPI.publishJournal(journal.id, publicationNumber);
      
      // Refresh journal data
      const { journal: updatedJournal } = await journalAPI.getJournalById(journal.id);
      setJournal(updatedJournal);
      
      // Show success message
      alert('Journal published successfully! It will now be visible on the home page.');
    } catch (error: any) {
      console.error('Error publishing journal:', error);
      setError(error.response?.data?.message || 'Failed to publish journal');
    } finally {
      setIsPublishing(false);
    }
  };

  // Fetch all reviewers
  const fetchReviewers = async () => {
    try {
      setIsLoadingReviewers(true);
      const { reviewers: fetchedReviewers } = await journalAPI.getAllReviewers();
      setReviewers(fetchedReviewers || []);
    } catch (error: any) {
      console.error('Error fetching reviewers:', error);
    } finally {
      setIsLoadingReviewers(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
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

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      
      // Only update status if user is authenticated and is a reviewer
      if (
        isAuthenticated &&
        user?.role === UserRole.REVIEWER &&
        journal?.reviewer_id === user.id &&
        journal?.status === 'assigned'
      ) {
        await journalAPI.updateJournalStatus(journal.id, 'being_reviewed');
        setJournal(prev => prev ? { ...prev, status: 'being_reviewed' } : null);
      }

      // Download the journal using the updated function that handles Google Drive files
      // This works for both authenticated users and visitors
      if (journal) {
        await journalAPI.downloadJournal(journal.id);
      }
    } catch (error) {
      console.error('Error downloading journal:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!journal) return;
    
    try {
      setIsSubmittingReview(true);
      setReviewError(null);
      
      // Submit the review
      await journalAPI.reviewJournal(journal.id, reviewStatus, reviewComment);
      
      // Update journal status based on review result
      if (reviewStatus === 'approved') {
        await updateJournalStatus(JournalStatus.APPROVED);
      } else {
        await updateJournalStatus(JournalStatus.REJECTED);
      }
      
      // Refresh journal data
      const { journal: updatedJournal } = await journalAPI.getJournalById(journal.id);
      setJournal(updatedJournal);
      
      if (updatedJournal.reviews) {
        setReviews(updatedJournal.reviews);
      } else {
        const { reviews: updatedReviews } = await reviewAPI.getJournalReviews(journal.id);
        setReviews(updatedReviews || []);
      }
      
      // Reset form
      setReviewComment('');
    } catch (error: any) {
      console.error('Error submitting review:', error);
      setReviewError(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleAssignReviewer = async () => {
    if (!journal || !selectedReviewer) return;
    
    try {
      setIsAssigningReviewer(true);
      setError(null);
      
      // Assign the reviewer
      await journalAPI.assignReviewer(journal.id, selectedReviewer);
      
      // Update status to ASSIGNED
      await updateJournalStatus(JournalStatus.ASSIGNED);
      
      // Refresh journal data
      const { journal: updatedJournal } = await journalAPI.getJournalById(journal.id);
      setJournal(updatedJournal);
      
      // Reset form
      setSelectedReviewer(null);
    } catch (error: any) {
      console.error('Error assigning reviewer:', error);
      setError(error.response?.data?.message || 'Failed to assign reviewer');
    } finally {
      setIsAssigningReviewer(false);
    }
  };
  
  const handleDeleteJournal = async () => {
    if (!journal) return;
    
    try {
      setIsDeleting(true);
      setError(null);
      
      await journalAPI.deleteJournal(journal.id);
      
      // Redirect to journals page after successful deletion
      router.push('/journals');
    } catch (error: any) {
      console.error('Error deleting journal:', error);
      setError(error.response?.data?.message || 'Failed to delete journal');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (isLoading) {
    return (
      <Layout title="Loading Journal | NBU Journal System">
        <div className="bg-gray-50 min-h-screen py-8">
          <div className="container mx-auto px-4">
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !journal) {
    return (
      <Layout title="Journal Not Found | NBU Journal System">
        <div className="bg-gray-50 min-h-screen py-8">
          <div className="container mx-auto px-4">
            <Alert variant="danger" className="max-w-2xl mx-auto">
              {error || 'Journal not found'}
            </Alert>
            <div className="text-center mt-6">
              <Button variant="outline" onClick={() => router.push('/journals')}>
                Back to Journals
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`${journal.title} | NBU Journal System`}>
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <Button variant="outline" onClick={() => router.push('/journals')}>
              &larr; Back to Journals
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main content */}
            <div className="lg:col-span-2">
              <Card>
                <div className="flex justify-between items-start mb-4">
                  <h1 className="text-2xl font-bold text-gray-900">{journal.title}</h1>
                  {getStatusBadge(journal.status)}
                </div>

                {/* Publication details for approved journals */}
                {journal.status === JournalStatus.APPROVED && (
                  <div className="bg-green-50 border border-green-100 rounded-md p-4 mb-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-green-800 mb-2">Publication Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Publication Number:</span>{' '}
                            <span>{journal.publication_number}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Approval Date:</span>{' '}
                            <span>{formatDate(journal.updated_at || journal.created_at)}</span>
                          </div>
                        </div>
                      </div>
                      {user?.role === UserRole.REVIEWER && (
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-center space-x-2">
                            <label htmlFor="publicationNumber" className="text-sm font-medium text-gray-700">
                              Publication Number:
                            </label>
                            <input
                              id="publicationNumber"
                              type="text"
                              className="form-input text-sm rounded-md"
                              value={publicationNumber}
                              onChange={(e) => setPublicationNumber(e.target.value)}
                              placeholder="Enter publication number"
                              required
                            />
                          </div>
                          <Button 
                            variant="success" 
                            onClick={handlePublishJournal}
                            isLoading={isPublishing}
                            disabled={!publicationNumber.trim()}
                          >
                            Publish Journal
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Publication details for published journals */}
                {journal.status === JournalStatus.PUBLISHED && (
                  <div className="bg-blue-50 border border-blue-100 rounded-md p-4 mb-6 shadow-sm">
                    <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Publication Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="bg-white p-2 rounded-md shadow-sm">
                        <span className="font-medium text-gray-700 block md:inline">Publication Number:</span>{' '}
                        <span className="text-primary-600">{journal.publication_number}</span>
                      </div>
                      <div className="bg-white p-2 rounded-md shadow-sm">
                        <span className="font-medium text-gray-700 block md:inline">Published Date:</span>{' '}
                        <span>{formatDate(journal.published_date || journal.updated_at || journal.created_at)}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mb-6 bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                    Abstract
                  </h3>
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">{journal.abstract}</p>
                </div>

                <div className="mb-6 bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    Authors
                  </h3>
                  {journal.authors && journal.authors.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {journal.authors.map((author) => (
                        <div key={author.id} className="flex items-start p-3 rounded-md border border-gray-100 hover:border-primary-200 hover:bg-primary-50 transition-colors">
                          <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center mr-3 flex-shrink-0">
                            {author.author_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{author.author_name}</div>
                            {author.is_primary && <span className="inline-block px-2 py-1 text-xs bg-primary-100 text-primary-700 rounded-full mt-1 mb-1">Primary Author</span>}
                            {author.author_email && (
                              <div className="text-sm text-gray-600 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                {author.author_email}
                              </div>
                            )}
                            {author.author_department && (
                              <div className="text-sm text-gray-600 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                {author.author_department}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-4 rounded-md text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <p className="text-gray-500">No authors listed for this journal</p>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      Submitted on {formatDate(journal.created_at)}
                    </div>
                    <Button variant="primary" onClick={handleDownload}>
                      Download Journal
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Reviews section (visible only to authenticated users with appropriate roles) */}
              {isAuthenticated && (user?.role !== UserRole.PUBLISHER || journal.publisher_id === user.id) && (
                <Card className="mt-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Reviews</h2>
                  
                  {reviews.length > 0 ? (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <div key={review.id} className="border rounded-md p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <span className="font-medium">
                                {review.first_name} {review.last_name}
                              </span>
                              <span className="text-sm text-gray-500 ml-2">
                                {formatDate(review.reviewed_at || review.created_at)}
                              </span>
                            </div>
                            <Badge 
                              variant={
                                review.status === 'approved' ? 'success' : 
                                review.status === 'rejected' ? 'danger' : 'info'
                              }
                            >
                              {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                            </Badge>
                          </div>
                          <p className="text-gray-700 whitespace-pre-line">{review.comments}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No reviews yet</p>
                  )}

                  {/* Review form for assigned reviewer */}
                  {user?.role === UserRole.REVIEWER && journal.reviewer_id === user.id && 
                   (journal.status === JournalStatus.ASSIGNED || journal.status === JournalStatus.BEING_REVIEWED) && (
                    <div className="mt-6 border-t border-gray-200 pt-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Submit Your Review</h3>
                      
                      {reviewError && (
                        <Alert 
                          variant="danger" 
                          className="mb-4" 
                          dismissible 
                          onDismiss={() => setReviewError(null)}
                        >
                          {reviewError}
                        </Alert>
                      )}
                      
                      <form onSubmit={handleReviewSubmit}>
                        <div className="mb-4">
                          <label className="form-label">Review Status</label>
                          <div className="flex space-x-4">
                            <label className="inline-flex items-center">
                              <input
                                type="radio"
                                className="form-radio"
                                name="reviewStatus"
                                value="approved"
                                checked={reviewStatus === 'approved'}
                                onChange={() => setReviewStatus('approved')}
                              />
                              <span className="ml-2">Approve</span>
                            </label>
                            <label className="inline-flex items-center">
                              <input
                                type="radio"
                                className="form-radio"
                                name="reviewStatus"
                                value="rejected"
                                checked={reviewStatus === 'rejected'}
                                onChange={() => setReviewStatus('rejected')}
                              />
                              <span className="ml-2">Reject</span>
                            </label>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <label htmlFor="reviewComment" className="form-label">
                            Comments
                          </label>
                          <textarea
                            id="reviewComment"
                            rows={4}
                            className="form-input"
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            required
                          />
                        </div>
                        
                        <Button
                          type="submit"
                          variant="primary"
                          isLoading={isSubmittingReview}
                        >
                          Submit Review
                        </Button>
                      </form>
                    </div>
                  )}
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div>
              {/* Publisher info */}
              <Card className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Publisher</h3>
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200">
                      {journal.publisher_profile_picture ? (
                        <Image 
                          src={getFileUrl(journal.publisher_profile_picture)}
                          alt={`${journal.publisher_first_name || ''} ${journal.publisher_last_name || ''}`}
                          width={64}
                          height={64}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full bg-primary-100 text-primary-600 font-medium text-xl">
                          {journal.publisher_first_name?.charAt(0) || ''}
                          {journal.publisher_last_name?.charAt(0) || ''}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-base font-medium text-gray-900">
                      {journal.publisher_first_name} {journal.publisher_last_name}
                    </h4>
                    <p className="text-sm text-gray-500">Publisher</p>
                  </div>
                </div>
              </Card>

              {/* Journal status */}
              <Card className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Journal Status</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Status:</span>
                    {getStatusBadge(journal.status)}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Submitted:</span>
                    <span>{formatDate(journal.created_at)}</span>
                  </div>
                  {journal.reviewer_id && journal.reviewer_first_name && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Reviewer:</span>
                      <span>{journal.reviewer_first_name} {journal.reviewer_last_name}</span>
                    </div>
                  )}
                  {journal.status === JournalStatus.APPROVED && journal.published_date && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Published:</span>
                      <span>{formatDate(journal.published_date)}</span>
                    </div>
                  )}
                </div>
              </Card>

              {/* Admin actions */}
              {(user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN) && (
                <Card>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Admin Actions</h3>
                  
                  {(journal.status === JournalStatus.SUBMITTED || journal.status === JournalStatus.RECEIVED) && (
                    <div>
                      <p className="text-sm text-gray-600 mb-4">
                        Assign this journal to a reviewer for evaluation
                      </p>
                      
                      {/* Reviewer selection dropdown */}
                      <div className="mb-4">
                        <label htmlFor="reviewer" className="form-label">
                          Select Reviewer
                        </label>
                        <select
                          id="reviewer"
                          className="form-input"
                          value={selectedReviewer || ''}
                          onChange={(e) => setSelectedReviewer(Number(e.target.value))}
                          disabled={isLoadingReviewers}
                        >
                          <option value="">Select a reviewer</option>
                          {reviewers.map(reviewer => (
                            <option key={reviewer.id} value={reviewer.id}>
                              {reviewer.first_name} {reviewer.last_name} - {reviewer.department || 'No Department'}
                            </option>
                          ))}
                        </select>
                        {isLoadingReviewers && (
                          <div className="text-xs text-gray-500 mt-1">Loading reviewers...</div>
                        )}
                      </div>
                      
                      <Button
                        variant="primary"
                        onClick={handleAssignReviewer}
                        isLoading={isAssigningReviewer}
                        disabled={!selectedReviewer || isLoadingReviewers}
                      >
                        Assign Reviewer
                      </Button>
                    </div>
                  )}
                  
                  {journal.status !== JournalStatus.SUBMITTED && (
                    <div className="text-center py-2">
                      <p className="text-sm text-gray-600">
                        {journal.status === JournalStatus.BEING_REVIEWED
                          ? 'This journal is currently under review'
                          : journal.status === JournalStatus.APPROVED
                          ? 'This journal has been approved and published'
                          : 'This journal has been rejected'}
                      </p>
                    </div>
                  )}
                  
                  {/* Delete journal action (super-admin only) */}
                  {user?.role === UserRole.SUPER_ADMIN && (
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-2">Danger Zone</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Permanently delete this journal and all associated data
                      </p>
                      
                      {showDeleteConfirm ? (
                        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                          <p className="text-sm text-red-800 mb-4">
                            Are you sure you want to delete this journal? This action cannot be undone.
                          </p>
                          <div className="flex space-x-3">
                            <Button
                              variant="danger"
                              onClick={handleDeleteJournal}
                              isLoading={isDeleting}
                            >
                              Yes, Delete Journal
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setShowDeleteConfirm(false)}
                              disabled={isDeleting}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          variant="danger"
                          onClick={() => setShowDeleteConfirm(true)}
                        >
                          Delete Journal
                        </Button>
                      )}
                    </div>
                  )}
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default JournalDetailPage;
