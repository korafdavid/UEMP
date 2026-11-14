import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import type { CurrentUser } from "@/src/server/auth/dal"
import type { DashboardPath } from "@/src/server/auth/roles"

export function DashboardShell({
  user,
  homeUrl,
  title,
  children,
}: {
  user: CurrentUser
  homeUrl: DashboardPath
  title: string
  children: React.ReactNode
}) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar
        variant="inset"
        homeUrl={homeUrl}
        quickCreateUrl={user.role === "ADMIN" ? "/admin/create-user" : undefined}
        user={{ name: `${user.firstName} ${user.lastName}`, email: user.email }}
      />
      <SidebarInset>
        <SiteHeader title={title} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
