
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart, Package, Clipboard, BarChart4, Clock, DollarSign } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const HomePage = () => {
  const navigate = useNavigate();
  const { isOwner } = useAuth();

  const modules = [
    {
      title: 'POS & Billing',
      icon: <ShoppingCart className="module-icon" />,
      path: '/pos',
      description: 'Create orders and generate bills',
    },
    {
      title: 'Daily Purchases',
      icon: <Package className="module-icon" />,
      path: '/purchases',
      description: 'Log your daily purchases',
    },
    {
      title: 'Inventory',
      icon: <Clipboard className="module-icon" />,
      path: '/inventory',
      description: 'Track and manage stock',
    },
    {
      title: 'Attendance',
      icon: <Clock className="module-icon" />,
      path: '/attendance',
      description: 'Check in/out and view shifts',
    },
    {
      title: 'Cash Drawer',
      icon: <DollarSign className="module-icon" />,
      path: '/cash-drawer',
      description: 'Track opening and closing cash',
    },
    {
      title: 'Dashboard',
      icon: <BarChart4 className="module-icon" />,
      path: '/dashboard',
      description: 'View sales and performance',
      ownerOnly: true,
    },
    {
      title: 'Upload Data',
      icon: <Clipboard className="module-icon" />,
      path: '/upload',
      description: 'Import menu, inventory & recipes',
      ownerOnly: true,
    },
  ];

  const filteredModules = modules.filter(module => !module.ownerOnly || isOwner);

  return (
    <Layout title="Mir Café Hub">
      <div className="mir-container">
        <div className="grid grid-cols-2 gap-4">
          {filteredModules.map((module) => (
            <Card 
              key={module.title} 
              className="module-card hover:scale-105 transition-transform cursor-pointer"
              onClick={() => navigate(module.path)}
            >
              <CardContent className="p-4 flex flex-col items-center text-center">
                {module.icon}
                <h3 className="font-bold text-sm mt-2">{module.title}</h3>
                <p className="text-xs text-mir-gray-dark mt-1">{module.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;
