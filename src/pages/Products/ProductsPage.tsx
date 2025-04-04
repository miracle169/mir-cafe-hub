import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { useMenu } from '@/contexts/MenuContext';
import { useInventory } from '@/contexts/InventoryContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Plus, Pencil, Trash2, Tag, UtensilsCrossed } from 'lucide-react';
import AddMenuItem from '@/components/Menu/AddMenuItem';

const ProductsPage = () => {
  const { menuItems, categories, isLoading, addMenuItem, updateMenuItem, deleteMenuItem } = useMenu();
  const { inventoryItems } = useInventory();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    // You can perform any necessary actions here when the component mounts
  }, []);

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = searchQuery === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === null ||
      item.category_id === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleEdit = (item) => {
    setSelectedItem(item);
    setOpen(true);
  };

  const handleDelete = async (item) => {
    if (confirm(`Are you sure you want to delete ${item.name}?`)) {
      try {
        await deleteMenuItem(item.id);
        // Optionally, update the local state or re-fetch the menu items
      } catch (error) {
        console.error("Error deleting menu item:", error);
      }
    }
  };

  return (
    <Layout title="Products">
      <div className="p-4 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex-1 w-full">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setSelectedItem(null)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{selectedItem ? 'Edit Product' : 'Add Product'}</DialogTitle>
                <DialogDescription>
                  {selectedItem ? 'Update the product details here.' : 'Create a new product by entering the details below.'}
                </DialogDescription>
              </DialogHeader>
              <AddMenuItem item={selectedItem} setOpen={setOpen} />
              <DialogFooter>
                <Button type="submit" form="menu-item-form" disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save changes'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            {categories.map((category) => (
              <TabsTrigger value={category.id} key={category.id}>
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
          <Separator />
          <ScrollArea className="h-[70vh] w-full rounded-md border">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
              {filteredItems.map((item) => (
                <Card key={item.id} className="bg-white shadow-md overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{item.name}</CardTitle>
                    <Badge variant="secondary">
                      ₹{item.price.toFixed(2)}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      Category: {categories.find(cat => cat.id === item.category_id)?.name || 'N/A'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {inventoryItems.find(inv => inv.menu_item_id === item.id) ? 'In Stock' : 'Out of Stock'}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(item)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ProductsPage;
