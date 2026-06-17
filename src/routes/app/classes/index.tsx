import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useUser } from '@/features/auth/hooks'
import { useCourses } from '@/features/courses/hooks'
import { useSessions, useCreateSession } from '@/features/class-sessions/hooks'
import {
  CalendarIcon,
  ListIcon,
  PlusIcon,
  VideoIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from 'lucide-react'
import { toast } from 'sonner'
import { z } from "zod"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { DateTimePicker } from '@/components/ui/date-time-picker'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export const Route = createFileRoute('/app/classes/')({
  component: ClassesComponent,
})

const scheduleSessionSchema = z.object({
  courseId: z.string().min(1, "Please select a course"),
  title: z.string().min(1, "Please enter a class title"),
  description: z.string().optional(),
  startTime: z.string().min(1, "Please select a start time"),
  endTime: z.string().min(1, "Please select an end time"),
  meetingLink: z.string().optional(),
})

type ScheduleSessionFormData = z.infer<typeof scheduleSessionSchema>

function ClassesComponent() {
  const user = useUser()
  const { data: sessions, isPending: loadingSessions } = useSessions()
  const { data: courses, isPending: loadingCourses } = useCourses()

  const createSessionMutation = useCreateSession()

  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isScheduleOpen, setIsScheduleOpen] = useState(false)

  const form = useForm<ScheduleSessionFormData>({
    resolver: zodResolver(scheduleSessionSchema),
    defaultValues: {
      courseId: '',
      title: '',
      description: '',
      startTime: '',
      endTime: '',
      meetingLink: '',
    },
  })

  if (!user) return null

  const isPending = loadingSessions || loadingCourses

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner className="size-8" />
      </div>
    )
  }

  const handleScheduleSubmit = form.handleSubmit((data) => {
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
        courseId: data.courseId,
        title: data.title,
        description: data.description,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        meetingLink: data.meetingLink,
      },
      {
        onSuccess: () => {
          toast.success('Class session scheduled successfully!')
          setIsScheduleOpen(false)
          form.reset()
        },
        onError: (err: any) => {
          toast.error(err.message || 'Failed to schedule class')
        },
      }
    )
  })

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const getLocalDateString = (date: Date) => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  // --- CALENDAR GRID CALCULATIONS ---
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const startOfMonth = new Date(year, month, 1)
  const endOfMonth = new Date(year, month + 1, 0)

  const startDayOfWeek = startOfMonth.getDay() // 0 = Sunday, 1 = Monday, etc.
  const daysInMonth = endOfMonth.getDate()

  const prevMonthEnd = new Date(year, month, 0).getDate()

  // Build grid items: previous month blanks, current month days, next month blanks
  const gridDays: { date: Date; isCurrentMonth: boolean }[] = []

  // Fill in blanks for previous month
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    gridDays.push({
      date: new Date(year, month - 1, prevMonthEnd - i),
      isCurrentMonth: false,
    })
  }

  // Fill in current month days
  for (let i = 1; i <= daysInMonth; i++) {
    gridDays.push({
      date: new Date(year, month, i),
      isCurrentMonth: true,
    })
  }

  // Fill in next month blanks to complete grid (multiples of 7)
  const remainingCells = 42 - gridDays.length
  for (let i = 1; i <= remainingCells; i++) {
    gridDays.push({
      date: new Date(year, month + 1, i),
      isCurrentMonth: false,
    })
  }

  // Group sessions by local day string (YYYY-MM-DD)
  const sessionsByDay: Record<string, typeof sessions> = {}
  sessions?.forEach((session) => {
    const dayStr = getLocalDateString(new Date(session.startTime))
    if (!sessionsByDay[dayStr]) {
      sessionsByDay[dayStr] = []
    }
    sessionsByDay[dayStr].push(session)
  })

  const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const isTutorOrAdmin = user.role === 'tutor' || user.role === 'admin'

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Classes</h1>
          <p className="text-muted-foreground mt-1">
            Browse upcoming live classroom sessions and schedule new ones.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* View Toggle */}
          <div className="border rounded-lg p-0.5 flex bg-background">
            <Button
              variant={viewMode === 'calendar' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('calendar')}
              className="gap-1.5"
            >
              <CalendarIcon />
              Calendar
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="gap-1.5"
            >
              <ListIcon />
              List
            </Button>
          </div>

          {/* Schedule Button (Tutor/Admin Only) */}
          {isTutorOrAdmin && (
            <Dialog open={isScheduleOpen} onOpenChange={(open) => {
              setIsScheduleOpen(open)
              if (!open) form.reset()
            }}>
              <DialogTrigger render={<Button className="gap-2">
                <PlusIcon />
                Schedule Class
              </Button>}>

              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleScheduleSubmit}>
                  <DialogHeader>
                    <DialogTitle>Schedule a New Class Session</DialogTitle>
                    <DialogDescription>
                      Fill in the details to schedule a live virtual class for your students.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="course">Select Course</Label>
                      <Controller
                        name="courseId"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <div className="space-y-1">
                            <select
                              {...field}
                              id="course"
                              aria-invalid={fieldState.invalid}
                              className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <option value="">-- Choose a course --</option>
                              {courses?.map((c) => (
                                <option key={c.id} value={c.id}>{c.title} ({c.code})</option>
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
                      <Label htmlFor="title">Class Title</Label>
                      <Controller
                        name="title"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <div className="space-y-1">
                            <Input
                              {...field}
                              id="title"
                              placeholder="e.g. Chapter 1: Introduction to Algebra"
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
                      <Label htmlFor="description">Description (Optional)</Label>
                      <Controller
                        name="description"
                        control={form.control}
                        render={({ field }) => (
                          <Textarea
                            {...field}
                            id="description"
                            placeholder="Topics to be covered, pre-readings..."
                          />
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="startTime">Start Time</Label>
                        <Controller
                          name="startTime"
                          control={form.control}
                          render={({ field, fieldState }) => (
                            <div className="space-y-1">
                              <DateTimePicker
                                {...field}
                                id="startTime"
                              />
                              {fieldState.invalid && (
                                <p className="text-xs text-destructive">{fieldState.error?.message}</p>
                              )}
                            </div>
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endTime">End Time</Label>
                        <Controller
                          name="endTime"
                          control={form.control}
                          render={({ field, fieldState }) => (
                            <div className="space-y-1">
                              <DateTimePicker
                                {...field}
                                id="endTime"
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
                      <Label htmlFor="meetingLink">Meeting Link (e.g. Google Meet, Zoom)</Label>
                      <Controller
                        name="meetingLink"
                        control={form.control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            id="meetingLink"
                            type="url"
                            placeholder="https://meet.google.com/abc-defg-hij"
                          />
                        )}
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsScheduleOpen(false)
                        form.reset()
                      }}
                      disabled={createSessionMutation.isPending}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createSessionMutation.isPending}
                    >
                      {createSessionMutation.isPending ? 'Scheduling...' : 'Schedule Class'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* View Rendering */}
      {viewMode === 'calendar' ? (
        <Card className="p-4 overflow-hidden ">
          <CardHeader className="flex flex-row items-center justify-between pb-4 space-y-0 flex-wrap gap-4">
            <CardTitle className="text-xl font-bold font-sans">
              {monthNames[month]} {year}
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button size="icon" variant="outline" onClick={handlePrevMonth}>
                <ChevronLeftIcon />
              </Button>
              <Button variant="outline" onClick={handleToday}>
                Today
              </Button>
              <Button size="icon" variant="outline" onClick={handleNextMonth}>
                <ChevronRightIcon />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {/* Weekday Labels */}
            <div className="grid grid-cols-7 border-b pb-2 text-center text-sm font-semibold text-muted-foreground">
              {weekdayNames.map((name) => (
                <div key={name} className="py-2">{name}</div>
              ))}
            </div>

            {/* Day Cells Grid */}
            <div className="grid grid-cols-7 grid-rows-6 gap-px bg-muted">
              {gridDays.map((cell, idx) => {
                const dayStr = getLocalDateString(cell.date)
                const daySessions = sessionsByDay[dayStr] ?? []
                const isToday = new Date().toDateString() === cell.date.toDateString()

                return (
                  <div
                    key={idx}
                    className={`min-h-[100px] md:min-h-[120px] bg-background p-2 flex flex-col justify-between hover:bg-accent/20 transition-colors relative ${!cell.isCurrentMonth ? 'text-muted-foreground/60 bg-muted/10' : ''
                      }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className={`text-xs font-bold rounded-full size-7 flex items-center justify-center ${isToday ? 'bg-pink-600 text-white font-black' : 'text-foreground'
                        }`}>
                        {cell.date.getDate()}
                      </span>
                    </div>

                    <div className="mt-1 flex-1 flex flex-col gap-1 overflow-y-auto max-h-[70px] md:max-h-[85px] no-scrollbar">
                      {daySessions.length <= 3 ? (
                        daySessions.map((session) => (
                          <Link
                            key={session.id}
                            to="/app/classes/$classId"
                            params={{ classId: session.id }}
                            className={`block p-1 text-[10px] md:text-xs rounded font-medium truncate border ${session.status === 'live'
                              ? 'bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400 animate-pulse'
                              : session.status === 'completed'
                                ? 'bg-muted border-muted-foreground/20 text-muted-foreground line-through'
                                : session.status === 'cancelled'
                                  ? 'bg-destructive/10 border-destructive/20 text-destructive line-through'
                                  : 'bg-primary/5 border-primary/10 text-primary hover:bg-primary/10'
                              }`}
                          >
                            <span className="flex items-center gap-1">
                              {session.status === 'live' && <span className="size-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />}
                              {session.title || 'Class'}
                            </span>
                          </Link>
                        ))
                      ) : (
                        <>
                          {daySessions.slice(0, 2).map((session) => (
                            <Link
                              key={session.id}
                              to="/app/classes/$classId"
                              params={{ classId: session.id }}
                              className={`block p-1 text-[10px] md:text-xs rounded font-medium truncate border ${session.status === 'live'
                                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400 animate-pulse'
                                : session.status === 'completed'
                                  ? 'bg-muted border-muted-foreground/20 text-muted-foreground line-through'
                                  : session.status === 'cancelled'
                                    ? 'bg-destructive/10 border-destructive/20 text-destructive line-through'
                                    : 'bg-primary/5 border-primary/10 text-primary hover:bg-primary/10'
                                }`}
                            >
                              <span className="flex items-center gap-1">
                                {session.status === 'live' && <span className="size-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />}
                                {session.title || 'Class'}
                              </span>
                            </Link>
                          ))}
                          <Popover>
                            <PopoverTrigger render={
                              <button className="text-[10px] md:text-xs font-semibold text-pink-600 hover:underline cursor-pointer text-left py-0.5">
                                +{daySessions.length - 2} more classes
                              </button>
                            } />
                            <PopoverContent className="w-64 p-3 space-y-2">
                              <h4 className="font-semibold text-xs text-muted-foreground border-b pb-1">
                                Classes on {cell.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                              </h4>
                              <div className="flex flex-col gap-1.5 max-h-[200px] overflow-y-auto pr-1">
                                {daySessions.map((session) => (
                                  <Link
                                    key={session.id}
                                    to="/app/classes/$classId"
                                    params={{ classId: session.id }}
                                    className={`block p-1.5 text-xs rounded font-medium border transition-colors ${session.status === 'live'
                                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400'
                                      : session.status === 'completed'
                                        ? 'bg-muted border-muted-foreground/20 text-muted-foreground line-through'
                                        : session.status === 'cancelled'
                                          ? 'bg-destructive/10 border-destructive/20 text-destructive line-through'
                                          : 'bg-primary/5 border-primary/10 text-primary hover:bg-primary/10'
                                      }`}
                                  >
                                    <div className="flex justify-between items-center gap-2">
                                      <span className="truncate flex items-center gap-1">
                                        {session.status === 'live' && <span className="size-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />}
                                        {session.title || 'Class'}
                                      </span>
                                      <span className="text-[9px] text-muted-foreground shrink-0">
                                        {new Date(session.startTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                    </div>
                                  </Link>
                                ))}
                              </div>
                            </PopoverContent>
                          </Popover>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className='space-y-4'>
          {sessions && sessions.length > 0 ? (
            [...sessions].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()).map((session) => {
              const isLive = session.status === 'live'

              return (
                <div
                  key={session.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/40 transition-colors gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-base">{session.title || 'Untitled Session'}</h3>
                      <Badge variant={
                        session.status === 'live' ? 'default' :
                          session.status === 'completed' ? 'secondary' :
                            session.status === 'cancelled' ? 'destructive' : 'outline'
                      }>
                        {session.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{session.description || 'No description provided.'}</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-2">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="size-3.5" />
                        {new Date(session.startTime).toLocaleString()} - {new Date(session.endTime).toLocaleTimeString()}
                      </span>
                      {session.meetingLink && (
                        <span className="flex items-center gap-1 text-primary">
                          <VideoIcon className="size-3.5" />
                          Live link available
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Link to="/app/classes/$classId" params={{ classId: session.id }} className={buttonVariants({ size: 'sm', variant: 'outline' })}>View details</Link>
                    {isLive && (
                      <Link to="/app/classes/$classId" params={{ classId: session.id }} className={buttonVariants({ size: 'sm', className: "bg-emerald-600 hover:bg-emerald-500" })}>Join Class</Link>
                    )}
                  </div>
                </div>
              )
            })
          ) : (
            <div className="text-center text-muted-foreground py-10">No class sessions scheduled.</div>
          )}
        </div>
      )}
    </div>
  )
}
