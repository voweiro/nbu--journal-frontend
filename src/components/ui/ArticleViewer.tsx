import React, { useState } from 'react';
import { FiDownload, FiEye, FiFileText, FiExternalLink } from 'react-icons/fi';

interface ArticleViewerProps {
  title: string;
  description?: string;
  pdfUrl: string;
  fileName: string;
  volume?: string;
  publishedDate?: string;
  className?: string;
}

const ArticleViewer: React.FC<ArticleViewerProps> = ({
  title,
  description,
  pdfUrl,
  fileName,
  volume,
  publishedDate,
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(pdfUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleView = () => {
    window.open(pdfUrl, '_blank');
  };

  return (
    <div className={`bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <FiFileText className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-1 text-white">{title}</h3>
            {volume && (
              <span className="inline-block bg-white text-primary-700 px-2 py-1 rounded text-sm font-medium">
                {volume}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {description && (
          <p className="text-gray-600 mb-4 leading-relaxed">
            {description}
          </p>
        )}

        {publishedDate && (
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <span className="font-medium">Published:</span>
            <span className="ml-2">{publishedDate}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleView}
            className="flex-1 flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-3 rounded-md transition-colors duration-200 font-medium"
          >
            <FiEye className="w-5 h-5" />
            View PDF
            <FiExternalLink className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleDownload}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-3 rounded-md transition-colors duration-200 font-medium"
          >
            <FiDownload className="w-5 h-5" />
            {isLoading ? 'Downloading...' : 'Download PDF'}
          </button>
        </div>

        {/* File Info */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>File: {fileName}</span>
            <span>Format: PDF</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleViewer;