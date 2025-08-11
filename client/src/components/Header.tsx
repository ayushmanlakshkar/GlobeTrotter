import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import logoSvg from '../assets/logo';
import authService from '../services/auth.service';

interface HeaderProps {
  variant?: 'landing' | 'dashboard' | 'admin' | 'minimal';
  showBackButton?: boolean;
  backButtonText?: string;
  backButtonPath?: string;
}

const Header: React.FC<HeaderProps> = ({ 
  variant = 'dashboard', 
  showBackButton = false, 
  backButtonText = 'Back to Dashboard',
  backButtonPath = '/dashboard'
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  // Landing page header
  if (variant === 'landing') {
    return (
      <div className="flex justify-between items-center px-6 md:px-16 py-5 z-20 relative">
        <div className="flex items-center">
          <div className="w-10 h-10 mr-3" dangerouslySetInnerHTML={{ __html: logoSvg }} />
          <h1 className="text-2xl font-bold text-primary">GlobeTrotter</h1>
        </div>
        <div className="flex gap-4">
          <button 
            className="font-semibold text-primary hover:underline" 
            onClick={() => navigate('/login')}
          >
            Login
          </button>
          <button 
            className="px-5 py-2.5 rounded-full font-semibold bg-primary text-white hover:bg-primary-dark transition-colors" 
            onClick={() => navigate('/signup')}
          >
            Sign up free
          </button>
        </div>
      </div>
    );
  }

  // Admin dashboard header
  if (variant === 'admin') {
    return (
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 
                  className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent cursor-pointer"
                  onClick={() => navigate('/admin')}
                >
                  Admin Dashboard
                </h1>
                <div className="flex items-center mt-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                  <span className="text-xs text-gray-600">Live Analytics</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/dashboard')}
                className="text-blue-600 border-blue-600 hover:bg-blue-50"
              >
                Back to Dashboard
              </Button>
              <div className="flex items-center space-x-3 bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl px-4 py-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {currentUser?.user?.first_name?.charAt(0) || 'A'}
                  </span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">
                    {currentUser?.user?.first_name} {currentUser?.user?.last_name}
                  </div>
                  <div className="text-xs text-gray-600">Admin</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>
    );
  }

  // Minimal header (for auth pages)
  if (variant === 'minimal') {
    return (
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div 
            className="flex items-center cursor-pointer"
            onClick={() => navigate('/')}
          >
            <div className="w-10 h-10 mr-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center" dangerouslySetInnerHTML={{ __html: logoSvg }} />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">GlobeTrotter</h1>
          </div>
        </div>
      </header>
    );
  }

  // Default dashboard header
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <div 
            className="w-10 h-10 mr-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center cursor-pointer" 
            dangerouslySetInnerHTML={{ __html: logoSvg }}
            onClick={() => navigate('/dashboard')}
          />
          <h1 
            className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent cursor-pointer"
            onClick={() => navigate('/dashboard')}
          >
            GlobeTrotter
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/search')}
            className={`text-blue-600 border-blue-600 hover:bg-blue-50 ${
              location.pathname.includes('/search') ? 'bg-blue-50' : ''
            }`}
          >
            Search
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate('/calendar')}
            className={`text-blue-600 border-blue-600 hover:bg-blue-50 ${
              location.pathname === '/calendar' ? 'bg-blue-50' : ''
            }`}
          >
            Calendar
          </Button>
          {currentUser?.user?.role === 'admin' && (
            <Button 
              variant="outline" 
              onClick={() => navigate('/admin')}
              className={`text-purple-600 border-purple-600 hover:bg-purple-50 ${
                location.pathname === '/admin' ? 'bg-purple-50' : ''
              }`}
            >
              Admin Panel
            </Button>
          )}
          {showBackButton && (
            <Button 
              variant="ghost" 
              onClick={() => navigate(backButtonPath)}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {backButtonText}
            </Button>
          )}
          {currentUser && (
            <div className="flex items-center space-x-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl px-4 py-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {currentUser.user?.first_name?.charAt(0) || 'U'}
                </span>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900">
                  {currentUser.user?.first_name} {currentUser.user?.last_name}
                </div>
                <div className="text-xs text-gray-600">
                  {currentUser.user?.role === 'admin' ? 'Admin' : 'User'}
                </div>
              </div>
            </div>
          )}
          <Button variant="ghost" onClick={handleLogout} className="text-gray-600 hover:text-gray-900">
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
