
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useInventory } from '@/contexts/InventoryContext';
import { Edit, Trash, Save, Plus, Minus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const InventoryDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { items, getItemById, updateItem, deleteItem, increaseInventory, decreaseInventory } = useInventory();
  
  const [item, setItem] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [category, setCategory] = useState('');
  const [lowStockThreshold, setLowStockThreshold] = useState('');
  const [adjustQuantity, setAdjustQuantity] = useState('');

  // Extract unique categories from items
  const categories = Array.from(new Set(items.map(item => item.category)));

  // Load item data
  useEffect(() => {
    if (!id) return;
    
    const foundItem = getItemById(id);
    if (foundItem) {
      setItem(foundItem);
      setName(foundItem.name);
      setQuantity(foundItem.quantity.toString());
      setUnit(foundItem.unit);
      setCategory(foundItem.category);
      setLowStockThreshold(foundItem.lowStockThreshold?.toString() || '');
    } else {
      toast({
        title: "Error",
        description: "Item not found",
        variant: "destructive",
      });
      navigate('/inventory');
    }
  }, [id, getItemById, navigate, toast]);

  // Toggle edit mode
  const toggleEditMode = () => {
    if (editMode) {
      // Cancel edit - reset form
      setName(item.name);
      setQuantity(item.quantity.toString());
      setUnit(item.unit);
      setCategory(item.category);
      setLowStockThreshold(item.lowStockThreshold?.toString() || '');
    }
    setEditMode(!editMode);
  };

  // Handle save
  const handleSave = () => {
    if (!name || !quantity || !unit || !category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const updatedItem = {
        ...item,
        name,
        quantity: parseFloat(quantity),
        unit,
        category,
        lowStockThreshold: lowStockThreshold ? parseFloat(lowStockThreshold) : undefined,
      };

      updateItem(updatedItem);
      setItem(updatedItem);
      setEditMode(false);
      
      toast({
        title: "Success",
        description: "Item updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update item",
        variant: "destructive",
      });
    }
  };

  // Handle delete
  const handleDelete = () => {
    try {
      deleteItem(id!);
      toast({
        title: "Success",
        description: "Item deleted successfully",
      });
      navigate('/inventory');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive",
      });
    }
  };

  // Handle quantity adjustment
  const handleAdjustQuantity = (increase: boolean) => {
    if (!adjustQuantity || parseFloat(adjustQuantity) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid quantity",
        variant: "destructive",
      });
      return;
    }

    try {
      const amount = parseFloat(adjustQuantity);
      
      if (increase) {
        increaseInventory(id!, amount);
      } else {
        const success = decreaseInventory(id!, amount);
        if (!success) {
          toast({
            title: "Error",
            description: "Not enough stock available",
            variant: "destructive",
          });
          return;
        }
      }
      
      // Refresh item data
      const updatedItem = getItemById(id!);
      if (updatedItem) {
        setItem(updatedItem);
        setQuantity(updatedItem.quantity.toString());
      }
      
      setAdjustQuantity('');
      
      toast({
        title: "Success",
        description: `Quantity ${increase ? 'increased' : 'decreased'} successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to adjust quantity",
        variant: "destructive",
      });
    }
  };

  if (!item) {
    return (
      <Layout title="Item Details" showBackButton>
        <div className="mir-container">
          <p className="text-center py-8">Loading...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Item Details" showBackButton>
      <div className="mir-container">
        {editMode ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Item Name</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter item name"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input 
                  id="quantity" 
                  type="number" 
                  value={quantity} 
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="Enter quantity"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Input 
                  id="unit" 
                  value={unit} 
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="e.g., kg, liter, piece"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <div className="flex space-x-2">
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                    <SelectItem value="new">+ Add New Category</SelectItem>
                  </SelectContent>
                </Select>
                
                {category === 'new' && (
                  <Input 
                    placeholder="New category name"
                    value="" 
                    onChange={(e) => setCategory(e.target.value)}
                    className="flex-1"
                  />
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="threshold">Low Stock Threshold (Optional)</Label>
              <Input 
                id="threshold" 
                type="number" 
                value={lowStockThreshold} 
                onChange={(e) => setLowStockThreshold(e.target.value)}
                placeholder="Set threshold for low stock alert"
              />
            </div>
            
            <div className="flex space-x-3 pt-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={toggleEditMode}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1 bg-mir-red text-white"
                onClick={handleSave}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-mir-black">{item.name}</h2>
                <Badge className="mt-1">
                  {item.category}
                </Badge>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={toggleEditMode}
                >
                  <Edit className="h-5 w-5" />
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-red-500">
                      <Trash className="h-5 w-5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Item</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete {item.name}? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} className="bg-red-500 text-white hover:bg-red-600">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-mir-black">Current Stock</h3>
                <div className="text-right">
                  <p className="text-3xl font-bold text-mir-black">
                    {item.quantity} <span className="text-lg font-normal">{item.unit}</span>
                  </p>
                  {item.lowStockThreshold && item.quantity <= item.lowStockThreshold && (
                    <Badge variant="destructive" className="mt-1">
                      Low Stock
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="adjust-quantity">Adjust Quantity</Label>
                  <Input 
                    id="adjust-quantity" 
                    type="number" 
                    value={adjustQuantity} 
                    onChange={(e) => setAdjustQuantity(e.target.value)}
                    placeholder={`Amount in ${item.unit}`}
                  />
                </div>
                <div className="flex space-x-2 items-end">
                  <Button 
                    className="flex-1 bg-red-100 text-red-700 hover:bg-red-200"
                    onClick={() => handleAdjustQuantity(false)}
                  >
                    <Minus className="h-4 w-4 mr-1" /> Remove
                  </Button>
                  <Button 
                    className="flex-1 bg-green-100 text-green-700 hover:bg-green-200"
                    onClick={() => handleAdjustQuantity(true)}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-bold text-mir-black mb-3">Item Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-mir-gray-dark">Category</span>
                  <span>{item.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-mir-gray-dark">Unit</span>
                  <span>{item.unit}</span>
                </div>
                {item.lowStockThreshold !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-mir-gray-dark">Low Stock Alert</span>
                    <span>{item.lowStockThreshold} {item.unit}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-mir-gray-dark">Last Updated</span>
                  <span>{new Date(item.lastUpdated).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default InventoryDetailPage;
