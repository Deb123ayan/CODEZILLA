export const API_BASE_URL = "http://localhost:8000/api";

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;
  
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.detail || "API request failed");
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
      body: JSON.stringify(data) 
    }),
    
  put: <T>(endpoint: string, data: any, options: RequestInit = {}) => 
    apiFetch<T>(endpoint, { 
      ...options, 
      method: "PUT", 
      body: JSON.stringify(data) 
    }),
    
  delete: <T>(endpoint: string, options: RequestInit = {}) => 
    apiFetch<T>(endpoint, { ...options, method: "DELETE" }),
    
  // Support for multipart/form-data (for file uploads)
  upload: async <T>(endpoint: string, formData: FormData, options: RequestInit = {}): Promise<T> => {
    const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      method: "POST",
      body: formData,
      // Note: Don't set Content-Type header for FormData, fetch will do it with boundary
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.detail || "Upload failed");
    }

    return response.json();
  }
};
