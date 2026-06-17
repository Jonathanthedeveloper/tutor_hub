import { Link } from '@tanstack/react-router'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'
import { BookOpenIcon } from 'lucide-react'

export function Logo({
    to = '/app',
    className,
    textClassName,
    iconClassName,
    ...props
}: ComponentProps<typeof Link> & { textClassName?: string; iconClassName?: string }) {
    return (
        <Link to={to} {...props} className={cn('flex items-center gap-2 h-10', className)}>
            <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shrink-0 shadow-sm', iconClassName)}>
                <BookOpenIcon className="h-4.5 w-4.5" />
            </div>
            <span className={cn('font-bold text-lg tracking-tight text-foreground', textClassName)}>
                Tutor Hub
            </span>
        </Link>
    )
}