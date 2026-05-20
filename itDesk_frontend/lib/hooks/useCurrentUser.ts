// lib/hooks/useCurrentUser.ts
// Reads the stored session and maps it to the User shape AppShell expects.
// Uses useEffect so it only runs in the browser (localStorage is browser-only).

import { useState, useEffect } from "react";
import type { User } from "@/types";
import { getStoredUser } from "@/lib/auth";

export function useCurrentUser(): User | null {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = getStoredUser();
    if (!stored) return;

    // Compute initials from the name (first letter of first two words)
    const parts    = stored.name.trim().split(" ");
    const initials = parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : stored.name.slice(0, 2).toUpperCase();

    setUser({
      id:         stored.id,
      name:       stored.name,
      initials,
      email:      stored.email,
      role:       stored.role,
      department: "IT Support · Dairies Plant",
    });
  }, []);

  return user;
}
