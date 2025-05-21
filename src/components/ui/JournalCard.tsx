import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Journal } from '@/types';
import Badge from './Badge';
import { getFileUrl } from '@/utils/fileHelper';
import { useAuth } from '@/contexts/AuthContext';
import { journalAPI } from '@/utils/api';
import { toast } from 'react-toastify';
import Modal from './Modal';
import Button from './Button';

interface JournalCardProps {
  journal: Journal;
  className?: string;
  onUnpublish?: (journalId: number) => Promise<void>;
  isUnpublishing?: boolean;
}

const JournalCard: React.FC<JournalCardProps> = ({ 
  journal, 
  className = '',
  onUnpublish,
  isUnpublishing = false
}) => {
  const { user, isAuthenticated } = useAuth();
  const [showShareModal, setShowShareModal] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Format date helper function
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return <Badge variant="default" className="status-badge">Submitted</Badge>;
      case 'received':
        return <Badge variant="info" className="status-badge">Received</Badge>;
      case 'assigned':
        return <Badge variant="info" className="status-badge">Assigned</Badge>;
      case 'being_reviewed':
        return <Badge variant="info" className="status-badge">Being Reviewed</Badge>;
      case 'approved':
        return <Badge variant="success" className="status-badge">Approved</Badge>;
      case 'published':
        return <Badge variant="success" className="status-badge">Published</Badge>;
      case 'rejected':
        return <Badge variant="danger" className="status-badge">Rejected</Badge>;
      default:
        return null;
    }
  };
  
  const getStatusDetails = (status: string) => {
    switch (status) {
      case 'submitted':
        return {
          text: 'Your journal has been submitted and is awaiting review.',
          icon: '📝',
          color: 'text-gray-600'
        };
      case 'received':
        return {
          text: 'Your journal has been received by the admin team.',
          icon: '📬',
          color: 'text-blue-600'
        };
      case 'assigned':
        return {
          text: 'Your journal has been assigned to a reviewer.',
          icon: '👤',
          color: 'text-blue-600'
        };
      case 'being_reviewed':
        return {
          text: 'Your journal is currently being reviewed by our team.',
          icon: '🔍',
          color: 'text-blue-600'
        };
      case 'approved':
        return {
          text: 'Your journal has been approved and is ready for publication.',
          icon: '✅',
          color: 'text-green-600'
        };
      case 'published':
        return {
          text: 'Congratulations! Your journal has been published and is publicly available.',
          icon: '🌟',
          color: 'text-green-600'
        };
      case 'rejected':
        return {
          text: 'Your journal submission was not accepted. Please check reviewer comments.',
          icon: '❌',
          color: 'text-red-600'
        };
      default:
        return {
          text: 'Status unknown',
          icon: '❓',
          color: 'text-gray-500'
        };
    }
  };
  
  const statusDetails = getStatusDetails(journal.status);
  
  // Check if user has permission to unpublish
  const canUnpublish = user && (
    user.role === 'super_admin' || // Using underscore to match backend role name
    user.role === 'admin' || 
    user.role === 'reviewer'
  );
  
  // Get the correct URL for the journal details page
  const journalUrl = `/journals/${journal.id}`;

  const toggleAbstract = () => {
    setExpanded(!expanded);
  };

  return (
    <div id={`journal-${journal.id}`} className={`bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200 ${className}`}>
      {/* Share Modal */}
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
              type="text"
              readOnly
              value={typeof window !== 'undefined' ? `${window.location.origin}/journals/published/${journal.id}` : ''}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 pr-24"
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <button
              onClick={() => {
                if (typeof navigator !== 'undefined') {
                  navigator.clipboard.writeText(`${window.location.origin}/journals/published/${journal.id}`)
                    .then(() => toast.success('Link copied to clipboard!'))
                    .catch(() => toast.error('Failed to copy link'));
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
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(typeof window !== 'undefined' ? `${window.location.origin}/journals/published/${journal.id}` : '')}&text=${encodeURIComponent(journal?.title || 'Check out this journal')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-blue-400 text-white rounded-full hover:bg-blue-500 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.1 10.1 0 01-3.127 1.184 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </a>
              <a 
                href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(typeof window !== 'undefined' ? `${window.location.origin}/journals/published/${journal.id}` : '')}&title=${encodeURIComponent(journal?.title || 'Check out this journal')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-blue-700 text-white rounded-full hover:bg-blue-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a 
                href={`mailto:?subject=${encodeURIComponent(journal?.title || 'Check out this journal')}&body=${encodeURIComponent(`I thought you might be interested in this journal: ${typeof window !== 'undefined' ? `${window.location.origin}/journals/published/${journal.id}` : ''}`)}`}
                className="p-2 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </a>
              <a 
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${journal?.title || 'Check out this journal'}: ${typeof window !== 'undefined' ? `${window.location.origin}/journals/published/${journal.id}` : ''}`)}`}
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

      {/* Card with smaller padding and more compact layout */}
      <div className="p-2 flex flex-col h-full">
        {/* Status Badge - Much more compact for mobile */}
        <div className="flex items-center mb-2">
          <span className="text-base mr-1.5">{statusDetails.icon}</span>
          <div className="flex items-center flex-wrap gap-1">
            <span className={`text-xs font-medium ${statusDetails.color}`}>
              {journal.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}:
            </span>
            {getStatusBadge(journal.status)}
          </div>
        </div>
        
        {/* Journal Title */}
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1">
          <Link href={`/journals/${journal.id}`} className="hover:text-primary-600">
            {journal.title}
          </Link>
        </h3>
        
        {/* Mobile-optimized metadata row */}
        <div className="flex items-center text-xs text-gray-500 mb-2">
          <div className="flex items-center mr-3">
            <div className="w-4 h-4 rounded-full overflow-hidden bg-gray-200 mr-1">
              {journal.publisher_profile_picture ? (
                <Image 
                  src={getFileUrl(journal.publisher_profile_picture)}
                  alt={`${journal.publisher_first_name} ${journal.publisher_last_name}`}
                  width={16}
                  height={16}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full bg-primary-100 text-primary-600 font-medium text-xs">
                  {journal.publisher_first_name?.charAt(0) || 'U'}
                </div>
              )}
            </div>
            <span className="truncate max-w-[80px]">
              {journal.publisher_first_name || 'Author'}
            </span>
          </div>
          
          <span className="text-xs text-gray-400">
            {formatDate(journal.created_at)}
          </span>
        </div>
        
        {/* Abstract with expand/collapse - even more compact */}
        {journal.abstract && (
          <div className="mb-2">
            <p className={`text-xs text-gray-600 ${expanded ? '' : 'line-clamp-2'}`}>
              {journal.abstract}
            </p>
            {journal.abstract.length > 60 && (
              <button 
                onClick={toggleAbstract} 
                className="text-xs text-primary-600 mt-0.5 font-medium hover:text-primary-700 focus:outline-none"
              >
                {expanded ? 'Show less' : 'Read more'}
              </button>
            )}
          </div>
        )}
        
        {/* Compact publication details */}
        <div className="flex flex-wrap gap-x-3 gap-y-1 mb-2 text-xs">
          {journal.publication_number && (
            <div className="flex items-center">
              <span className="text-gray-500 mr-1">ID:</span>
              <span className="truncate">{journal.publication_number}</span>
            </div>
          )}
          
          {journal.published_date && (
            <div className="flex items-center">
              <span className="text-gray-500 mr-1">Published:</span>
              <span className="truncate">
                {formatDate(journal.published_date)}
              </span>
            </div>
          )}
        </div>
        
        {/* Action buttons */}
        <div className="mt-auto pt-2 flex gap-2">
          <Link 
            href={`/journals/published/${journal.id}`}
            className="flex-1 inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md shadow-sm transition-colors duration-200"
          >
            View Details
          </Link>
          
          {/* Share button - visible to everyone */}
          <button
            className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-md shadow-sm transition-colors duration-200"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowShareModal(true);
            }}
          >
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
            </svg>
            Share
          </button>
          
          {/* Admin-only buttons */}
          {isAuthenticated && user?.role === 'admin' && journal.status === 'published' && (
            <button
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                try {
                  // Use direct API call instead of relying on window methods
                  if (onUnpublish) {
                    await onUnpublish(journal.id);
                    toast.success('Journal unpublished successfully');
                  } else {
                    // Use updateJournalStatus instead of unpublishJournal
                    // Set the status to 'approved' which is the state before publishing
                    await journalAPI.updateJournalStatus(journal.id, 'approved');
                    toast.success('Journal unpublished successfully');
                    
                    // Update the journal status in the UI without page refresh
                    const journalElement = document.getElementById(`journal-${journal.id}`);
                    if (journalElement) {
                      const statusBadge = journalElement.querySelector('.status-badge');
                      if (statusBadge) {
                        statusBadge.textContent = 'Approved';
                        statusBadge.className = 'status-badge px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800';
                      }
                    }
                  }
                } catch (error) {
                  console.error('Error unpublishing journal:', error);
                  toast.error('Failed to unpublish journal. Please try again.');
                }
              }}
              disabled={isUnpublishing}
              className={`inline-flex items-center justify-center px-2 py-1.5 text-xs font-medium ${
                isUnpublishing 
                  ? 'text-gray-400 bg-gray-100 border-gray-200 cursor-not-allowed' 
                  : 'text-red-600 bg-red-50 hover:bg-red-100 border-red-200'
              } rounded-md border transition-colors duration-200`}
            >
              {isUnpublishing ? 'Unpublishing...' : 'Unpublish'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default JournalCard;
