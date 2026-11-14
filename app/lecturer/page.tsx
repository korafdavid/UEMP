import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { requireDashboardAccess } from "@/src/server/auth/dal"

const sections = [
  { title: "Courses", description: "Your courses will appear here." },
  { title: "Students", description: "Students enrolled in your courses will appear here." },
  { title: "Pending grading", description: "Submissions awaiting grades will appear here." },
]

export default async function Page() {
  const user = await requireDashboardAccess("/lecturer")

  return (
    <DashboardShell user={user} homeUrl="/lecturer" title="Lecturer Dashboard">
      <div className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:py-6 lg:px-6">
        <h2 className="text-xl font-semibold">Welcome, {user.firstName}</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {sections.map((s) => (
            <Card key={s.title}>
              <CardHeader>
                <CardTitle>{s.title}</CardTitle>
                <CardDescription>{s.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </DashboardShell>
  )
}
