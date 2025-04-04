
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { useMenu } from '@/contexts/MenuContext';
import { useInventory } from '@/contexts/InventoryContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, Edit, Trash2, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AddMenuItem from '@/components/Menu/AddMenuItem';
import { useToast } from '@/hooks/use-toast';

const ProductsPage = () => {
  const { items: menuItems = [], categories = [], isLoading, addItem, updateItem, deleteItem, deleteCategory } = useMenu();
  const { items: inventoryItems = [] } = useInventory();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedTab, setSelectedTab] = useState<'products' | 'categories'>('products');
  
  // Filter products based on search query
  const filteredProducts = menuItems ? menuItems.filter(
    (product) => 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  // Filter categories based on search query
  const filteredCategories = categories ? categories.filter(
    (category) => category.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  // Handle product deletion
  const handleDeleteProduct = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteItem(id);
      toast({
        title: 'Product Deleted',
        description: 'The product has been deleted successfully.',
        duration: 1000,
      });
    }
  };

  // Handle category deletion
  const handleDeleteCategory = (id) => {
    if (menuItems && menuItems.some(item => item.category === id)) {
      toast({
        title: 'Cannot Delete Category',
        description: 'This category contains products. Remove or reassign them first.',
        variant: 'destructive',
        duration: 1000,
      });
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this category?')) {
      // Use the context function
      deleteCategory(id);
      toast({
        title: 'Category Deleted',
        description: 'The category has been deleted successfully.',
        duration: 1000,
      });
    }
  };
  
  // Handle edit product click
  const handleEditProduct = (item) => {
    setEditingItem(item);
    setIsAddDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEditingItem(null);
    setIsAddDialogOpen(false);
  };
  
  return (
    <Layout title="Products Management">
      <div className="p-4 max-w-7xl mx-auto">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div className="w-full md:w-auto md:flex-1 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search products or categories..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>{editingItem ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                </DialogHeader>
                <AddMenuItem 
                  isOpen={true} 
                  onClose={handleCloseDialog} 
                  editItem={editingItem} 
                />
              </DialogContent>
            </Dialog>
          </div>

          <Tabs 
            value={selectedTab} 
            onValueChange={(value: any) => setSelectedTab(value)}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
            </TabsList>

            <TabsContent value="products" className="mt-6">
              {isLoading ? (
                <div className="text-center py-8">Loading products...</div>
              ) : filteredProducts && filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProducts.map((product) => (
                    <Card key={product.id} className="overflow-hidden">
                      <CardHeader className="bg-gray-50 p-4">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg font-medium">{product.name}</CardTitle>
                          <Badge variant="outline" className="text-xs">
                            <Tag className="h-3 w-3 mr-1" />
                            {categories && categories.find(c => c.id === product.category)?.name || 'Uncategorized'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4">
                        <p className="font-medium text-md mb-1">₹{product.price.toFixed(2)}</p>
                        {product.description && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                        )}
                        
                        {product.recipe && product.recipe.length > 0 && (
                          <div className="mb-3">
                            <h4 className="text-xs font-semibold uppercase text-gray-500 mb-1">Recipe:</h4>
                            <ul className="text-sm space-y-1">
                              {product.recipe.map((item, index) => (
                                <li key={index} className="flex justify-between">
                                  <span>{item.ingredientName}</span>
                                  <span className="text-gray-500">{item.quantity} {item.unit}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        <div className="flex justify-end gap-2 mt-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleEditProduct(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p>No products found. Add your first product to get started.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="categories" className="mt-6">
              {filteredCategories && filteredCategories.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCategories.map((category) => (
                    <Card key={category.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium">{category.name}</h3>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => {
                                // TODO: Implement edit category
                                toast({
                                  title: "Edit Category",
                                  description: "Category editing will be available soon",
                                  duration: 1000,
                                });
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              onClick={() => handleDeleteCategory(category.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-500 mt-2">
                          {menuItems && menuItems.filter(item => item.category === category.id).length} products
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p>No categories found. Add your first category to get started.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default ProductsPage;
