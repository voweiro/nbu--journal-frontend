import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Journal } from '@/types';
import Badge from './Badge';
import { getFileUrl } from '@/utils/fileHelper';
// Import useAuth as a named import
import { useAuth } from '../../contexts/AuthContext';
import { useState } from 'react';

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
  // For published journals, use the published journal route
  const journalUrl = journal.status === 'published' 
    ? `/journals/published/${journal.id}` 
    : `/journals/${journal.id}`;

  const [expanded, setExpanded] = useState(false);

  const toggleAbstract = () => {
    setExpanded(!expanded);
  };

  return (
    <div className={`card hover:shadow-sm transition-shadow duration-200 ${className}`}>
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
          <Link href={journalUrl} className="hover:text-primary-600">
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
            {new Date(journal.created_at).toLocaleDateString('en-US', { year: '2-digit', month: 'short', day: 'numeric' })}
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
                {new Date(journal.published_date).toLocaleDateString('en-US', { year: '2-digit', month: 'short', day: 'numeric' })}
              </span>
            </div>
          )}
        </div>
        
        {/* Action button - Single prominent button for mobile */}
        <div className="mt-auto pt-2 flex gap-2">
          <Link 
            href={journalUrl}
            className="flex-1 inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md shadow-sm transition-colors duration-200"
          >
            View Details
          </Link>
          
          {journal.status === 'published' && canUnpublish && (
            <button
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                const confirmUnpublish = window.confirm('Are you sure you want to unpublish this journal?');
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
              className={`inline-flex items-center justify-center px-2 py-1.5 text-xs font-medium ${
                isUnpublishing 
                  ? 'text-gray-400 bg-gray-100 border-gray-200 cursor-not-allowed' 
                  : 'text-red-600 bg-red-50 hover:bg-red-100 border-red-200'
              } rounded-md border transition-colors duration-200`}
            >
              {isUnpublishing ? '...' : 'Unpublish'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default JournalCard;
