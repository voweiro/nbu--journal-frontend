import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';

interface SidebarProps {
  onToggle?: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onToggle }) => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    if (onToggle) {
      onToggle(newState);
    }
  };
  
  // Notify parent component of initial state
  useEffect(() => {
    if (onToggle) {
      onToggle(isCollapsed);
    }
  }, []);

  const NavLink = ({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) => {
    const isActive = router.pathname.startsWith(href);
    
    return (
      <Link 
        href={href} 
        className={`flex items-center p-3 rounded-lg transition-colors ${
          isActive 
            ? 'bg-primary-700 text-white' 
            : 'text-gray-300 hover:bg-primary-700 hover:text-white'
        }`}
      >
        <div className="mr-3">{icon}</div>
        {!isCollapsed && <span className="font-medium">{label}</span>}
      </Link>
    );
  };

  return (
    <aside 
      className={`bg-gradient-to-r from-[#3498DB] to-[#E74C3C] text-white h-screen transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      } fixed left-0 top-0 z-30`}
    >
      <div className="flex flex-col h-full">
        {/* Logo and toggle */}
        <div className={`flex items-center justify-between p-4 ${isCollapsed ? 'justify-center' : ''}`}>
          {!isCollapsed && (
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold">NBU Journal</span>
            </Link>
          )}
          <button 
            onClick={toggleSidebar}
            className="text-gray-300 hover:text-white p-1"
          >
            {isCollapsed ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            )}
          </button>
        </div>

        {/* User info */}
        <div className={`px-4 py-3 border-b border-primary-700 ${isCollapsed ? 'text-center' : ''}`}>
          {isCollapsed ? (
            <div className="w-8 h-8 rounded-full bg-primary-600 mx-auto flex items-center justify-center">
              <span className="font-medium">{user?.first_name?.charAt(0) || 'U'}</span>
            </div>
          ) : (
            <>
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center">
                  <span className="font-medium">{user?.first_name?.charAt(0) || 'U'}</span>
                </div>
                <div className="ml-3">
                  <p className="font-medium">{user?.first_name} {user?.last_name}</p>
                  <p className="text-xs text-gray-300">{user?.role}</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-2 space-y-2 overflow-y-auto">
          {/* Common links for all authenticated users */}
          <NavLink 
            href="/journals" 
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            } 
            label="Journals" 
          />

          {/* Super Admin links */}
          {user?.role === UserRole.SUPER_ADMIN && (
            <>
              <NavLink 
                href="/dashboard" 
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                } 
                label="Dashboard" 
              />
              <NavLink 
                href="/users" 
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                } 
                label="Users" 
              />
            </>
          )}

          {/* Admin links */}
          {user?.role === UserRole.ADMIN && (
            <NavLink 
              href="/dashboard" 
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              } 
              label="Dashboard" 
            />
          )}

          {/* Reviewer links */}
          {user?.role === UserRole.REVIEWER && (
            <NavLink 
              href="/reviews" 
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              } 
              label="Reviews" 
            />
          )}

          {/* Publisher links */}
          {user?.role === UserRole.PUBLISHER && (
            <>
              <NavLink 
                href="/journals/submit" 
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                } 
                label="Submit Journal" 
              />
              <NavLink 
                href="/journals?filter=mine" 
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                } 
                label="My Submissions" 
              />
            </>
          )}

          {/* Profile link */}
          <NavLink 
            href="/profile" 
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            } 
            label="Profile" 
          />
        </nav>

        {/* Logout button */}
        <div className="p-4 border-t border-primary-700">
          <button
            onClick={logout}
            className={`flex items-center p-2 rounded-lg text-gray-300 hover:bg-primary-700 hover:text-white transition-colors w-full ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {!isCollapsed && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
