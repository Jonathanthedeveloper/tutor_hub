import { useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { useUser, useUsers } from '@/features/auth/hooks'
import { useCourse, useUpdateCourse } from '@/features/courses/hooks'
import { useSessions, useCreateSession } from '@/features/class-sessions/hooks'
import { useEnrollments, useIsEnrolled, useEnroll, useUnenroll } from '@/features/enrollments/hooks'
import {
  ArrowLeftIcon,
  CalendarIcon, PlusIcon,
  UsersIcon,
  GraduationCapIcon, SettingsIcon
} from 'lucide-react'
import { toast } from 'sonner'
import { z } from "zod"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { cn } from '@/lib/utils'
import { DateTimePicker } from '@/components/ui/date-time-picker'

export const Route = createFileRoute('/app/courses/$courseId')({
  component: CourseDetailComponent,
})

const editCourseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  code: z.string().min(1, "Course code is required"),
  tutorId: z.string().min(1, "Please assign a tutor"),
  description: z.string().optional(),
})

type EditCourseFormData = z.infer<typeof editCourseSchema>

const scheduleClassSchema = z.object({
  title: z.string().min(1, "Please enter a class title"),
  description: z.string().optional(),
  startTime: z.string().min(1, "Please select a start time"),
  endTime: z.string().min(1, "Please select an end time"),
  meetingLink: z.string().optional(),
})

type ScheduleClassFormData = z.infer<typeof scheduleClassSchema>

function CourseDetailComponent() {
  const { courseId } = Route.useParams()
  const navigate = useNavigate()
  const user = useUser()

  const { data: course, isPending: loadingCourse } = useCourse(courseId)
  const { data: sessions, isPending: loadingSessions } = useSessions(courseId)
  const { data: enrollments, isPending: loadingEnrollments } = useEnrollments(courseId)
  const { data: isEnrolledFlag, isPending: loadingEnrolledFlag } = useIsEnrolled(courseId)
  const { data: users, isPending: loadingUsers } = useUsers()

  const enrollMutation = useEnroll()
  const unenrollMutation = useUnenroll()
  const updateCourseMutation = useUpdateCourse()
  const createSessionMutation = useCreateSession()

  const [isEditCourseOpen, setIsEditCourseOpen] = useState(false)
  const [isScheduleClassOpen, setIsScheduleClassOpen] = useState(false)

  const editCourseForm = useForm<EditCourseFormData>({
    resolver: zodResolver(editCourseSchema),
    defaultValues: {
      title: '',
      code: '',
      tutorId: '',
      description: '',
    },
  })

  const scheduleClassForm = useForm<ScheduleClassFormData>({
    resolver: zodResolver(scheduleClassSchema),
    defaultValues: {
      title: '',
      description: '',
      startTime: '',
      endTime: '',
      meetingLink: '',
    },
  })

  if (!user) return null

  const isPending = loadingCourse || loadingSessions || loadingEnrollments || loadingEnrolledFlag || loadingUsers

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner className="size-8" />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" className="gap-2" onClick={() => navigate({ to: '/app/courses' })}>
          <ArrowLeftIcon /> Back to Courses
        </Button>
        <div className="text-center py-10">
          <h2 className="text-xl font-bold">Course Not Found</h2>
        </div>
      </div>
    )
  }

  const tutorUser = users?.find((u) => u.id === course.tutorId)
  const isCourseTutor = user.role === 'tutor' && course.tutorId === user.id
  const isCourseAdmin = user.role === 'admin'
  const isInstructorOrAdmin = isCourseTutor || isCourseAdmin

  const handleEnroll = () => {
    enrollMutation.mutate(course.id, {
      onSuccess: () => {
        toast.success('Successfully enrolled in this course!')
      },
      onError: (err: any) => {
        toast.error(err.message || 'Failed to enroll')
      },
    })
  }

  const handleUnenroll = () => {
    if (confirm('Are you sure you want to unenroll from this course? You will no longer see scheduled classes.')) {
      unenrollMutation.mutate(course.id, {
        onSuccess: () => {
          toast.success('Successfully unenrolled.')
        },
        onError: (err: any) => {
          toast.error(err.message || 'Failed to unenroll')
        },
      })
    }
  }

  const handleOpenEditCourse = () => {
    editCourseForm.reset({
      title: course.title,
      code: course.code,
      tutorId: course.tutorId,
      description: course.description || '',
    })
    setIsEditCourseOpen(true)
  }

  const handleEditCourseSubmit = editCourseForm.handleSubmit((data) => {
    updateCourseMutation.mutate(
      {
        id: course.id,
        title: data.title,
        code: data.code.toUpperCase(),
        tutorId: data.tutorId,
        description: data.description,
      },
      {
        onSuccess: () => {
          toast.success('Course details updated!')
          setIsEditCourseOpen(false)
          editCourseForm.reset()
        },
        onError: (err: any) => {
          toast.error(err.message || 'Failed to update course')
        },
      }
    )
  })

  const handleScheduleClassSubmit = scheduleClassForm.handleSubmit((data) => {
    const start = new Date(data.startTime)
    const end = new Date(data.endTime)

    if (isNaN(start.getTime())) {
      toast.error('Please select a valid start date and time')
      return
    }
    if (isNaN(end.getTime())) {
      toast.error('Please select a valid end date and time')
      return
    }

    if (end <= start) {
      toast.error('End time must be after start time')
      return
    }

    createSessionMutation.mutate(
      {
        courseId: course.id,
        title: data.title,
        description: data.description,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        meetingLink: data.meetingLink,
      },
      {
        onSuccess: () => {
          toast.success('Class session scheduled successfully!')
          setIsScheduleClassOpen(false)
          scheduleClassForm.reset()
        },
        onError: (err: any) => {
          toast.error(err.message || 'Failed to schedule class')
        },
      }
    )
  })

  // Render NOT enrolled student view
  if (user.role === 'student' && !isEnrolledFlag) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <Link to="/app/courses" className={cn(buttonVariants({ variant: "ghost" }), "gap-2")}>
          <ArrowLeftIcon /> Back to Catalog
        </Link>

        <Card className="overflow-hidden border-2 border-primary/20">
          <CardHeader className="bg-primary/5 pb-6 border-b">
            <Badge className="font-mono mb-2 w-fit" variant="secondary">{course.code}</Badge>
            <CardTitle className="text-3xl font-black">{course.title}</CardTitle>
            <CardDescription className="text-base">
              Instructor: <span className="font-semibold text-foreground">{tutorUser ? tutorUser.name : 'Unassigned'}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">About this Course</h3>
              <p className="text-muted-foreground leading-relaxed">
                {course.description || 'No course overview description is available at this time.'}
              </p>
            </div>

            <div className="border rounded-lg p-4 bg-muted/40 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-sm">Enroll now to join live classroom sessions</p>
                <p className="text-xs text-muted-foreground">Gain instant access to schedules, live streams, and slides.</p>
              </div>
              <Button className={"w-full sm:w-auto px-8"} onClick={handleEnroll} disabled={enrollMutation.isPending}>
                {enrollMutation.isPending ? <Spinner /> : 'Enroll in Course'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Render ENROLLED Student, Assigned Tutor, or Admin View
  return (
    <div className="space-y-6">
      {/* Header Back navigation and admin tools */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link to="/app/courses" className={cn("gap-2 self-start", buttonVariants({ variant: "ghost" }))}>
          <ArrowLeftIcon /> Back to Courses
        </Link>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Unenroll for student */}
          {user.role === 'student' && (
            <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive/10" onClick={handleUnenroll} disabled={unenrollMutation.isPending}>
              Unenroll from Course
            </Button>
          )}

          {/* Schedule class session (Tutor / Admin) */}
          {isInstructorOrAdmin && (
            <Dialog open={isScheduleClassOpen} onOpenChange={(open) => {
              setIsScheduleClassOpen(open)
              if (!open) scheduleClassForm.reset()
            }}>
              <DialogTrigger render={<Button className="gap-2">
                <PlusIcon />
                Schedule Class
              </Button>}>

              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleScheduleClassSubmit}>
                  <DialogHeader>
                    <DialogTitle>Schedule a Class Session</DialogTitle>
                    <DialogDescription>
                      Create a virtual class slot for {course.title}.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="cTitle">Class Title</Label>
                      <Controller
                        name="title"
                        control={scheduleClassForm.control}
                        render={({ field, fieldState }) => (
                          <div className="space-y-1">
                            <Input
                              {...field}
                              id="cTitle"
                              placeholder="e.g. Week 1: Core Principles"
                              aria-invalid={fieldState.invalid}
                            />
                            {fieldState.invalid && (
                              <p className="text-xs text-destructive">{fieldState.error?.message}</p>
                            )}
                          </div>
                        )}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cDesc">Description (Optional)</Label>
                      <Controller
                        name="description"
                        control={scheduleClassForm.control}
                        render={({ field }) => (
                          <Textarea
                            {...field}
                            id="cDesc"
                            placeholder="Describe topics, readings..."
                          />
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cStart">Start Time</Label>
                        <Controller
                          name="startTime"
                          control={scheduleClassForm.control}
                          render={({ field, fieldState }) => (
                            <div className="space-y-1">
                              <DateTimePicker
                                {...field}
                                id="cStart"
                              />
                              {fieldState.invalid && (
                                <p className="text-xs text-destructive">{fieldState.error?.message}</p>
                              )}
                            </div>
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cEnd">End Time</Label>
                        <Controller
                          name="endTime"
                          control={scheduleClassForm.control}
                          render={({ field, fieldState }) => (
                            <div className="space-y-1">
                              <DateTimePicker
                                {...field}
                                id="cEnd"
                              />
                              {fieldState.invalid && (
                                <p className="text-xs text-destructive">{fieldState.error?.message}</p>
                              )}
                            </div>
                          )}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cLink">Meeting Link (Zoom, Meet)</Label>
                      <Controller
                        name="meetingLink"
                        control={scheduleClassForm.control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            id="cLink"
                            type="url"
                            placeholder="https://meet.google.com/xyz"
                          />
                        )}
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => {
                      setIsScheduleClassOpen(false)
                      scheduleClassForm.reset()
                    }}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createSessionMutation.isPending}>
                      {createSessionMutation.isPending ? 'Scheduling...' : 'Schedule Class'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}

          {/* Edit course options (Admin only) */}
          {isCourseAdmin && (
            <Dialog open={isEditCourseOpen} onOpenChange={(open) => {
              setIsEditCourseOpen(open)
              if (!open) editCourseForm.reset()
            }}>
              <DialogTrigger render={<Button variant="outline" size="sm" onClick={handleOpenEditCourse} className="gap-2">
                <SettingsIcon />
                Course Settings
              </Button>}>

              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleEditCourseSubmit}>
                  <DialogHeader>
                    <DialogTitle>Edit Course Settings</DialogTitle>
                    <DialogDescription>Modify metadata and tutor assignments.</DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-2 space-y-2">
                        <Label htmlFor="editTitle">Course Title</Label>
                        <Controller
                          name="title"
                          control={editCourseForm.control}
                          render={({ field, fieldState }) => (
                            <div className="space-y-1">
                              <Input
                                {...field}
                                id="editTitle"
                                aria-invalid={fieldState.invalid}
                              />
                              {fieldState.invalid && (
                                <p className="text-xs text-destructive">{fieldState.error?.message}</p>
                              )}
                            </div>
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="editCode">Code</Label>
                        <Controller
                          name="code"
                          control={editCourseForm.control}
                          render={({ field, fieldState }) => (
                            <div className="space-y-1">
                              <Input
                                {...field}
                                id="editCode"
                                aria-invalid={fieldState.invalid}
                              />
                              {fieldState.invalid && (
                                <p className="text-xs text-destructive">{fieldState.error?.message}</p>
                              )}
                            </div>
                          )}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="editTutor">Assign Instructor</Label>
                      <Controller
                        name="tutorId"
                        control={editCourseForm.control}
                        render={({ field, fieldState }) => (
                          <div className="space-y-1">
                            <select
                              {...field}
                              id="editTutor"
                              aria-invalid={fieldState.invalid}
                              className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {users?.filter((u) => u.role === 'tutor').map((t) => (
                                <option key={t.id} value={t.id}>{t.name} ({t.email})</option>
                              ))}
                            </select>
                            {fieldState.invalid && (
                              <p className="text-xs text-destructive">{fieldState.error?.message}</p>
                            )}
                          </div>
                        )}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="editDesc">Description</Label>
                      <Controller
                        name="description"
                        control={editCourseForm.control}
                        render={({ field }) => (
                          <Textarea
                            {...field}
                            id="editDesc"
                          />
                        )}
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => {
                      setIsEditCourseOpen(false)
                      editCourseForm.reset()
                    }}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={updateCourseMutation.isPending}>
                      Save Changes
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column course metadata and session details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <Badge className="font-mono w-fit mb-2">{course.code}</Badge>
              <CardTitle className="text-3xl font-bold">{course.title}</CardTitle>
              <CardDescription>
                Taught by <span className="font-semibold text-foreground">{tutorUser ? tutorUser.name : 'Unassigned'}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">{course.description || 'No description provided.'}</p>
            </CardContent>
          </Card>

          {/* Classes/Sessions List */}
          <Card>
            <CardHeader>
              <CardTitle>Class Schedule</CardTitle>
              <CardDescription>Virtual classrooms scheduled for this course program.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {sessions && sessions.length > 0 ? (
                sessions.map((session) => {
                  const isLive = session.status === 'live'
                  return (
                    <div key={session.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/40 transition-colors gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm">{session.title || 'Untitled Session'}</span>
                          <Badge variant={isLive ? 'default' : session.status === 'completed' ? 'secondary' : session.status === 'cancelled' ? 'destructive' : 'outline'}>
                            {session.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <CalendarIcon className="size-3" />
                          {new Date(session.startTime).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <Link to="/app/classes/$classId" params={{ classId: session.id }} className={buttonVariants({ size: "sm", variant: "ghost" })}>Details</Link>
                        {isLive && (
                          <Link to="/app/classes/$classId" params={{ classId: session.id }} className={buttonVariants({ size: "sm", className: "bg-emerald-600 hover:bg-emerald-500" })}>Join Class</Link>
                        )}
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center text-sm text-muted-foreground py-6">No classes have been scheduled yet.</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column: Enrolled Students (Tutor/Admin Only) or course info (Student) */}
        <div className="space-y-6">
          {isInstructorOrAdmin ? (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <UsersIcon className="size-5 text-muted-foreground" />
                  <CardTitle className="text-lg font-bold">Enrolled Students ({enrollments?.length ?? 0})</CardTitle>
                </div>
                <CardDescription>Users attending your course.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[300px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]"></TableHead>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Email</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {enrollments && enrollments.length > 0 ? (
                        enrollments.map((enr) => {
                          const student = users?.find((u) => u.id === enr.studentId)
                          return (
                            <TableRow key={enr.id}>
                              <TableCell>
                                <Avatar className="size-8">
                                  <AvatarImage src={student?.image || undefined} alt={student?.name || ''} />
                                  <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                                    {(student?.name || 'U').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                              </TableCell>
                              <TableCell className="font-medium">{student ? student.name : 'Unknown'}</TableCell>
                              <TableCell className="text-xs text-muted-foreground">{student ? student.email : ''}</TableCell>
                            </TableRow>
                          )
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center text-xs text-muted-foreground py-6">
                            No students enrolled yet.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <GraduationCapIcon className="size-5 text-muted-foreground" />
                  <CardTitle className="text-lg font-bold">Attendee Info</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-muted-foreground">My Enrollment Status</span>
                  <Badge className="bg-emerald-600 hover:bg-emerald-500">Active</Badge>
                </div>
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-muted-foreground">Assigned Instructor</span>
                  <span className="font-semibold">{tutorUser ? tutorUser.name : 'Unassigned'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Lessons Scheduled</span>
                  <span className="font-bold">{sessions?.length ?? 0}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
