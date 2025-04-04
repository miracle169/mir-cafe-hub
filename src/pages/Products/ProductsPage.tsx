
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useMenu } from '@/contexts/MenuContext';
import { useInventory } from '@/contexts/InventoryContext';
import { Search, Plus, Edit, Trash, Save } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

const ProductsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('products');
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [isEditItemDialogOpen, setIsEditItemDialogOpen] = useState(false);
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false);
  const [isEditCategoryDialogOpen, setIsEditCategoryDialogOpen] = useState(false);
  const [isDeleteItemDialogOpen, setIsDeleteItemDialogOpen] = useState(false);
  const [isDeleteCategoryDialogOpen, setIsDeleteCategoryDialogOpen] = useState(false);
  
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('');
  const [newItemDescription, setNewItemDescription] = useState('');
  
  const [editItemName, setEditItemName] = useState('');
  const [editItemPrice, setEditItemPrice] = useState('');
  const [editItemCategory, setEditItemCategory] = useState('');
  const [editItemDescription, setEditItemDescription] = useState('');
  
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editCategoryName, setEditCategoryName] = useState('');
  const [selectedCategoryForEdit, setSelectedCategoryForEdit] = useState<string | null>(null);
  
  const [selectedRecipeIngredients, setSelectedRecipeIngredients] = useState<Array<{
    ingredientId: string;
    ingredientName: string;
    quantity: number;
    unit: string;
  }>>([]);
  const [newIngredientId, setNewIngredientId] = useState('');
  const [newIngredientQuantity, setNewIngredientQuantity] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { 
    items, 
    categories, 
    addItem, 
    updateItem, 
    deleteItem, 
    addCategory, 
    updateCategory,
    deleteCategory, 
    getItemById 
  } = useMenu();
  const { items: inventoryItems } = useInventory();
  const { toast } = useToast();

  useEffect(() => {
    let filtered = items;
    
    if (selectedCategoryId && selectedCategoryId !== 'all') {
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
        duration: 1000,
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
        recipe: selectedRecipeIngredients.length > 0 ? selectedRecipeIngredients : undefined,
      });
      
      toast({
        title: "Product Added",
        description: `${newItemName} has been added successfully`,
        duration: 1000,
      });
      
      setIsAddItemDialogOpen(false);
      setNewItemName('');
      setNewItemPrice('');
      setNewItemCategory('');
      setNewItemDescription('');
      setSelectedRecipeIngredients([]);
    } catch (error) {
      console.error('Error adding item:', error);
      toast({
        title: "Error",
        description: "Failed to add product",
        variant: "destructive",
        duration: 1000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditItem = async () => {
    if (!selectedProductId || !editItemName || !editItemPrice || !editItemCategory) {
      toast({
        title: "Error",
        description: "All required fields must be filled",
        variant: "destructive",
        duration: 1000,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const price = parseFloat(editItemPrice);
      if (isNaN(price)) {
        throw new Error("Invalid price");
      }
      
      await updateItem({
        id: selectedProductId,
        name: editItemName,
        price,
        category: editItemCategory,
        description: editItemDescription || undefined,
        recipe: selectedRecipeIngredients.length > 0 ? selectedRecipeIngredients : undefined,
      });
      
      toast({
        title: "Product Updated",
        description: `${editItemName} has been updated successfully`,
        duration: 1000,
      });
      
      setIsEditItemDialogOpen(false);
    } catch (error) {
      console.error('Error updating item:', error);
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
        duration: 1000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!selectedProductId) return;

    setIsSubmitting(true);
    try {
      await deleteItem(selectedProductId);
      
      toast({
        title: "Product Deleted",
        description: "Product has been deleted successfully",
        duration: 1000,
      });
      
      setIsDeleteItemDialogOpen(false);
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
        duration: 1000,
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
        duration: 1000,
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
        duration: 1000,
      });
      
      setIsAddCategoryDialogOpen(false);
      setNewCategoryName('');
    } catch (error) {
      console.error('Error adding category:', error);
      toast({
        title: "Error",
        description: "Failed to add category",
        variant: "destructive",
        duration: 1000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCategory = async () => {
    if (!selectedCategoryForEdit || !editCategoryName) {
      toast({
        title: "Error",
        description: "Category name is required",
        variant: "destructive",
        duration: 1000,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await updateCategory({
        id: selectedCategoryForEdit,
        name: editCategoryName,
      });
      
      toast({
        title: "Category Updated",
        description: `Category has been updated successfully`,
        duration: 1000,
      });
      
      setIsEditCategoryDialogOpen(false);
    } catch (error) {
      console.error('Error updating category:', error);
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive",
        duration: 1000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!selectedCategoryForEdit) return;

    setIsSubmitting(true);
    try {
      await deleteCategory(selectedCategoryForEdit);
      
      toast({
        title: "Category Deleted",
        description: "Category has been deleted successfully",
        duration: 1000,
      });
      
      setIsDeleteCategoryDialogOpen(false);
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
        duration: 1000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditItemDialog = (itemId: string) => {
    const item = getItemById(itemId);
    if (!item) return;
    
    setSelectedProductId(itemId);
    setEditItemName(item.name);
    setEditItemPrice(item.price.toString());
    setEditItemCategory(item.category);
    setEditItemDescription(item.description || '');
    setSelectedRecipeIngredients(item.recipe || []);
    setIsEditItemDialogOpen(true);
  };

  const openDeleteItemDialog = (itemId: string) => {
    setSelectedProductId(itemId);
    setIsDeleteItemDialogOpen(true);
  };

  const openEditCategoryDialog = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;
    
    setSelectedCategoryForEdit(categoryId);
    setEditCategoryName(category.name);
    setIsEditCategoryDialogOpen(true);
  };

  const openDeleteCategoryDialog = (categoryId: string) => {
    setSelectedCategoryForEdit(categoryId);
    setIsDeleteCategoryDialogOpen(true);
  };

  const handleAddIngredient = () => {
    if (!newIngredientId || !newIngredientQuantity) {
      toast({
        title: "Error",
        description: "Ingredient and quantity are required",
        variant: "destructive",
        duration: 1000,
      });
      return;
    }

    const quantity = parseFloat(newIngredientQuantity);
    if (isNaN(quantity) || quantity <= 0) {
      toast({
        title: "Error",
        description: "Quantity must be a positive number",
        variant: "destructive",
        duration: 1000,
      });
      return;
    }

    const ingredient = inventoryItems.find(i => i.id === newIngredientId);
    if (!ingredient) return;

    const newIngredient = {
      ingredientId: ingredient.id,
      ingredientName: ingredient.name,
      quantity,
      unit: ingredient.unit,
    };

    setSelectedRecipeIngredients(prev => [...prev, newIngredient]);
    setNewIngredientId('');
    setNewIngredientQuantity('');
  };

  const handleRemoveIngredient = (ingredientId: string) => {
    setSelectedRecipeIngredients(prev => 
      prev.filter(item => item.ingredientId !== ingredientId)
    );
  };

  const handleProductClick = (itemId: string) => {
    if (activeTab === 'recipes') {
      setSelectedProductId(itemId);
      const item = getItemById(itemId);
      if (item) {
        setSelectedRecipeIngredients(item.recipe || []);
      }
    }
  };

  return (
    <Layout title="Products Management" showBackButton>
      <div className="mir-container pb-16">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full mb-4">
            <TabsTrigger value="products" className="flex-1">Products</TabsTrigger>
            <TabsTrigger value="categories" className="flex-1">Categories</TabsTrigger>
            <TabsTrigger value="recipes" className="flex-1">Recipes</TabsTrigger>
          </TabsList>
          
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
                  <SelectItem value="all">All Categories</SelectItem>
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
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="mr-1"
                                onClick={() => openEditItemDialog(item.id)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-red-500"
                                onClick={() => openDeleteItemDialog(item.id)}
                              >
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
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="mr-1"
                            onClick={() => openEditCategoryDialog(category.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-red-500"
                            onClick={() => openDeleteCategoryDialog(category.id)}
                          >
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
          
          <TabsContent value="recipes">
            <div className="mb-4">
              <Label htmlFor="recipeProduct">Select Product</Label>
              <Select value={selectedProductId || ''} onValueChange={setSelectedProductId}>
                <SelectTrigger id="recipeProduct">
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {items.map(item => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedProductId ? (
              <div className="space-y-4">
                <div className="flex flex-col space-y-2">
                  <h3 className="font-medium">Recipe Ingredients</h3>
                  
                  {selectedRecipeIngredients.length > 0 ? (
                    <div className="space-y-2">
                      {selectedRecipeIngredients.map((ing) => (
                        <div key={ing.ingredientId} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <div>
                            <p className="font-medium">{ing.ingredientName}</p>
                            <p className="text-sm text-gray-600">{ing.quantity} {ing.unit}</p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-500"
                            onClick={() => handleRemoveIngredient(ing.ingredientId)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No ingredients added to this recipe</p>
                  )}
                  
                  <div className="pt-4 space-y-2">
                    <h4 className="text-sm font-medium">Add Ingredient</h4>
                    <div className="grid grid-cols-12 gap-2">
                      <div className="col-span-6">
                        <Select value={newIngredientId} onValueChange={setNewIngredientId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select ingredient" />
                          </SelectTrigger>
                          <SelectContent>
                            {inventoryItems.map(ingredient => (
                              <SelectItem key={ingredient.id} value={ingredient.id}>
                                {ingredient.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-3">
                        <Input
                          type="number"
                          placeholder="Quantity"
                          value={newIngredientQuantity}
                          onChange={(e) => setNewIngredientQuantity(e.target.value)}
                        />
                      </div>
                      <div className="col-span-3">
                        <Button 
                          className="w-full"
                          onClick={handleAddIngredient}
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Button 
                  className="w-full mt-4" 
                  onClick={handleEditItem}
                  disabled={isSubmitting}
                >
                  <Save className="h-4 w-4 mr-1" />
                  Save Recipe
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Select a product to manage its recipe</p>
              </div>
            )}
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
              <Textarea 
                id="item-description" 
                value={newItemDescription}
                onChange={(e) => setNewItemDescription(e.target.value)}
                placeholder="Enter description"
                rows={3}
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

      {/* Edit Product Dialog */}
      <Dialog open={isEditItemDialogOpen} onOpenChange={setIsEditItemDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-item-name">Name</Label>
              <Input 
                id="edit-item-name" 
                value={editItemName}
                onChange={(e) => setEditItemName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-item-price">Price (₹)</Label>
              <Input 
                id="edit-item-price" 
                type="number"
                value={editItemPrice}
                onChange={(e) => setEditItemPrice(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-item-category">Category</Label>
              <Select value={editItemCategory} onValueChange={setEditItemCategory}>
                <SelectTrigger id="edit-item-category">
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
              <Label htmlFor="edit-item-description">Description (Optional)</Label>
              <Textarea 
                id="edit-item-description" 
                value={editItemDescription}
                onChange={(e) => setEditItemDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditItemDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleEditItem}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Product Confirmation Dialog */}
      <Dialog open={isDeleteItemDialogOpen} onOpenChange={setIsDeleteItemDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this product? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteItemDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteItem}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Deleting...' : 'Delete Product'}
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

      {/* Edit Category Dialog */}
      <Dialog open={isEditCategoryDialogOpen} onOpenChange={setIsEditCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-category-name">Name</Label>
              <Input 
                id="edit-category-name" 
                value={editCategoryName}
                onChange={(e) => setEditCategoryName(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditCategoryDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleEditCategory}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Category Confirmation Dialog */}
      <Dialog open={isDeleteCategoryDialogOpen} onOpenChange={setIsDeleteCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this category? Products in this category will not be deleted but will no longer be associated with a category.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteCategoryDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteCategory}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Deleting...' : 'Delete Category'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default ProductsPage;
