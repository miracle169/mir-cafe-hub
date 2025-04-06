
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { useMenu } from '@/contexts/MenuContext';
import { useCart } from '@/contexts/CartContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ShoppingCart, Tag, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCustomer } from '@/contexts/CustomerContext';

const POSPage = () => {
  const { items: menuItems = [], categories = [], isLoading = false } = useMenu();
  const { cart = [], updateCart } = useCart();
  const { currentCustomer } = useCustomer();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCategoryItems, setShowCategoryItems] = useState(false);

  // Ensure proper menu items format for debugging
  useEffect(() => {
    console.log("Menu items loaded:", menuItems);
    console.log("Categories loaded:", categories);
  }, [menuItems, categories]);

  // Handle adding item to cart
  const handleAddItem = (item) => {
    if (!cart) {
      updateCart([{ ...item, quantity: 1 }]);
      return;
    }
    
    const existingItem = cart.find((cartItem) => cartItem.id === item.id);
    
    if (existingItem) {
      // If item exists in cart, increase quantity
      const updatedCart = cart.map((cartItem) => 
        cartItem.id === item.id 
          ? { ...cartItem, quantity: cartItem.quantity + 1 } 
          : cartItem
      );
      updateCart(updatedCart);
    } else {
      // Add new item to cart
      updateCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  // Filter items based on search and category
  const filteredItems = menuItems ? menuItems.filter((item) => {
    const matchesSearch = searchQuery === '' || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === null || 
      item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  }) : [];

  // Calculate total items in cart
  const totalItems = cart ? cart.reduce((sum, item) => sum + item.quantity, 0) : 0;

  // Handle category selection
  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setShowCategoryItems(true);
  };

  // Handle back button click
  const handleBackToCategories = () => {
    setShowCategoryItems(false);
    setSelectedCategory(null);
  };

  // Get category name
  const getCategoryName = (categoryId) => {
    const category = categories?.find(c => c.id === categoryId);
    return category ? category.name : 'All Items';
  };

  return (
    <Layout title="Point of Sale">
      <div className="p-4 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Menu Items Section */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-2">
              <div className="relative w-full md:w-auto md:flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search menu items..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Button
                onClick={() => navigate('/pos/cart')}
                className="w-full md:w-auto"
                disabled={!cart || cart.length === 0}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                View Cart
                {totalItems > 0 && (
                  <Badge variant="outline" className="ml-2 bg-primary text-primary-foreground">
                    {totalItems}
                  </Badge>
                )}
              </Button>
            </div>

            {/* Customer Info - if available */}
            {currentCustomer && (
              <Card className="mb-4">
                <CardContent className="p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{currentCustomer.name}</h3>
                      <p className="text-sm text-gray-500">{currentCustomer.phone}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{currentCustomer.loyaltyPoints} points</p>
                      <p className="text-xs text-gray-500">
                        Last visit: {new Date(currentCustomer.lastVisit).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {currentCustomer.favoriteItems && currentCustomer.favoriteItems.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-500">Favorite items: {currentCustomer.favoriteItems.join(', ')}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {!showCategoryItems ? (
              // Categories View
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                <Card 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleCategorySelect(null)}
                >
                  <CardContent className="p-4 text-center">
                    <h3 className="font-medium">All Items</h3>
                    <p className="text-sm text-gray-500">
                      {menuItems ? menuItems.length : 0} items
                    </p>
                  </CardContent>
                </Card>
                
                {categories && categories.map((category) => (
                  <Card 
                    key={category.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleCategorySelect(category.id)}
                  >
                    <CardContent className="p-4 text-center">
                      <h3 className="font-medium">{category.name}</h3>
                      <p className="text-sm text-gray-500">
                        {menuItems ? menuItems.filter(item => item.category === category.id).length : 0} items
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              // Category Items View
              <div>
                <div className="flex items-center mb-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleBackToCategories}
                    className="mr-2"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back
                  </Button>
                  <h2 className="text-lg font-medium">
                    {selectedCategory === null ? 'All Items' : getCategoryName(selectedCategory)}
                  </h2>
                </div>
                
                {isLoading ? (
                  <div className="text-center py-8">Loading menu items...</div>
                ) : filteredItems && filteredItems.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredItems.map((item) => (
                      <Card key={item.id} className="overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-medium">{item.name}</h3>
                              <p className="text-sm text-gray-500">₹{item.price.toFixed(2)}</p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              <Tag className="h-3 w-3 mr-1" />
                              {getCategoryName(item.category) || 'Uncategorized'}
                            </Badge>
                          </div>
                          <Button 
                            onClick={() => handleAddItem(item)} 
                            className="w-full mt-2"
                            size="sm"
                          >
                            Add to Cart
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p>No menu items found.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default POSPage;
