import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import { FiMenu, FiX, FiHome, FiBook, FiUsers, FiSettings, FiLogOut, 
         FiFileText, FiUpload, FiList, FiCheckSquare, FiUser } from 'react-icons/fi';

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
    <>
      {/* Mobile overlay when sidebar is open */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden" 
          onClick={toggleSidebar}
        />
      )}
      
      <aside 
        className={`bg-primary-800 text-white h-screen transition-all duration-300 ${
          isCollapsed ? 'w-16' : 'w-64'
        } fixed left-0 top-0 z-30 shadow-xl`}
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
              className="text-gray-300 hover:text-white p-1 rounded-full hover:bg-primary-700 transition-colors"
              aria-label="Toggle sidebar"
            >
              {isCollapsed ? <FiMenu size={20} /> : <FiX size={20} />}
            </button>
          </div>

        {/* User info */}
        <div className={`px-4 py-3 border-b border-primary-700 ${isCollapsed ? 'text-center' : ''}`}>
          {isCollapsed ? (
            <div className="w-8 h-8 rounded-full bg-primary-600 mx-auto flex items-center justify-center">
              <span className="font-medium">{user?.first_name?.charAt(0) || 'U'}</span>
            </div>
          ) : (
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center">
                <span className="font-medium">{user?.first_name?.charAt(0) || 'U'}</span>
              </div>
              <div className="ml-3">
                <p className="font-medium">{user?.first_name} {user?.last_name}</p>
                <p className="text-xs text-gray-300">{user?.role}</p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-2 space-y-2 overflow-y-auto">
          {/* Common links for all authenticated users */}
          <NavLink 
            href="/journals" 
            icon={<FiBook size={18} />}
            label="Journals" 
          />

          {/* Super Admin links */}
          {user?.role === UserRole.SUPER_ADMIN && (
            <>
              <NavLink 
                href="/dashboard" 
                icon={<FiHome size={18} />}
                label="Dashboard" 
              />
              <NavLink 
                href="/users" 
                icon={<FiUsers size={18} />}
                label="Users" 
              />
            </>
          )}

          {/* Admin links */}
          {user?.role === UserRole.ADMIN && (
            <NavLink 
              href="/dashboard" 
              icon={<FiHome size={18} />}
              label="Dashboard" 
            />
          )}

          {/* Reviewer links */}
          {user?.role === UserRole.REVIEWER && (
            <NavLink 
              href="/reviews" 
              icon={<FiCheckSquare size={18} />}
              label="Reviews" 
            />
          )}

          {/* Publisher links */}
          {user?.role === UserRole.PUBLISHER && (
            <>
              <NavLink 
                href="/journals/submit" 
                icon={<FiUpload size={18} />}
                label="Submit Journal" 
              />
              <NavLink 
                href="/journals?filter=mine" 
                icon={<FiList size={18} />}
                label="My Submissions" 
              />
            </>
          )}

          {/* Profile link */}
          <NavLink 
            href="/profile" 
            icon={<FiUser size={18} />}
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
            <FiLogOut size={18} />
            {!isCollapsed && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </div>
    </aside>
    </>
  );
};

export default Sidebar;
