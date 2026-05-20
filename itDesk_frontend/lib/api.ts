// ─────────────────────────────────────────────────────────────────────────────
// lib/api.ts — Central fetch wrapper
//
// WHY A WRAPPER?
// Every protected API call needs the same Authorization header.
// Instead of writing this on every fetch call across the app, we centralise it here.
// When you replace this with a real auth library later, you only change one file.
//
// USAGE EXAMPLES:
//   const { tasks } = await api.get("/tasks");
//   const { task }  = await api.post("/tasks", { title: "Fix printer" });
//   await api.patch("/tasks/abc123", { status: "done" });
//   await api.delete("/tasks/abc123");
// ─────────────────────────────────────────────────────────────────────────────

import { getToken } from "./auth";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// ── Core fetch function ────────────────────────────────────────────────────────
async function request<T = unknown>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const token = getToken(); // reads from localStorage

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Attach the JWT if we have one — the backend's protect() middleware reads this
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // If the server returns 401, the token has likely expired — clear the session
  if (res.status === 401) {
    // Dynamically import to avoid circular deps
    const { clearSession } = await import("./auth");
    clearSession();
    window.location.href = "/"; // redirect to login
    throw new Error("Session expired");
  }

  // Parse JSON for all other responses
  // For 204 No Content (DELETE success), there's no body to parse
  if (res.status === 204) return undefined as T;

  const data = await res.json();

  if (!res.ok) {
    // Throw the server's error message so it can be shown in the UI
    throw new Error(data.error || "An unknown error occurred");
  }

  return data as T;
}

// ── HTTP method shortcuts ─────────────────────────────────────────────────────
export const api = {
  get:    <T>(path: string)                  => request<T>("GET",    path),
  post:   <T>(path: string, body: unknown)   => request<T>("POST",   path, body),
  patch:  <T>(path: string, body: unknown)   => request<T>("PATCH",  path, body),
  delete: <T>(path: string)                  => request<T>("DELETE", path),
};
