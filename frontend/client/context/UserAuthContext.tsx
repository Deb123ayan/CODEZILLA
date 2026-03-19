import { createContext, useContext, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api-client";
import { toast } from "sonner";

type UserAuthStatus = "authenticated" | "unauthenticated" | "logged_out";

const STORAGE_KEY = "userAuthStatus";
const ACCESS_TOKEN = "accessToken";
const REFRESH_TOKEN = "refreshToken";

function getInitialStatus(): UserAuthStatus {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored === "authenticated") return "authenticated";
    if (stored === "logged_out") return "logged_out";
    return "unauthenticated";
}

interface UserAuthContextType {
    status: UserAuthStatus;
    login: (platform: string, username: string, gmail: string, phone: string, platformId: string, workerId: string) => void;
    platformLogin: (platform: string, partner_id: string, name: string, phone: string, email: string) => Promise<boolean>;
    generateOTP: (phone: string) => Promise<{ success: boolean; message: string }>;
    verifyOTP: (phone: string, code: string) => Promise<{ success: boolean; data?: any }>;
    logout: () => void;
    platform: string;
    username: string;
    phoneNumber: string;
    gmail: string;
    platformId: string;
    workerId: string;
}

const UserAuthContext = createContext<UserAuthContextType | null>(null);

export function UserAuthProvider({ children }: { children: React.ReactNode }) {
    const [status, setStatus] = useState<UserAuthStatus>(getInitialStatus);
    const [platform, setPlatform] = useState<string>(() => sessionStorage.getItem("userPlatform") || "");
    const [username, setUsername] = useState<string>(() => sessionStorage.getItem("userUsername") || "");
    const [phoneNumber, setPhoneNumber] = useState<string>(() => sessionStorage.getItem("userPhone") || "");
    const [gmail, setGmail] = useState<string>(() => sessionStorage.getItem("userGmail") || "");
    const [platformId, setPlatformId] = useState<string>(() => sessionStorage.getItem("userPlatformId") || "");
    const [workerId, setWorkerId] = useState<string>(() => sessionStorage.getItem("workerId") || "");
    const navigate = useNavigate();

    const login = useCallback((platformVal: string, usernameVal: string, gmailVal: string, phoneVal: string, platformIdVal: string, workerIdVal: string) => {
        sessionStorage.setItem(STORAGE_KEY, "authenticated");
        sessionStorage.setItem("userPlatform", platformVal);
        sessionStorage.setItem("userUsername", usernameVal);
        sessionStorage.setItem("userGmail", gmailVal);
        sessionStorage.setItem("userPhone", phoneVal);
        sessionStorage.setItem("userPlatformId", platformIdVal);
        sessionStorage.setItem("workerId", workerIdVal);
        
        setStatus("authenticated");
        setPlatform(platformVal);
        setUsername(usernameVal);
        setGmail(gmailVal);
        setPhoneNumber(phoneVal);
        setPlatformId(platformIdVal);
        setWorkerId(workerIdVal);
    }, []);

    const platformLogin = useCallback(async (platform: string, partner_id: string, name: string, phone: string, email: string) => {
        try {
            const res = await api.post<any>("/auth/platform/login/", {
                platform, partner_id, name, phone, email
            });
            sessionStorage.setItem(ACCESS_TOKEN, res.access);
            sessionStorage.setItem(REFRESH_TOKEN, res.refresh);
            
            login(platform, name, email, phone, partner_id, res.worker_id);
            return true;
        } catch (error: any) {
            toast.error(error.message || "Platform synchronization failed");
            return false;
        }
    }, [login]);

    const generateOTP = async (phone: string) => {
        try {
            const res = await api.post<{ message: string; code?: string }>("/auth/otp/generate/", { phone });
            // In a real app, code wouldn't be returned, it would go to SMS/WhatsApp
            if (res.code) {
                toast.info(`Dev Mode: Your OTP is ${res.code}`);
            }
            return { success: true, message: res.message };
        } catch (error: any) {
            toast.error(error.message || "Failed to generate OTP");
            return { success: false, message: error.message };
        }
    };

    const verifyOTP = async (phone: string, code: string) => {
        try {
            const res = await api.post<any>("/auth/otp/verify/", { phone, code });
            sessionStorage.setItem(ACCESS_TOKEN, res.access);
            sessionStorage.setItem(REFRESH_TOKEN, res.refresh);
            
            // If user is existing, we might get worker data back
            if (!res.is_new_user && res.worker) {
                const w = res.worker;
                login(w.platform, w.name, w.email, phone, w.partner_id, w.id);
            }
            
            return { success: true, data: res };
        } catch (error: any) {
            toast.error(error.message || "Invalid OTP");
            return { success: false };
        }
    };

    const logout = useCallback(() => {
        sessionStorage.setItem(STORAGE_KEY, "logged_out");
        sessionStorage.removeItem("userPlatform");
        sessionStorage.removeItem("userUsername");
        sessionStorage.removeItem("userGmail");
        sessionStorage.removeItem("userPhone");
        sessionStorage.removeItem("userPlatformId");
        sessionStorage.removeItem("workerId");
        sessionStorage.removeItem(ACCESS_TOKEN);
        sessionStorage.removeItem(REFRESH_TOKEN);
        
        setStatus("logged_out");
        setPlatform("");
        setUsername("");
        setGmail("");
        setPhoneNumber("");
        setPlatformId("");
        setWorkerId("");
        navigate("/", { replace: true });
    }, [navigate]);

    return (
        <UserAuthContext.Provider value={{ status, login, platformLogin, generateOTP, verifyOTP, logout, platform, username, phoneNumber, gmail, platformId, workerId }}>
            {children}
        </UserAuthContext.Provider>
    );
}

export function useUserAuth(): UserAuthContextType {
    const ctx = useContext(UserAuthContext);
    if (!ctx) throw new Error("useUserAuth must be used inside <UserAuthProvider>");
    return ctx;
}
