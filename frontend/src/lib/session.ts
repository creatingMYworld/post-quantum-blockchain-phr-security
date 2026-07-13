const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

export function setAuthCookies(accessToken: string, role: string, userId: string) {
  const secure = typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `aegis_access_token=${accessToken}; Path=/; SameSite=Lax${secure}`;
  document.cookie = `aegis_role=${encodeURIComponent(role)}; Path=/; SameSite=Lax${secure}`;
  document.cookie = `aegis_user_id=${encodeURIComponent(userId)}; Path=/; SameSite=Lax${secure}`;
}

export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
}

export function getAuthToken(): string | null {
  return getCookie("aegis_access_token");
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return fetch(url, { ...options, headers });
}

export async function register(data: any) {
  const response = await fetch(`${backendBaseUrl}/api/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.detail || "Registration failed");
  }
  return response.json();
}

export async function login(user_id: string, password: string) {
  const response = await fetch(`${backendBaseUrl}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id, password }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.detail || "Login failed");
  }
  return response.json();
}

export async function logout() {
  try {
    await fetchWithAuth(`${backendBaseUrl}/api/logout`, { method: "POST" });
  } catch (e) {
    console.error("Logout API failed", e);
  }
  document.cookie = "aegis_access_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
  document.cookie = "aegis_role=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
  document.cookie = "aegis_user_id=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
}

export async function getProfile() {
  const response = await fetchWithAuth(`${backendBaseUrl}/api/auth/me`);
  if (!response.ok) throw new Error("Failed to fetch profile");
  return response.json();
}

export async function getAdminPending() {
  const response = await fetchWithAuth(`${backendBaseUrl}/api/admin/registrations/pending`);
  if (!response.ok) throw new Error("Failed to fetch pending registrations");
  return response.json();
}

export async function approveRegistration(id: string) {
  const response = await fetchWithAuth(`${backendBaseUrl}/api/admin/registrations/${id}/approve`, {
    method: "POST",
  });
  if (!response.ok) throw new Error("Failed to approve registration");
  return response.json();
}

export async function rejectRegistration(id: string, reason?: string) {
  const response = await fetchWithAuth(`${backendBaseUrl}/api/admin/registrations/${id}/reject`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason: reason || null }),
  });
  if (!response.ok) throw new Error("Failed to reject registration");
  return response.json();
}

export async function getDashboardStats() {
  const response = await fetchWithAuth(`${backendBaseUrl}/api/admin/dashboard/stats`);
  if (!response.ok) throw new Error("Failed to fetch dashboard stats");
  return response.json();
}

export async function getRecentActivity() {
  const response = await fetchWithAuth(`${backendBaseUrl}/api/admin/dashboard/recent-activity`);
  if (!response.ok) throw new Error("Failed to fetch recent activity");
  return response.json();
}

export async function getAllRegistrations() {
  const response = await fetchWithAuth(`${backendBaseUrl}/api/admin/registrations`);
  if (!response.ok) throw new Error("Failed to fetch registrations");
  return response.json();
}

export async function getAllUsers(params: { role?: string; status?: string; search?: string; page?: number; per_page?: number } = {}) {
  const query = new URLSearchParams();
  if (params.role) query.set("role", params.role);
  if (params.status) query.set("status", params.status);
  if (params.search) query.set("search", params.search);
  if (params.page) query.set("page", String(params.page));
  if (params.per_page) query.set("per_page", String(params.per_page));
  const response = await fetchWithAuth(`${backendBaseUrl}/api/admin/users?${query.toString()}`);
  if (!response.ok) throw new Error("Failed to fetch users");
  return response.json();
}

export async function getUserDetail(id: string) {
  const response = await fetchWithAuth(`${backendBaseUrl}/api/admin/users/${id}`);
  if (!response.ok) throw new Error("Failed to fetch user detail");
  return response.json();
}

export async function disableUser(id: string) {
  const response = await fetchWithAuth(`${backendBaseUrl}/api/admin/users/${id}/disable`, { method: "POST" });
  if (!response.ok) throw new Error("Failed to disable user");
  return response.json();
}

export async function enableUser(id: string) {
  const response = await fetchWithAuth(`${backendBaseUrl}/api/admin/users/${id}/enable`, { method: "POST" });
  if (!response.ok) throw new Error("Failed to enable user");
  return response.json();
}

export async function getAuditLogs(params: { action?: string; page?: number; per_page?: number } = {}) {
  const query = new URLSearchParams();
  if (params.action) query.set("action", params.action);
  if (params.page) query.set("page", String(params.page));
  if (params.per_page) query.set("per_page", String(params.per_page));
  const response = await fetchWithAuth(`${backendBaseUrl}/api/admin/audit-logs?${query.toString()}`);
  if (!response.ok) throw new Error("Failed to fetch audit logs");
  return response.json();
}

export async function getSecurityStats() {
  const response = await fetchWithAuth(`${backendBaseUrl}/api/admin/security/stats`);
  if (!response.ok) throw new Error("Failed to fetch security stats");
  return response.json();
}

export async function getUserEmails(userId: string) {
  const response = await fetchWithAuth(`${backendBaseUrl}/api/admin/users/${userId}/emails`);
  if (!response.ok) throw new Error("Failed to fetch user email history");
  return response.json();
}

export async function resendEmail(notificationId: string) {
  const response = await fetchWithAuth(`${backendBaseUrl}/api/admin/emails/${notificationId}/resend`, {
    method: "POST",
  });
  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.detail || "Failed to resend email");
  }
  return response.json();
}
