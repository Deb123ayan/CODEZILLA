import { Navigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "@/context/AdminAuthContext";

/**
 * AdminGuard — route middleware for all protected admin routes.
 *
 * ┌─────────────────┬──────────────────────────────────────┐
 * │ Auth Status     │ Behaviour                            │
 * ├─────────────────┼──────────────────────────────────────┤
 * │ authenticated   │ render children normally             │
 * │ unauthenticated │ → /admin/login  (fresh session)      │
 * │ logged_out      │ → /  (admin sealed after logout)     │
 * └─────────────────┴──────────────────────────────────────┘
 */
export default function AdminGuard({ children }: { children: React.ReactNode }) {
    const { status } = useAdminAuth();
    const location = useLocation();

    if (status === "authenticated") {
        return <>{children}</>;
    }

    if (status === "logged_out") {
        // Admin is completely sealed — send to landing page
        return <Navigate to="/" replace />;
    }

    // status === "unauthenticated" — fresh session, show login
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
}
