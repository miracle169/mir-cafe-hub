
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useInventory } from '@/contexts/InventoryContext';
import { useAuth } from '@/contexts/AuthContext';
import { Search, Plus, AlertTriangle, Trash2, CheckSquare } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, 
  AlertDialogContent, AlertDialogDescription, 
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle 
} from '@/components/ui/alert-dialog';

const InventoryPage = () => {
  const navigate = useNavigate();
  const { items, getLowStockItems, bulkDeleteItems } = useInventory();
  const { isOwner } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectMode, setSelectMode] = useState(false);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  
  // Extract unique categories from items
  const categories = ['all', ...Array.from(new Set(items.map(item => item.category)))];
  
  // Filter items by search and category
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'all' || item.category === category;
    return matchesSearch && matchesCategory;
  });

  // Get low stock items
  const lowStockItems = getLowStockItems();

  // Toggle select mode
  const toggleSelectMode = () => {
    setSelectMode(!selectMode);
    setSelectedItems([]);
  };

  // Toggle select all items
  const toggleSelectAll = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map(item => item.id));
    }
  };

  // Toggle item selection
  const toggleSelectItem = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  // Handle bulk delete confirmation
  const handleBulkDelete = () => {
    if (selectedItems.length > 0) {
      bulkDeleteItems(selectedItems);
      toast({
        title: 'Items Deleted',
        description: `${selectedItems.length} inventory items have been removed`,
        duration: 2000,
      });
      setSelectedItems([]);
      setSelectMode(false);
      setIsBulkDeleteDialogOpen(false);
    }
  };

  // Handle item click - either select or navigate
  const handleItemClick = (itemId: string) => {
    if (selectMode) {
      toggleSelectItem(itemId);
    } else {
      navigate(`/inventory/${itemId}`);
    }
  };

  return (
    <Layout title="Inventory" showBackButton>
      <div className="mir-container pb-20">
        <div className="mb-4 space-y-3">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold">Inventory Items</h1>
            <div className="flex space-x-2">
              <Button
                variant={selectMode ? "default" : "outline"}
                size="sm"
                onClick={toggleSelectMode}
              >
                <CheckSquare className="h-4 w-4 mr-1" />
                {selectMode ? "Cancel" : "Select"}
              </Button>
              
              {selectMode && selectedItems.length > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setIsBulkDeleteDialogOpen(true)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete ({selectedItems.length})
                </Button>
              )}
            </div>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search inventory..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {selectMode && (
            <div className="flex justify-between items-center text-sm">
              <span>{selectedItems.length} of {filteredItems.length} selected</span>
              <Button variant="ghost" size="sm" onClick={toggleSelectAll}>
                {selectedItems.length === filteredItems.length ? "Deselect All" : "Select All"}
              </Button>
            </div>
          )}
        </div>
        
        {/* Low Stock Alert */}
        {lowStockItems.length > 0 && (
          <div className="mb-4 bg-amber-50 border border-amber-200 rounded-md p-3">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-amber-800">Low Stock Alert</h3>
                <p className="text-sm text-amber-700 mb-2">
                  {lowStockItems.length} {lowStockItems.length === 1 ? 'item is' : 'items are'} running low
                </p>
                <div className="flex flex-wrap gap-1">
                  {lowStockItems.slice(0, 3).map((item) => (
                    <Badge key={item.id} variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                      {item.name}: {item.quantity} {item.unit}
                    </Badge>
                  ))}
                  {lowStockItems.length > 3 && (
                    <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                      +{lowStockItems.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {filteredItems.length === 0 ? (
          <div className="text-center py-8">
            <h3 className="text-xl font-bold text-mir-black mb-2">No items found</h3>
            <p className="text-mir-gray-dark mb-4">
              {search ? `No results for "${search}"` : "Your inventory is empty"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item) => (
              <Card 
                key={item.id} 
                className={`bg-white shadow-sm cursor-pointer hover:shadow transition-shadow ${
                  selectedItems.includes(item.id) ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handleItemClick(item.id)}
              >
                <CardContent className="p-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3">
                      {selectMode && (
                        <Checkbox 
                          checked={selectedItems.includes(item.id)}
                          onCheckedChange={() => toggleSelectItem(item.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="mt-1"
                        />
                      )}
                      <div>
                        <h3 className="font-medium text-mir-black">{item.name}</h3>
                        <div className="flex items-center mt-1">
                          <Badge variant="outline" className="mr-2 text-xs">
                            {item.category}
                          </Badge>
                          <p className="text-xs text-mir-gray-dark">
                            Updated: {new Date(item.lastUpdated).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">
                        {item.quantity} <span className="text-sm font-normal">{item.unit}</span>
                      </p>
                      {item.lowStockThreshold && item.quantity <= item.lowStockThreshold && (
                        <Badge variant="destructive" className="mt-1">
                          Low Stock
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Bulk Delete Dialog */}
      <AlertDialog open={isBulkDeleteDialogOpen} onOpenChange={setIsBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Items?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {selectedItems.length} inventory items.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleBulkDelete} 
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete {selectedItems.length} items
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Item Button */}
      <div className="fixed bottom-16 right-4">
        <Button 
          className="rounded-full h-14 w-14 bg-mir-red text-white shadow-lg hover:bg-mir-red/90"
          onClick={() => navigate('/inventory/add')}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </Layout>
  );
};

export default InventoryPage;
