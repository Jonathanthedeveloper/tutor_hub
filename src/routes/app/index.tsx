import { createFileRoute, Link } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useUser, useUsers } from '@/features/auth/hooks'
import { useCourses } from '@/features/courses/hooks'
import { useSessions } from '@/features/class-sessions/hooks'
import { useEnrollments } from '@/features/enrollments/hooks'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import {
  BookOpenIcon,
  CalendarIcon,
  UsersIcon,
  GraduationCapIcon,
  VideoIcon,
  PlusIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/app/')({
  component: DashboardComponent,
})

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

function DashboardComponent() {
  const user = useUser()

  if (!user) return null

  switch (user.role) {
    case 'admin':
      return <AdminDashboard />
    case 'tutor':
      return <TutorDashboard user={user} />
    case 'student':
      return <StudentDashboard user={user} />
    default:
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <h2 className="text-xl font-bold">Access Denied</h2>
          <p className="text-muted-foreground mt-2">You do not have a valid role assigned to your account.</p>
        </div>
      )
  }
}

// ----------------------------------------------------
// ADMIN DASHBOARD
// ----------------------------------------------------
function AdminDashboard() {
  const { data: courses, isPending: loadingCourses } = useCourses()
  const { data: users, isPending: loadingUsers } = useUsers()
  const { data: sessions, isPending: loadingSessions } = useSessions()
  const { data: enrollments, isPending: loadingEnrollments } = useEnrollments()

  const isPending = loadingCourses || loadingUsers || loadingSessions || loadingEnrollments

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner className="size-8" />
      </div>
    )
  }

  const tutorsCount = users?.filter((u) => u.role === 'tutor').length ?? 0
  const studentsCount = users?.filter((u) => u.role === 'student').length ?? 0
  const adminsCount = users?.filter((u) => u.role === 'admin').length ?? 0
  const liveSessions = sessions?.filter((s) => s.status === 'live').length ?? 0

  const userDistributionData = [
    { name: 'Tutors', value: tutorsCount, color: COLORS[0] },
    { name: 'Students', value: studentsCount, color: COLORS[1] },
    { name: 'Admins', value: adminsCount, color: COLORS[4] },
  ].filter((d) => d.value > 0)

  const sessionsStatusData = [
    { status: 'Scheduled', count: sessions?.filter((s) => s.status === 'scheduled').length ?? 0 },
    { status: 'Live', count: sessions?.filter((s) => s.status === 'live').length ?? 0 },
    { status: 'Completed', count: sessions?.filter((s) => s.status === 'completed').length ?? 0 },
    { status: 'Cancelled', count: sessions?.filter((s) => s.status === 'cancelled').length ?? 0 },
  ]

  const courseEnrollmentData = courses?.map((course) => {
    const count = enrollments?.filter((e) => e.courseId === course.id).length ?? 0
    return { course: course.title, count }
  }) ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your tutor hub network activities.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpenIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses?.length ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Active course programs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Active Tutors</CardTitle>
            <UsersIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tutorsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Assigned instructors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Registered Students</CardTitle>
            <GraduationCapIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Enrolled class attendees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Live Now</CardTitle>
            <VideoIcon className="size-4 text-emerald-500 animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{liveSessions}</div>
            <p className="text-xs text-muted-foreground mt-1">Virtual classrooms running</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Distribution</CardTitle>
            <CardDescription>Breakdown of users by role</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                tutors: { label: 'Tutors', color: COLORS[0] },
                students: { label: 'Students', color: COLORS[1] },
                admins: { label: 'Admins', color: COLORS[4] },
              }}
              className="aspect-[4/3]"
            >
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Pie
                  data={userDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  nameKey="name"
                >
                  {userDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sessions by Status</CardTitle>
            <CardDescription>Overview of all class sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                count: { label: 'Count', color: COLORS[0] },
              }}
              className="aspect-[4/3]"
            >
              <BarChart data={sessionsStatusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill={COLORS[0]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course Enrollments</CardTitle>
          <CardDescription>Number of students enrolled per course</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              count: { label: 'Enrollments', color: COLORS[1] },
            }}
            className="aspect-[16/9]"
          >
            <BarChart data={courseEnrollmentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="course" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill={COLORS[1]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}

// ----------------------------------------------------
// TUTOR DASHBOARD
// ----------------------------------------------------
function TutorDashboard({ user }: { user: any }) {
  const { data: courses, isPending: loadingCourses } = useCourses()
  const { data: sessions, isPending: loadingSessions } = useSessions()
  const { data: enrollments, isPending: loadingEnrollments } = useEnrollments()

  const isPending = loadingCourses || loadingSessions || loadingEnrollments

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner className="size-8" />
      </div>
    )
  }

  const tutorCourses = courses?.filter((c) => c.tutorId === user.id) ?? []
  const tutorCourseIds = tutorCourses.map((c) => c.id)
  const tutorSessions = sessions?.filter((s) => tutorCourseIds.includes(s.courseId)) ?? []
  const upcomingSessions = tutorSessions.filter((s) => new Date(s.endTime) > new Date())

  const sessionsStatusData = [
    { status: 'Scheduled', count: tutorSessions.filter((s) => s.status === 'scheduled').length },
    { status: 'Live', count: tutorSessions.filter((s) => s.status === 'live').length },
    { status: 'Completed', count: tutorSessions.filter((s) => s.status === 'completed').length },
    { status: 'Cancelled', count: tutorSessions.filter((s) => s.status === 'cancelled').length },
  ]

  const courseEnrollmentData = tutorCourses.map((course) => {
    const count = enrollments?.filter((e) => e.courseId === course.id).length ?? 0
    return { course: course.title, count }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user.name}</h1>
        <p className="text-muted-foreground mt-1">Manage your courses, schedule live classes, and view student attendance.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Assigned Courses</CardTitle>
            <BookOpenIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tutorCourses.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Teaching programs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Upcoming Classes</CardTitle>
            <CalendarIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingSessions.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Scheduled sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Live Classroom</CardTitle>
            <VideoIcon className="size-4 text-emerald-500 animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {tutorSessions.filter((s) => s.status === 'live').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Sessions currently live</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>My Sessions by Status</CardTitle>
            <CardDescription>Overview of your class sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                count: { label: 'Count', color: COLORS[0] },
              }}
              className="aspect-[4/3]"
            >
              <BarChart data={sessionsStatusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill={COLORS[0]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Enrollments per Course</CardTitle>
            <CardDescription>Student count in your courses</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                count: { label: 'Enrollments', color: COLORS[1] },
              }}
              className="aspect-[4/3]"
            >
              <BarChart data={courseEnrollmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="course" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill={COLORS[1]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ----------------------------------------------------
// STUDENT DASHBOARD
// ----------------------------------------------------
function StudentDashboard({ user }: { user: any }) {
  const { data: courses, isPending: loadingCourses } = useCourses()
  const { data: sessions, isPending: loadingSessions } = useSessions()

  const isPending = loadingCourses || loadingSessions

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner className="size-8" />
      </div>
    )
  }

  const liveSessions = sessions?.filter((s) => s.status === 'live') ?? []
  const upcomingSessions = sessions?.filter((s) => s.status === 'scheduled' && new Date(s.endTime) > new Date()) ?? []

  const sessionsStatusData = [
    { status: 'Scheduled', count: sessions?.filter((s) => s.status === 'scheduled').length ?? 0 },
    { status: 'Live', count: sessions?.filter((s) => s.status === 'live').length ?? 0 },
    { status: 'Completed', count: sessions?.filter((s) => s.status === 'completed').length ?? 0 },
    { status: 'Cancelled', count: sessions?.filter((s) => s.status === 'cancelled').length ?? 0 },
  ]

  const classesPerCourseData = courses?.map((course) => {
    const count = sessions?.filter((s) => s.courseId === course.id).length ?? 0
    return { course: course.title, count }
  }) ?? []

  return (
    <div className="space-y-6">
      {/* Live Classroom Alert Banner */}
      {liveSessions.length > 0 && (
        <Card className="border-emerald-500 bg-emerald-50/10 dark:bg-emerald-950/10">
          <CardHeader className="flex flex-row items-center gap-4 py-4 space-y-0">
            <div className="p-2 bg-emerald-500 text-white rounded-full animate-bounce">
              <VideoIcon className="size-6" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-emerald-700 dark:text-emerald-400">Class Session is Live!</CardTitle>
              <CardDescription className="text-emerald-600 dark:text-emerald-500">
                You have {liveSessions.length} virtual class{liveSessions.length > 1 ? 'es' : ''} running right now. Click join to enter.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 pb-4">
            {liveSessions.map((session) => (
              <div key={session.id} className="flex flex-wrap items-center justify-between p-3 border border-emerald-500/20 bg-background rounded-lg">
                <span className="font-semibold text-sm">{session.title}</span>
                <Link to="/app/classes/$classId" params={{ classId: session.id }} className={cn("bg-emerald-600 hover:bg-emerald-500", buttonVariants({ size: "sm" }))}>Join Live Class</Link>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome, {user.name}</h1>
        <p className="text-muted-foreground mt-1">Ready for learning? View your enrolled courses and upcoming live classrooms.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
            <BookOpenIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses?.length ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Programs you attend</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
            <CalendarIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingSessions.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Scheduled lessons</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Explore Hub</CardTitle>
            <PlusIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Link to="/app/courses" className={cn("p-0 h-auto font-bold text-lg", buttonVariants({ variant: "link" }))}>Catalog Browse &rarr;</Link>
            <p className="text-xs text-muted-foreground mt-1">Find new subjects to enroll</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>My Sessions by Status</CardTitle>
            <CardDescription>Overview of your class sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                count: { label: 'Count', color: COLORS[0] },
              }}
              className="aspect-[4/3]"
            >
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Pie
                  data={sessionsStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="status"
                >
                  {sessionsStatusData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Classes per Course</CardTitle>
            <CardDescription>Number of sessions in each enrolled course</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                count: { label: 'Classes', color: COLORS[1] },
              }}
              className="aspect-[4/3]"
            >
              <BarChart data={classesPerCourseData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="course" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill={COLORS[1]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
