"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { canAccessRoute } from "@/lib/iam";

type Props = {
  route: string;
  children: React.ReactNode;
};

export default function ProtectedRoute({ route, children }: Props) {
  const router = useRouter();
  const { isAuthenticated, role } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !canAccessRoute(role, route)) {
      router.replace("/forbidden");
    }
  }, [isAuthenticated, role, route, router]);

  if (!isAuthenticated || !canAccessRoute(role, route)) {
    return null;
  }

  return <>{children}</>;
}
