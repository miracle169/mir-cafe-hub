
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// Menu item interface
export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  recipe?: RecipeItem[];
  description?: string;
  image?: string;
}

// Recipe item interface
export interface RecipeItem {
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: string;
}

// Menu category interface
export interface MenuCategory {
  id: string;
  name: string;
}

// Menu context type
interface MenuContextType {
  items: MenuItem[];
  categories: MenuCategory[];
  addItem: (item: Omit<MenuItem, 'id'>) => void;
  updateItem: (item: MenuItem) => void;
  deleteItem: (id: string) => void;
  addCategory: (category: Omit<MenuCategory, 'id'>) => void;
  updateCategory: (category: MenuCategory) => void;
  deleteCategory: (id: string) => void;
  getItemById: (id: string) => MenuItem | undefined;
  getItemsByCategory: (categoryId: string) => MenuItem[];
  bulkAddItems: (items: Omit<MenuItem, 'id'>[]) => void;
  bulkAddCategories: (categories: Omit<MenuCategory, 'id'>[]) => void;
}

// Create the context
const MenuContext = createContext<MenuContextType | undefined>(undefined);

// Sample menu categories
const initialCategories: MenuCategory[] = [
  { id: '1', name: 'Coffee' },
  { id: '2', name: 'Tea' },
  { id: '3', name: 'Snacks' },
  { id: '4', name: 'Sandwiches' },
  { id: '5', name: 'Desserts' },
];

// Sample menu items
const initialItems: MenuItem[] = [
  {
    id: '1',
    name: 'Cappuccino',
    price: 120,
    category: '1',
    description: 'Rich espresso with steamed milk and foam',
    recipe: [
      { ingredientId: '3', ingredientName: 'Coffee Beans', quantity: 0.02, unit: 'kg' },
      { ingredientId: '1', ingredientName: 'Milk', quantity: 0.1, unit: 'liter' },
    ],
  },
  {
    id: '2',
    name: 'Masala Chai',
    price: 80,
    category: '2',
    description: 'Spiced tea with milk',
    recipe: [
      { ingredientId: '1', ingredientName: 'Milk', quantity: 0.1, unit: 'liter' },
      { ingredientId: '2', ingredientName: 'Sugar', quantity: 0.01, unit: 'kg' },
    ],
  },
  {
    id: '3',
    name: 'Samosa',
    price: 60,
    category: '3',
    description: 'Crispy pastry with savory filling',
  },
  {
    id: '4',
    name: 'Veg Sandwich',
    price: 90,
    category: '4',
    description: 'Fresh vegetables with cheese in toasted bread',
  },
  {
    id: '5',
    name: 'Chocolate Brownie',
    price: 110,
    category: '5',
    description: 'Rich chocolate brownie with nuts',
  },
];

// Provider component
export const MenuProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const savedItems = localStorage.getItem('mir-menu-items');
    if (savedItems) {
      setItems(JSON.parse(savedItems));
    } else {
      setItems(initialItems);
    }

    const savedCategories = localStorage.getItem('mir-menu-categories');
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    } else {
      setCategories(initialCategories);
    }
  }, []);

  // Save to localStorage when they change
  useEffect(() => {
    localStorage.setItem('mir-menu-items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('mir-menu-categories', JSON.stringify(categories));
  }, [categories]);

  // Add a new menu item
  const addItem = (newItemData: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = {
      id: Date.now().toString(),
      ...newItemData,
    };

    setItems((prevItems) => [...prevItems, newItem]);
  };

  // Update a menu item
  const updateItem = (updatedItem: MenuItem) => {
    setItems((prevItems) =>
      prevItems.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );
  };

  // Delete a menu item
  const deleteItem = (id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  // Add a new category
  const addCategory = (newCategoryData: Omit<MenuCategory, 'id'>) => {
    const newCategory: MenuCategory = {
      id: Date.now().toString(),
      ...newCategoryData,
    };

    setCategories((prevCategories) => [...prevCategories, newCategory]);
  };

  // Update a category
  const updateCategory = (updatedCategory: MenuCategory) => {
    setCategories((prevCategories) =>
      prevCategories.map((category) =>
        category.id === updatedCategory.id ? updatedCategory : category
      )
    );
  };

  // Delete a category
  const deleteCategory = (id: string) => {
    setCategories((prevCategories) =>
      prevCategories.filter((category) => category.id !== id)
    );
  };

  // Get item by ID
  const getItemById = (id: string) => {
    return items.find((item) => item.id === id);
  };

  // Get items by category
  const getItemsByCategory = (categoryId: string) => {
    return items.filter((item) => item.category === categoryId);
  };

  // Bulk add items (for CSV import)
  const bulkAddItems = (newItems: Omit<MenuItem, 'id'>[]) => {
    const itemsToAdd = newItems.map((item) => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      ...item,
    }));

    setItems((prevItems) => [...prevItems, ...itemsToAdd]);
  };

  // Bulk add categories (for CSV import)
  const bulkAddCategories = (newCategories: Omit<MenuCategory, 'id'>[]) => {
    const categoriesToAdd = newCategories.map((category) => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      ...category,
    }));

    setCategories((prevCategories) => [...prevCategories, ...categoriesToAdd]);
  };

  // Context value
  const value = {
    items,
    categories,
    addItem,
    updateItem,
    deleteItem,
    addCategory,
    updateCategory,
    deleteCategory,
    getItemById,
    getItemsByCategory,
    bulkAddItems,
    bulkAddCategories,
  };

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
};

// Hook for using the menu context
export const useMenu = () => {
  const context = useContext(MenuContext);
  if (context === undefined) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
};
