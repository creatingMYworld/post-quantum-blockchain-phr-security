const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

export function setAuthCookies(accessToken: string, role: string, email: string) {
  const secure = typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `aegis_access_token=${accessToken}; Path=/; SameSite=Lax${secure}`;
  document.cookie = `aegis_role=${encodeURIComponent(role)}; Path=/; SameSite=Lax${secure}`;
  document.cookie = `aegis_user_email=${encodeURIComponent(email)}; Path=/; SameSite=Lax${secure}`;
}

export async function exchangeFirebaseToken(idToken: string) {
  const response = await fetch(`${backendBaseUrl}/api/auth/firebase/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id_token: idToken }),
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => null);
    throw new Error(errorPayload?.detail || errorPayload?.error || "Failed to establish backend session.");
  }

  return response.json();
}
