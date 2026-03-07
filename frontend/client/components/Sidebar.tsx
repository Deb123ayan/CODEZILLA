import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Shield,
  AlertCircle,
  DollarSign,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { useUserAuth } from "@/context/UserAuthContext";

interface SidebarProps {
  isAdmin?: boolean;
}

export default function Sidebar({ isAdmin = false }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const { logout: adminLogout } = useAdminAuth();
  const { logout: userLogout } = useUserAuth();

  const handleLogout = () => {
    setIsOpen(false);
    if (isAdmin) {
      // Delegate to context: stamps session as logged_out, wipes admin state, → /
      adminLogout();
    } else {
      userLogout();
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const workerLinks = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "My Policies", path: "/policies", icon: Shield },
    { label: "Claims", path: "/claims", icon: AlertCircle },
    { label: "Payouts", path: "/payouts", icon: DollarSign },
    { label: "Notifications", path: "/notifications", icon: Bell },
    { label: "Settings", path: "/settings", icon: Settings },
  ];

  const adminLinks = [
    { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
    { label: "Workers", path: "/admin/workers", icon: Shield },
    { label: "Claims", path: "/admin/claims", icon: AlertCircle },
    { label: "Analytics", path: "/admin/analytics", icon: DollarSign },
    { label: "Alerts", path: "/admin/alerts", icon: Bell },
    { label: "Settings", path: "/admin/settings", icon: Settings },
  ];

  const links = isAdmin ? adminLinks : workerLinks;

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-6 left-6 z-50 md:hidden p-3 bg-white/90 backdrop-blur-md rounded-2xl border border-gray-100/50 text-gray-900 shadow-xl transition-all active:scale-90"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 md:hidden z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen w-72 bg-white border-r border-gray-100 transition-all duration-500 ease-in-out z-30 md:relative md:translate-x-0",
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Sidebar Header */}
        <div className="p-8 border-b border-gray-50 flex items-center justify-between pl-24 md:pl-8">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center transform transition-transform group-hover:rotate-12 group-hover:scale-110 duration-300">
              <Shield className="text-white" size={22} />
            </div>
            <span className="font-black text-2xl text-gray-900 tracking-tighter">EarnLock</span>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="p-6 space-y-1.5 overflow-y-auto h-[calc(100vh-200px)] no-scrollbar">
          {links.map((link, index) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                style={{ transitionDelay: `${index * 50}ms` }}
                className={cn(
                  "flex items-center space-x-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden",
                  isActive(link.path)
                    ? "bg-black text-white shadow-lg shadow-black/10 scale-[1.02]"
                    : "text-gray-500 hover:bg-gray-50 hover:text-black hover:translate-x-1"
                )}
              >
                <Icon size={20} className={cn(
                  "transition-all duration-300",
                  isActive(link.path) ? "text-white rotate-0" : "group-hover:text-black group-hover:rotate-6"
                )} />
                <span className="font-bold tracking-tight">{link.label}</span>
                {isActive(link.path) && (
                  <div className="absolute right-4 w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-50 bg-white/80 backdrop-blur-sm">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3.5 text-gray-400 hover:bg-red-50 hover:text-red-600 rounded-2xl transition-all duration-300 group"
          >
            <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
            <span className="font-bold tracking-tight">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
