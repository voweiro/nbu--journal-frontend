import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';

const MobileNav: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
    setIsOpen(false);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <div className="md:hidden">
      {/* Hamburger button */}
      <button 
        onClick={toggleMenu}
        className="text-white p-2 focus:outline-none"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Mobile menu overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={closeMenu}>
          <div 
            className="absolute top-0 right-0 w-3/4 max-w-sm h-screen bg-primary-800 shadow-lg p-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button 
              onClick={closeMenu}
              className="absolute top-4 right-4 text-white"
              aria-label="Close menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* User info */}
            {isAuthenticated && user && (
              <div className="py-4 border-b border-primary-700 mb-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center">
                    <span className="font-medium text-white">{user.first_name?.charAt(0) || 'U'}</span>
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-white">{user.first_name} {user.last_name}</p>
                    <p className="text-xs text-gray-300">{user.role}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation links */}
            <nav className="flex flex-col space-y-2">
              <Link 
                href="/" 
                className={`p-3 rounded-lg text-white hover:bg-primary-700 ${
                  router.pathname === '/' ? 'bg-primary-700' : ''
                }`}
                onClick={closeMenu}
              >
                Home
              </Link>

              {isAuthenticated ? (
                <>
                  <Link 
                    href="/journals" 
                    className={`p-3 rounded-lg text-white hover:bg-primary-700 ${
                      router.pathname.startsWith('/journals') ? 'bg-primary-700' : ''
                    }`}
                    onClick={closeMenu}
                  >
                    Journals
                  </Link>

                  {user?.role === UserRole.PUBLISHER && (
                    <Link 
                      href="/journals/submit" 
                      className={`p-3 rounded-lg text-white hover:bg-primary-700 ${
                        router.pathname === '/journals/submit' ? 'bg-primary-700' : ''
                      }`}
                      onClick={closeMenu}
                    >
                      Submit Journal
                    </Link>
                  )}

                  {user?.role === UserRole.REVIEWER && (
                    <Link 
                      href="/reviews" 
                      className={`p-3 rounded-lg text-white hover:bg-primary-700 ${
                        router.pathname.startsWith('/reviews') ? 'bg-primary-700' : ''
                      }`}
                      onClick={closeMenu}
                    >
                      Reviews
                    </Link>
                  )}

                  {(user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN) && (
                    <Link 
                      href="/dashboard" 
                      className={`p-3 rounded-lg text-white hover:bg-primary-700 ${
                        router.pathname.startsWith('/dashboard') ? 'bg-primary-700' : ''
                      }`}
                      onClick={closeMenu}
                    >
                      Dashboard
                    </Link>
                  )}

                  {user?.role === UserRole.SUPER_ADMIN && (
                    <Link 
                      href="/users" 
                      className={`p-3 rounded-lg text-white hover:bg-primary-700 ${
                        router.pathname.startsWith('/users') ? 'bg-primary-700' : ''
                      }`}
                      onClick={closeMenu}
                    >
                      Users
                    </Link>
                  )}

                  <Link 
                    href="/profile" 
                    className={`p-3 rounded-lg text-white hover:bg-primary-700 ${
                      router.pathname === '/profile' ? 'bg-primary-700' : ''
                    }`}
                    onClick={closeMenu}
                  >
                    Profile
                  </Link>

                  <button 
                    onClick={handleLogout}
                    className="p-3 rounded-lg text-white hover:bg-primary-700 text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/login" 
                    className={`p-3 rounded-lg text-white hover:bg-primary-700 ${
                      router.pathname === '/login' ? 'bg-primary-700' : ''
                    }`}
                    onClick={closeMenu}
                  >
                    Login
                  </Link>
                  <Link 
                    href="/register" 
                    className={`p-3 rounded-lg text-white hover:bg-primary-700 ${
                      router.pathname === '/register' ? 'bg-primary-700' : ''
                    }`}
                    onClick={closeMenu}
                  >
                    Register
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileNav;
