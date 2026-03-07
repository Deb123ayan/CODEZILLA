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
    login: (platform: string, username: string, phone?: string) => void;
    logout: () => void;
    platform: string;
    username: string;
    phoneNumber: string;
}

const UserAuthContext = createContext<UserAuthContextType | null>(null);

export function UserAuthProvider({ children }: { children: React.ReactNode }) {
    const [status, setStatus] = useState<UserAuthStatus>(getInitialStatus);
    const [platform, setPlatform] = useState<string>(() => sessionStorage.getItem("userPlatform") || "");
    const [username, setUsername] = useState<string>(() => sessionStorage.getItem("userUsername") || "");
    const [phoneNumber, setPhoneNumber] = useState<string>(() => sessionStorage.getItem("userPhone") || "");
    const navigate = useNavigate();

    const login = useCallback((platformVal: string, usernameVal: string, phoneVal?: string) => {
        const phone = phoneVal || "";
        sessionStorage.setItem(STORAGE_KEY, "authenticated");
        sessionStorage.setItem("userPlatform", platformVal);
        sessionStorage.setItem("userUsername", usernameVal);
        sessionStorage.setItem("userPhone", phone);
        setStatus("authenticated");
        setPlatform(platformVal);
        setUsername(usernameVal);
        setPhoneNumber(phone);
    }, []);

    const logout = useCallback(() => {
        sessionStorage.setItem(STORAGE_KEY, "logged_out");
        sessionStorage.removeItem("userPlatform");
        sessionStorage.removeItem("userUsername");
        sessionStorage.removeItem("userPhone");
        setStatus("logged_out");
        setPlatform("");
        setUsername("");
        setPhoneNumber("");
        navigate("/", { replace: true });
    }, [navigate]);

    return (
        <UserAuthContext.Provider value={{ status, login, logout, platform, username, phoneNumber }}>
            {children}
        </UserAuthContext.Provider>
    );
}

export function useUserAuth(): UserAuthContextType {
    const ctx = useContext(UserAuthContext);
    if (!ctx) throw new Error("useUserAuth must be used inside <UserAuthProvider>");
    return ctx;
}
