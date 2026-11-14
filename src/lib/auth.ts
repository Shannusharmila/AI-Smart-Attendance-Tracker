// src/lib/auth.ts — Light client-side auth helpers (no real auth server; we rely on localStorage + Zustand).

import type { User, Role } from "@/lib/types";

// No actual password hashing for the prototype — the API just compares plaintext.
// These helpers are for client convenience.

export function isRole(u: User | null, role: Role): boolean {
  return !!u && u.role === role;
}
