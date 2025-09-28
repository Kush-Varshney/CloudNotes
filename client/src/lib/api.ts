const baseUrl = (import.meta as any).env.VITE_API_BASE_URL as string

// A simple localStorage-based store for the auth token
const tokenStore = {
  getToken: () => localStorage.getItem("authToken"),
  setToken: (token: string) => localStorage.setItem("authToken", token),
  clearToken: () => localStorage.removeItem("authToken"),
}

type Json = Record<string, any>

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${baseUrl}${path}`
  const token = tokenStore.getToken()

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const res = await fetch(url, {
    ...options,
    headers,
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw data
  return data as T
}

// Specific response types for our API calls
interface AuthResponse {
  token: string
  user: { id: string; name: string; email: string }
}

export const api = {
  signupStart: (payload: { name: string; dob: string; email: string }) =>
    request<Json>("/auth/signup/start", { method: "POST", body: JSON.stringify(payload) }),

  signupVerify: async (payload: { email: string; otp: string }) => {
    const data = await request<AuthResponse>("/auth/signup/verify", {
      method: "POST",
      body: JSON.stringify(payload),
    })
    if (data.token) {
      tokenStore.setToken(data.token)
    }
    return data
  },

  loginStart: (payload: { email: string }) =>
    request<Json>("/auth/login/start", { method: "POST", body: JSON.stringify(payload) }),

  loginVerify: async (payload: { email: string; otp: string; keepSignedIn?: boolean }) => {
    const data = await request<AuthResponse>("/auth/login/verify", {
      method: "POST",
      body: JSON.stringify(payload),
    })
    if (data.token) {
      tokenStore.setToken(data.token)
    }
    return data
  },

  logout: () => {
    tokenStore.clearToken()
    // Although the server logout is now stateless, we can still call it if needed for any server-side cleanup in the future.
    return request<Json>("/auth/logout", { method: "POST" })
  },

  me: () => request<{ user: { id: string; name: string; email: string } }>("/auth/me"),

  notes: {
    list: () => request<{ notes: { id: string; content: string; createdAt: string }[] }>("/notes"),
    create: (payload: { content: string }) =>
      request<{ note: { id: string; content: string; createdAt: string } }>("/notes", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    update: (id: string, payload: { content: string }) =>
      request<{ note: { id: string; content: string; createdAt: string } }>(`/notes/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
    remove: (id: string) => request<Json>(`/notes/${id}`, { method: "DELETE" }),
  },

  handleGoogleCallback: () => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get("token")
    if (token) {
      tokenStore.setToken(token)
      // Clean the token from the URL for security
      window.history.replaceState({}, document.title, window.location.pathname)
      return true
    }
    return false
  },
}

export const API_BASE_URL = baseUrl
