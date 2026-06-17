import { Link, useNavigate } from '@tanstack/react-router'
import {
  BookOpenIcon,
  CalendarIcon,
  HomeIcon,
  LogOutIcon,
  SettingsIcon,
} from 'lucide-react'
import { Logo } from '@/components/logo'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { ThemeToggle } from './theme-provider'
import { authClient } from '@/lib/auth-client'
import { toast } from 'sonner'
import { Button } from '../ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  { title: 'Dashboard', href: '/app', icon: HomeIcon },
  { title: 'Courses', href: '/app/courses', icon: BookOpenIcon },
  { title: 'Classes', href: '/app/classes', icon: CalendarIcon },
  { title: 'Settings', href: '/app/settings', icon: SettingsIcon },
]

export function TutorSidebar() {
  const { setOpenMobile } = useSidebar()

  const navigate = useNavigate()

  const { data } = authClient.useSession()

  function handleLogout() {
    authClient
      .signOut()
      .then(() => navigate({ to: '/' }))
      .catch((err) => toast.error('Failed to sign out', err))
  }

  if (data?.user.role !== "tutor") return null

  return (
    <Sidebar>
      <SidebarHeader className="h-14 lg:h-16 border-b flex items-center justify-center">
        <Logo />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="space-y-1">
          <SidebarMenu>
            {navItems.map((item) => {
              const Icon = item.icon

              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    render={
                      <Link
                        to={item.href}
                        activeProps={{
                          className: 'active',
                        }}
                        activeOptions={{ exact: true }}
                      >
                        <Icon />
                        <span>{item.title}</span>
                      </Link>
                    }
                    tooltip={item.title}
                    onClick={() => setOpenMobile(false)}
                    className="h-10 [&.active]:bg-primary [&.active]:text-primary-foreground   transition-colors duration-300 hover:bg-primary hover:text-primary-foreground active:bg-primary active:text-primary-foreground"
                  />
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="flex-row justify-between items-end group-data-[collapsible=icon]:flex-col">
        <div className="flex gap-2">
          <Avatar>
            <AvatarImage src={data?.user?.image || ""} />
            <AvatarFallback>
              {data?.user?.name?.split(" ").map((n) => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div className='group-data-[collapsible=icon]:hidden'>
            <p className="text-sm">{data?.user?.name}</p>
            <p className="text-xs">{data?.user?.email}</p>
          </div>
        </div>
        <div>
          <ThemeToggle />
          <Button
            onClick={handleLogout}
            variant="ghost"
            size="icon"
            className="hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOutIcon />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
