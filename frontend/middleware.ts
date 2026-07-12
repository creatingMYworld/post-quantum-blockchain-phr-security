import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const protectedPrefixes = ["/dashboard"];

function readCookie(request: NextRequest, name: string) {
  return request.cookies.get(name)?.value ?? null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!protectedPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  const accessToken = readCookie(request, "aegis_access_token");
  const role = readCookie(request, "aegis_role");

  if (!accessToken || !role) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const requestedRole = pathname.split("/")[2];
  if (requestedRole && requestedRole !== "dashboard") {
    const normalizedRequested = requestedRole.toLowerCase();
    const normalizedRole = role.toLowerCase().replace(/\s+/g, "");
    const normalizedRoleHyphen = role.toLowerCase().replace(/\s+/g, "-");
    if (normalizedRequested !== normalizedRole && normalizedRequested !== normalizedRoleHyphen) {
      return new NextResponse("Forbidden", { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
