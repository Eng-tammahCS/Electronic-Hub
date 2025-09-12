import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LoginPage } from "@/pages/auth/LoginPage";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { POSPage } from "./pages/pos/POSPage";
import { SalesInvoicesPage } from "./pages/sales/SalesInvoicesPage";
import { ProductsPage } from "./pages/inventory/ProductsPage";
import { ReturnsPage } from "./pages/returns/ReturnsPage";
import { InventoryDashboard } from "./pages/inventory/InventoryDashboard";
import { CategoriesPage } from "./pages/inventory/CategoriesPage";
import { PurchaseInvoicesPage } from "./pages/purchases/PurchaseInvoicesPage";
import { SuppliersPage } from "./pages/suppliers/SuppliersPage";
import { ExpensesPage } from "./pages/expenses/ExpensesPage";
import { ReportsPage } from "./pages/reports/ReportsPage";
import { UsersPage } from "./pages/users/UsersPage";
import { SettingsPage } from "./pages/settings/SettingsPage";
import { AuditPage } from "./pages/audit/AuditPage";
import { CustomersPage } from "./pages/CustomersPage";
import PredictionsPage from "./pages/Predictions";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on 401 errors
        if (error?.status === 401) {
          return false;
        }
        return failureCount < 2; // Reduce retries
      },
      refetchOnWindowFocus: false, // Disable refetch on window focus
    },
    mutations: {
      retry: false, // Disable mutation retries
    },
  },
});

// Protected Route Component
function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode, requiredRole?: string }) {
  const { user, isLoading } = useAuth();
  
  console.log('ProtectedRoute: user =', user);
  console.log('ProtectedRoute: isLoading =', isLoading);
  
  if (isLoading) {
    console.log('ProtectedRoute: إظهار شاشة التحميل');
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user) {
    console.log('ProtectedRoute: لا يوجد مستخدم، إعادة توجيه إلى /login');
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && user.roleName?.toLowerCase() !== requiredRole.toLowerCase()) {
    console.log(`ProtectedRoute: المستخدم ليس لديه الإذن الكافي (${requiredRole})، إعادة توجيه إلى /`);
    return <Navigate to="/" replace />;
  }
  
  console.log('ProtectedRoute: مستخدم موثق، إظهار المحتوى');
  return <DashboardLayout>{children}</DashboardLayout>;
}

// App Routes Component - This must be inside AuthProvider
function AppRoutes() {
  const { user } = useAuth();
  
  console.log('AppRoutes: المستخدم الحالي =', user);
  console.log('AppRoutes: roleName =', user?.roleName);
  console.log('AppRoutes: المسار الحالي =', window.location.pathname);
  
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      {/* Simplified root route - direct redirect without ProtectedRoute wrapper */}
      <Route path="/" element={
        user?.roleName?.toLowerCase() === 'admin' ? <Navigate to="/dashboard" replace /> : 
        user?.roleName?.toLowerCase() === 'cashier' ? <Navigate to="/pos" replace /> :
        <Navigate to="/login" replace />
      } />
      
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Index />
        </ProtectedRoute>
      } />
      
      <Route path="/pos" element={
        <ProtectedRoute>
          <POSPage />
        </ProtectedRoute>
      } />

      <Route path="/sales/invoices" element={
        <ProtectedRoute>
          <SalesInvoicesPage />
        </ProtectedRoute>
      } />

      <Route path="/inventory/products" element={
        <ProtectedRoute>
          <ProductsPage />
        </ProtectedRoute>
      } />

      <Route path="/returns" element={
        <ProtectedRoute>
          <ReturnsPage />
        </ProtectedRoute>
      } />

      <Route path="/inventory/dashboard" element={
        <ProtectedRoute>
          <InventoryDashboard />
        </ProtectedRoute>
      } />

      <Route path="/categories" element={
        <ProtectedRoute>
          <CategoriesPage />
        </ProtectedRoute>
      } />

      <Route path="/purchase-invoices" element={
        <ProtectedRoute>
          <PurchaseInvoicesPage />
        </ProtectedRoute>
      } />


      <Route path="/suppliers" element={
        <ProtectedRoute>
          <SuppliersPage />
        </ProtectedRoute>
      } />

      <Route path="/expenses" element={
        <ProtectedRoute>
          <ExpensesPage />
        </ProtectedRoute>
      } />

      <Route path="/reports" element={
        <ProtectedRoute requiredRole="admin">
          <ReportsPage />
        </ProtectedRoute>
      } />

      <Route path="/users" element={
        <ProtectedRoute requiredRole="admin">
          <UsersPage />
        </ProtectedRoute>
      } />

      <Route path="/settings" element={
        <ProtectedRoute requiredRole="admin">
          <SettingsPage />
        </ProtectedRoute>
      } />

      <Route path="/audit" element={
        <ProtectedRoute requiredRole="admin">
          <AuditPage />
        </ProtectedRoute>
      } />

      <Route path="/customers" element={
        <ProtectedRoute>
          <CustomersPage />
        </ProtectedRoute>
      } />

      <Route path="/predictions" element={
        <ProtectedRoute requiredRole="admin">
          <PredictionsPage />
        </ProtectedRoute>
      } />
      
      {/* Catch-all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="store-ui-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;