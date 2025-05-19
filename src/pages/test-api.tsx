import { useEffect, useState } from 'react';
import axios from 'axios';

export default function TestAPI() {
  const [apiUrl, setApiUrl] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  
  useEffect(() => {
    // Get the API URL from the api.ts file
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://nbu-journal-backend.onrender.com/api';
    setApiUrl(API_URL);
    
    // Create axios instance with the same configuration as in api.ts
    const api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });
    
    setBaseUrl(api.defaults.baseURL || '');
  }, []);
  
  return (
    <div style={{ padding: '20px' }}>
      <h1>API Configuration Test</h1>
      <p><strong>API URL:</strong> {apiUrl}</p>
      <p><strong>Axios Base URL:</strong> {baseUrl}</p>
      <p>
        If these URLs still show the old Render URL, you may need to:
        <ol>
          <li>Clear your browser cache</li>
          <li>Restart your Next.js development server</li>
          <li>Make sure you've saved all the files we modified</li>
        </ol>
      </p>
    </div>
  );
}
