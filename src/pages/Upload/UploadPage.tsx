import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useInventory } from '@/contexts/InventoryContext';
import { useMenu } from '@/contexts/MenuContext';
import { useAuth } from '@/contexts/AuthContext';
import { Upload, FileText, CheckCircle, AlertCircle, Trash2, RefreshCw } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel, AlertDialogFooter, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const UploadPage = () => {
  const { toast } = useToast();
  const { bulkAddItems: bulkAddInventoryItems } = useInventory();
  const { bulkAddItems: bulkAddMenuItems, bulkAddCategories, clearAllItems } = useMenu();
  const { isOwner } = useAuth();
  
  const [activeTab, setActiveTab] = useState<string>('menu');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);

  // Check if user is owner
  if (!isOwner) {
    return (
      <Layout title="Upload Data" showBackButton>
        <div className="mir-container">
          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
            <AlertCircle className="h-12 w-12 text-mir-red mx-auto mb-3" />
            <h2 className="text-xl font-bold text-mir-black mb-2">Owner Access Required</h2>
            <p className="text-mir-gray-dark">
              This upload feature is only accessible to owner accounts. Please log in as an owner to upload data.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCsvFile(file);
      setUploadSuccess(false);
      setUploadError(null);
      setCsvData([]);
    }
  };

  // Parse CSV file
  const parseCSV = (text: string) => {
    try {
      const lines = text.split('\n');
      
      if (lines.length <= 1) {
        throw new Error("CSV file appears to be empty or has only headers");
      }
      
      const headers = lines[0].split(',').map(header => header.trim());
      
      const data = [];
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const values = lines[i].split(',').map(value => value.trim());
        if (values.length !== headers.length) {
          console.warn(`Line ${i+1} has ${values.length} values but should have ${headers.length}`);
          continue;
        }
        
        const row: any = {};
        
        headers.forEach((header, index) => {
          row[header] = values[index];
        });
        
        data.push(row);
      }
      
      if (data.length === 0) {
        throw new Error("No valid data rows found in CSV file");
      }
      
      return { headers, data };
    } catch (error) {
      console.error("CSV parsing error:", error);
      throw error;
    }
  };

  // Preview CSV file
  const previewCSV = () => {
    if (!csvFile) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const { data } = parseCSV(text);
        setCsvData(data);
      } catch (error) {
        setUploadError('Failed to parse CSV file. Please check the format.');
        setCsvData([]);
      }
    };
    reader.readAsText(csvFile);
  };

  // Process upload
  const handleUpload = () => {
    if (!csvFile) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }
    
    setUploading(true);
    setUploadProgress(0);
    setUploadSuccess(false);
    setUploadError(null);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const { headers, data } = parseCSV(text);
        
        // Process data based on active tab
        if (activeTab === 'menu') {
          processMenuData(headers, data);
        } else if (activeTab === 'inventory') {
          processInventoryData(headers, data);
        } else if (activeTab === 'recipes') {
          processRecipeData(headers, data);
        }
        
        // Simulate progress
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          setUploadProgress(progress);
          
          if (progress >= 100) {
            clearInterval(interval);
            setUploading(false);
            setUploadSuccess(true);
            
            toast({
              title: "Upload Successful",
              description: `${data.length} items were added successfully`,
            });
          }
        }, 100);
        
      } catch (error) {
        setUploading(false);
        setUploadError('Failed to process CSV file. Please check the format.');
        
        toast({
          title: "Upload Failed",
          description: "Failed to process the CSV file. Please check the format.",
          variant: "destructive",
        });
      }
    };
    
    reader.readAsText(csvFile);
  };

  // Process menu data
  const processMenuData = (headers: string[], data: any[]) => {
    // Validate required headers
    const requiredHeaders = ['name', 'price', 'category'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    
    if (missingHeaders.length > 0) {
      setUploadError(`Missing required headers: ${missingHeaders.join(', ')}`);
      setUploading(false);
      return;
    }
    
    // Extract unique categories
    const categories = Array.from(new Set(data.map(item => item.category)))
      .filter(Boolean)
      .map(name => ({ name }));
    
    // Add categories
    if (categories.length > 0) {
      bulkAddCategories(categories);
    }
    
    // Format menu items
    const menuItems = data.map(item => ({
      name: item.name,
      price: parseFloat(item.price) || 0,
      category: item.category,
      description: item.description || '',
    }));
    
    // Add menu items
    if (menuItems.length > 0) {
      bulkAddMenuItems(menuItems);
    } else {
      setUploadError('No valid menu items found in CSV file');
      setUploading(false);
    }
  };

  // Process inventory data
  const processInventoryData = (headers: string[], data: any[]) => {
    // Validate required headers
    const requiredHeaders = ['name', 'quantity', 'unit', 'category'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    
    if (missingHeaders.length > 0) {
      setUploadError(`Missing required headers: ${missingHeaders.join(', ')}`);
      setUploading(false);
      return;
    }
    
    // Format inventory items
    const inventoryItems = data.map(item => ({
      name: item.name,
      quantity: parseFloat(item.quantity) || 0,
      unit: item.unit,
      category: item.category,
      lowStockThreshold: item.lowStockThreshold ? parseFloat(item.lowStockThreshold) : undefined,
    }));
    
    // Add inventory items
    if (inventoryItems.length > 0) {
      bulkAddInventoryItems(inventoryItems);
    } else {
      setUploadError('No valid inventory items found in CSV file');
      setUploading(false);
    }
  };

  // Process recipe data
  const processRecipeData = (headers: string[], data: any[]) => {
    // For simplicity, we'll just simulate a successful upload
    // In a real implementation, this would link menu items to inventory items with quantities
    setUploadSuccess(true);
    
    toast({
      title: "Recipe Upload",
      description: "Recipe processing is simulated in this version",
    });
  };

  // Reset upload state
  const handleReset = () => {
    setCsvFile(null);
    setCsvData([]);
    setUploadSuccess(false);
    setUploadError(null);
    setUploadProgress(0);
  };

  // Handle clear all items
  const handleClearAllItems = () => {
    if (activeTab === 'menu') {
      clearAllItems();
      toast({
        title: "Menu Items Cleared",
        description: "All menu items have been removed",
      });
    } else if (activeTab === 'inventory') {
      // Similarly implement for inventory if needed
      toast({
        title: "Not Implemented",
        description: "Clearing inventory items is not implemented yet",
      });
    }
    setIsClearDialogOpen(false);
  };

  // Generate sample CSV download
  const getSampleCSVLink = () => {
    let csvContent = '';
    
    if (activeTab === 'menu') {
      csvContent = 'name,price,category,description\nLatte,120,Coffee,Espresso with steamed milk\nCheese Sandwich,150,Sandwiches,Grilled cheese sandwich';
    } else if (activeTab === 'inventory') {
      csvContent = 'name,quantity,unit,category,lowStockThreshold\nCoffee Beans,5,kg,Beverages,1\nBread,20,pack,Bakery,5';
    } else if (activeTab === 'recipes') {
      csvContent = 'menuItem,ingredient,quantity,unit\nLatte,Coffee Beans,0.02,kg\nLatte,Milk,0.2,liter';
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    return URL.createObjectURL(blob);
  };

  return (
    <Layout title="Upload Data" showBackButton>
      <div className="mir-container">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="menu">Menu</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="recipes">Recipes</TabsTrigger>
          </TabsList>
          
          <div className="flex justify-between items-center mt-4 mb-2">
            <h2 className="text-lg font-semibold">{activeTab === 'menu' ? 'Menu Items' : activeTab === 'inventory' ? 'Inventory Items' : 'Recipes'}</h2>
            <div className="flex space-x-2">
              <a 
                href={getSampleCSVLink()} 
                download={`sample_${activeTab}.csv`}
                className="text-sm text-blue-600 underline hover:text-blue-800"
              >
                Download Sample CSV
              </a>
              
              <AlertDialog open={isClearDialogOpen} onOpenChange={setIsClearDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-red-500 border-red-200">
                    <Trash2 className="h-4 w-4 mr-1" />
                    Clear All
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete all {activeTab === 'menu' ? 'menu items' : 'inventory items'} and cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearAllItems} className="bg-red-500 hover:bg-red-600 text-white">
                      Yes, clear everything
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
          
          <TabsContent value="menu" className="space-y-4">
            <Card>
              <CardHeader className="p-3 pb-0">
                <CardTitle className="text-lg">Upload Menu Items</CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <p className="text-sm text-mir-gray-dark mb-3">
                  Upload a CSV file with menu items. Required columns: name, price, category.
                  Optional: description.
                </p>
                
                {uploadSuccess ? (
                  <div className="text-center py-4">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                    <h3 className="font-bold text-green-700">Upload Successful</h3>
                    <p className="text-green-600 text-sm mb-3">
                      {csvData.length} menu items were added.
                    </p>
                    <Button variant="outline" onClick={handleReset}>
                      Upload Another File
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-gray-200 rounded-md p-6 text-center">
                        <input
                          type="file"
                          accept=".csv"
                          onChange={handleFileChange}
                          className="hidden"
                          id="menu-csv-upload"
                        />
                        <label htmlFor="menu-csv-upload" className="cursor-pointer">
                          <FileText className="h-10 w-10 text-mir-gray mx-auto mb-2" />
                          <p className="font-medium mb-1">Click to select CSV file</p>
                          <p className="text-xs text-mir-gray-dark">
                            {csvFile ? csvFile.name : "No file selected"}
                          </p>
                        </label>
                      </div>
                      
                      {uploadError && (
                        <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
                          {uploadError}
                        </div>
                      )}
                      
                      {csvFile && (
                        <div className="flex space-x-3">
                          <Button 
                            variant="outline" 
                            onClick={previewCSV}
                            className="flex-1"
                          >
                            Preview
                          </Button>
                          <Button 
                            onClick={handleUpload}
                            className="flex-1 bg-mir-red text-white"
                            disabled={uploading}
                          >
                            {uploading ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload className="h-4 w-4 mr-2" />
                                Upload
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                      
                      {uploading && (
                        <Progress value={uploadProgress} className="h-2" />
                      )}
                    </div>
                    
                    {csvData.length > 0 && (
                      <div className="mt-4">
                        <h3 className="font-medium mb-2">Preview ({csvData.length} items)</h3>
                        <div className="border rounded-md overflow-x-auto max-h-40">
                          <table className="min-w-full text-sm">
                            <thead className="bg-gray-50">
                              <tr>
                                {Object.keys(csvData[0]).map((header) => (
                                  <th key={header} className="px-3 py-2 text-left font-medium">
                                    {header}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {csvData.slice(0, 5).map((row, index) => (
                                <tr key={index} className="border-t">
                                  {Object.values(row).map((value: any, i) => (
                                    <td key={i} className="px-3 py-2">
                                      {value}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {csvData.length > 5 && (
                            <div className="px-3 py-2 text-center text-xs text-mir-gray-dark">
                              +{csvData.length - 5} more items
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="inventory" className="space-y-4">
            <Card>
              <CardHeader className="p-3 pb-0">
                <CardTitle className="text-lg">Upload Inventory Items</CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <p className="text-sm text-mir-gray-dark mb-3">
                  Upload a CSV file with inventory items. Required columns: name, quantity, unit, category.
                  Optional: lowStockThreshold.
                </p>
                
                {uploadSuccess ? (
                  <div className="text-center py-4">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                    <h3 className="font-bold text-green-700">Upload Successful</h3>
                    <p className="text-green-600 text-sm mb-3">
                      {csvData.length} inventory items were added.
                    </p>
                    <Button variant="outline" onClick={handleReset}>
                      Upload Another File
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-200 rounded-md p-6 text-center">
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        className="hidden"
                        id="inventory-csv-upload"
                      />
                      <label htmlFor="inventory-csv-upload" className="cursor-pointer">
                        <FileText className="h-10 w-10 text-mir-gray mx-auto mb-2" />
                        <p className="font-medium mb-1">Click to select CSV file</p>
                        <p className="text-xs text-mir-gray-dark">
                          {csvFile ? csvFile.name : "No file selected"}
                        </p>
                      </label>
                    </div>
                    
                    {uploadError && (
                      <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
                        {uploadError}
                      </div>
                    )}
                    
                    {csvFile && (
                      <div className="flex space-x-3">
                        <Button 
                          variant="outline" 
                          onClick={previewCSV}
                          className="flex-1"
                        >
                          Preview
                        </Button>
                        <Button 
                          onClick={handleUpload}
                          className="flex-1 bg-mir-red text-white"
                          disabled={uploading}
                        >
                          {uploading ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-2" />
                              Upload
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                    
                    {uploading && (
                      <Progress value={uploadProgress} className="h-2" />
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="recipes" className="space-y-4">
            <Card>
              <CardHeader className="p-3 pb-0">
                <CardTitle className="text-lg">Upload Recipes</CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <p className="text-sm text-mir-gray-dark mb-3">
                  Upload a CSV file with recipes. Required columns: menuItem, ingredient, quantity, unit.
                </p>
                
                {uploadSuccess ? (
                  <div className="text-center py-4">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                    <h3 className="font-bold text-green-700">Upload Successful</h3>
                    <p className="text-green-600 text-sm mb-3">
                      {csvData.length} recipe entries were added.
                    </p>
                    <Button variant="outline" onClick={handleReset}>
                      Upload Another File
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-200 rounded-md p-6 text-center">
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        className="hidden"
                        id="recipes-csv-upload"
                      />
                      <label htmlFor="recipes-csv-upload" className="cursor-pointer">
                        <FileText className="h-10 w-10 text-mir-gray mx-auto mb-2" />
                        <p className="font-medium mb-1">Click to select CSV file</p>
                        <p className="text-xs text-mir-gray-dark">
                          {csvFile ? csvFile.name : "No file selected"}
                        </p>
                      </label>
                    </div>
                    
                    {uploadError && (
                      <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
                        {uploadError}
                      </div>
                    )}
                    
                    {csvFile && (
                      <div className="flex space-x-3">
                        <Button 
                          variant="outline" 
                          onClick={previewCSV}
                          className="flex-1"
                        >
                          Preview
                        </Button>
                        <Button 
                          onClick={handleUpload}
                          className="flex-1 bg-mir-red text-white"
                          disabled={uploading}
                        >
                          {uploading ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-2" />
                              Upload
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                    
                    {uploading && (
                      <Progress value={uploadProgress} className="h-2" />
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default UploadPage;
