import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import Card from '@/components/ui/Card';
import JournalSubmissionForm from '@/components/forms/JournalSubmissionForm';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';

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
          <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Submit New Journal</h1>
            
            <Card>
              <div className="mb-6">
                <h2 className="text-lg font-medium text-gray-900 mb-2">Submission Guidelines</h2>
                <ul className="list-disc pl-5 text-gray-600 space-y-1">
                  <li>Ensure your journal meets all academic standards and formatting requirements</li>
                  <li>Provide a comprehensive abstract that clearly explains your research</li>
                  <li>Include all authors with their correct information</li>
                  <li>Submit your journal in PDF or DOCX format (maximum 10MB)</li>
                  <li>Your submission will be reviewed by our editorial team before publication</li>
                </ul>
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
