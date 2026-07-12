export type AppRole =
  | "Patient"
  | "Doctor"
  | "Nurse"
  | "Lab Technician"
  | "Administrator";

export const dashboardRouteMap: Record<AppRole, string> = {
  Patient: "/dashboard/patient",
  Doctor: "/dashboard/doctor",
  Nurse: "/dashboard/nurse",
  "Lab Technician": "/dashboard/lab-technician",
  Administrator: "/dashboard/admin",
};

export const roleModules: Record<AppRole, string[]> = {
  Patient: ["My Records", "Consent", "Emergency Access", "Notifications"],
  Doctor: ["Assigned Patients", "Record Review", "Diagnosis Upload", "Emergency Request"],
  Nurse: ["Assigned Patients", "Vitals Upload", "Care Plans"],
  "Lab Technician": ["Assigned Samples", "Lab Report Upload", "Queue Management"],
  Administrator: ["User Management", "Role Assignment", "Registration Approvals", "Audit Logs"],
};

export const rolePermissions: Record<AppRole, string[]> = {
  Patient: ["records:view:own", "records:upload:own", "consent:grant", "consent:revoke", "history:view:own", "emergency:view:own", "notifications:receive"],
  Doctor: ["patients:search", "records:view:approved", "records:create:diagnosis", "records:upload:reports", "access:request", "access:emergency", "history:view:own", "notifications:receive"],
  Nurse: ["patients:search", "records:view:approved", "records:upload:vitals", "notifications:receive"],
  "Lab Technician": ["patients:search:assigned", "records:upload:lab", "reports:view:own", "reports:update:status", "notifications:receive"],
  Administrator: ["users:create", "users:delete", "roles:assign", "hospitals:manage", "settings:configure", "audit:view", "registrations:manage", "users:suspend"],
};

export function normalizeRole(role: string | null | undefined): AppRole | null {
  if (!role) return null;
  const cleaned = role.trim().toLowerCase();
  return (Object.keys(dashboardRouteMap) as AppRole[]).find((candidate) => candidate.toLowerCase() === cleaned) ?? null;
}

export function getAllowedModules(role: AppRole | null): string[] {
  return role ? roleModules[role] : [];
}

export function hasPermission(role: AppRole | null, permission: string): boolean {
  if (!role) return false;
  return rolePermissions[role].includes(permission);
}

export function canAccessRoute(role: AppRole | null, route: string): boolean {
  if (!role) return false;
  return dashboardRouteMap[role] === route;
}

export function getRoleFromCookie(cookieValue: string | null): AppRole | null {
  if (!cookieValue) return null;
  const decoded = decodeURIComponent(cookieValue);
  return (Object.keys(dashboardRouteMap) as AppRole[]).find((role) => role === decoded) ?? null;
}
