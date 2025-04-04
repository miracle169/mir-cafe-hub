
/**
 * Utility functions for Bluetooth printer connectivity and printing
 */

let bluetoothDevice: BluetoothDevice | null = null;
let gattServer: BluetoothRemoteGATTServer | null = null;
let printCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;

// Connect to Bluetooth printer
export const connectPrinter = async (): Promise<boolean> => {
  try {
    // Check if Bluetooth API is available
    if (!navigator.bluetooth) {
      console.error('Bluetooth not available. Are you using HTTPS?');
      return false;
    }
    
    // Request device with printer service
    bluetoothDevice = await navigator.bluetooth.requestDevice({
      filters: [
        { services: ['000018f0-0000-1000-8000-00805f9b34fb'] }, // Common printer service
        { namePrefix: 'Printer' }, // Fallback to name-based filter
      ],
      optionalServices: ['battery_service', '0000180a-0000-1000-8000-00805f9b34fb'] // Optional services
    });

    if (!bluetoothDevice) {
      console.error('No Bluetooth device selected');
      return false;
    }

    // Connect to GATT server
    gattServer = await bluetoothDevice.gatt?.connect();
    
    if (!gattServer) {
      console.error('Failed to connect to the GATT server');
      return false;
    }

    // Get primary service for printing
    const service = await gattServer.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb');
    
    // Get characteristic for print commands
    printCharacteristic = await service.getCharacteristic('00002af1-0000-1000-8000-00805f9b34fb');
    
    // Add disconnect listener
    bluetoothDevice.addEventListener('gattserverdisconnected', handleDisconnect);
    
    return true;
  } catch (error) {
    console.error('Error connecting to printer:', error);
    return false;
  }
};

// Handle disconnect event
const handleDisconnect = () => {
  console.log('Printer disconnected');
  printCharacteristic = null;
  gattServer = null;
};

// Disconnect from printer
export const disconnectPrinter = () => {
  if (gattServer && gattServer.connected) {
    gattServer.disconnect();
  }
  bluetoothDevice = null;
  gattServer = null;
  printCharacteristic = null;
};

// Check if printer is connected
export const isPrinterConnected = (): boolean => {
  return !!(gattServer && gattServer.connected && printCharacteristic);
};

// Get bill format settings from localStorage
const getBillFormatSettings = () => {
  const defaultSettings = {
    printLogo: true,
    printAddress: true,
    printCustomerInfo: true,
    printItemizedDetails: true,
    printTaxDetails: true,
    printDiscountDetails: true,
    footerMessage: "Thank you for visiting Mir Cafe! We hope to see you again soon!"
  };
  
  try {
    const savedSettings = localStorage.getItem('mirCafePrintSettings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      return parsed.bill || defaultSettings;
    }
  } catch (error) {
    console.error('Error parsing bill settings:', error);
  }
  
  return defaultSettings;
};

// Get KOT format settings from localStorage
const getKotFormatSettings = () => {
  const defaultSettings = {
    printTableNumber: true,
    printTime: true,
    printServername: true,
    footerMessage: ""
  };
  
  try {
    const savedSettings = localStorage.getItem('mirCafeKotSettings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      return parsed.kot || defaultSettings;
    }
  } catch (error) {
    console.error('Error parsing KOT settings:', error);
  }
  
  return defaultSettings;
};

// Print order KOT (Kitchen Order Ticket)
export const printKOT = async (order: any): Promise<boolean> => {
  if (!isPrinterConnected()) {
    console.error('Printer not connected');
    return false;
  }
  
  try {
    const encoder = new TextEncoder();
    const kotSettings = getKotFormatSettings();
    
    // Format KOT data
    let kotData = `\n\nKITCHEN ORDER TICKET\n\n`;
    kotData += `Order #: ${order.id.slice(-5)}\n`;
    kotData += `Type: ${order.type.toUpperCase()}\n`;
    
    if (kotSettings.printTableNumber && order.type === 'dine-in' && order.tableNumber) {
      kotData += `Table: ${order.tableNumber}\n`;
    }
    
    if (kotSettings.printTime) {
      kotData += `Date: ${new Date(order.createdAt).toLocaleString()}\n`;
    }
    
    if (kotSettings.printServername && order.staffName) {
      kotData += `Server: ${order.staffName}\n`;
    }
    
    kotData += `\nITEMS:\n`;
    
    order.items.forEach((item: any, index: number) => {
      kotData += `${item.quantity}x ${item.name}\n`;
    });
    
    if (order.notes) {
      kotData += `\nNotes: ${order.notes}\n`;
    }
    
    if (kotSettings.footerMessage) {
      kotData += `\n${kotSettings.footerMessage}\n`;
    }
    
    kotData += `\n\n\n`; // Extra lines for cutting
    
    // Send data to printer
    await printCharacteristic!.writeValue(encoder.encode(kotData));
    
    return true;
  } catch (error) {
    console.error('Error printing KOT:', error);
    return false;
  }
};

// Print bill
export const printBill = async (order: any): Promise<boolean> => {
  if (!isPrinterConnected()) {
    console.error('Printer not connected');
    return false;
  }
  
  try {
    const encoder = new TextEncoder();
    const billSettings = getBillFormatSettings();
    
    // Format bill data
    let billData = `\n\n`;
    
    if (billSettings.printLogo) {
      billData += `MIR CAFE\n\n`;
    }
    
    billData += `INVOICE\n`;
    billData += `Order #: ${order.id.slice(-5)}\n`;
    billData += `Date: ${new Date(order.createdAt).toLocaleString()}\n`;
    
    if (order.staffName) {
      billData += `Staff: ${order.staffName}\n`;
    }
    
    if (billSettings.printAddress) {
      billData += `\n123 Main Street, City\n`;
      billData += `Phone: +91 98765 43210\n`;
    }
    
    if (billSettings.printCustomerInfo && order.customer) {
      billData += `\nCustomer: ${order.customer.name}\n`;
      if (order.customer.phone) {
        billData += `Phone: ${order.customer.phone}\n`;
      }
    }
    
    billData += `\nITEMS:\n`;
    billData += `--------------------------\n`;
    
    // Calculate total
    let subTotal = 0;
    
    if (billSettings.printItemizedDetails) {
      order.items.forEach((item: any) => {
        const itemTotal = item.price * item.quantity;
        subTotal += itemTotal;
        billData += `${item.quantity}x ${item.name}\n`;
        billData += `  ₹${item.price.toFixed(2)} each: ₹${itemTotal.toFixed(2)}\n`;
      });
    } else {
      // Just print quantities and names, no prices
      order.items.forEach((item: any) => {
        const itemTotal = item.price * item.quantity;
        subTotal += itemTotal;
        billData += `${item.quantity}x ${item.name}\n`;
      });
    }
    
    billData += `--------------------------\n`;
    billData += `Subtotal: ₹${subTotal.toFixed(2)}\n`;
    
    // Add tax/service charge if applicable
    if (billSettings.printTaxDetails) {
      const tax = subTotal * 0.05; // Example 5% tax
      billData += `Tax (5%): ₹${tax.toFixed(2)}\n`;
    }
    
    if (billSettings.printDiscountDetails && order.discount) {
      billData += `Discount: ₹${order.discount.toFixed(2)}\n`;
    }
    
    billData += `TOTAL: ₹${order.totalAmount.toFixed(2)}\n\n`;
    
    if (order.paymentDetails) {
      billData += `Payment Method: ${order.paymentDetails.method.toUpperCase()}\n`;
      
      if (order.paymentDetails.method === 'split') {
        if (order.paymentDetails.cash) {
          billData += `Cash: ₹${order.paymentDetails.cash.toFixed(2)}\n`;
        }
        if (order.paymentDetails.upi) {
          billData += `UPI: ₹${order.paymentDetails.upi.toFixed(2)}\n`;
        }
      }
    }
    
    if (billSettings.footerMessage) {
      billData += `\n${billSettings.footerMessage}\n`;
    }
    
    billData += `\n\n\n`;
    
    // Send data to printer
    await printCharacteristic!.writeValue(encoder.encode(billData));
    
    return true;
  } catch (error) {
    console.error('Error printing bill:', error);
    return false;
  }
};
