import { redirect } from "next/navigation"

import { getCurrentUser } from "@/src/server/auth/dal"
import { dashboardPathFor } from "@/src/server/auth/roles"

// Entry point after login: forwards each user to their role's dashboard.
export default async function Page() {
  const user = await getCurrentUser()
  redirect(dashboardPathFor(user.role))
}
