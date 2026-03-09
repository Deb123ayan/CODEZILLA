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
import ProfileSetup from "./pages/ProfileSetup";
import DocumentVerification from "./pages/DocumentVerification";
import AdminDashboard from "./pages/AdminDashboard";
import AdminWorkers from "./pages/AdminWorkers";
import AdminClaims from "./pages/AdminClaims";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminAlerts from "./pages/AdminAlerts";
import AdminSettings from "./pages/AdminSettings";
import AdminLogin from "./pages/AdminLogin";
import BuyPlan from "./pages/BuyPlan";
import Tracking from "./pages/features/Tracking";
import WeatherAI from "./pages/features/WeatherAI";
import Traffic from "./pages/features/Traffic";
import ZeroClickClaims from "./pages/features/ZeroClickClaims";
import FraudProtection from "./pages/features/FraudProtection";
import MobileOptimized from "./pages/features/MobileOptimized";
import RiskPredictor from "./pages/RiskPredictor";
import AdminGuard from "./components/AdminGuard";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import UserGuard from "./components/UserGuard";
import { UserAuthProvider } from "./context/UserAuthContext";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AdminAuthProvider>
          <UserAuthProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<PlatformSelection />} />

              {/* Feature Pages (Public) */}
              <Route path="/features/tracking" element={<Tracking />} />
              <Route path="/features/weather-ai" element={<WeatherAI />} />
              <Route path="/features/traffic" element={<Traffic />} />
              <Route path="/features/claims" element={<ZeroClickClaims />} />
              <Route path="/features/fraud" element={<FraudProtection />} />
              <Route path="/features/mobile" element={<MobileOptimized />} />
              <Route path="/risk-predictor" element={<RiskPredictor />} />

              {/* Registration Routes */}
              <Route path="/register/zomato" element={<RegisterZomato />} />
              <Route path="/register/blinkit" element={<RegisterBlinkit />} />
              <Route path="/register/flipkart" element={<RegisterFlipkart />} />
              <Route path="/register/amazon" element={<RegisterAmazon />} />
              <Route path="/register/zepto" element={<RegisterZepto />} />
              <Route path="/register/swiggy" element={<RegisterSwiggy />} />

              {/* Worker Dashboard Routes */}
              <Route path="/dashboard" element={<UserGuard><Dashboard /></UserGuard>} />
              <Route path="/policies" element={<UserGuard><Policies /></UserGuard>} />
              <Route path="/claims" element={<UserGuard><Claims /></UserGuard>} />
              <Route path="/payouts" element={<UserGuard><Payouts /></UserGuard>} />
              <Route path="/notifications" element={<UserGuard><NotificationsPage /></UserGuard>} />
              <Route path="/settings" element={<UserGuard><Settings /></UserGuard>} />
              <Route path="/profile-setup" element={<UserGuard><ProfileSetup /></UserGuard>} />
              <Route path="/document-verification" element={<UserGuard><DocumentVerification /></UserGuard>} />
              <Route path="/buy-plan" element={<UserGuard><BuyPlan /></UserGuard>} />

              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
              <Route path="/admin/workers" element={<AdminGuard><AdminWorkers /></AdminGuard>} />
              <Route path="/admin/claims" element={<AdminGuard><AdminClaims /></AdminGuard>} />
              <Route path="/admin/analytics" element={<AdminGuard><AdminAnalytics /></AdminGuard>} />
              <Route path="/admin/alerts" element={<AdminGuard><AdminAlerts /></AdminGuard>} />
              <Route path="/admin/settings" element={<AdminGuard><AdminSettings /></AdminGuard>} />

              {/* Catch-all for 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </UserAuthProvider>
        </AdminAuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
