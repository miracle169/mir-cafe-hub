
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { useMenu } from '@/contexts/MenuContext';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
  image?: string;
}

interface AddMenuItemProps {
  isOpen: boolean;
  onClose: () => void;
  initialValues?: MenuItem | null;
}

const AddMenuItem: React.FC<AddMenuItemProps> = ({ isOpen, onClose, initialValues }) => {
  const { categories, addItem, updateItem } = useMenu();
  const { toast } = useToast();
  
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [itemId, setItemId] = useState<string | null>(null);
  
  // Initialize form with values if editing
  useEffect(() => {
    if (initialValues) {
      setName(initialValues.name);
      setPrice(initialValues.price.toString());
      setCategory(initialValues.category);
      setDescription(initialValues.description || '');
      setIsEditing(true);
      setItemId(initialValues.id);
    } else {
      setName('');
      setPrice('');
      setCategory('');
      setDescription('');
      setIsEditing(false);
      setItemId(null);
    }
  }, [initialValues]);
  
  const handleSubmit = () => {
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Item name is required",
        variant: "destructive",
        duration: 1000,
      });
      return;
    }
    
    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid price",
        variant: "destructive",
        duration: 1000,
      });
      return;
    }
    
    if (!category) {
      toast({
        title: "Error",
        description: "Please select a category",
        variant: "destructive",
        duration: 1000,
      });
      return;
    }
    
    const itemData = {
      name: name.trim(),
      price: parseFloat(price),
      category,
      description: description.trim() || undefined,
    };
    
    if (isEditing && itemId) {
      // Update existing item
      updateItem({
        id: itemId,
        ...itemData
      });
      
      toast({
        title: "Success",
        description: "Menu item updated successfully",
        duration: 1000,
      });
    } else {
      // Add new item
      addItem(itemData);
      
      toast({
        title: "Success",
        description: "Menu item added successfully",
        duration: 1000,
      });
    }
    
    // Reset form
    setName('');
    setPrice('');
    setCategory('');
    setDescription('');
    
    // Close the dialog
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogTitle>{isEditing ? 'Edit Menu Item' : 'Add Menu Item'}</DialogTitle>
        
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="name">Item Name</Label>
            <Input 
              id="name" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter item name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="price">Price (₹)</Label>
            <Input 
              id="price" 
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Enter price"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input 
              id="description" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {isEditing ? 'Update Item' : 'Add Item'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddMenuItem;
