
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useInventory } from '@/contexts/InventoryContext';
import { useAuth } from '@/contexts/AuthContext';
import { Trash, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const AddPurchasePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { items, addPurchaseLog } = useInventory();
  const { currentUser } = useAuth();
  
  const [moneyReceived, setMoneyReceived] = useState('');
  const [purchaseItems, setPurchaseItems] = useState<{
    itemId: string;
    itemName: string;
    quantity: string;
    unitPrice: string;
  }[]>([{ itemId: '', itemName: '', quantity: '', unitPrice: '' }]);
  
  const [date, setDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  // Calculate total and balance
  const calculateTotal = () => {
    return purchaseItems.reduce((total, item) => {
      const itemTotal = parseFloat(item.quantity || '0') * parseFloat(item.unitPrice || '0');
      return total + (isNaN(itemTotal) ? 0 : itemTotal);
    }, 0);
  };

  const calculateBalance = () => {
    const total = calculateTotal();
    const received = parseFloat(moneyReceived || '0');
    return received - total;
  };

  // Add a new empty item row
  const addItemRow = () => {
    setPurchaseItems([
      ...purchaseItems,
      { itemId: '', itemName: '', quantity: '', unitPrice: '' },
    ]);
  };

  // Remove an item row
  const removeItemRow = (index: number) => {
    if (purchaseItems.length > 1) {
      setPurchaseItems(purchaseItems.filter((_, i) => i !== index));
    }
  };

  // Update an item field
  const updateItemField = (
    index: number,
    field: 'itemId' | 'itemName' | 'quantity' | 'unitPrice',
    value: string
  ) => {
    const updatedItems = [...purchaseItems];
    updatedItems[index][field] = value;
    
    // If the item ID changed, update the item name
    if (field === 'itemId') {
      const selectedItem = items.find(item => item.id === value);
      if (selectedItem) {
        updatedItems[index].itemName = selectedItem.name;
      }
    }
    
    setPurchaseItems(updatedItems);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast({
        title: "Error",
        description: "You must be logged in to record purchases",
        variant: "destructive",
      });
      return;
    }
    
    // Validate inputs
    if (!moneyReceived || parseFloat(moneyReceived) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount for money received",
        variant: "destructive",
      });
      return;
    }
    
    const hasInvalidItems = purchaseItems.some(
      item => !item.itemId || !item.quantity || !item.unitPrice || 
      parseFloat(item.quantity) <= 0 || parseFloat(item.unitPrice) <= 0
    );
    
    if (hasInvalidItems) {
      toast({
        title: "Error",
        description: "Please fill in all item details with valid values",
        variant: "destructive",
      });
      return;
    }
    
    // Create the purchase log
    const totalAmount = calculateTotal();
    const moneyReceived_ = parseFloat(moneyReceived);
    const balance = calculateBalance();
    
    const formattedItems = purchaseItems.map(item => ({
      itemId: item.itemId,
      itemName: item.itemName,
      quantity: parseFloat(item.quantity),
      unitPrice: parseFloat(item.unitPrice),
    }));
    
    try {
      addPurchaseLog({
        staffId: currentUser.id,
        staffName: currentUser.name,
        date: new Date(date).toISOString(),
        items: formattedItems,
        totalAmount,
        moneyReceived: moneyReceived_,
        balance,
      });
      
      toast({
        title: "Purchase Recorded",
        description: "Your purchase has been saved successfully",
      });
      
      navigate('/purchases');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record the purchase",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout title="Add Purchase" showBackButton>
      <div className="mir-container pb-20">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input 
              id="date" 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="money-received">Money Received (₹)</Label>
            <Input 
              id="money-received" 
              type="number" 
              placeholder="Enter amount" 
              value={moneyReceived}
              onChange={(e) => setMoneyReceived(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Purchase Items</Label>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={addItemRow}
                className="h-8 text-mir-red hover:text-mir-red/90"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </Button>
            </div>
            
            <div className="space-y-3">
              {purchaseItems.map((item, index) => (
                <Card key={index} className="bg-white shadow-sm">
                  <CardContent className="p-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor={`item-${index}`} className="text-sm">Item</Label>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeItemRow(index)}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        disabled={purchaseItems.length <= 1}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <Select
                      value={item.itemId}
                      onValueChange={(value) => updateItemField(index, 'itemId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select item" />
                      </SelectTrigger>
                      <SelectContent>
                        {items.map((inventoryItem) => (
                          <SelectItem key={inventoryItem.id} value={inventoryItem.id}>
                            {inventoryItem.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor={`quantity-${index}`} className="text-sm">Quantity</Label>
                        <Input 
                          id={`quantity-${index}`}
                          type="number"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) => updateItemField(index, 'quantity', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`price-${index}`} className="text-sm">Unit Price (₹)</Label>
                        <Input 
                          id={`price-${index}`}
                          type="number"
                          placeholder="Price"
                          value={item.unitPrice}
                          onChange={(e) => updateItemField(index, 'unitPrice', e.target.value)}
                        />
                      </div>
                    </div>
                    
                    {item.quantity && item.unitPrice && (
                      <div className="text-right text-sm font-medium">
                        Total: ₹{(parseFloat(item.quantity) * parseFloat(item.unitPrice)).toFixed(2)}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm mb-4 space-y-2">
            <div className="flex justify-between">
              <span>Total Purchase Amount</span>
              <span className="font-medium">₹{calculateTotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Money Received</span>
              <span className="font-medium">₹{(parseFloat(moneyReceived) || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold pt-1 border-t">
              <span>Balance</span>
              <span className={calculateBalance() < 0 ? 'text-red-500' : ''}>
                ₹{calculateBalance().toFixed(2)}
              </span>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-mir-red text-white"
          >
            Save Purchase
          </Button>
        </form>
      </div>
    </Layout>
  );
};

export default AddPurchasePage;
