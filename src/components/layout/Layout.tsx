import React, { ReactNode, useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
import HeroSlider from '@/components/ui/HeroSlider';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import MobileNav from '@/components/layout/MobileNav'

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
  // For mobile detection
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile when component mounts and when window resizes
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Check on mount
    checkIfMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkIfMobile);
    
    // Clean up
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

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
          {/* Show sidebar on desktop, hide on mobile */}
          <div className="hidden md:block">
            <Sidebar onToggle={handleSidebarToggle} />
          </div>
          
          {/* Mobile header for authenticated users */}
          <div className="fixed top-0 left-0 right-0 z-40 md:hidden">
            <div className="bg-gradient-to-r from-primary-900 to-primary-700 text-white shadow-lg px-4 py-3 flex justify-between items-center">
              <Link href="/" className="flex items-center">
                <span className="text-xl font-bold">NBU Journal</span>
              </Link>
              <MobileNav />
            </div>
          </div>
          
          <main className={`flex-1 transition-all duration-300 ${isMobile ? 'mt-14' : ''} ${!isMobile && sidebarCollapsed ? 'md:ml-16' : !isMobile ? 'md:ml-64' : ''}`}>
            <div className="p-4 md:p-6">
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
      
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        
        <main className="flex-1 pt-16">
          {shouldShowHero && <HeroSlider slides={heroSlides} />}
          <div className="container mx-auto px-4 py-6 md:py-8">
            {children}
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default Layout;
