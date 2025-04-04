
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { useMenu } from '@/contexts/MenuContext';
import { useInventory } from '@/contexts/InventoryContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Pencil, Trash2, Plus, Search, Filter, ChevronsUpDown, Chef } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ProductsPage = () => {
  const { items, categories, addItem, updateItem, deleteItem, addCategory, updateCategory, deleteCategory } = useMenu();
  const { items: inventoryItems } = useInventory();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('products');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [sortField, setSortField] = useState<'name' | 'price'>('name');

  // Product form state
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [productFormData, setProductFormData] = useState({
    id: '',
    name: '',
    price: '',
    category: '',
    description: '',
    recipe: [] as {ingredientId: string, ingredientName: string, quantity: number, unit: string}[]
  });

  // Category form state
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false);
  const [categoryFormData, setCategoryFormData] = useState({
    id: '',
    name: ''
  });

  // Recipe dialog state
  const [isRecipeDialogOpen, setIsRecipeDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // Recipe form state
  const [recipeIngredient, setRecipeIngredient] = useState('');
  const [recipeQuantity, setRecipeQuantity] = useState('');
  const [recipeUnit, setRecipeUnit] = useState('');

  // Filter and sort products
  const filteredProducts = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === '' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortField === 'name') {
      return sortDirection === 'asc' 
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    } else {
      return sortDirection === 'asc'
        ? a.price - b.price
        : b.price - a.price;
    }
  });

  // Handle form submissions
  const handleAddProduct = () => {
    if (!productFormData.name || !productFormData.price || !productFormData.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
        duration: 1000,
      });
      return;
    }

    addItem({
      name: productFormData.name,
      price: parseFloat(productFormData.price),
      category: productFormData.category,
      description: productFormData.description,
      recipe: productFormData.recipe
    });

    setProductFormData({
      id: '',
      name: '',
      price: '',
      category: '',
      description: '',
      recipe: []
    });
    
    setIsAddProductOpen(false);
    
    toast({
      title: "Success",
      description: "Product added successfully",
      duration: 1000,
    });
  };

  const handleUpdateProduct = () => {
    if (!productFormData.name || !productFormData.price || !productFormData.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
        duration: 1000,
      });
      return;
    }

    updateItem({
      id: productFormData.id,
      name: productFormData.name,
      price: parseFloat(productFormData.price),
      category: productFormData.category,
      description: productFormData.description,
      recipe: productFormData.recipe
    });

    setProductFormData({
      id: '',
      name: '',
      price: '',
      category: '',
      description: '',
      recipe: []
    });
    
    setIsEditProductOpen(false);
    
    toast({
      title: "Success",
      description: "Product updated successfully",
      duration: 1000,
    });
  };

  const handleDeleteProduct = (id: string) => {
    deleteItem(id);
    
    toast({
      title: "Success",
      description: "Product deleted successfully",
      duration: 1000,
    });
  };

  const handleAddCategory = () => {
    if (!categoryFormData.name) {
      toast({
        title: "Error",
        description: "Please enter a category name",
        variant: "destructive",
        duration: 1000,
      });
      return;
    }

    addCategory({
      name: categoryFormData.name
    });

    setCategoryFormData({
      id: '',
      name: ''
    });
    
    setIsAddCategoryOpen(false);
    
    toast({
      title: "Success",
      description: "Category added successfully",
      duration: 1000,
    });
  };

  const handleUpdateCategory = () => {
    if (!categoryFormData.name) {
      toast({
        title: "Error",
        description: "Please enter a category name",
        variant: "destructive",
        duration: 1000,
      });
      return;
    }

    updateCategory({
      id: categoryFormData.id,
      name: categoryFormData.name
    });

    setCategoryFormData({
      id: '',
      name: ''
    });
    
    setIsEditCategoryOpen(false);
    
    toast({
      title: "Success",
      description: "Category updated successfully",
      duration: 1000,
    });
  };

  const handleDeleteCategory = (id: string) => {
    // Check if any products are using this category
    const productsInCategory = items.filter(item => item.category === id);
    
    if (productsInCategory.length > 0) {
      toast({
        title: "Error",
        description: `Cannot delete this category because ${productsInCategory.length} products are using it`,
        variant: "destructive",
        duration: 1000,
      });
      return;
    }
    
    deleteCategory(id);
    
    toast({
      title: "Success",
      description: "Category deleted successfully",
      duration: 1000,
    });
  };

  // Handle recipe management
  const openRecipeDialog = (product) => {
    setSelectedProduct(product);
    setIsRecipeDialogOpen(true);
  };

  const addRecipeItem = () => {
    if (!recipeIngredient || !recipeQuantity || !recipeUnit) {
      toast({
        title: "Error",
        description: "Please fill in all recipe fields",
        variant: "destructive",
        duration: 1000,
      });
      return;
    }

    const ingredient = inventoryItems.find(item => item.id === recipeIngredient);
    
    if (!ingredient) {
      toast({
        title: "Error",
        description: "Invalid ingredient selected",
        variant: "destructive",
        duration: 1000,
      });
      return;
    }

    const quantity = parseFloat(recipeQuantity);
    
    if (isNaN(quantity) || quantity <= 0) {
      toast({
        title: "Error",
        description: "Quantity must be a positive number",
        variant: "destructive",
        duration: 1000,
      });
      return;
    }

    const newRecipeItem = {
      ingredientId: ingredient.id,
      ingredientName: ingredient.name,
      quantity,
      unit: recipeUnit
    };

    const updatedProduct = {
      ...selectedProduct,
      recipe: selectedProduct.recipe ? [...selectedProduct.recipe, newRecipeItem] : [newRecipeItem]
    };

    updateItem(updatedProduct);
    setSelectedProduct(updatedProduct);

    // Reset form
    setRecipeIngredient('');
    setRecipeQuantity('');
    setRecipeUnit('');

    toast({
      title: "Success",
      description: "Ingredient added to recipe",
      duration: 1000,
    });
  };

  const removeRecipeItem = (index) => {
    if (!selectedProduct || !selectedProduct.recipe) return;

    const updatedRecipe = [...selectedProduct.recipe];
    updatedRecipe.splice(index, 1);

    const updatedProduct = {
      ...selectedProduct,
      recipe: updatedRecipe
    };

    updateItem(updatedProduct);
    setSelectedProduct(updatedProduct);

    toast({
      title: "Success",
      description: "Ingredient removed from recipe",
      duration: 1000,
    });
  };

  return (
    <Layout title="Products Management">
      <div className="p-4 max-w-7xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <TabsList>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
            </TabsList>
            
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              {activeTab === 'products' && (
                <>
                  <div className="relative flex-grow">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Search products..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <div className="flex items-center">
                        <Filter className="mr-2 h-4 w-4" />
                        {categoryFilter
                          ? categories.find(c => c.id === categoryFilter)?.name || 'All Categories'
                          : 'All Categories'}
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-mir-red hover:bg-mir-red/90">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Product
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Product</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <label htmlFor="name" className="text-sm font-medium">
                            Product Name
                          </label>
                          <Input
                            id="name"
                            value={productFormData.name}
                            onChange={(e) => setProductFormData({...productFormData, name: e.target.value})}
                            placeholder="Enter product name"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label htmlFor="price" className="text-sm font-medium">
                            Price
                          </label>
                          <Input
                            id="price"
                            type="number"
                            min="0"
                            step="0.01"
                            value={productFormData.price}
                            onChange={(e) => setProductFormData({...productFormData, price: e.target.value})}
                            placeholder="Enter price"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label htmlFor="category" className="text-sm font-medium">
                            Category
                          </label>
                          <Select
                            value={productFormData.category}
                            onValueChange={(value) => setProductFormData({...productFormData, category: value})}
                          >
                            <SelectTrigger id="category">
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <label htmlFor="description" className="text-sm font-medium">
                            Description (optional)
                          </label>
                          <Textarea
                            id="description"
                            value={productFormData.description}
                            onChange={(e) => setProductFormData({...productFormData, description: e.target.value})}
                            placeholder="Enter product description"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddProductOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddProduct}>
                          Add Product
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </>
              )}
              
              {activeTab === 'categories' && (
                <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-mir-red hover:bg-mir-red/90">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Category
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Category</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium">
                          Category Name
                        </label>
                        <Input
                          id="name"
                          value={categoryFormData.name}
                          onChange={(e) => setCategoryFormData({...categoryFormData, name: e.target.value})}
                          placeholder="Enter category name"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddCategoryOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddCategory}>
                        Add Category
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
          
          <TabsContent value="products">
            <Card>
              <CardHeader className="p-4">
                <CardTitle>Products List</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead 
                        className="w-[300px] cursor-pointer"
                        onClick={() => {
                          setSortField('name');
                          setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                        }}
                      >
                        <div className="flex items-center">
                          Name
                          {sortField === 'name' && (
                            <ChevronsUpDown className="ml-1 h-4 w-4" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer"
                        onClick={() => {
                          setSortField('price');
                          setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                        }}
                      >
                        <div className="flex items-center">
                          Price
                          {sortField === 'price' && (
                            <ChevronsUpDown className="ml-1 h-4 w-4" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedProducts.length > 0 ? (
                      sortedProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>₹{product.price.toFixed(2)}</TableCell>
                          <TableCell>
                            {categories.find(c => c.id === product.category)?.name || 'Unknown'}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                title="Edit Product"
                                onClick={() => {
                                  setProductFormData({
                                    id: product.id,
                                    name: product.name,
                                    price: product.price.toString(),
                                    category: product.category,
                                    description: product.description || '',
                                    recipe: product.recipe || []
                                  });
                                  setIsEditProductOpen(true);
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                title="Manage Recipe"
                                onClick={() => openRecipeDialog(product)}
                              >
                                <Chef className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                title="Delete Product"
                                onClick={() => handleDeleteProduct(product.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">
                          {searchQuery || categoryFilter
                            ? "No products match your search criteria"
                            : "No products found. Add a product to get started."}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="categories">
            <Card>
              <CardHeader className="p-4">
                <CardTitle>Categories List</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">Name</TableHead>
                      <TableHead>Products</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.length > 0 ? (
                      categories.map((category) => (
                        <TableRow key={category.id}>
                          <TableCell className="font-medium">{category.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {items.filter(item => item.category === category.id).length}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                title="Edit Category"
                                onClick={() => {
                                  setCategoryFormData({
                                    id: category.id,
                                    name: category.name
                                  });
                                  setIsEditCategoryOpen(true);
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                title="Delete Category"
                                onClick={() => handleDeleteCategory(category.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center">
                          No categories found. Add a category to get started.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Product Dialog */}
      <Dialog open={isEditProductOpen} onOpenChange={setIsEditProductOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="edit-name" className="text-sm font-medium">
                Product Name
              </label>
              <Input
                id="edit-name"
                value={productFormData.name}
                onChange={(e) => setProductFormData({...productFormData, name: e.target.value})}
                placeholder="Enter product name"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="edit-price" className="text-sm font-medium">
                Price
              </label>
              <Input
                id="edit-price"
                type="number"
                min="0"
                step="0.01"
                value={productFormData.price}
                onChange={(e) => setProductFormData({...productFormData, price: e.target.value})}
                placeholder="Enter price"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="edit-category" className="text-sm font-medium">
                Category
              </label>
              <Select
                value={productFormData.category}
                onValueChange={(value) => setProductFormData({...productFormData, category: value})}
              >
                <SelectTrigger id="edit-category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="edit-description" className="text-sm font-medium">
                Description (optional)
              </label>
              <Textarea
                id="edit-description"
                value={productFormData.description}
                onChange={(e) => setProductFormData({...productFormData, description: e.target.value})}
                placeholder="Enter product description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditProductOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateProduct}>
              Update Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={isEditCategoryOpen} onOpenChange={setIsEditCategoryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="edit-category-name" className="text-sm font-medium">
                Category Name
              </label>
              <Input
                id="edit-category-name"
                value={categoryFormData.name}
                onChange={(e) => setCategoryFormData({...categoryFormData, name: e.target.value})}
                placeholder="Enter category name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditCategoryOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateCategory}>
              Update Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Recipe Dialog */}
      <Dialog open={isRecipeDialogOpen} onOpenChange={setIsRecipeDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Chef className="mr-2 h-5 w-5" />
              {selectedProduct ? `Recipe for ${selectedProduct.name}` : 'Recipe'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Current Recipe Items */}
            {selectedProduct && selectedProduct.recipe && selectedProduct.recipe.length > 0 ? (
              <div>
                <h3 className="text-sm font-medium mb-2">Current Recipe</h3>
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ingredient</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedProduct.recipe.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.ingredientName}</TableCell>
                          <TableCell>{item.quantity} {item.unit}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeRecipeItem(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : (
              <div className="text-center py-2 text-sm text-mir-gray-dark">
                No ingredients added to this recipe yet.
              </div>
            )}
            
            {/* Add New Ingredient */}
            <div>
              <h3 className="text-sm font-medium mb-2">Add Ingredient</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="recipeIngredient" className="text-sm mb-1 block">
                    Ingredient
                  </label>
                  <Select
                    value={recipeIngredient}
                    onValueChange={setRecipeIngredient}
                  >
                    <SelectTrigger id="recipeIngredient">
                      <SelectValue placeholder="Select ingredient" />
                    </SelectTrigger>
                    <SelectContent>
                      {inventoryItems.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label htmlFor="recipeQuantity" className="text-sm mb-1 block">
                    Quantity
                  </label>
                  <Input
                    id="recipeQuantity"
                    type="number"
                    min="0.001"
                    step="0.001"
                    value={recipeQuantity}
                    onChange={(e) => setRecipeQuantity(e.target.value)}
                    placeholder="Amount"
                  />
                </div>
                
                <div>
                  <label htmlFor="recipeUnit" className="text-sm mb-1 block">
                    Unit
                  </label>
                  <Select
                    value={recipeUnit}
                    onValueChange={setRecipeUnit}
                  >
                    <SelectTrigger id="recipeUnit">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="g">g</SelectItem>
                      <SelectItem value="liter">liter</SelectItem>
                      <SelectItem value="ml">ml</SelectItem>
                      <SelectItem value="pcs">pcs</SelectItem>
                      <SelectItem value="tbsp">tbsp</SelectItem>
                      <SelectItem value="tsp">tsp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button className="mt-4 w-full" onClick={addRecipeItem}>
                Add to Recipe
              </Button>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRecipeDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default ProductsPage;
