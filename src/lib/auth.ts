import { useSyncExternalStore } from "react";

/**
 * Demo authentication layer.
 * Replace these three functions with Supabase Auth calls
 * (signInWithPassword / signOut / getSession) to go production.
 */
const KEY = "lapiazza.admin.session.v1";

const DEMO_EMAIL = "admin@lapiazza.com";
const DEMO_PASSWORD = "lapiazza123";

export const DEMO_CREDENTIALS = { email: DEMO_EMAIL, password: DEMO_PASSWORD };

export type AdminSession = { email: string; signedInAt: string };

const listeners = new Set<() => void>();
let cache: AdminSession | null | undefined;

function read(): AdminSession | null {
  if (typeof window === "undefined") return null;
  if (cache !== undefined) return cache;
  try {
    const raw = window.localStorage.getItem(KEY);
    cache = raw ? (JSON.parse(raw) as AdminSession) : null;
  } catch {
    cache = null;
  }
  return cache;
}

function emit() {
  listeners.forEach((l) => l());
}

export async function signIn(email: string, password: string): Promise<AdminSession> {
  await new Promise((r) => setTimeout(r, 450));
  if (email.trim().toLowerCase() !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
    throw new Error("Invalid email or password.");
  }
  const session: AdminSession = { email: DEMO_EMAIL, signedInAt: new Date().toISOString() };
  cache = session;
  window.localStorage.setItem(KEY, JSON.stringify(session));
  emit();
  return session;
}

export function signOut() {
  cache = null;
  window.localStorage.removeItem(KEY);
  emit();
}

export function useAdminSession(): AdminSession | null {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    read,
    () => null,
  );
}