// ─────────────────────────────────────────────────────────────────────────────
// proxy.ts — Route protection (Next.js 16 "Proxy", formerly middleware.ts)
//
// WHAT THIS FILE DOES:
// It runs on the SERVER before any page renders. It checks for the
// it_desk_token cookie. If a user tries to visit a protected page without
// being logged in, it redirects them to the login page (/).
//
// WHY A COOKIE INSTEAD OF LOCALSTORAGE?
// This file runs server-side (Edge environment) before React renders.
// localStorage only exists in the browser. Cookies are sent with every
// HTTP request, so the server can read them here.
//
// WHAT WE CHECK:
// - No token cookie → redirect to login (/)
// - Manager visiting staff-only routes → proxy just lets Next.js handle it
//   (we do role checks inside the pages themselves for simplicity)
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require login
const PROTECTED_PATHS = [
  "/dashboard",
  "/tasks",
  "/log",
  "/handover",
  "/assets",
  "/manager",
];

// Routes only managers can access
const MANAGER_ONLY_PATHS = ["/manager"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if this is a protected route
  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next(); // public page, let it through

  // Read the session cookie
  const token = request.cookies.get("it_desk_token")?.value;
  const role  = request.cookies.get("it_desk_role")?.value;

  // No token → redirect to login
  if (!token) {
    const loginUrl = new URL("/", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Manager trying to access a staff-only route isn't blocked at proxy level
  // (manager can see tasks, logs, handover in read-only mode)
  // BUT if a staff member tries to reach /manager, redirect them
  const isManagerOnly = MANAGER_ONLY_PATHS.some((p) => pathname.startsWith(p));
  if (isManagerOnly && role !== "manager" && role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // All checks passed — proceed to the page
  return NextResponse.next();
}

// Tell Next.js which paths this proxy should run on.
// We exclude static files and Next.js internals for performance.
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$).*)",
  ],
};
