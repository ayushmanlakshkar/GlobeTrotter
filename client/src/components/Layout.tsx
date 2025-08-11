import React from 'react';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
  headerVariant?: 'landing' | 'dashboard' | 'admin' | 'minimal';
  className?: string;
  showHeader?: boolean;
  showBackButton?: boolean;
  backButtonText?: string;
  backButtonPath?: string;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  headerVariant = 'dashboard', 
  className = '',
  showHeader = true,
  showBackButton = false,
  backButtonText = 'Back to Dashboard',
  backButtonPath = '/dashboard'
}) => {
  return (
    <div className={`min-h-screen ${className}`}>
      {showHeader && (
        <Header 
          variant={headerVariant} 
          showBackButton={showBackButton}
          backButtonText={backButtonText}
          backButtonPath={backButtonPath}
        />
      )}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

export default Layout;
