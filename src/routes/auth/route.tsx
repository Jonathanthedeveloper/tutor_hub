import { createFileRoute, Outlet } from '@tanstack/react-router'
import { Logo } from '@/components/logo'

export const Route = createFileRoute('/auth')({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <div>
            <div className="min-h-screen flex flex-col justify-center gap-8">
                <div className="w-full flex justify-center">
                    <Logo to="/" />
                </div>
                <Outlet />
            </div>
        </div>
    )
}
