import React, { ReactNode, useState } from 'react';
import Head from 'next/head';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
import HeroSlider from '@/components/ui/HeroSlider';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  hideHero?: boolean;
  showHero?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title = 'NBU Journal Publication System',
  description = 'Nigerian British University Journal Publication System for academic research and publications',
  hideHero = false,
  showHero = false
}) => {
  const { isAuthenticated } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const router = useRouter();
  
  // Determine if we should show the hero section
  // Only show on homepage for non-authenticated users or when explicitly requested
  const isHomePage = router.pathname === '/';
  const shouldShowHero = showHero && !isAuthenticated && isHomePage;
  
  const handleSidebarToggle = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
  };
  
  // Hero slider content
  const heroSlides = [
    {
      title: "Nigerian British University Journal Publications",
      description: "Discover the latest academic research and publications from our university community",
      imageUrl: "/images/home.png"
    },
    {
      title: "Advancing Academic Excellence",
      description: "Supporting scholarly research and innovation across disciplines",
      imageUrl: "/images/home2.png"
    },
    {
      title: "Join Our Academic Community",
      description: "Publish your research and contribute to the growing body of knowledge",
      imageUrl: "/images/home3.jpg"
    },

    {
      title: "Advancing Academic Excellence",
      description: "Supporting scholarly research and innovation across disciplines",
      imageUrl: "/images/nbu-mss.jpg"
    }
  ];
  // If user is authenticated, use the sidebar layout
  if (isAuthenticated) {
    return (
      <>
        <Head>
          <title>{title}</title>
          <meta name="description" content={description} />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        
        <div className="flex min-h-screen bg-gray-50">
          <Sidebar onToggle={handleSidebarToggle} />
          
          <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
            <div className="p-6">
              {children}
            </div>
          </main>
        </div>
      </>
    );
  }
  
  // For unauthenticated users, use the regular layout with header and footer
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-1 pt-16">
          {shouldShowHero && <HeroSlider slides={heroSlides} />}
          {children}
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default Layout;
