import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useUser, useUsers } from '@/features/auth/hooks'
import { useCourses, useAllCourses, useCreateCourse, useDeleteCourse } from '@/features/courses/hooks'
import { useEnroll } from '@/features/enrollments/hooks'
import { PlusIcon, TrashIcon, EyeIcon, SearchIcon } from 'lucide-react'
import { toast } from 'sonner'
import { z } from "zod"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/app/courses/')({
  component: CoursesIndexComponent,
})

function CoursesIndexComponent() {
  const user = useUser()

  if (!user) return null

  switch (user.role) {
    case 'admin':
      return <AdminCoursesView />
    case 'tutor':
      return <TutorCoursesView />
    case 'student':
      return <StudentCoursesView />
    default:
      return <div>Access Denied</div>
  }
}

// ----------------------------------------------------
// ADMIN VIEW
// ----------------------------------------------------
const createCourseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  code: z.string().min(1, "Course code is required"),
  tutorId: z.string().min(1, "Please assign a tutor"),
  description: z.string().optional(),
})

type CreateCourseFormData = z.infer<typeof createCourseSchema>

function AdminCoursesView() {
  const { data: courses, isPending: loadingCourses } = useCourses()
  const { data: users, isPending: loadingUsers } = useUsers()

  const createCourseMutation = useCreateCourse()
  const deleteCourseMutation = useDeleteCourse()

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const form = useForm<CreateCourseFormData>({
    resolver: zodResolver(createCourseSchema),
    defaultValues: {
      title: '',
      code: '',
      tutorId: '',
      description: '',
    },
  })

  const isPending = loadingCourses || loadingUsers

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner className="size-8" />
      </div>
    )
  }

  const tutors = users?.filter((u) => u.role === 'tutor') ?? []

  const handleCreateSubmit = form.handleSubmit((data) => {
    createCourseMutation.mutate(
      {
        title: data.title,
        code: data.code.toUpperCase(),
        tutorId: data.tutorId,
        description: data.description,
      },
      {
        onSuccess: () => {
          toast.success('Course created successfully!')
          setIsCreateOpen(false)
          form.reset()
        },
        onError: (err: any) => {
          toast.error(err.message || 'Failed to create course')
        },
      }
    )
  })

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this course? All class sessions and enrollments will be deleted.')) {
      deleteCourseMutation.mutate(id, {
        onSuccess: () => {
          toast.success('Course deleted successfully')
        },
        onError: (err: any) => {
          toast.error(err.message || 'Failed to delete course')
        },
      })
    }
  }

  const filteredCourses = courses?.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase())
  ) ?? []

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Courses Management</h1>
          <p className="text-muted-foreground mt-1">Create courses, assign instructors, and monitor enrollees.</p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={(open) => {
          setIsCreateOpen(open)
          if (!open) form.reset()
        }}>
          <DialogTrigger render={<Button className="gap-2">
            <PlusIcon />
            Create Course
          </Button>}>

          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleCreateSubmit}>
              <DialogHeader>
                <DialogTitle>Create a New Course</DialogTitle>
                <DialogDescription>
                  Enter details to initialize a new course study program and assign a tutor.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="title">Course Title</Label>
                    <Controller
                      name="title"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <div className="space-y-1">
                          <Input
                            {...field}
                            id="title"
                            placeholder="e.g. Introduction to Physics"
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
                    <Label htmlFor="code">Course Code</Label>
                    <Controller
                      name="code"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <div className="space-y-1">
                          <Input
                            {...field}
                            id="code"
                            placeholder="e.g. PHY101"
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
                  <Label htmlFor="tutor">Assign Tutor</Label>
                  <Controller
                    name="tutorId"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <div className="space-y-1">
                        <select
                          {...field}
                          id="tutor"
                          aria-invalid={fieldState.invalid}
                          className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-normal"
                        >
                          <option value="">-- Choose Tutor --</option>
                          {tutors.map((t) => (
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
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Controller
                    name="description"
                    control={form.control}
                    render={({ field }) => (
                      <Textarea
                        {...field}
                        id="description"
                        placeholder="Short summary of curriculum or prerequisites..."
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
                    setIsCreateOpen(false)
                    form.reset()
                  }}
                  disabled={createCourseMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createCourseMutation.isPending}
                >
                  {createCourseMutation.isPending ? 'Creating...' : 'Create Course'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-2 max-w-sm border rounded-lg px-3 py-2 bg-background">
        <SearchIcon className="size-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search courses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent text-sm focus:outline-none"
        />
      </div>


      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Code</TableHead>
            <TableHead>Course Title</TableHead>
            <TableHead>Assigned Tutor</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="w-[120px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredCourses.length > 0 ? (
            filteredCourses.map((c) => {
              const assignedTutor = users?.find((u) => u.id === c.tutorId)
              return (
                <TableRow key={c.id}>
                  <TableCell className="text-primary">{c.code}</TableCell>
                  <TableCell className="font-medium">{c.title}</TableCell>
                  <TableCell>{assignedTutor ? assignedTutor.name : 'Unassigned'}</TableCell>
                  <TableCell>{new Date(c.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="flex items-center justify-end gap-2">
                    <Link to="/app/courses/$courseId" params={{ courseId: c.id }} className={cn(buttonVariants({ size: "icon", variant: "ghost" }))}>
                      <EyeIcon />
                    </Link>
                    <Button size="icon" variant="ghost" className="hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDelete(c.id)}>
                      <TrashIcon />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                No courses found. Click Create Course to start.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

// ----------------------------------------------------
// TUTOR VIEW
// ----------------------------------------------------
function TutorCoursesView() {
  const { data: courses, isPending } = useCourses()
  const [searchQuery, setSearchQuery] = useState('')

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner className="size-8" />
      </div>
    )
  }

  const filteredCourses = courses?.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase())
  ) ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Assigned Courses</h1>
        <p className="text-muted-foreground mt-1">Courses assigned to you for teaching and scheduling classes.</p>
      </div>

      <div className="flex items-center gap-2 max-w-sm border rounded-lg px-3 py-2 bg-background">
        <SearchIcon className="size-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search my courses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent text-sm focus:outline-none"
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredCourses.length > 0 ? (
          filteredCourses.map((c) => (
            <Card key={c.id} className="hover:shadow-md transition-all">
              <CardHeader className="pb-3">
                <Badge className="font-mono mb-2 w-fit">{c.code}</Badge>
                <CardTitle className="text-xl font-bold leading-tight">{c.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-3 min-h-[60px]">
                  {c.description || 'No description provided.'}
                </p>
                <Link to="/app/courses/$courseId" params={{ courseId: c.id }} className={cn("w-full", buttonVariants())}>Manage Course & Classes</Link>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center text-muted-foreground py-10">
            You are not assigned to any courses currently.
          </div>
        )}
      </div>
    </div>
  )
}

// ----------------------------------------------------
// STUDENT VIEW
// ----------------------------------------------------
function StudentCoursesView() {
  const { data: enrolledCourses, isPending: loadingEnrolled } = useCourses()
  const { data: allCourses, isPending: loadingAll } = useAllCourses()
  const { data: users, isPending: loadingUsers } = useUsers()
  const enrollMutation = useEnroll()

  const [searchQuery, setSearchQuery] = useState('')

  const isPending = loadingEnrolled || loadingAll || loadingUsers

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner className="size-8" />
      </div>
    )
  }

  const handleEnroll = (courseId: string) => {
    enrollMutation.mutate(courseId, {
      onSuccess: () => {
        toast.success('Successfully enrolled in course!')
      },
      onError: (err: any) => {
        toast.error(err.message || 'Failed to enroll')
      },
    })
  }

  const enrolledIds = new Set(enrolledCourses?.map((c) => c.id) ?? [])

  const filteredCatalog = allCourses?.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase())
  ) ?? []

  const filteredEnrolled = enrolledCourses?.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase())
  ) ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Courses Catalog</h1>
        <p className="text-muted-foreground mt-1">Browse, view course contents, and enroll in studies.</p>
      </div>

      <div className="flex items-center gap-2 max-w-sm border rounded-lg px-3 py-2 bg-background">
        <SearchIcon className="size-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search courses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent text-sm focus:outline-none"
        />
      </div>

      <Tabs defaultValue="catalog" className="space-y-4">
        <TabsList>
          <TabsTrigger value="catalog">Browse All Courses</TabsTrigger>
          <TabsTrigger value="enrolled">My Enrolled Courses ({enrolledCourses?.length ?? 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="catalog" className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCatalog.length > 0 ? (
              filteredCatalog.map((c) => {
                const isEnrolled = enrolledIds.has(c.id)
                const tutorUser = users?.find((u) => u.id === c.tutorId)

                return (
                  <Card key={c.id} className="hover:shadow-md transition-all flex flex-col justify-between">
                    <div>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <Badge variant="outline" className="font-mono">{c.code}</Badge>
                          {isEnrolled && <Badge className="bg-emerald-600 hover:bg-emerald-500">Enrolled</Badge>}
                        </div>
                        <CardTitle className="text-xl font-bold leading-tight">{c.title}</CardTitle>
                        <CardDescription className="text-xs">Instructor: {tutorUser ? tutorUser.name : 'Unknown'}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {c.description || 'No description provided.'}
                        </p>
                      </CardContent>
                    </div>
                    <div className="p-6 pt-0 space-y-2">
                      {isEnrolled ? (
                        <Link to="/app/courses/$courseId" params={{ courseId: c.id }} className={cn("w-full", buttonVariants({ variant: "outline" }))}>Go to Course</Link>
                      ) : (
                        <div className="flex gap-2">
                          <Link to="/app/courses/$courseId" params={{ courseId: c.id }} className={cn("flex-1", buttonVariants({ variant: "outline" }))}>Preview</Link>
                          <Button
                            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                            onClick={() => handleEnroll(c.id)}
                            disabled={enrollMutation.isPending}
                          >
                            Enroll
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                )
              })
            ) : (
              <div className="col-span-full text-center text-muted-foreground py-10">
                No courses found matching your criteria.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="enrolled" className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEnrolled.length > 0 ? (
              filteredEnrolled.map((c) => {
                const tutorUser = users?.find((u) => u.id === c.tutorId)

                return (
                  <Card key={c.id} className="hover:shadow-md transition-all flex flex-col justify-between">
                    <div>
                      <CardHeader className="pb-3">
                        <Badge variant="outline" className="font-mono mb-2 w-fit">{c.code}</Badge>
                        <CardTitle className="text-xl font-bold leading-tight">{c.title}</CardTitle>
                        <CardDescription className="text-xs">Instructor: {tutorUser ? tutorUser.name : 'Unknown'}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {c.description || 'No description provided.'}
                        </p>
                      </CardContent>
                    </div>
                    <div className="p-6 pt-0">
                      <Link to="/app/courses/$courseId" params={{ courseId: c.id }} className={cn("w-full", buttonVariants())}>Enter Course Room</Link>
                    </div>
                  </Card>
                )
              })
            ) : (
              <div className="col-span-full text-center text-muted-foreground py-10">
                You haven't enrolled in any courses yet. Go to catalog to browse.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
