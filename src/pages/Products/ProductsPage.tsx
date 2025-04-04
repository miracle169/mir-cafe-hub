
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useMenu } from '@/contexts/MenuContext';
import { useInventory } from '@/contexts/InventoryContext';
import { Search, Plus, Edit, Trash } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const ProductsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('products');
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false);
  
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('');
  const [newItemDescription, setNewItemDescription] = useState('');
  
  const [newCategoryName, setNewCategoryName] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { items, categories, addItem, addCategory } = useMenu();
  const { items: inventoryItems } = useInventory();
  const { toast } = useToast();

  // Filter items based on search and category
  useEffect(() => {
    let filtered = items;
    
    if (selectedCategoryId) {
      filtered = filtered.filter(item => item.category === selectedCategoryId);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(
        item => item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredItems(filtered);
  }, [items, searchQuery, selectedCategoryId]);

  const handleAddItem = async () => {
    if (!newItemName || !newItemPrice || !newItemCategory) {
      toast({
        title: "Error",
        description: "Name, price, and category are required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const price = parseFloat(newItemPrice);
      if (isNaN(price)) {
        throw new Error("Invalid price");
      }
      
      await addItem({
        name: newItemName,
        price,
        category: newItemCategory,
        description: newItemDescription || undefined,
      });
      
      toast({
        title: "Product Added",
        description: `${newItemName} has been added successfully`,
      });
      
      setIsAddItemDialogOpen(false);
      setNewItemName('');
      setNewItemPrice('');
      setNewItemCategory('');
      setNewItemDescription('');
    } catch (error) {
      console.error('Error adding item:', error);
      toast({
        title: "Error",
        description: "Failed to add product",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName) {
      toast({
        title: "Error",
        description: "Category name is required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await addCategory({
        name: newCategoryName,
      });
      
      toast({
        title: "Category Added",
        description: `${newCategoryName} has been added successfully`,
      });
      
      setIsAddCategoryDialogOpen(false);
      setNewCategoryName('');
    } catch (error) {
      console.error('Error adding category:', error);
      toast({
        title: "Error",
        description: "Failed to add category",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout title="Products Management" showBackButton>
      <div className="mir-container">
        <Tabs defaultValue="products" onValueChange={setActiveTab}>
          <TabsList className="w-full mb-4">
            <TabsTrigger value="products" className="flex-1">Products</TabsTrigger>
            <TabsTrigger value="categories" className="flex-1">Categories</TabsTrigger>
            <TabsTrigger value="recipes" className="flex-1">Recipes</TabsTrigger>
          </TabsList>
          
          {/* Products Tab */}
          <TabsContent value="products">
            <div className="flex justify-between items-center mb-4">
              <div className="relative flex-1 mr-2">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search products"
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button 
                className="bg-mir-yellow text-mir-black hover:bg-mir-yellow/90"
                onClick={() => setIsAddItemDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>
            
            <div className="mb-4">
              <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {filteredItems.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No products found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredItems.map((item) => {
                  const category = categories.find(c => c.id === item.category);
                  
                  return (
                    <Card key={item.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-mir-black">{item.name}</h3>
                            {category && (
                              <p className="text-xs text-mir-gray-dark">{category.name}</p>
                            )}
                            {item.description && (
                              <p className="text-sm mt-1">{item.description}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-bold">₹{item.price.toFixed(2)}</p>
                            <div className="flex mt-2">
                              <Button size="sm" variant="outline" className="mr-1">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" className="text-red-500">
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
          
          {/* Categories Tab */}
          <TabsContent value="categories">
            <div className="flex justify-end mb-4">
              <Button 
                className="bg-mir-yellow text-mir-black hover:bg-mir-yellow/90"
                onClick={() => setIsAddCategoryDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-1" /> Add Category
              </Button>
            </div>
            
            {categories.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No categories found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {categories.map((category) => (
                  <Card key={category.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-mir-black">{category.name}</h3>
                        <div className="flex">
                          <Button size="sm" variant="outline" className="mr-1">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-500">
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          {/* Recipes Tab */}
          <TabsContent value="recipes">
            <div className="text-center py-8">
              <p className="text-gray-500">Select a product to manage its recipe</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Product Dialog */}
      <Dialog open={isAddItemDialogOpen} onOpenChange={setIsAddItemDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="item-name">Name</Label>
              <Input 
                id="item-name" 
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="Enter product name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="item-price">Price (₹)</Label>
              <Input 
                id="item-price" 
                type="number"
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(e.target.value)}
                placeholder="Enter price"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="item-category">Category</Label>
              <Select value={newItemCategory} onValueChange={setNewItemCategory}>
                <SelectTrigger id="item-category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="item-description">Description (Optional)</Label>
              <Input 
                id="item-description" 
                value={newItemDescription}
                onChange={(e) => setNewItemDescription(e.target.value)}
                placeholder="Enter description"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsAddItemDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddItem}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Product'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Category Dialog */}
      <Dialog open={isAddCategoryDialogOpen} onOpenChange={setIsAddCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">Name</Label>
              <Input 
                id="category-name" 
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Enter category name"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsAddCategoryDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddCategory}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Category'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default ProductsPage;
