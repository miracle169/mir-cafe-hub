
import React from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ShoppingBasket, Receipt, Users, Package, ShoppingCart, 
  Settings, BarChart3, Coffee, ClipboardList
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const MenuItem = ({ 
  icon: Icon, 
  label, 
  path, 
  color 
}: { 
  icon: React.ElementType; 
  label: string; 
  path: string; 
  color: string;
}) => {
  const navigate = useNavigate();
  
  return (
    <Card className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => navigate(path)}>
      <CardContent className="p-6 flex flex-col items-center justify-center">
        <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center mb-3`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <h3 className="font-medium text-center">{label}</h3>
      </CardContent>
    </Card>
  );
};

const HomePage = () => {
  const { hasPermission } = useAuth();
  const isOwner = hasPermission('owner');
  
  const menuItems = [
    {
      icon: ShoppingBasket,
      label: 'Point of Sale',
      path: '/pos',
      color: 'bg-mir-red',
      role: 'staff',
    },
    {
      icon: Receipt,
      label: 'Receipts',
      path: '/receipts',
      color: 'bg-mir-yellow',
      role: 'staff',
    },
    {
      icon: Users,
      label: 'Customers',
      path: '/customers',
      color: 'bg-blue-500',
      role: 'owner',
    },
    {
      icon: Package,
      label: 'Inventory',
      path: '/inventory',
      color: 'bg-green-500',
      role: 'owner',
    },
    {
      icon: ShoppingCart,
      label: 'Purchases',
      path: '/purchases',
      color: 'bg-purple-500',
      role: 'owner',
    },
    {
      icon: Coffee,
      label: 'Products',
      path: '/products',
      color: 'bg-orange-500',
      role: 'owner',
    },
    {
      icon: ClipboardList,
      label: 'Cash Drawer',
      path: '/cash-drawer',
      color: 'bg-pink-500',
      role: 'owner',
    },
    {
      icon: BarChart3,
      label: 'Dashboard',
      path: '/dashboard',
      color: 'bg-indigo-500',
      role: 'owner',
    },
    {
      icon: Settings,
      label: 'Settings',
      path: '/settings',
      color: 'bg-gray-500',
      role: 'owner',
    },
  ];

  // Filter menu items based on role
  const filteredMenuItems = menuItems.filter(
    item => isOwner || item.role === 'staff'
  );

  return (
    <Layout title="Mir Café">
      <div className="mir-container pb-20">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {filteredMenuItems.map((item, index) => (
            <MenuItem
              key={index}
              icon={item.icon}
              label={item.label}
              path={item.path}
              color={item.color}
            />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;
