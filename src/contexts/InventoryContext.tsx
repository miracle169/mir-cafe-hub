
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// Inventory item interface
export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  lowStockThreshold?: number;
  lastUpdated: string;
  category: string;
}

// Purchase log interface
export interface PurchaseLog {
  id: string;
  staffId: string;
  staffName: string;
  date: string;
  items: {
    itemId: string;
    itemName: string;
    quantity: number;
    unitPrice: number;
  }[];
  totalAmount: number;
  moneyReceived: number;
  balance: number;
}

// Inventory context type
interface InventoryContextType {
  items: InventoryItem[];
  inventoryItems: InventoryItem[]; // Alias for backward compatibility
  purchaseLogs: PurchaseLog[];
  addItem: (item: Omit<InventoryItem, 'id' | 'lastUpdated'>) => void;
  updateItem: (item: InventoryItem) => void;
  deleteItem: (id: string) => void;
  decreaseInventory: (itemId: string, amount: number) => boolean;
  increaseInventory: (itemId: string, amount: number) => void;
  addPurchaseLog: (log: Omit<PurchaseLog, 'id'>) => void;
  getItemById: (id: string) => InventoryItem | undefined;
  getLowStockItems: () => InventoryItem[];
  bulkAddItems: (items: Omit<InventoryItem, 'id' | 'lastUpdated'>[]) => void;
}

// Create the context
const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

// Sample inventory data
const initialInventory: InventoryItem[] = [
  {
    id: '1',
    name: 'Milk',
    quantity: 10,
    unit: 'liter',
    lowStockThreshold: 5,
    lastUpdated: new Date().toISOString(),
    category: 'Dairy',
  },
  {
    id: '2',
    name: 'Sugar',
    quantity: 5,
    unit: 'kg',
    lowStockThreshold: 2,
    lastUpdated: new Date().toISOString(),
    category: 'Ingredients',
  },
  {
    id: '3',
    name: 'Coffee Beans',
    quantity: 20,
    unit: 'kg',
    lowStockThreshold: 5,
    lastUpdated: new Date().toISOString(),
    category: 'Beverages',
  },
];

// Provider component
export const InventoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [purchaseLogs, setPurchaseLogs] = useState<PurchaseLog[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const savedItems = localStorage.getItem('mir-inventory');
    if (savedItems) {
      setItems(JSON.parse(savedItems));
    } else {
      setItems(initialInventory);
    }

    const savedLogs = localStorage.getItem('mir-purchase-logs');
    if (savedLogs) {
      setPurchaseLogs(JSON.parse(savedLogs));
    }
  }, []);

  // Save to localStorage when they change
  useEffect(() => {
    localStorage.setItem('mir-inventory', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('mir-purchase-logs', JSON.stringify(purchaseLogs));
  }, [purchaseLogs]);

  // Add a new inventory item
  const addItem = (newItemData: Omit<InventoryItem, 'id' | 'lastUpdated'>) => {
    const newItem: InventoryItem = {
      id: Date.now().toString(),
      ...newItemData,
      lastUpdated: new Date().toISOString(),
    };

    setItems((prevItems) => [...prevItems, newItem]);
  };

  // Update an inventory item
  const updateItem = (updatedItem: InventoryItem) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === updatedItem.id
          ? { ...updatedItem, lastUpdated: new Date().toISOString() }
          : item
      )
    );
  };

  // Delete an inventory item
  const deleteItem = (id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  // Decrease inventory (return false if not enough)
  const decreaseInventory = (itemId: string, amount: number) => {
    const item = items.find((i) => i.id === itemId);
    if (!item || item.quantity < amount) {
      return false;
    }

    updateItem({
      ...item,
      quantity: item.quantity - amount,
      lastUpdated: new Date().toISOString(),
    });

    return true;
  };

  // Increase inventory
  const increaseInventory = (itemId: string, amount: number) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    updateItem({
      ...item,
      quantity: item.quantity + amount,
      lastUpdated: new Date().toISOString(),
    });
  };

  // Add a purchase log
  const addPurchaseLog = (log: Omit<PurchaseLog, 'id'>) => {
    const newLog: PurchaseLog = {
      id: Date.now().toString(),
      ...log,
    };

    // Update inventory based on purchased items
    log.items.forEach((item) => {
      increaseInventory(item.itemId, item.quantity);
    });

    setPurchaseLogs((prevLogs) => [...prevLogs, newLog]);
  };

  // Get item by ID
  const getItemById = (id: string) => {
    return items.find((item) => item.id === id);
  };

  // Get low stock items
  const getLowStockItems = () => {
    return items.filter(
      (item) => item.lowStockThreshold && item.quantity <= item.lowStockThreshold
    );
  };

  // Bulk add items (for CSV import)
  const bulkAddItems = (newItems: Omit<InventoryItem, 'id' | 'lastUpdated'>[]) => {
    const timestamp = new Date().toISOString();
    const itemsToAdd = newItems.map((item) => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      ...item,
      lastUpdated: timestamp,
    }));

    setItems((prevItems) => [...prevItems, ...itemsToAdd]);
  };

  // Context value
  const value = {
    items,
    inventoryItems: items, // Alias for backward compatibility
    purchaseLogs,
    addItem,
    updateItem,
    deleteItem,
    decreaseInventory,
    increaseInventory,
    addPurchaseLog,
    getItemById,
    getLowStockItems,
    bulkAddItems,
  };

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>;
};

// Hook for using the inventory context
export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
