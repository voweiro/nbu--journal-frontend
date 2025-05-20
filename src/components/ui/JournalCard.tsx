import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Journal } from '@/types';
import Badge from './Badge';
import { getFileUrl } from '@/utils/fileHelper';
import { useAuth } from '../../contexts/AuthContext';
import { FiCalendar, FiDownload, FiEye, FiFile, FiUser, FiUsers, FiXCircle } from 'react-icons/fi';

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
    <div className={`bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-all duration-200 ${className}`}>
      <div className="p-5 flex flex-col h-full">
        {/* Status Banner */}
        <div className={`-mx-5 -mt-5 px-4 py-3 mb-4 flex items-center ${
          journal.status === 'approved' || journal.status === 'published' ? 'bg-green-50 border-b border-green-100' : 
          journal.status === 'rejected' ? 'bg-red-50 border-b border-red-100' : 
          journal.status === 'received' || journal.status === 'assigned' || journal.status === 'being_reviewed' ? 'bg-blue-50 border-b border-blue-100' : 
          'bg-gray-50 border-b border-gray-100'
        }`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 flex-shrink-0 ${
            journal.status === 'approved' || journal.status === 'published' ? 'bg-green-100 text-green-600' : 
            journal.status === 'rejected' ? 'bg-red-100 text-red-600' : 
            journal.status === 'received' || journal.status === 'assigned' || journal.status === 'being_reviewed' ? 'bg-blue-100 text-blue-600' : 
            'bg-gray-100 text-gray-600'
          }`}>
            {journal.status === 'published' && <FiEye size={18} />}
            {journal.status === 'approved' && <FiEye size={18} />}
            {journal.status === 'rejected' && <FiXCircle size={18} />}
            {(journal.status === 'received' || journal.status === 'assigned' || journal.status === 'being_reviewed') && <FiFile size={18} />}
            {journal.status === 'submitted' && <FiFile size={18} />}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`font-medium ${
                journal.status === 'approved' || journal.status === 'published' ? 'text-green-700' : 
                journal.status === 'rejected' ? 'text-red-700' : 
                journal.status === 'received' || journal.status === 'assigned' || journal.status === 'being_reviewed' ? 'text-blue-700' : 
                'text-gray-700'
              }`}>
                {journal.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
              {getStatusBadge(journal.status)}
            </div>
            <p className="text-xs text-gray-600 mt-1">{statusDetails.text}</p>
          </div>
        </div>
        
        <div className="flex-1">
          <Link href={journalUrl} className="block group">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors">
              {journal.title}
            </h3>
          </Link>

          <div className="mt-3 mb-4 text-sm text-gray-600 line-clamp-3">
            {journal.abstract}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div className="flex items-center text-xs text-gray-600">
              <FiCalendar size={14} className="mr-2 text-gray-400" />
              <div>
                <span className="font-medium block">Submitted</span>
                {formatDate(journal.created_at)}
              </div>
            </div>
            
            {journal.status === 'published' && journal.published_date && (
              <div className="flex items-center text-xs text-gray-600">
                <FiCalendar size={14} className="mr-2 text-gray-400" />
                <div>
                  <span className="font-medium block">Published</span>
                  {formatDate(journal.published_date)}
                </div>
              </div>
            )}
            
            {journal.publisher_first_name && (
              <div className="flex items-center text-xs text-gray-600">
                <FiUser size={14} className="mr-2 text-gray-400" />
                <div>
                  <span className="font-medium block">Publisher</span>
                  {journal.publisher_first_name} {journal.publisher_last_name}
                </div>
              </div>
            )}
            
            {journal.reviewer_first_name && (
              <div className="flex items-center text-xs text-gray-600">
                <FiUser size={14} className="mr-2 text-gray-400" />
                <div>
                  <span className="font-medium block">Reviewer</span>
                  {journal.reviewer_first_name} {journal.reviewer_last_name}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap justify-between items-center gap-3 mt-auto pt-4 border-t border-gray-100">
          <Link 
            href={journalUrl} 
            className="inline-flex items-center text-primary-600 hover:text-primary-700 text-sm font-medium hover:underline"
          >
            <FiEye size={16} className="mr-1" />
            View Details
          </Link>
          
          {journal.file_path && (
            <a 
              href={getFileUrl(journal.file_path)} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center text-gray-600 hover:text-gray-800 text-sm font-medium hover:underline"
            >
              <FiDownload size={16} className="mr-1" />
              Download
            </a>
          )}

          {canUnpublish && journal.status === 'published' && onUnpublish && (
            <button 
              onClick={() => onUnpublish(journal.id)}
              disabled={isUnpublishing}
              className="inline-flex items-center text-red-600 hover:text-red-700 text-sm font-medium hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiXCircle size={16} className="mr-1" />
              {isUnpublishing ? 'Processing...' : 'Unpublish'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default JournalCard;
