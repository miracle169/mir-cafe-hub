
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { useMenu } from '@/contexts/MenuContext';
import { useCart } from '@/contexts/CartContext';
import { Search, Plus, ShoppingCart, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const POSPage = () => {
  const navigate = useNavigate();
  const { categories, items, getItemsByCategory } = useMenu();
  const { addItem, itemCount, totalAmount } = useCart();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(categories[0]?.id || null);

  const handleAddItem = (itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (item) {
      addItem({
        id: item.id,
        name: item.name,
        price: item.price,
        category: item.category,
      });
    }
  };

  const filteredItems = search
    ? items.filter((item) => 
        item.name.toLowerCase().includes(search.toLowerCase())
      )
    : activeCategory
      ? getItemsByCategory(activeCategory)
      : [];

  return (
    <Layout title="POS & Billing" showBackButton>
      <div className="mir-container pb-20">
        {/* Search Bar */}
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search menu items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Categories */}
        <Tabs value={activeCategory || ''} onValueChange={setActiveCategory} className="mb-4">
          <TabsList className="w-full overflow-x-auto flex-nowrap whitespace-nowrap justify-start">
            {categories.map((category) => (
              <TabsTrigger 
                key={category.id} 
                value={category.id}
                className="px-4 py-2"
              >
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Menu Items */}
        <div className="grid grid-cols-1 gap-2 mb-20">
          {filteredItems.map((item) => (
            <Card key={item.id} className="bg-white shadow-sm">
              <CardContent className="p-3 flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-mir-black">{item.name}</h3>
                  <p className="text-sm text-mir-gray-dark">₹{item.price.toFixed(2)}</p>
                </div>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-8 w-8 rounded-full p-0 bg-mir-yellow text-mir-black hover:bg-mir-yellow/90"
                  onClick={() => handleAddItem(item.id)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Cart Summary Fixed at Bottom */}
      <div className="fixed bottom-16 left-0 right-0 bg-white shadow-lg border-t border-mir-gray p-4">
        <Button 
          className="w-full bg-mir-red text-white flex justify-between"
          onClick={() => navigate('/pos/cart')}
          disabled={itemCount === 0}
        >
          <div className="flex items-center">
            <ShoppingCart className="mr-2 h-5 w-5" />
            <span>View Cart</span>
          </div>
          <div className="flex items-center">
            <Badge variant="secondary" className="mr-2 bg-white text-mir-black">
              {itemCount} items
            </Badge>
            <span>₹{totalAmount.toFixed(2)}</span>
            <ChevronRight className="ml-2 h-5 w-5" />
          </div>
        </Button>
      </div>
    </Layout>
  );
};

export default POSPage;
