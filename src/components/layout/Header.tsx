import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import { getFileUrl } from '@/utils/fileHelper';
import MobileNav from './MobileNav';

const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-gradient-to-r from-[#3498DB] to-[#E74C3C] text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and site name */}
          <div className="flex items-center space-x-2">
            <Link href="/" className="flex items-center space-x-2">
              <Image 
                src="/images/banner.jpg" 
                alt="NBU Journal Logo" 
                width={60} 
                height={60} 
                className="rounded-full object-cover border-2 border-white"
              />
              <span className="text-2xl font-bold">Nigerian British University Journal System</span>
            </Link>
          </div>

          {/* Mobile Navigation */}
          <div className="block md:hidden">
            <MobileNav />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              href="/" 
              className={`hover:text-primary-200 ${
                router.pathname === '/' ? 'text-primary-200 font-medium' : ''
              }`}
            >
              Home
            </Link>

            {isAuthenticated ? (
              <>
                {/* Links based on user role */}
                {user?.role === UserRole.SUPER_ADMIN && (
                  <>
                    <Link 
                      href="/dashboard" 
                      className={`hover:text-primary-200 ${
                        router.pathname.startsWith('/dashboard') ? 'text-primary-200 font-medium' : ''
                      }`}
                    >
                      Dashboard
                    </Link>
                    <Link 
                      href="/users" 
                      className={`hover:text-primary-200 ${
                        router.pathname.startsWith('/users') ? 'text-primary-200 font-medium' : ''
                      }`}
                    >
                      Users
                    </Link>
                  </>
                )}

                {user?.role === UserRole.ADMIN && (
                  <>
                    <Link 
                      href="/dashboard" 
                      className={`hover:text-primary-200 ${
                        router.pathname.startsWith('/dashboard') ? 'text-primary-200 font-medium' : ''
                      }`}
                    >
                      Dashboard
                    </Link>
                  </>
                )}

                {user?.role === UserRole.REVIEWER && (
                  <Link 
                    href="/reviews" 
                    className={`hover:text-primary-200 ${
                      router.pathname.startsWith('/reviews') ? 'text-primary-200 font-medium' : ''
                    }`}
                  >
                    Reviews
                  </Link>
                )}

                {/* Common links for all authenticated users */}
                <Link 
                  href="/journals" 
                  className={`hover:text-primary-200 ${
                    router.pathname.startsWith('/journals') ? 'text-primary-200 font-medium' : ''
                  }`}
                >
                  Journals
                </Link>

                {/* User dropdown */}
                <div className="relative group">
                  <button className="flex items-center space-x-2 hover:text-primary-200">
                    {user?.profile_picture ? (
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                        <Image 
                          src={getFileUrl(user.profile_picture)}
                          alt={`${user.first_name} ${user.last_name}`}
                          width={32}
                          height={32}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-primary-100 flex items-center justify-center text-primary-600 font-medium">
                        {user?.first_name?.charAt(0)}
                        {user?.last_name?.charAt(0)}
                      </div>
                    )}
                    <span>{user?.first_name}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                    <Link 
                      href="/profile" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={logout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className={`hover:text-primary-200 ${
                    router.pathname === '/login' ? 'text-primary-200 font-medium' : ''
                  }`}
                >
                  Login
                </Link>
                <Link 
                  href="/register" 
                  className="bg-white text-primary-800 px-4 py-2 rounded-md font-medium hover:bg-primary-100"
                >
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
