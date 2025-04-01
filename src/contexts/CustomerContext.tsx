
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// Customer interface
export interface Customer {
  id: string;
  name: string;
  phone: string;
  loyaltyPoints: number;
  visitCount: number;
  lastVisit: string;
  firstVisit: string;
  favoriteItems: string[];
}

// Customer context type
interface CustomerContextType {
  customers: Customer[];
  currentCustomer: Customer | null;
  setCurrentCustomer: (customer: Customer | null) => void;
  addCustomer: (customer: Omit<Customer, 'id' | 'loyaltyPoints' | 'visitCount' | 'lastVisit' | 'firstVisit' | 'favoriteItems'>) => Customer;
  updateCustomer: (customer: Customer) => void;
  findCustomerByPhone: (phone: string) => Customer | undefined;
  addLoyaltyPoints: (customerId: string, points: number) => void;
  redeemLoyaltyPoints: (customerId: string, points: number) => boolean;
}

// Create the context
const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

// Sample data
const initialCustomers: Customer[] = [
  {
    id: '1',
    name: 'Rahul Sharma',
    phone: '9876543210',
    loyaltyPoints: 50,
    visitCount: 5,
    lastVisit: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    firstVisit: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    favoriteItems: ['Chicken Burger', 'Fries'],
  },
  {
    id: '2',
    name: 'Anjali Patel',
    phone: '8765432109',
    loyaltyPoints: 25,
    visitCount: 3,
    lastVisit: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    firstVisit: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    favoriteItems: ['Veg Burger', 'Cappuccino'],
  },
];

// Provider component
export const CustomerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);

  // Load customers from localStorage on mount
  useEffect(() => {
    const savedCustomers = localStorage.getItem('mir-customers');
    if (savedCustomers) {
      setCustomers(JSON.parse(savedCustomers));
    } else {
      setCustomers(initialCustomers);
    }
  }, []);

  // Save customers to localStorage when they change
  useEffect(() => {
    localStorage.setItem('mir-customers', JSON.stringify(customers));
  }, [customers]);

  // Add a new customer
  const addCustomer = (newCustomerData: Omit<Customer, 'id' | 'loyaltyPoints' | 'visitCount' | 'lastVisit' | 'firstVisit' | 'favoriteItems'>) => {
    const now = new Date().toISOString();
    const newCustomer: Customer = {
      id: Date.now().toString(),
      ...newCustomerData,
      loyaltyPoints: 10, // Starting points for new customers
      visitCount: 1,
      lastVisit: now,
      firstVisit: now,
      favoriteItems: [],
    };

    setCustomers((prevCustomers) => [...prevCustomers, newCustomer]);
    return newCustomer;
  };

  // Update a customer
  const updateCustomer = (updatedCustomer: Customer) => {
    setCustomers((prevCustomers) =>
      prevCustomers.map((customer) =>
        customer.id === updatedCustomer.id ? updatedCustomer : customer
      )
    );
  };

  // Find a customer by phone number
  const findCustomerByPhone = (phone: string) => {
    return customers.find((customer) => customer.phone === phone);
  };

  // Add loyalty points to a customer
  const addLoyaltyPoints = (customerId: string, points: number) => {
    setCustomers((prevCustomers) =>
      prevCustomers.map((customer) =>
        customer.id === customerId
          ? {
              ...customer,
              loyaltyPoints: customer.loyaltyPoints + points,
              visitCount: customer.visitCount + 1,
              lastVisit: new Date().toISOString(),
            }
          : customer
      )
    );
  };

  // Redeem loyalty points
  const redeemLoyaltyPoints = (customerId: string, points: number) => {
    const customer = customers.find((c) => c.id === customerId);
    if (!customer || customer.loyaltyPoints < points) {
      return false;
    }

    setCustomers((prevCustomers) =>
      prevCustomers.map((c) =>
        c.id === customerId
          ? { ...c, loyaltyPoints: c.loyaltyPoints - points }
          : c
      )
    );

    return true;
  };

  // Context value
  const value = {
    customers,
    currentCustomer,
    setCurrentCustomer,
    addCustomer,
    updateCustomer,
    findCustomerByPhone,
    addLoyaltyPoints,
    redeemLoyaltyPoints,
  };

  return <CustomerContext.Provider value={value}>{children}</CustomerContext.Provider>;
};

// Hook for using the customer context
export const useCustomer = () => {
  const context = useContext(CustomerContext);
  if (context === undefined) {
    throw new Error('useCustomer must be used within a CustomerProvider');
  }
  return context;
};
