import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import PlatformSelection from "./pages/PlatformSelection";
import RegisterZomato from "./pages/RegisterZomato";
import RegisterBlinkit from "./pages/RegisterBlinkit";
import RegisterFlipkart from "./pages/RegisterFlipkart";
import RegisterAmazon from "./pages/RegisterAmazon";
import RegisterZepto from "./pages/RegisterZepto";
import RegisterSwiggy from "./pages/RegisterSwiggy";
import Dashboard from "./pages/Dashboard";
import Policies from "./pages/Policies";
import Claims from "./pages/Claims";
import Payouts from "./pages/Payouts";
import NotificationsPage from "./pages/Notifications";
import Settings from "./pages/Settings";
import AdminDashboard from "./pages/AdminDashboard";
import AdminWorkers from "./pages/AdminWorkers";
import AdminClaims from "./pages/AdminClaims";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminAlerts from "./pages/AdminAlerts";
import AdminSettings from "./pages/AdminSettings";
import AdminLogin from "./pages/AdminLogin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<PlatformSelection />} />

          {/* Registration Routes */}
          <Route path="/register/zomato" element={<RegisterZomato />} />
          <Route path="/register/blinkit" element={<RegisterBlinkit />} />
          <Route path="/register/flipkart" element={<RegisterFlipkart />} />
          <Route path="/register/amazon" element={<RegisterAmazon />} />
          <Route path="/register/zepto" element={<RegisterZepto />} />
          <Route path="/register/swiggy" element={<RegisterSwiggy />} />

          {/* Worker Dashboard Routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/policies" element={<Policies />} />
          <Route path="/claims" element={<Claims />} />
          <Route path="/payouts" element={<Payouts />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/settings" element={<Settings />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/workers" element={<AdminWorkers />} />
          <Route path="/admin/claims" element={<AdminClaims />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
          <Route path="/admin/alerts" element={<AdminAlerts />} />
          <Route path="/admin/settings" element={<AdminSettings />} />

          {/* Catch-all for 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
