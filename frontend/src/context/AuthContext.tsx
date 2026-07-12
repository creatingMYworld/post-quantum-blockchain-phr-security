"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import { normalizeRole, type AppRole, rolePermissions, dashboardRouteMap } from "@/lib/iam";

type AuthState = {
  isAuthenticated: boolean;
  role: AppRole | null;
  permissions: string[];
  userEmail: string | null;
  accessToken: string | null;
  setSession: (input: { role: AppRole | null; permissions?: string[]; userEmail?: string | null; accessToken?: string | null }) => void;
  clearSession: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

function readCookie(name: string) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name.replace(/([.$?*|{}()\[\]\\/+^])/g, "\\$1")}=(.*?)(?:;|$)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<AppRole | null>(() => {
    const cookieRole = normalizeRole(readCookie("aegis_role"));
    if (cookieRole) return cookieRole;
    if (typeof window !== "undefined") {
      return normalizeRole(localStorage.getItem("aegis_role"));
    }
    return null;
  });
  const [permissions, setPermissions] = useState<string[]>(() => (role ? rolePermissions[role] : []));
  const [userEmail, setUserEmail] = useState<string | null>(() => {
    const cookieEmail = readCookie("aegis_user_email");
    if (cookieEmail) return cookieEmail;
    if (typeof window !== "undefined") {
      return localStorage.getItem("aegis_user_email");
    }
    return null;
  });
  const [accessToken, setAccessToken] = useState<string | null>(() => {
    const token = readCookie("aegis_access_token");
    if (token) return token;
    if (typeof window !== "undefined") {
      return localStorage.getItem("aegis_access_token");
    }
    return null;
  });

  const value = useMemo<AuthState>(() => ({
    isAuthenticated: Boolean(role && accessToken),
    role,
    permissions,
    userEmail,
    accessToken,
    setSession: ({ role: nextRole, permissions: nextPermissions, userEmail: nextUserEmail, accessToken: nextToken }) => {
      setRole(nextRole);
      setPermissions(nextPermissions ?? (nextRole ? rolePermissions[nextRole] : []));
      setUserEmail(nextUserEmail ?? null);
      setAccessToken(nextToken ?? null);
    },
    clearSession: () => {
      setRole(null);
      setPermissions([]);
      setUserEmail(null);
      setAccessToken(null);
    },
  }), [accessToken, permissions, role, userEmail]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

export function isDashboardRouteAllowed(role: AppRole | null, route: string) {
  if (!role) return false;
  return dashboardRouteMap[role] === route;
}
