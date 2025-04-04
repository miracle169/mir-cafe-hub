import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { useMenu } from '@/contexts/MenuContext';
import { useCart } from '@/contexts/CartContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ShoppingCart, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const POSPage = () => {
  const { menuItems, categories, isLoading } = useMenu();
  const { cart, updateCart } = useCart();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Handle adding item to cart
  const handleAddItem = (item) => {
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
  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = searchQuery === '' || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === null || 
      item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Calculate total items in cart
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

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
                disabled={cart.length === 0}
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

            <Tabs defaultValue="all" className="w-full">
              <TabsList className="mb-4 w-full overflow-x-auto flex flex-nowrap justify-start">
                <TabsTrigger value="all" onClick={() => setSelectedCategory(null)}>
                  All Items
                </TabsTrigger>
                {categories.map((category) => (
                  <TabsTrigger 
                    key={category.id} 
                    value={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="all" className="mt-0">
                {isLoading ? (
                  <div className="text-center py-8">Loading menu items...</div>
                ) : filteredItems.length > 0 ? (
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
                              {categories.find(c => c.id === item.category)?.name || 'Uncategorized'}
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
              </TabsContent>

              {categories.map((category) => (
                <TabsContent key={category.id} value={category.id} className="mt-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredItems.map((item) => (
                      <Card key={item.id} className="overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-medium">{item.name}</h3>
                              <p className="text-sm text-gray-500">₹{item.price.toFixed(2)}</p>
                            </div>
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
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default POSPage;
