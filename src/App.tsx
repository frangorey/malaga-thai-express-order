import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { OrderStatusTracker } from "@/components/OrderStatusTracker";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancelled from "./pages/PaymentCancelled";
import OrderHistory from "./pages/OrderHistory";
import AdminPanel from "./pages/AdminPanel";
import WaiterPanel from "./pages/WaiterPanel";
import MesaPanel from "./pages/MesaPanel";

const queryClient = new QueryClient();

// Set to false to restore the app
const MAINTENANCE_MODE = false;

const App = () => {
  if (MAINTENANCE_MODE) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl md:text-4xl font-bold text-foreground">
            Esta página web no está operativa
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            Disculpen las molestias
          </p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <OrderStatusTracker />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/orders" element={<OrderHistory />} />
                <Route path="/admin" element={<AdminPanel />} />
                <Route path="/waiter" element={<WaiterPanel />} />
                <Route path="/mesa/:tableNumber" element={<MesaPanel />} />
                <Route path="/payment-success" element={<PaymentSuccess />} />
                <Route path="/payment-cancelled" element={<PaymentCancelled />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
};

export default App;
