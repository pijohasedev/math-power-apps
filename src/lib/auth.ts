import { cookies } from "next/headers";

const SESSION_COOKIE = "mathpower-session";

export interface Session {
  role: "parent" | "child";
  id: number;
}

export async function setSession(role: "parent" | "child", id: number) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, `${role}:${id}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);
  if (!session) return null;
  const parts = session.value.split(":");
  if (parts.length !== 2) return null;
  const [role, idStr] = parts;
  const id = parseInt(idStr, 10);
  if (isNaN(id)) return null;
  if (role !== "parent" && role !== "child") return null;
  return { role, id };
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}