import "server-only"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { cache } from "react"

import type { Role } from "@/src/generated/prisma/client"
import { db } from "@/src/server/db"
import { dashboardPathFor, type DashboardPath } from "@/src/server/auth/roles"
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

/**
 * Authorizes a page for one dashboard. Signed-in users with a different role
 * are sent to their own dashboard instead of seeing a 403.
 */
export async function requireDashboardAccess(path: DashboardPath) {
  const user = await getCurrentUser()
  if (dashboardPathFor(user.role) !== path) redirect(dashboardPathFor(user.role))
  return user
}

/**
 * Strict role gate for pages and server actions. Unlike requireDashboardAccess
 * this checks the exact role, so a HOD does not pass an ADMIN check.
 */
export async function requireRole(...roles: Role[]) {
  const user = await getCurrentUser()
  if (!roles.includes(user.role)) redirect(dashboardPathFor(user.role))
  return user
}
