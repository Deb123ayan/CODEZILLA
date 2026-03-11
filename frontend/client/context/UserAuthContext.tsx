import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "@/lib/api";
import { toast } from "sonner";

type UserAuthStatus = "authenticated" | "unauthenticated" | "logged_out" | "loading";

const STORAGE_KEY = "userAuthStatus";

function getInitialStatus(): UserAuthStatus {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored === "authenticated") return "authenticated";
    if (stored === "logged_out") return "logged_out";
    return "unauthenticated";
}

interface UserAuthContextType {
    status: UserAuthStatus;
    login: (platform: string, username: string, gmail: string, phone: string, platformId: string) => Promise<void>;
    logout: () => void;
    platform: string;
    username: string;
    phoneNumber: string;
    gmail: string;
    platformId: string;
    updateUserInfo: (data: { username?: string, gmail?: string, phoneNumber?: string }) => void;
}

const UserAuthContext = createContext<UserAuthContextType | null>(null);

export function UserAuthProvider({ children }: { children: React.ReactNode }) {
    const [status, setStatus] = useState<UserAuthStatus>(getInitialStatus);
    const [platform, setPlatform] = useState<string>(() => sessionStorage.getItem("userPlatform") || "");
    const [username, setUsername] = useState<string>(() => sessionStorage.getItem("userUsername") || "");
    const [phoneNumber, setPhoneNumber] = useState<string>(() => sessionStorage.getItem("userPhone") || "");
    const [gmail, setGmail] = useState<string>(() => sessionStorage.getItem("userGmail") || "");
    const [platformId, setPlatformId] = useState<string>(() => sessionStorage.getItem("userPlatformId") || "");
    const navigate = useNavigate();

    const login = useCallback(async (platformVal: string, usernameVal: string, gmailVal: string, phoneVal: string, platformIdVal: string) => {
        setStatus("loading");
        try {
            const response = await authApi.login(
                platformVal,
                platformIdVal,
                usernameVal,
                phoneVal,
                gmailVal
            );

            // Save tokens
            localStorage.setItem("accessToken", response.access);
            localStorage.setItem("refreshToken", response.refresh);

            sessionStorage.setItem(STORAGE_KEY, "authenticated");
            sessionStorage.setItem("userPlatform", platformVal);
            sessionStorage.setItem("userUsername", usernameVal);
            sessionStorage.setItem("userGmail", gmailVal);
            sessionStorage.setItem("userPhone", phoneVal);
            sessionStorage.setItem("userPlatformId", platformIdVal);
            
            setStatus("authenticated");
            setPlatform(platformVal);
            setUsername(usernameVal);
            setGmail(gmailVal);
            setPhoneNumber(phoneVal);
            setPlatformId(platformIdVal);
            
            toast.success(`Welcome back! Logged in via ${platformVal}`);
        } catch (error: any) {
            setStatus("unauthenticated");
            toast.error(error.message || "Login failed");
            throw error;
        }
    }, []);

    const logout = useCallback(() => {
        sessionStorage.setItem(STORAGE_KEY, "logged_out");
        sessionStorage.removeItem("userPlatform");
        sessionStorage.removeItem("userUsername");
        sessionStorage.removeItem("userGmail");
        sessionStorage.removeItem("userPhone");
        sessionStorage.removeItem("userPlatformId");
        
        setStatus("logged_out");
        setPlatform("");
        setUsername("");
        setGmail("");
        setPhoneNumber("");
        setPlatformId("");
        navigate("/", { replace: true });
    }, [navigate]);

    const updateUserInfo = useCallback((data: { username?: string, gmail?: string, phoneNumber?: string }) => {
        if (data.username) {
            setUsername(data.username);
            sessionStorage.setItem("userUsername", data.username);
        }
        if (data.gmail) {
            setGmail(data.gmail);
            sessionStorage.setItem("userGmail", data.gmail);
        }
        if (data.phoneNumber) {
            setPhoneNumber(data.phoneNumber);
            sessionStorage.setItem("userPhone", data.phoneNumber);
        }
    }, []);

    return (
        <UserAuthContext.Provider value={{ status, login, logout, platform, username, phoneNumber, gmail, platformId, updateUserInfo }}>
            {children}
        </UserAuthContext.Provider>
    );
}

export function useUserAuth(): UserAuthContextType {
    const ctx = useContext(UserAuthContext);
    if (!ctx) throw new Error("useUserAuth must be used inside <UserAuthProvider>");
    return ctx;
}
