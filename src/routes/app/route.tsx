import { AdminSidebar } from '@/components/layout/admin-sidebar'
import { AppHeader } from '@/components/layout/app-header'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { TutorSidebar } from '@/components/layout/tutor-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { getSession } from '@/features/auth'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/app')({
  component: RouteComponent,
  beforeLoad: async ({ location }) => {
    const session = await getSession();
    if (!session) {
      throw redirect({
        to: "/auth/login",
        search: { callbackUrl: location.href, },
      });
    }
    return { user: session.user };
  },
})

function RouteComponent() {
  return <SidebarProvider>
    <AdminSidebar />
    <TutorSidebar />
    <AppSidebar />
    <SidebarInset className="min-w-0">
      <AppHeader />
      <main className="p-4 lg:p-6">
        <Outlet />
      </main>
    </SidebarInset>
  </SidebarProvider>
}
