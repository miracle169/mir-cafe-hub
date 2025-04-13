
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { useMenu } from '@/contexts/MenuContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  PlusCircle, Edit, Trash, TrashIcon, 
  Search, RefreshCw, CheckSquare, Filter,
  MoreHorizontal, ChevronDown, Save
} from 'lucide-react';
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, 
  AlertDialogContent, AlertDialogDescription, 
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AddMenuItem from '@/components/Menu/AddMenuItem';

const ProductsPage = () => {
  const { categories, menuItems, addCategory, updateCategory, removeCategory, addMenuItem, updateMenuItem, removeMenuItem, bulkDeleteItems } = useMenu();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('categories');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [isAddMenuItemOpen, setIsAddMenuItemOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [itemToEdit, setItemToEdit] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'

  // Filter menu items based on search and category
  const filteredMenuItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

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
      updateCategory({ id: editCategoryId, name: newCategoryName.trim() });
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

  // Handle checkbox selection for individual items
  const handleItemSelection = (itemId) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  // Handle select all checkbox
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredMenuItems.map(item => item.id));
    }
    setSelectAll(!selectAll);
  };

  // Reset selection when filter changes
  useEffect(() => {
    setSelectedItems([]);
    setSelectAll(false);
  }, [searchQuery, categoryFilter]);

  // Handle bulk delete
  const handleBulkDelete = () => {
    if (selectedItems.length > 0) {
      bulkDeleteItems(selectedItems);
      toast({
        title: 'Items Deleted',
        description: `${selectedItems.length} items have been removed`,
        duration: 1000,
      });
      setSelectedItems([]);
      setSelectAll(false);
      setIsBulkDeleteDialogOpen(false);
    }
  };

  // Get category name by id
  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Uncategorized';
  };

  return (
    <Layout title="Products Management" showBackButton>
      <div className="mir-container pb-20">
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
            {/* Search and Actions */}
            <div className="flex flex-col md:flex-row gap-3 justify-between mb-4">
              <div className="flex-1 flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search menu items..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-1">
                      <Filter className="h-4 w-4" />
                      <span className="hidden sm:inline">Filter</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setCategoryFilter('all')}>
                      All Categories
                    </DropdownMenuItem>
                    {categories.map((category) => (
                      <DropdownMenuItem 
                        key={category.id} 
                        onClick={() => setCategoryFilter(category.id)}
                      >
                        {category.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-1">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="hidden sm:inline">View</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setViewMode('grid')}>
                      Grid View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setViewMode('table')}>
                      Table View
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div className="flex gap-2">
                {selectedItems.length > 0 && (
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => setIsBulkDeleteDialogOpen(true)}
                    className="whitespace-nowrap"
                  >
                    <TrashIcon className="h-4 w-4 mr-1" />
                    Delete Selected ({selectedItems.length})
                  </Button>
                )}
                
                <Button 
                  onClick={handleAddMenuItem} 
                  className="bg-mir-red text-white hover:bg-mir-red/90 whitespace-nowrap"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Menu Item
                </Button>
              </div>
            </div>

            {/* Current Filter Info */}
            <div className="text-sm text-gray-500 flex justify-between items-center mb-2">
              <span>
                {filteredMenuItems.length} items {categoryFilter !== 'all' ? `in ${getCategoryName(categoryFilter)}` : ''}
                {searchQuery ? ` matching "${searchQuery}"` : ''}
              </span>
              
              {filteredMenuItems.length > 0 && (
                <div className="flex items-center space-x-1">
                  <Checkbox 
                    id="select-all" 
                    checked={selectAll}
                    onCheckedChange={handleSelectAll}
                  />
                  <label htmlFor="select-all" className="text-sm ml-1 cursor-pointer">
                    Select All
                  </label>
                </div>
              )}
            </div>

            {/* Menu Items List - Table View */}
            {viewMode === 'table' && filteredMenuItems.length > 0 && (
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">
                        <Checkbox 
                          checked={selectAll}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMenuItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Checkbox 
                            checked={selectedItems.includes(item.id)}
                            onCheckedChange={() => handleItemSelection(item.id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{getCategoryName(item.category)}</TableCell>
                        <TableCell>₹{item.price.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
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
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Menu Items List - Grid View */}
            {viewMode === 'grid' && (
              <div className="space-y-6">
                {categories.map((category) => {
                  const categoryItems = filteredMenuItems.filter(
                    (item) => item.category === category.id
                  );

                  if (categoryFilter !== 'all' && categoryFilter !== category.id) return null;
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
                              <div className="flex items-center gap-3">
                                <Checkbox 
                                  checked={selectedItems.includes(item.id)}
                                  onCheckedChange={() => handleItemSelection(item.id)}
                                />
                                <div>
                                  <div className="font-medium">{item.name}</div>
                                  <div className="text-sm text-gray-500">₹{item.price.toFixed(2)}</div>
                                </div>
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
                
                {/* Handle items with no category */}
                {filteredMenuItems.filter(item => !item.category || !categories.find(c => c.id === item.category)).length > 0 && (
                  <Card className="shadow-sm">
                    <CardHeader className="py-3">
                      <CardTitle className="text-lg">Uncategorized</CardTitle>
                    </CardHeader>
                    <CardContent className="py-0">
                      <div className="divide-y">
                        {filteredMenuItems
                          .filter(item => !item.category || !categories.find(c => c.id === item.category))
                          .map((item) => (
                            <div key={item.id} className="py-2 flex justify-between items-center">
                              <div className="flex items-center gap-3">
                                <Checkbox 
                                  checked={selectedItems.includes(item.id)}
                                  onCheckedChange={() => handleItemSelection(item.id)}
                                />
                                <div>
                                  <div className="font-medium">{item.name}</div>
                                  <div className="text-sm text-gray-500">₹{item.price.toFixed(2)}</div>
                                </div>
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
                          ))
                        }
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Empty State */}
            {filteredMenuItems.length === 0 && (
              <div className="text-center py-8 border border-dashed rounded-md">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No menu items found</h3>
                <p className="text-gray-500 mb-4">
                  {searchQuery || categoryFilter !== 'all' 
                    ? 'Try changing your search or filter criteria'
                    : 'Get started by adding your first menu item'}
                </p>
                {!searchQuery && categoryFilter === 'all' && (
                  <Button 
                    onClick={handleAddMenuItem} 
                    className="bg-mir-red text-white hover:bg-mir-red/90"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Menu Item
                  </Button>
                )}
              </div>
            )}
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

        {/* Bulk Delete Confirmation Dialog */}
        <AlertDialog open={isBulkDeleteDialogOpen} onOpenChange={setIsBulkDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete multiple items?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete {selectedItems.length} selected menu items.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleBulkDelete} className="bg-red-500 hover:bg-red-600">
                Delete {selectedItems.length} items
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Add/Edit Menu Item Dialog */}
        {isAddMenuItemOpen && (
          <AddMenuItem 
            isOpen={true}
            onClose={closeMenuItemDialog}
            initialValues={itemToEdit}
            key={itemToEdit ? `edit-${itemToEdit.id}` : 'add-new'}
          />
        )}
      </div>
    </Layout>
  );
};

export default ProductsPage;
