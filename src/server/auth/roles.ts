import type { Role } from "@/src/generated/prisma/client"

export type DashboardPath = "/admin" | "/lecturer" | "/student"

/** Where each role lands after signing in. HODs share the lecturer dashboard for now. */
export function dashboardPathFor(role: Role): DashboardPath {
  switch (role) {
    case "ADMIN":
      return "/admin"
    case "LECTURER":
    case "HOD":
      return "/lecturer"
    case "STUDENT":
      return "/student"
  }
}
