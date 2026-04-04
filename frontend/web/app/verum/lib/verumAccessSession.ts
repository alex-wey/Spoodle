/** Verum access gate (localStorage); separate from any external auth. */
export const VERUM_ACCESS_KEY = "verum_mockup_access_v1";

export type VerumAccessPayload =
  | { bypass: true }
  | {
      bypass?: false;
      mode: "student";
      firstName: string;
      lastName: string;
      email: string;
      fullName: string;
    };

// Approved emails bypass the student flow (e.g. internal / demo accounts)
const APPROVED_EMAILS = [
  "dev@verum.local",
  // Add more approved emails here
];

export function isBypassEmail(email: string): boolean {
  const normalizedEmail = email.trim().toLowerCase();
  return APPROVED_EMAILS.includes(normalizedEmail);
}

export function writeVerumBypassSession(): void {
  try {
    localStorage.setItem(VERUM_ACCESS_KEY, JSON.stringify({ bypass: true }));
  } catch {
    /* ignore */
  }
}

export function writeVerumStudentSession(payload: {
  firstName: string;
  lastName: string;
  email: string;
  fullName: string;
}): void {
  try {
    localStorage.setItem(
      VERUM_ACCESS_KEY,
      JSON.stringify({
        bypass: false,
        mode: "student" as const,
        ...payload,
      })
    );
  } catch {
    /* ignore */
  }
}

export function clearVerumAccessSession(): void {
  try {
    localStorage.removeItem(VERUM_ACCESS_KEY);
  } catch {
    /* ignore */
  }
}

export function readVerumAccessSession(): VerumAccessPayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(VERUM_ACCESS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as VerumAccessPayload;
  } catch {
    return null;
  }
}

export function hasVerumAccessGrant(): boolean {
  const s = readVerumAccessSession();
  if (!s) return false;
  if ("bypass" in s && s.bypass === true) return true;
  if ("mode" in s && s.mode === "student") return true;
  return false;
}
