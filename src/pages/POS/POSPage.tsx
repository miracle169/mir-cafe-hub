
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useMenu } from '@/contexts/MenuContext';
import { useCart } from '@/contexts/CartContext';
import { useCustomer } from '@/contexts/CustomerContext';
import { Search, Plus, ShoppingCart, ChevronRight, Utensils, ChevronLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OrdersList from '@/components/Orders/OrdersList';
import AddMenuItem from '@/components/Menu/AddMenuItem';
import { formatDistanceToNow } from 'date-fns';

const POSPage = () => {
  const navigate = useNavigate();
  const { categories, items, getItemsByCategory } = useMenu();
  const { addItem, itemCount, totalAmount } = useCart();
  const { currentCustomer } = useCustomer();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(categories[0]?.id || null);
  const [activeTab, setActiveTab] = useState<string>('menu');
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  const [showCategoryList, setShowCategoryList] = useState(true);

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

  const handleCategorySelect = (categoryId: string) => {
    setActiveCategory(categoryId);
    setShowCategoryList(false);
  };

  const handleBackToCategories = () => {
    setShowCategoryList(true);
  };

  const filteredItems = search
    ? items.filter((item) => 
        item.name.toLowerCase().includes(search.toLowerCase())
      )
    : activeCategory
      ? getItemsByCategory(activeCategory)
      : [];

  // Get favorite items for current customer
  const getCustomerFavorites = () => {
    if (!currentCustomer || !currentCustomer.favoriteItems) return [];
    return currentCustomer.favoriteItems.map(itemId => {
      const item = items.find(i => i.id === itemId);
      return item ? item.name : '';
    }).filter(Boolean);
  };

  return (
    <Layout title="POS & Billing" showBackButton>
      <div className="mir-container pb-20">
        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="menu">Menu</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>
          
          <TabsContent value="menu">
            {/* Customer Info Banner - if customer is selected */}
            {currentCustomer && (
              <div className="bg-mir-gray-light p-3 rounded-md mb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-mir-black">{currentCustomer.name}</h3>
                    <p className="text-sm text-mir-gray-dark">
                      Points: <span className="font-semibold">{currentCustomer.loyaltyPoints}</span> • 
                      Last visit: {formatDistanceToNow(new Date(currentCustomer.lastVisit), { addSuffix: true })}
                    </p>
                    {getCustomerFavorites().length > 0 && (
                      <p className="text-xs mt-1">
                        <span className="font-medium">Favorites:</span> {getCustomerFavorites().join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
            
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

            {/* Add menu item button */}
            <div className="mb-4">
              <Button 
                className="w-full bg-mir-yellow text-mir-black flex justify-center items-center"
                onClick={() => setShowAddItemDialog(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Menu Item
              </Button>
            </div>

            {/* Back button when viewing items in a category */}
            {!showCategoryList && !search && (
              <Button
                variant="outline"
                className="mb-4 w-full flex items-center justify-center"
                onClick={handleBackToCategories}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Categories
              </Button>
            )}

            {/* Categories as Tiles */}
            {!search && showCategoryList && (
              <div className="mb-4">
                <div className="grid grid-cols-2 gap-2 pb-2">
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      variant="outline"
                      className="h-16 flex flex-col items-center justify-center bg-white hover:bg-mir-red hover:text-white"
                      onClick={() => handleCategorySelect(category.id)}
                    >
                      <Utensils className="h-5 w-5 mb-1" />
                      <span className="text-sm">{category.name}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Menu Items */}
            {(!showCategoryList || search) && (
              <div className="grid grid-cols-1 gap-2 mb-20">
                {filteredItems.map((item) => (
                  <Card key={item.id} className="bg-white shadow-sm">
                    <CardContent className="p-3 flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-mir-black">{item.name}</h3>
                        <p className="text-sm text-mir-gray-dark">₹{item.price.toFixed(2)}</p>
                        {item.description && (
                          <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                        )}
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
                
                {filteredItems.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    {search ? 'No items match your search' : 'No items in this category'}
                  </div>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="orders">
            <OrdersList />
          </TabsContent>
        </Tabs>
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
      
      {/* Add Menu Item Dialog */}
      <AddMenuItem 
        isOpen={showAddItemDialog}
        onClose={() => setShowAddItemDialog(false)}
      />
    </Layout>
  );
};

export default POSPage;
