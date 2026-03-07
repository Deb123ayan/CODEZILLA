import { Navigate, useLocation } from "react-router-dom";
import { useUserAuth } from "@/context/UserAuthContext";

export default function UserGuard({ children }: { children: React.ReactNode }) {
    const { status } = useUserAuth();
    const location = useLocation();

    if (status === "authenticated") {
        return <>{children}</>;
    }

    if (status === "logged_out") {
        return <Navigate to="/" replace />;
    }

    return <Navigate to="/login" state={{ from: location }} replace />;
}
