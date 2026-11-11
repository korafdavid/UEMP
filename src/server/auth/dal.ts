import "server-only"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { cache } from "react"

import { db } from "@/src/server/db"
import { decrypt, SESSION_COOKIE } from "@/src/server/auth/session"

/** Verifies the session cookie, redirecting to /login when it's missing or invalid. */
export const verifySession = cache(async () => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value
  const session = await decrypt(token)
  if (!session) redirect("/login")
  return session
})

/**
 * Returns the signed-in, active user (safe fields only). Use this for
 * authorization checks: role and status come from the database, not the cookie.
 */
export const getCurrentUser = cache(async () => {
  const { userId } = await verifySession()
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true },
  })
  if (!user || !user.isActive) redirect("/login")
  return user
})

export type CurrentUser = Awaited<ReturnType<typeof getCurrentUser>>
