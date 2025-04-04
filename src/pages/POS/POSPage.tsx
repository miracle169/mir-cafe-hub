
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useMenu } from '@/contexts/MenuContext';
import { useCart } from '@/contexts/CartContext';
import { useCustomer } from '@/contexts/CustomerContext';
import { Search, ShoppingCart, Plus, ChevronLeft, ChevronRight, Calendar, Star } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const POSPage = () => {
  const navigate = useNavigate();
  const { items, categories } = useMenu();
  const { addToCart, items: cartItems, totalAmount } = useCart();
  const { customers, setCurrentCustomer, currentCustomer } = useCustomer();
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [showCustomerInfo, setShowCustomerInfo] = useState(false);
  
  // Get all menu items for the selected category or search query
  const filteredItems = selectedCategory
    ? items.filter(item => 
        item.category === selectedCategory && 
        (searchQuery === '' || item.name.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : items.filter(item => 
        searchQuery === '' || item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
  
  // Get filtered customers based on search
  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
    customer.phone.includes(customerSearchQuery)
  );
  
  // Handle customer selection
  const handleSelectCustomer = (customer) => {
    setCurrentCustomer(customer);
    setIsCustomerDialogOpen(false);
    setShowCustomerInfo(true);
  };
  
  // Get customer favorite items
  const getFavoriteItems = () => {
    if (!currentCustomer) return [];
    
    // This is a placeholder. In a real app, you'd use the customer's favoriteItems
    // to get the actual menu items they favor.
    return items.filter(item => currentCustomer.favoriteItems.includes(item.name)).slice(0, 3);
  };
  
  // Go back to category selection
  const handleBackToCategories = () => {
    setSelectedCategory(null);
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'First visit';
    return format(new Date(dateString), 'dd MMM yyyy');
  };

  return (
    <Layout title="Point of Sale">
      <div className="p-4 md:p-6">
        {/* Customer Selection Bar */}
        <div className="bg-white rounded-lg shadow-sm p-3 mb-4 flex flex-col md:flex-row justify-between items-center gap-2">
          <div className="flex gap-2 items-center w-full md:w-auto">
            <Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  onClick={() => setIsCustomerDialogOpen(true)}
                  className="flex-shrink-0"
                >
                  {currentCustomer ? currentCustomer.name : 'Select Customer'}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Select Customer</DialogTitle>
                </DialogHeader>
                <div className="mt-2 space-y-4">
                  <Input
                    type="search"
                    placeholder="Search by name or phone..."
                    value={customerSearchQuery}
                    onChange={(e) => setCustomerSearchQuery(e.target.value)}
                  />
                  <div className="max-h-[300px] overflow-y-auto space-y-2">
                    {filteredCustomers.map((customer) => (
                      <div
                        key={customer.id}
                        className="p-3 rounded-lg border hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                        onClick={() => handleSelectCustomer(customer)}
                      >
                        <div>
                          <p className="font-medium">{customer.name}</p>
                          <p className="text-sm text-gray-500">{customer.phone}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">{customer.loyaltyPoints} points</Badge>
                        </div>
                      </div>
                    ))}
                    {filteredCustomers.length === 0 && (
                      <div className="text-center py-4 text-gray-500">
                        No customers found
                      </div>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            {currentCustomer && showCustomerInfo && (
              <div className="text-sm flex flex-col md:flex-row md:gap-4">
                <div className="flex items-center text-mir-gray-dark gap-1">
                  <Star className="h-3.5 w-3.5" />
                  <span>{currentCustomer.loyaltyPoints} points</span>
                </div>
                <div className="flex items-center text-mir-gray-dark gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Last visit: {formatDate(currentCustomer.lastVisit)}</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex gap-2 w-full md:w-auto justify-end">
            <Button 
              size="sm" 
              onClick={() => navigate('/pos/cart')}
              className="bg-mir-red hover:bg-mir-red/90"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              <span>Cart ({cartItems.length})</span>
              <span className="ml-2">₹{totalAmount.toFixed(2)}</span>
            </Button>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Categories & Items Panel */}
          <div className="md:col-span-3">
            {/* Search/Category Navigation */}
            <div className="bg-white rounded-lg shadow-sm p-3 mb-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="search"
                    placeholder="Search menu items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                
                {selectedCategory && (
                  <Button 
                    variant="outline" 
                    onClick={handleBackToCategories}
                    className="flex-shrink-0"
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Back to Categories
                  </Button>
                )}
              </div>
            </div>
            
            {/* Categories or Items Grid */}
            <div className="bg-white rounded-lg shadow-sm p-3">
              {selectedCategory === null ? (
                <>
                  <h3 className="text-lg font-semibold mb-3">Categories</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {categories.map((category) => (
                      <div
                        key={category.id}
                        className="aspect-square rounded-lg bg-mir-gray-light hover:bg-mir-gray/20 cursor-pointer flex flex-col items-center justify-center p-4 text-center transition-colors"
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        <h3 className="font-medium">{category.name}</h3>
                        <p className="text-xs text-mir-gray-dark mt-1">
                          {items.filter(item => item.category === category.id).length} items
                        </p>
                      </div>
                    ))}
                  </div>
                  
                  {/* Favorite Items for Current Customer */}
                  {currentCustomer && getFavoriteItems().length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-3">
                        {currentCustomer.name}'s Favorites
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {getFavoriteItems().map((item) => (
                          <Card key={item.id} className="overflow-hidden">
                            <CardContent className="p-3">
                              <div className="flex flex-col justify-between h-full">
                                <div>
                                  <h3 className="font-medium text-sm">{item.name}</h3>
                                  <p className="text-xs text-mir-gray-dark">{item.description}</p>
                                </div>
                                <div className="flex justify-between items-center mt-3">
                                  <p className="font-semibold">₹{item.price.toFixed(2)}</p>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => addToCart(item)}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold mb-3">
                    {categories.find(c => c.id === selectedCategory)?.name || 'Menu Items'}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {filteredItems.length > 0 ? (
                      filteredItems.map((item) => (
                        <Card key={item.id} className="overflow-hidden">
                          <CardContent className="p-3">
                            <div className="flex flex-col justify-between h-full">
                              <div>
                                <h3 className="font-medium text-sm">{item.name}</h3>
                                <p className="text-xs text-mir-gray-dark">{item.description}</p>
                              </div>
                              <div className="flex justify-between items-center mt-3">
                                <p className="font-semibold">₹{item.price.toFixed(2)}</p>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => addToCart(item)}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="col-span-full text-center py-6 text-mir-gray-dark">
                        No items found in this category
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
          
          {/* Cart Quick View */}
          <div className="hidden md:block">
            <div className="bg-white rounded-lg shadow-sm p-3 sticky top-4">
              <h3 className="text-lg font-semibold mb-3">Current Order</h3>
              {cartItems.length > 0 ? (
                <div className="space-y-2">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.quantity}x {item.name}</span>
                      <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 mt-3">
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>₹{totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full mt-3 bg-mir-red hover:bg-mir-red/90"
                    onClick={() => navigate('/pos/cart')}
                  >
                    Checkout
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8 text-mir-gray-dark">
                  <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p>Your cart is empty</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default POSPage;
