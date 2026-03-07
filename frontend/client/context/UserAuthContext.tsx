import { createContext, useContext, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

type UserAuthStatus = "authenticated" | "unauthenticated" | "logged_out";

const STORAGE_KEY = "userAuthStatus";

function getInitialStatus(): UserAuthStatus {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored === "authenticated") return "authenticated";
    if (stored === "logged_out") return "logged_out";
    return "unauthenticated";
}

interface UserAuthContextType {
    status: UserAuthStatus;
    login: (platform: string, username: string) => void;
    logout: () => void;
    platform: string;
    username: string;
}

const UserAuthContext = createContext<UserAuthContextType | null>(null);

export function UserAuthProvider({ children }: { children: React.ReactNode }) {
    const [status, setStatus] = useState<UserAuthStatus>(getInitialStatus);
    const [platform, setPlatform] = useState<string>(() => sessionStorage.getItem("userPlatform") || "");
    const [username, setUsername] = useState<string>(() => sessionStorage.getItem("userUsername") || "");
    const navigate = useNavigate();

    const login = useCallback((platformVal: string, usernameVal: string) => {
        sessionStorage.setItem(STORAGE_KEY, "authenticated");
        sessionStorage.setItem("userPlatform", platformVal);
        sessionStorage.setItem("userUsername", usernameVal);
        setStatus("authenticated");
        setPlatform(platformVal);
        setUsername(usernameVal);
    }, []);

    const logout = useCallback(() => {
        sessionStorage.setItem(STORAGE_KEY, "logged_out");
        sessionStorage.removeItem("userPlatform");
        sessionStorage.removeItem("userUsername");
        setStatus("logged_out");
        setPlatform("");
        setUsername("");
        navigate("/", { replace: true });
    }, [navigate]);

    return (
        <UserAuthContext.Provider value={{ status, login, logout, platform, username }}>
            {children}
        </UserAuthContext.Provider>
    );
}

export function useUserAuth(): UserAuthContextType {
    const ctx = useContext(UserAuthContext);
    if (!ctx) throw new Error("useUserAuth must be used inside <UserAuthProvider>");
    return ctx;
}
