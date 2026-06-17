import { Link, useLocation, useNavigate } from '@tanstack/react-router'
import {
  BookOpenIcon,
  CalendarIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  SettingsIcon,
  UsersIcon,
} from 'lucide-react'
import type { ComponentProps } from 'react'
import { toast } from 'sonner'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup, SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar
} from '@/components/ui/sidebar'
import { authClient } from '@/lib/auth-client'
import { Logo } from '../logo'
import { ThemeToggle } from './theme-provider'
import { Button } from '../ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  { title: 'Dashboard', href: '/app', icon: LayoutDashboardIcon },
  { title: 'Courses', href: '/app/courses', icon: BookOpenIcon },
  { title: 'Users', href: '/app/users', icon: UsersIcon },
  { title: 'Classes', href: '/app/classes', icon: CalendarIcon },
  { title: 'Settings', href: '/app/settings', icon: SettingsIcon },
]

function NavLink(props: ComponentProps<typeof Link>) {
  return <Link
    activeOptions={{ exact: true }}
    activeProps={{
      className: "active"
    }}
    {...props}
  />
}

function NavItemComponent({
  item,
  isActive,
}: {
  item: NavItem
  isActive: boolean
}) {
  const Icon = item.icon
  const { setOpenMobile } = useSidebar()

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        render={
          <NavLink to={item.href}>
            <Icon />
            <span>{item.title}</span>
          </NavLink>
        }
        isActive={isActive}
        tooltip={item.title}
        onClick={() => setOpenMobile(false)}
        className="[&.active]:bg-primary [&.active]:text-primary-foreground   transition-colors duration-300 hover:bg-primary hover:text-primary-foreground active:bg-primary active:text-primary-foreground"

      />
    </SidebarMenuItem>
  )
}

export function AdminSidebar() {
  const location = useLocation()
  const navigate = useNavigate()

  const { data } = authClient.useSession()

  function handleLogout() {
    authClient
      .signOut()
      .then(() => navigate({ to: '/' }))
      .catch((err) => toast.error('Failed to sign out', err))
  }

  if (data?.user.role !== "admin") return null

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="flex flex-row items-center justify-between">
            <Logo
              to="/app"
              className="group-data-[collapsible=icon]:hidden"
            />
            <SidebarTrigger />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {navItems.map((item) => (
              <NavItemComponent
                key={item.href}
                item={item}
                isActive={location.pathname === item.href}
              />
            ))}
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
