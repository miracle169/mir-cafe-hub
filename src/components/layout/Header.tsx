
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Coffee, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  showLogoutButton?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  title = 'Mir Café Hub', 
  showBackButton = false,
  showLogoutButton = true
}) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = () => {
    logout();
    toast({
      title: 'Logged Out',
      description: 'You have been logged out successfully',
    });
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-mir-gray/10 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {showBackButton && (
            <Button variant="ghost" size="icon" onClick={handleBack} className="mr-2">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
          
          {!showBackButton && (
            <Coffee className="h-6 w-6 text-mir-red mr-2" />
          )}
          
          <h1 className="text-lg font-bold text-mir-black">{title}</h1>
        </div>
        
        <div className="flex items-center">
          {currentUser && (
            <div className="text-sm font-medium mr-3 text-mir-black">
              {currentUser.name}
              <span className="ml-2 badge badge-secondary text-xs">
                {currentUser.role === 'owner' ? 'Owner' : 'Staff'}
              </span>
            </div>
          )}
          
          {showLogoutButton && (
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5 text-mir-black" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
