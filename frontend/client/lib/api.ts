const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem("accessToken");
    
    const headers = {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        ...((options.headers as any) || {}),
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.detail || "Something went wrong");
    }

    return response.json();
}

export const authApi = {
    login: (platform: string, partner_id: string, name: string, phone: string, email: string) => 
        apiRequest("/auth/platform/login/", {
            method: "POST",
            body: JSON.stringify({ platform, partner_id, name, phone, email }),
        }),
    
    generateOtp: (phone: string) => 
        apiRequest("/auth/otp/generate/", {
            method: "POST",
            body: JSON.stringify({ phone }),
        }),
    
    verifyOtp: (phone: string, code: string) => 
        apiRequest("/auth/otp/verify/", {
            method: "POST",
            body: JSON.stringify({ phone, code }),
        }),

    updateProfile: (phone: string, data: any) =>
        apiRequest("/auth/work-details/", {
            method: "POST",
            body: JSON.stringify({ phone, ...data }),
        }),

    finalizeOnboarding: (phone: string, data: any) =>
        apiRequest("/auth/finalize/", {
            method: "POST",
            body: JSON.stringify({ phone, ...data }),
        }),

    getMe: (phone: string) => 
        apiRequest(`/workers/me/?phone=${phone}`),
};

export const claimApi = {
    submit: (data: any) => 
        apiRequest("/claims/submit/", {
            method: "POST",
            body: JSON.stringify(data),
        }),
    
    getHistory: () => 
        apiRequest("/claims/history/"),
};

export const policyApi = {
    getStatus: (workerId: string) => 
        apiRequest(`/policy/status/?worker_id=${workerId}`),
};
