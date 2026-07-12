"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

function readCookie(name: string) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name.replace(/([.$?*|{}()\[\]\\/+^])/g, "\\$1")}=(.*?)(?:;|$)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const role = readCookie("aegis_role") || localStorage.getItem("aegis_role") || "Patient";
    const normalized = role.toLowerCase();
    if (normalized.includes("doctor")) router.replace("/dashboard/doctor");
    else if (normalized.includes("laboratory")) router.replace("/dashboard/laboratory");
    else if (normalized.includes("admin")) router.replace("/dashboard/admin");
    else if (normalized.includes("security")) router.replace("/dashboard/security");
    else router.replace("/dashboard/patient");
  }, [router]);

  return null;
}