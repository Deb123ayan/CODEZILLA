import { Link, useLocation } from "react-router-dom";
import { Home, LayoutGrid, Shield, CreditCard, User } from "lucide-react";
import { cn } from "@/lib/utils";

const mobileNavItems = [
  { name: "Home",     href: "/dashboard",  Icon: Home },
  { name: "Tasks",    href: "/deliveries", Icon: LayoutGrid },
  { name: "Plans",    href: "/policies",   Icon: Shield },
  { name: "Earnings", href: "/payouts",    Icon: CreditCard },
  { name: "Profile",  href: "/profile",    Icon: User },
];

export default function MobileBottomNav() {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 bg-[#ffffff]/90 backdrop-blur-xl shadow-[0_-10px_30px_rgba(27,28,27,0.06)] rounded-t-[2.5rem] border-t border-[#e4e2e0]/40 px-4 py-4 pb-7">
      <div className="flex justify-around items-center max-w-sm mx-auto">
        {mobileNavItems.map(({ name, href, Icon }) => {
          const isActive = location.pathname === href;
          return (
            <Link
              key={name}
              to={href}
              className={cn(
                "flex flex-col items-center justify-center px-3 py-2 rounded-2xl transition-all",
                isActive
                  ? "bg-gradient-to-br from-[#004191] to-[#0058be] text-white shadow-md"
                  : "text-[#434751] hover:text-[#004191]"
              )}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className="font-inter text-[9px] font-bold tracking-[0.05em] uppercase mt-1">
                {name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
