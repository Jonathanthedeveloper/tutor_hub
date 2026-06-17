import { createFileRoute, redirect, Link, useNavigate } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { useUserDetail, useUpdateUserRole } from '@/features/auth/hooks'
import { useAllCourses } from '@/features/courses/hooks'
import { useEnrollments } from '@/features/enrollments/hooks'
import { ArrowLeftIcon, UserIcon, ShieldAlertIcon } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

export const Route = createFileRoute('/app/users/$userId')({
  component: UserDetailComponent,
  beforeLoad: async ({ context }) => {
    const { user } = context as any
    if (user?.role !== 'admin') {
      throw redirect({
        to: '/app',
      })
    }
  }
})

function UserDetailComponent() {
  const { userId } = Route.useParams()
  const navigate = useNavigate()

  const { data: userProfile, isPending: loadingProfile } = useUserDetail(userId)
  const { data: allCourses, isPending: loadingCourses } = useAllCourses()
  const { data: allEnrollments, isPending: loadingEnrollments } = useEnrollments()

  const updateRoleMutation = useUpdateUserRole()

  if (loadingProfile || loadingCourses || loadingEnrollments) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner className="size-8" />
      </div>
    )
  }

  if (!userProfile) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" className="gap-2" onClick={() => navigate({ to: '/app/users' })}>
          <ArrowLeftIcon /> Back to Users
        </Button>
        <div className="text-center py-10">
          <h2 className="text-xl font-bold">User Not Found</h2>
        </div>
      </div>
    )
  }

  const handleRoleChange = (newRole: string) => {
    updateRoleMutation.mutate(
      { id: userProfile.id, role: newRole },
      {
        onSuccess: () => {
          toast.success('User role updated successfully!')
        },
        onError: (err: any) => {
          toast.error(err.message || 'Failed to update user role')
        },
      }
    )
  }

  // Filter courses depending on user's role
  const isTutor = userProfile.role === 'tutor'
  const isStudent = userProfile.role === 'student'

  const taughtCourses = isTutor ? allCourses?.filter((c) => c.tutorId === userProfile.id) ?? [] : []

  const studentEnrollments = isStudent ? allEnrollments?.filter((e) => e.studentId === userProfile.id) ?? [] : []
  const enrolledCourses = isStudent
    ? allCourses?.filter((c) => studentEnrollments.some((e) => e.courseId === c.id)) ?? []
    : []

  return (
    <div className="space-y-6">
      <Link to="/app/users" className={cn("gap-2 self-start", buttonVariants({ variant: "ghost" }))}>
        <ArrowLeftIcon /> Back to Users
      </Link>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Details Card */}
        <Card className="md:col-span-1">
          <CardHeader className="flex flex-col items-center text-center pb-4">
            <Avatar className="size-20 mb-3">
              <AvatarImage src={userProfile.image || undefined} alt={userProfile.name || ''} />
              <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                <UserIcon className="size-10" />
              </AvatarFallback>
            </Avatar>
            <CardTitle className="text-xl font-bold">{userProfile.name}</CardTitle>
            <CardDescription className="text-sm font-mono truncate max-w-full">{userProfile.email}</CardDescription>
            <Badge className="mt-2" variant={userProfile.role === 'admin' ? 'destructive' : userProfile.role === 'tutor' ? 'default' : 'secondary'}>
              {userProfile.role || 'student'}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4 pt-4 border-t text-sm">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">User Role Settings</span>
              <select
                value={userProfile.role || 'student'}
                onChange={(e) => handleRoleChange(e.target.value)}
                disabled={updateRoleMutation.isPending}
                className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="student">Student</option>
                <option value="tutor">Tutor</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="flex justify-between border-t pt-4">
              <span className="text-muted-foreground">Registered on</span>
              <span className="font-semibold">{new Date(userProfile.createdAt).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Activity or Enrollment Details Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>
              {isTutor ? 'Teaching Courses' : isStudent ? 'Enrolled Studies' : 'Administrator Info'}
            </CardTitle>
            <CardDescription>
              {isTutor
                ? 'List of course programs assigned to this tutor instructor.'
                : isStudent
                  ? 'Course programs this student is enrolled in.'
                  : 'Account has full root level admin controls across courses, scheduling, and user rolls.'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isTutor && (
              <div className="space-y-3">
                {taughtCourses.length > 0 ? (
                  taughtCourses.map((c) => (
                    <div key={c.id} className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-accent/40 transition-colors text-sm">
                      <div className="space-y-0.5">
                        <p className="font-semibold">{c.title}</p>
                        <p className="text-xs text-muted-foreground font-mono">{c.code}</p>
                      </div>
                      <Link to="/app/courses/$courseId" params={{ courseId: c.id }} className={buttonVariants({ variant: "outline", size: "sm" })}>View course</Link>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-6 text-sm">No courses currently assigned to this instructor.</div>
                )}
              </div>
            )}

            {isStudent && (
              <div className="space-y-3">
                {enrolledCourses.length > 0 ? (
                  enrolledCourses.map((c) => (
                    <div key={c.id} className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-accent/40 transition-colors text-sm">
                      <div className="space-y-0.5">
                        <p className="font-semibold">{c.title}</p>
                        <p className="text-xs text-muted-foreground font-mono">{c.code}</p>
                      </div>
                      <Link to="/app/courses/$courseId" params={{ courseId: c.id }} className={buttonVariants({ variant: "ghost", size: "sm" })}>View course</Link>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-6 text-sm">Student is not currently enrolled in any courses.</div>
                )}
              </div>
            )}

            {userProfile.role === 'admin' && (
              <div className="space-y-4 text-sm">
                <div className="flex items-center gap-2 text-amber-600 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-500/20 p-3 rounded-lg">
                  <ShieldAlertIcon className="size-5 shrink-0" />
                  <p>Administrators have absolute permissions. Changing an admin's role will immediately restrict access to settings and user management.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
