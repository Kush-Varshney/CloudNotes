const baseUrl = (import.meta as any).env.VITE_API_BASE_URL as string

console.log("  API Base URL:", baseUrl)

type Json = Record<string, any>

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${baseUrl}${path}`
  console.log("  Making request to:", url)

  const res = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  })

  console.log("  Response status:", res.status)
  console.log("  Response headers:", Object.fromEntries(res.headers.entries()))

  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw data
  return data as T
}

export const api = {
  signupStart: (payload: { name: string; dob: string; email: string }) =>
    request<Json>("/auth/signup/start", { method: "POST", body: JSON.stringify(payload) }),
  signupVerify: (payload: { email: string; otp: string }) =>
    request<Json>("/auth/signup/verify", { method: "POST", body: JSON.stringify(payload) }),
  loginStart: (payload: { email: string }) =>
    request<Json>("/auth/login/start", { method: "POST", body: JSON.stringify(payload) }),
  loginVerify: (payload: { email: string; otp: string; keepSignedIn?: boolean }) =>
    request<Json>("/auth/login/verify", { method: "POST", body: JSON.stringify(payload) }),
  logout: () => request<Json>("/auth/logout", { method: "POST" }),
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
}

export const API_BASE_URL = baseUrl
