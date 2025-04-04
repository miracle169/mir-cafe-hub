
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useInventory } from '@/contexts/InventoryContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const AddInventoryPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { items, addItem } = useInventory();
  
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [category, setCategory] = useState('');
  const [lowStockThreshold, setLowStockThreshold] = useState('');
  const [newCategory, setNewCategory] = useState('');

  // Extract unique categories from items
  const categories = Array.from(new Set(items.map(item => item.category)));

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    if (!name || !quantity || !unit || (!category && !newCategory)) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Add new item
      addItem({
        name,
        quantity: parseFloat(quantity),
        unit,
        category: category === 'new' ? newCategory : category,
        lowStockThreshold: lowStockThreshold ? parseFloat(lowStockThreshold) : undefined,
      });
      
      toast({
        title: "Success",
        description: "Item added successfully",
      });
      
      navigate('/inventory');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout title="Add Inventory Item" showBackButton>
      <div className="mir-container">
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
                <SelectItem value="new-category">+ Add New Category</SelectItem>
              </SelectContent>
            </Select>
            
            {category === 'new-category' && (
              <div className="mt-2">
                <Input 
                  placeholder="Enter new category name" 
                  value={newCategory} 
                  onChange={(e) => setNewCategory(e.target.value)}
                />
              </div>
            )}
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
          
          <Button 
            type="submit" 
            className="w-full bg-mir-red text-white"
          >
            Add Item
          </Button>
        </form>
      </div>
    </Layout>
  );
};

export default AddInventoryPage;
