import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { useMenu } from '@/contexts/MenuContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, Edit, Trash, ChevronRight } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import AddMenuItem from '@/components/Menu/AddMenuItem';

const ProductsPage = () => {
  const { categories, menuItems, addCategory, updateCategory, removeCategory, addMenuItem, updateMenuItem, removeMenuItem } = useMenu();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('categories');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [isAddMenuItemOpen, setIsAddMenuItemOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [itemToEdit, setItemToEdit] = useState(null);

  // Handle adding a new category
  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      addCategory({ name: newCategoryName.trim() });
      setNewCategoryName('');
      toast({
        title: 'Category Added',
        description: `${newCategoryName} has been added to categories`,
        duration: 1000,
      });
    }
  };

  // Handle updating a category
  const handleUpdateCategory = () => {
    if (editCategoryId && newCategoryName.trim()) {
      updateCategory(editCategoryId, { name: newCategoryName.trim() });
      setEditCategoryId(null);
      setNewCategoryName('');
      toast({
        title: 'Category Updated',
        description: `Category has been updated to ${newCategoryName}`,
        duration: 1000,
      });
    }
  };

  // Set up for editing a category
  const handleEditCategory = (category) => {
    setEditCategoryId(category.id);
    setNewCategoryName(category.name);
  };

  // Set up for deleting a category or menu item
  const handleDeleteClick = (item, type) => {
    setItemToDelete({ ...item, type });
    setIsDeleteDialogOpen(true);
  };

  // Confirm deletion
  const confirmDelete = () => {
    if (itemToDelete) {
      if (itemToDelete.type === 'category') {
        removeCategory(itemToDelete.id);
        toast({
          title: 'Category Deleted',
          description: `${itemToDelete.name} has been removed from categories`,
          duration: 1000,
        });
      } else {
        removeMenuItem(itemToDelete.id);
        toast({
          title: 'Menu Item Deleted',
          description: `${itemToDelete.name} has been removed from menu`,
          duration: 1000,
        });
      }
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  // Open add/edit menu item dialog
  const handleAddMenuItem = () => {
    setItemToEdit(null);
    setIsAddMenuItemOpen(true);
  };

  // Handle editing a menu item
  const handleEditMenuItem = (item) => {
    setItemToEdit(item);
    setIsAddMenuItemOpen(true);
  };

  // Close menu item dialog
  const closeMenuItemDialog = () => {
    setIsAddMenuItemOpen(false);
    setItemToEdit(null);
  };

  return (
    <Layout title="Products Management" showBackButton>
      <div className="mir-container">
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="menu-items">Menu Items</TabsTrigger>
          </TabsList>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-4">
            {/* Category Input Form */}
            <div className="flex space-x-2">
              <Input
                type="text"
                placeholder="New category name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
              <Button onClick={editCategoryId ? handleUpdateCategory : handleAddCategory}>
                {editCategoryId ? 'Update Category' : 'Add Category'}
              </Button>
            </div>

            {/* Categories List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map((category) => (
                <Card key={category.id} className="shadow-sm">
                  <CardContent className="flex justify-between items-center p-4">
                    <span>{category.name}</span>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEditCategory(category)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDeleteClick(category, 'category')}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Menu Items Tab */}
          <TabsContent value="menu-items" className="space-y-4">
            <Button 
              onClick={handleAddMenuItem} 
              className="bg-mir-red text-white hover:bg-mir-red/90"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Menu Item
            </Button>

            {/* Menu Items List */}
            <div className="space-y-6">
              {categories.map((category) => {
                const categoryItems = menuItems.filter(
                  (item) => item.categoryId === category.id
                );

                if (categoryItems.length === 0) return null;

                return (
                  <Card key={category.id} className="shadow-sm">
                    <CardHeader className="py-3">
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="py-0">
                      <div className="divide-y">
                        {categoryItems.map((item) => (
                          <div key={item.id} className="py-2 flex justify-between items-center">
                            <div>
                              <div className="font-medium">{item.name}</div>
                              <div className="text-sm text-gray-500">₹{item.price.toFixed(2)}</div>
                            </div>
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="icon" onClick={() => handleEditMenuItem(item)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleDeleteClick(item, 'menuItem')}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the {itemToDelete?.type === 'category' ? 'category' : 'menu item'} 
                "{itemToDelete?.name}".
                {itemToDelete?.type === 'category' && ' All menu items in this category will also be removed.'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Add/Edit Menu Item Dialog */}
        {isAddMenuItemOpen && (
          <AddMenuItem 
            onClose={closeMenuItemDialog} 
            isOpen={true}
            key={itemToEdit ? `edit-${itemToEdit.id}` : 'add-new'}
          />
        )}
      </div>
    </Layout>
  );
};

export default ProductsPage;
