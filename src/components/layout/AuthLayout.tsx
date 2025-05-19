import React, { ReactNode } from 'react';
import Head from 'next/head';
import Sidebar from './Sidebar';

interface AuthLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ 
  children, 
  title = 'NBU Journal Publication System',
  description = 'Nigerian British University Journal Publication System for academic research and publications'
}) => {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        
        <main className="flex-1 ml-64 transition-all duration-300">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </>
  );
};

export default AuthLayout;
