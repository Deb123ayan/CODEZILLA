import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
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
import Deliveries from "./pages/Deliveries";
import ProfileSetup from "./pages/ProfileSetup";
import DocumentVerification from "./pages/DocumentVerification";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import AdminWorkers from "./pages/AdminWorkers";
import AdminClaims from "./pages/AdminClaims";
import AdminPolicies from "./pages/AdminPolicies";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminAlerts from "./pages/AdminAlerts";
import AdminSettings from "./pages/AdminSettings";
import AdminLogin from "./pages/AdminLogin";
import BuyPlan from "./pages/BuyPlan";
import Payment from "./pages/Payment";
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

// Info Pages
import HowItWorks from "./pages/info/HowItWorks";
import CoverageZones from "./pages/info/CoverageZones";
import UpiSettlements from "./pages/info/UpiSettlements";
import HelpCenter from "./pages/info/HelpCenter";
import PrivacyPolicy from "./pages/info/PrivacyPolicy";
import IrdaiTerms from "./pages/info/IrdaiTerms";
import BankIntegrations from "./pages/info/BankIntegrations";

const queryClient = new QueryClient();

// Request geolocation permission once on first load
function useGeolocationPermission() {
  useEffect(() => {
    if (!navigator.geolocation) return;

    // Track immediately then poll every 60s
    const postLocation = async (pos: GeolocationPosition) => {
      localStorage.setItem("userLat", pos.coords.latitude.toString());
      localStorage.setItem("userLng", pos.coords.longitude.toString());
      
      const phone = sessionStorage.getItem("userPhone");
      if (phone) {
        // Reverse Geocode
        let zone = "";
        let city = "";
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
          const data = await res.json();
          zone = data.address?.suburb || data.address?.neighbourhood || data.address?.commercial || data.address?.residential || "";
          city = data.address?.city || data.address?.town || data.address?.state_district || "";
          console.log("[Zafby] Zone resolved:", zone, city);
        } catch (e) {
          console.warn("[Zafby] Geocoding failure", e);
        }

        import("@/lib/api-client").then(({ api }) => {
          api.post("/workers/location/", {
            phone: phone,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            zone: zone,
            city: city
          }).catch(() => {});
        });
      }
    };

    navigator.geolocation.getCurrentPosition(
      postLocation,
      () => {
        localStorage.setItem("geoPrompted", "1");
        console.warn("[Zafby] Location permission denied");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );

    const watchId = navigator.geolocation.watchPosition(
      postLocation,
      () => {},
      { enableHighAccuracy: true, maximumAge: 60000, timeout: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);
}

const App = () => {
  useGeolocationPermission();
  return (
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

              {/* Info Pages (Public) */}
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/coverage-zones" element={<CoverageZones />} />
              <Route path="/upi-settlements" element={<UpiSettlements />} />
              <Route path="/help-center" element={<HelpCenter />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/irdai-terms" element={<IrdaiTerms />} />
              <Route path="/bank-integrations" element={<BankIntegrations />} />

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
              <Route path="/deliveries" element={<UserGuard><Deliveries /></UserGuard>} />
              <Route path="/policies" element={<UserGuard><Policies /></UserGuard>} />
              <Route path="/claims" element={<UserGuard><Claims /></UserGuard>} />
              <Route path="/payouts" element={<UserGuard><Payouts /></UserGuard>} />
              <Route path="/notifications" element={<UserGuard><NotificationsPage /></UserGuard>} />
              <Route path="/settings" element={<UserGuard><Settings /></UserGuard>} />
              <Route path="/profile-setup" element={<UserGuard><ProfileSetup /></UserGuard>} />
              <Route path="/document-verification" element={<UserGuard><DocumentVerification /></UserGuard>} />
              <Route path="/buy-plan" element={<UserGuard><BuyPlan /></UserGuard>} />
              <Route path="/payment" element={<UserGuard><Payment /></UserGuard>} />
              <Route path="/profile" element={<UserGuard><Profile /></UserGuard>} />

              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
              <Route path="/admin/dashboard" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
              <Route path="/admin/workers" element={<AdminGuard><AdminWorkers /></AdminGuard>} />
              <Route path="/admin/claims" element={<AdminGuard><AdminClaims /></AdminGuard>} />
              <Route path="/admin/policies" element={<AdminGuard><AdminPolicies /></AdminGuard>} />
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
};

createRoot(document.getElementById("root")!).render(<App />);
