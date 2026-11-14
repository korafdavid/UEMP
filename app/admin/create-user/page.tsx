import { DashboardShell } from "@/components/dashboard-shell"
import { requireRole } from "@/src/server/auth/dal"

import { CreateUserForm } from "./create-user-form"

export default async function Page() {
  const user = await requireRole("ADMIN")

  return (
    <DashboardShell user={user} homeUrl="/admin" title="Create User">
      <div className="flex flex-1 items-center justify-center px-4 py-4 md:py-6 lg:px-6">
        <CreateUserForm />
      </div>
    </DashboardShell>
  )
}
