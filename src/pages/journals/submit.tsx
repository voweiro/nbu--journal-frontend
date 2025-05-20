import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import Card from '@/components/ui/Card';
import JournalSubmissionForm from '@/components/forms/JournalSubmissionForm';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import { FiFileText, FiInfo, FiUpload, FiUsers } from 'react-icons/fi';

const SubmitJournalPage: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Redirect if not authenticated or not a publisher
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (user?.role !== UserRole.PUBLISHER) {
        router.push('/journals');
      }
    }
  }, [isAuthenticated, isLoading, router, user]);

  return (
    <Layout title="Submit Journal | NBU Journal System">
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center">
                <FiUpload className="mr-2 text-primary-600" />
                Submit New Journal
              </h1>
              <div className="text-sm text-gray-500 bg-white px-3 py-2 rounded-md shadow-sm border border-gray-200">
                <span className="font-medium">Logged in as:</span> {user?.first_name} {user?.last_name}
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-primary-50 to-blue-50 p-4 rounded-lg shadow-sm mb-6 border border-primary-100">
              <div className="flex items-start">
                <FiInfo className="text-primary-600 mt-1 mr-3 flex-shrink-0" size={20} />
                <div>
                  <h2 className="text-lg font-medium text-primary-800 mb-2">Before You Submit</h2>
                  <p className="text-primary-700 text-sm mb-2">Please ensure your submission meets all the requirements of the Nigerian British University Journal System.</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:border-primary-200 hover:shadow transition-all">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mr-3">
                    <FiFileText size={18} />
                  </div>
                  <h3 className="font-medium text-gray-900">Document Format</h3>
                </div>
                <p className="text-sm text-gray-600">Submit your journal in PDF or DOCX format with a maximum size of 10MB.</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:border-primary-200 hover:shadow transition-all">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mr-3">
                    <FiUsers size={18} />
                  </div>
                  <h3 className="font-medium text-gray-900">Author Details</h3>
                </div>
                <p className="text-sm text-gray-600">Include all authors with their correct information and designate a primary author.</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:border-primary-200 hover:shadow transition-all">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="font-medium text-gray-900">Abstract</h3>
                </div>
                <p className="text-sm text-gray-600">Provide a comprehensive abstract that clearly explains your research.</p>
              </div>
            </div>
            
            <Card className="shadow-md border border-gray-200">
              <div className="border-b border-gray-200 pb-4 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <FiUpload className="mr-2 text-primary-600" />
                  Journal Submission Form
                </h2>
                <p className="text-sm text-gray-600 mt-1">Fill out all required fields to submit your journal</p>
              </div>
              
              <JournalSubmissionForm />
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SubmitJournalPage;
