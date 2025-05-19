import React, { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import { journalAPI } from '@/utils/api';
import { Journal } from '@/types';

export default function TestPublishedPage() {
  const [journals, setJournals] = useState<Journal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rawResponse, setRawResponse] = useState<any>(null);

  useEffect(() => {
    const fetchJournals = async () => {
      try {
        console.log('Fetching published journals...');
        const response = await fetch('/api/journals/published');
        const data = await response.json();
        
        console.log('Raw API response:', data);
        setRawResponse(data);
        
        if (data.journals) {
          console.log('Found journals:', data.journals);
          setJournals(data.journals);
        } else {
          console.log('No journals found in response');
          setError('No journals found in response');
        }
      } catch (err) {
        console.error('Error fetching journals:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchJournals();
  }, []);

  return (
    <Layout title="Test Published Journals" description="Testing published journals display">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Test Published Journals</h1>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
            <p className="mt-2">Loading journals...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <p className="font-medium">Error loading journals</p>
            <p className="text-sm">{error}</p>
          </div>
        ) : (
          <div>
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-6">
              <p className="font-medium">Raw API Response:</p>
              <pre className="text-xs mt-2 overflow-auto max-h-40">
                {JSON.stringify(rawResponse, null, 2)}
              </pre>
            </div>
            
            <h2 className="text-xl font-semibold mb-4">Found {journals.length} Published Journals</h2>
            
            {journals.length > 0 ? (
              <div className="space-y-4">
                {journals.map(journal => (
                  <div key={journal.id} className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900">{journal.title}</h3>
                    <p className="mt-2 text-gray-600">{journal.abstract}</p>
                    <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Status:</span> {journal.status}
                      </div>
                      <div>
                        <span className="font-medium">Publication Number:</span> {journal.publication_number || 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">Published Date:</span> {journal.published_date ? new Date(journal.published_date).toLocaleDateString() : 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">Created:</span> {new Date(journal.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
                <p>No published journals found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
