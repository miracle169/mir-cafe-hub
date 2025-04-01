
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NotFound from "./pages/NotFound";

// Context Providers
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { CustomerProvider } from "./contexts/CustomerContext";
import { InventoryProvider } from "./contexts/InventoryContext";
import { MenuProvider } from "./contexts/MenuContext";
import { OrderProvider } from "./contexts/OrderContext";
import { AttendanceProvider } from "./contexts/AttendanceContext";

// Pages
import HomePage from "./pages/HomePage";
import POSPage from "./pages/POS/POSPage";
import CartPage from "./pages/POS/CartPage";
import OrderPage from "./pages/POS/OrderPage";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <MenuProvider>
        <InventoryProvider>
          <CustomerProvider>
            <CartProvider>
              <OrderProvider>
                <AttendanceProvider>
                  <TooltipProvider>
                    <Toaster />
                    <Sonner />
                    <BrowserRouter>
                      <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/pos" element={<POSPage />} />
                        <Route path="/pos/cart" element={<CartPage />} />
                        <Route path="/pos/order" element={<OrderPage />} />
                        <Route path="/purchases" element={<PurchasesPage />} />
                        <Route path="/purchases/add" element={<AddPurchasePage />} />
                        <Route path="/inventory" element={<InventoryPage />} />
                        <Route path="/inventory/:id" element={<InventoryDetailPage />} />
                        <Route path="/inventory/add" element={<AddInventoryPage />} />
                        <Route path="/attendance" element={<AttendancePage />} />
                        <Route path="/cash-drawer" element={<CashDrawerPage />} />
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/upload" element={<UploadPage />} />
                        <Route path="/staff-management" element={<StaffManagementPage />} />
                        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </BrowserRouter>
                  </TooltipProvider>
                </AttendanceProvider>
              </OrderProvider>
            </CartProvider>
          </CustomerProvider>
        </InventoryProvider>
      </MenuProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
