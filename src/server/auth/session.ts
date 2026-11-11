import "server-only"

import { jwtVerify, SignJWT } from "jose"
import { cookies } from "next/headers"

export const SESSION_COOKIE = "session"
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60

/**
 * Keep the payload minimal: only what identifies the user. Role and active
 * status are read from the database on each request (see dal.ts) so changes
 * take effect immediately.
 */
export type SessionPayload = { userId: string }

function getSecretKey() {
  const secret = process.env.SESSION_SECRET
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be set to at least 32 characters")
  }
  return new TextEncoder().encode(secret)
}

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getSecretKey())
}

export async function decrypt(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), { algorithms: ["HS256"] })
    return typeof payload.userId === "string" ? { userId: payload.userId } : null
  } catch {
    return null
  }
}

export async function createSession(userId: string) {
  const token = await encrypt({ userId })
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    // Safari refuses Secure cookies on http://localhost, so only require it in production.
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  })
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}
