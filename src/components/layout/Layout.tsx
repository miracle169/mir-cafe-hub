
import React, { ReactNode } from 'react';
import Header from './Header';
import BottomNav from './BottomNav';
import { useAuth } from '@/contexts/AuthContext';
import Login from '../Login';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  showBackButton?: boolean;
  hideNav?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title,
  showBackButton = false,
  hideNav = false
}) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-mir-gray-light">
      <Header title={title} showBackButton={showBackButton} />
      
      <main className="flex-1 pb-16"> {/* Add padding to accommodate bottom nav */}
        {children}
      </main>
      
      {!hideNav && <BottomNav />}
    </div>
  );
};

export default Layout;
