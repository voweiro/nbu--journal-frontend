import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Journal } from '@/types';
import Badge from './Badge';
import { getFileUrl } from '@/utils/fileHelper';
// Import useAuth as a named import
import { useAuth } from '../../contexts/AuthContext';

interface JournalCardProps {
  journal: Journal;
  className?: string;
  onUnpublish?: (journalId: number) => Promise<void>;
  isUnpublishing?: boolean;
}

declare global {
  interface Window {
    onUnpublishJournal?: (journalId: number) => void;
  }
}

const JournalCard: React.FC<JournalCardProps> = ({ 
  journal, 
  className = '',
  onUnpublish,
  isUnpublishing = false
}) => {
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
      case 'received':
        return <Badge variant="info">Received</Badge>;
      case 'assigned':
        return <Badge variant="info">Assigned</Badge>;
      case 'being_reviewed':
        return <Badge variant="info">Being Reviewed</Badge>;
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'published':
        return <Badge variant="success">Published</Badge>;
      case 'rejected':
        return <Badge variant="danger">Rejected</Badge>;
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
  const { user } = useAuth();
  
  // Check if user has permission to unpublish
  const canUnpublish = user && (
    user.role === 'super_admin' || // Using underscore to match backend role name
    user.role === 'admin' || 
    user.role === 'reviewer'
  );
  
  // Get the correct URL for the journal details page
  const journalUrl = `/journals/${journal.id}`;

  return (
    <div className={`card hover:shadow-lg transition-shadow duration-200 ${className}`}>
      <div className="p-4 flex flex-col h-full">
        {/* Status Banner */}
        <div className={`-mx-4 -mt-4 px-4 py-2 mb-3 ${
          journal.status === 'approved' || journal.status === 'published' ? 'bg-green-50' : 
          journal.status === 'rejected' ? 'bg-red-50' : 
          journal.status === 'received' || journal.status === 'assigned' || journal.status === 'being_reviewed' ? 'bg-blue-50' : 
          'bg-gray-50'
        }`}>
          <div className="flex items-center">
            <span className="text-xl mr-2">{statusDetails.icon}</span>
            <div>
              <div className="flex items-center">
                <span className={`font-medium mr-2 ${statusDetails.color}`}>
                  Status: {journal.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
                {getStatusBadge(journal.status)}
              </div>
              <p className="text-xs text-gray-600">{statusDetails.text}</p>
            </div>
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
              <Link href={`/journals/${journal.id}`} className="hover:text-primary-600">
                {journal.title}
              </Link>
            </h3>
          </div>
          
          <p className="text-sm text-gray-600 mb-4 line-clamp-3">
            {journal.abstract}
          </p>
          
          {journal.publication_number && (
            <div className="mb-2">
              <span className="text-xs font-medium text-gray-500">Publication Number:</span>
              <span className="ml-1 text-sm">{journal.publication_number}</span>
            </div>
          )}
          
          {journal.published_date && (
            <div className="mb-2">
              <span className="text-xs font-medium text-gray-500">Published:</span>
              <span className="ml-1 text-sm">{formatDate(journal.published_date)}</span>
            </div>
          )}
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                  {journal.publisher_profile_picture ? (
                    <Image 
                      src={getFileUrl(journal.publisher_profile_picture)}
                      alt={`${journal.publisher_first_name} ${journal.publisher_last_name}`}
                      width={40}
                      height={40}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full bg-primary-100 text-primary-600 font-medium text-sm">
                      {journal.publisher_first_name?.charAt(0) || 'U'}
                      {journal.publisher_last_name?.charAt(0) || 'U'}
                    </div>
                  )}
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {journal.publisher_first_name && journal.publisher_last_name
                    ? `${journal.publisher_first_name} ${journal.publisher_last_name}`
                    : 'Journal Publisher'}
                </p>
                <p className="text-xs text-gray-500">
                  {formatDate(journal.created_at)}
                </p>
              </div>
            </div>
            
            <div className="flex space-x-2">
              {journal.status === 'published' && canUnpublish && (
                <button
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const confirmUnpublish = window.confirm('Are you sure you want to unpublish this journal? It will no longer be visible to the public.');
                    if (confirmUnpublish) {
                      try {
                        if (onUnpublish) {
                          await onUnpublish(journal.id);
                        } else if (window.onUnpublishJournal) {
                          window.onUnpublishJournal(journal.id);
                        }
                      } catch (error) {
                        console.error('Error unpublishing journal:', error);
                      }
                    }
                  }}
                  disabled={isUnpublishing}
                  className={`inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium ${
                    isUnpublishing 
                      ? 'text-gray-400 bg-gray-100 border-gray-200 cursor-not-allowed' 
                      : 'text-red-600 bg-red-50 hover:bg-red-100 border-red-200'
                  } rounded-md border transition-colors duration-200`}
                >
                  {isUnpublishing ? 'Unpublishing...' : 'Unpublish'}
                </button>
              )}
              <Link 
                href={journalUrl}
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md shadow-sm transition-colors duration-200"
              >
                View Details
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JournalCard;
