export const API_BASE_URL = "http://localhost:8000/api";

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;
  
  const token = typeof window !== "undefined" ? sessionStorage.getItem("accessToken") : null;
  
  const isFormData = options.body instanceof FormData;
  
  const headers: Record<string, string> = {
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> || {}),
  };

  if (!isFormData && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || errorData.detail || "API request failed");
  }

  return response.json();
}

export const api = {
  get: <T>(endpoint: string, options: RequestInit = {}) => 
    apiFetch<T>(endpoint, { ...options, method: "GET" }),
    
  post: <T>(endpoint: string, data: any, options: RequestInit = {}) => 
    apiFetch<T>(endpoint, { 
      ...options, 
      method: "POST", 
      body: data instanceof FormData ? data : JSON.stringify(data) 
    }),
    
  put: <T>(endpoint: string, data: any, options: RequestInit = {}) => 
    apiFetch<T>(endpoint, { 
      ...options, 
      method: "PUT", 
      body: data instanceof FormData ? data : JSON.stringify(data) 
    }),
    
  delete: <T>(endpoint: string, options: RequestInit = {}) => 
    apiFetch<T>(endpoint, { ...options, method: "DELETE" }),
    
  patch: <T>(endpoint: string, data: any, options: RequestInit = {}) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: data instanceof FormData ? data : JSON.stringify(data)
    }),

    
};
