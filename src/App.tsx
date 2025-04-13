
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NotFound from "./pages/NotFound";

// Context Providers
import { AuthProvider } from "./contexts/AuthContext";
import { AttendanceProvider } from "./contexts/AttendanceContext";
import { MenuProvider } from "./contexts/MenuContext";
import { InventoryProvider } from "./contexts/InventoryContext";
import { CustomerProvider } from "./contexts/CustomerContext";
import { CartProvider } from "./contexts/CartContext";
import { OrderProvider } from "./contexts/OrderContext";

// Pages
import HomePage from "./pages/HomePage";
import POSPage from "./pages/POS/POSPage";
import CartPage from "./pages/POS/CartPage";
import OrderPage from "./pages/POS/OrderPage";
import ViewOrderPage from "./pages/POS/ViewOrderPage";
import PurchasesPage from "./pages/Purchases/PurchasesPage";
import AddPurchasePage from "./pages/Purchases/AddPurchasePage";
import InventoryPage from "./pages/Inventory/InventoryPage";
import InventoryDetailPage from "./pages/Inventory/InventoryDetailPage";
import AddInventoryPage from "./pages/Inventory/AddInventoryPage";
import AttendancePage from "./pages/Attendance/AttendancePage";
import CashDrawerPage from "./pages/CashDrawer/CashDrawerPage";
import DashboardPage from "./pages/Dashboard/DashboardPage";
import UploadPage from "./pages/Upload/UploadPage";
import StaffManagementPage from "./pages/StaffManagement/StaffManagementPage";
import SettingsPage from "./pages/Settings/SettingsPage";
import ReceiptsPage from "./pages/Receipts/ReceiptsPage";
import CustomersPage from "./pages/Customers/CustomersPage";
import ProductsPage from "./pages/Products/ProductsPage";
import ResetPasswordPage from "./pages/ResetPassword/ResetPasswordPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
});

// Ensuring correct provider nesting order to avoid dependency issues
const App = () => (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MenuProvider>
          <InventoryProvider>
            <AttendanceProvider>
              <CustomerProvider>
                <OrderProvider>
                  <CartProvider>
                    <TooltipProvider>
                      <Toaster />
                      <Sonner />
                      <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/pos" element={<POSPage />} />
                        <Route path="/pos/cart" element={<CartPage />} />
                        <Route path="/pos/order" element={<OrderPage />} />
                        <Route path="/pos/view-order/:id" element={<ViewOrderPage />} />
                        <Route path="/receipts" element={<ReceiptsPage />} />
                        <Route path="/customers" element={<CustomersPage />} />
                        <Route path="/purchases" element={<PurchasesPage />} />
                        <Route path="/purchases/add" element={<AddPurchasePage />} />
                        <Route path="/inventory" element={<InventoryPage />} />
                        <Route path="/inventory/:id" element={<InventoryDetailPage />} />
                        <Route path="/inventory/add" element={<AddInventoryPage />} />
                        <Route path="/products" element={<ProductsPage />} />
                        <Route path="/attendance" element={<AttendancePage />} />
                        <Route path="/cash-drawer" element={<CashDrawerPage />} />
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/upload" element={<UploadPage />} />
                        <Route path="/settings" element={<SettingsPage />} />
                        <Route path="/staff-management" element={<StaffManagementPage />} />
                        <Route path="/reset-password" element={<ResetPasswordPage />} />
                        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </TooltipProvider>
                  </CartProvider>
                </OrderProvider>
              </CustomerProvider>
            </AttendanceProvider>
          </InventoryProvider>
        </MenuProvider>
      </AuthProvider>
    </QueryClientProvider>
  </BrowserRouter>
);

export default App;
