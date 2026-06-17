import {
  MenuIcon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SidebarTrigger } from '../ui/sidebar'

export function AppHeader() {

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center gap-4 border-b bg-background sm:px-4 md:hidden">
      {/* Left: Sidebar toggle */}
      <div className="flex md:hidden flex-1">
        <SidebarTrigger
          render={
            <Button variant="ghost" className="">
              <MenuIcon />
              <span className="sr-only">Toggle sidebar</span>
            </Button>
          }
        ></SidebarTrigger>
      </div>

    </header >
  )
}
