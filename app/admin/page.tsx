import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DashboardShell } from "@/components/dashboard-shell"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { requireDashboardAccess } from "@/src/server/auth/dal"

import data from "./data.json"

export default async function Page() {
  const user = await requireDashboardAccess("/admin")

  return (
    <DashboardShell user={user} homeUrl="/admin" title="Admin Dashboard">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <SectionCards />
        <div className="px-4 lg:px-6">
          <ChartAreaInteractive />
        </div>
        <DataTable data={data} />
      </div>
    </DashboardShell>
  )
}
