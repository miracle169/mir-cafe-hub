
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingCart, Package, BarChart4, Clock, Upload, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const BottomNav = () => {
  const location = useLocation();
  const { isOwner } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bottom-nav">
      <Link 
        to="/" 
        className={cn("bottom-nav-item", isActive('/') && "text-mir-red")}
      >
        <Home className="bottom-nav-icon" />
        <span className="text-xs">Home</span>
      </Link>
      
      <Link 
        to="/pos" 
        className={cn("bottom-nav-item", isActive('/pos') && "text-mir-red")}
      >
        <ShoppingCart className="bottom-nav-icon" />
        <span className="text-xs">POS</span>
      </Link>
      
      <Link 
        to="/purchases" 
        className={cn("bottom-nav-item", isActive('/purchases') && "text-mir-red")}
      >
        <Package className="bottom-nav-icon" />
        <span className="text-xs">Purchases</span>
      </Link>
      
      <Link 
        to="/attendance" 
        className={cn("bottom-nav-item", isActive('/attendance') && "text-mir-red")}
      >
        <Clock className="bottom-nav-icon" />
        <span className="text-xs">Attendance</span>
      </Link>
      
      {isOwner && (
        <Link 
          to="/dashboard" 
          className={cn("bottom-nav-item", isActive('/dashboard') && "text-mir-red")}
        >
          <BarChart4 className="bottom-nav-icon" />
          <span className="text-xs">Dashboard</span>
        </Link>
      )}
      
      {isOwner && (
        <Link 
          to="/upload" 
          className={cn("bottom-nav-item", isActive('/upload') && "text-mir-red")}
        >
          <Upload className="bottom-nav-icon" />
          <span className="text-xs">Upload</span>
        </Link>
      )}

      {isOwner && (
        <Link 
          to="/staff-management" 
          className={cn("bottom-nav-item", isActive('/staff-management') && "text-mir-red")}
        >
          <Users className="bottom-nav-icon" />
          <span className="text-xs">Staff</span>
        </Link>
      )}
    </nav>
  );
};

export default BottomNav;
