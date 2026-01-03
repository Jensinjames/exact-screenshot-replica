import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";

// Pages
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import NewOrder from "./pages/NewOrder";
import OrderDetail from "./pages/OrderDetail";
import Customers from "./pages/Customers";
import Production from "./pages/Production";
import Inventory from "./pages/Inventory";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            
            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Dashboard />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Orders />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders/new"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <NewOrder />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders/:id"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <OrderDetail />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/customers"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Customers />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/production"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Production />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/inventory"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Inventory />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
