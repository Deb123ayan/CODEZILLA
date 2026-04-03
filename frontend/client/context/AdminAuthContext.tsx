import { createContext, useContext, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api-client";
import { toast } from "sonner";

// ─── Auth Status ────────────────────────────────────────────────────────────
// "authenticated" → logged in, admin routes open
// "unauthenticated" → fresh session, never logged in → redirect to /admin/login
// "logged_out" → explicitly logged out → admin is sealed, redirect to /
type AdminAuthStatus = "authenticated" | "unauthenticated" | "logged_out";

const STORAGE_KEY = "adminAuthStatus";
const ADMIN_ACCESS_TOKEN = "adminAccessToken";
const ADMIN_REFRESH_TOKEN = "adminRefreshToken";

function getInitialStatus(): AdminAuthStatus {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored === "authenticated") return "authenticated";
    if (stored === "logged_out") return "logged_out";
    return "unauthenticated";
}

// ─── Context Shape ───────────────────────────────────────────────────────────
interface AdminAuthContextType {
    status: AdminAuthStatus;
    login: (username?: string, password?: string) => Promise<boolean>;
    logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────
export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
    const [status, setStatus] = useState<AdminAuthStatus>(getInitialStatus);
    const navigate = useNavigate();

    const login = useCallback(async (username?: string, password?: string) => {
        if (!username || !password) {
            toast.error("Please enter administrator credentials");
            return false;
        }

        try {
            // Always try the real backend first — this gets a proper JWT token
            // that the backend uses to verify admin permissions (IsAdminUser)
            const res = await api.post<any>("/token/", { username, password });
            sessionStorage.setItem(ADMIN_ACCESS_TOKEN, res.access);
            sessionStorage.setItem(ADMIN_REFRESH_TOKEN, res.refresh);
            sessionStorage.setItem(STORAGE_KEY, "authenticated");
            setStatus("authenticated");
            return true;
        } catch (error: any) {
            // Backend returned 401 → wrong credentials
            const msg: string = error.message || "";
            if (msg.includes("401") || msg.toLowerCase().includes("no active") || msg.toLowerCase().includes("unauthorized")) {
                toast.error("Invalid administrator credentials");
                return false;
            }
            // Backend is unreachable (network error) → check against .env for offline fallback
            const envEmail = import.meta.env.VITE_ADMIN_EMAIL || "admin@user.com";
            const envPassword = import.meta.env.VITE_ADMIN_PASSWORD || "admin";
            if (username === envEmail && password === envPassword) {
                // Offline mode — no JWT, but mark as authenticated so the UI works
                sessionStorage.removeItem(ADMIN_ACCESS_TOKEN);
                sessionStorage.removeItem(ADMIN_REFRESH_TOKEN);
                sessionStorage.setItem(STORAGE_KEY, "authenticated");
                setStatus("authenticated");
                toast.warning("Connected in offline mode — live data unavailable");
                return true;
            }
            toast.error(error.message || "Unable to reach authentication server");
            return false;
        }
    }, []);

    const logout = useCallback(() => {
        // Stamp session as "logged_out" so AdminGuard seals all admin routes
        sessionStorage.setItem(STORAGE_KEY, "logged_out");
        sessionStorage.removeItem(ADMIN_ACCESS_TOKEN);
        sessionStorage.removeItem(ADMIN_REFRESH_TOKEN);
        setStatus("logged_out");
        // Replace current history entry → Back button cannot return to admin
        navigate("/admin/login", { replace: true });
    }, [navigate]);

    return (
        <AdminAuthContext.Provider value={{ status, login, logout }}>
            {children}
        </AdminAuthContext.Provider>
    );
}

// ─── Hook ────────────────────────────────────────────────────────────────────
export function useAdminAuth(): AdminAuthContextType {
    const ctx = useContext(AdminAuthContext);
    if (!ctx) throw new Error("useAdminAuth must be used inside <AdminAuthProvider>");
    return ctx;
}
