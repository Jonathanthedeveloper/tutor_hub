import { useState } from 'react'
import { createFileRoute, redirect, Link } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { buttonVariants } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useUsers, useUpdateUserRole } from '@/features/auth/hooks'
import { UsersIcon, ShieldAlertIcon, GraduationCapIcon, UserCheckIcon, SearchIcon, EyeIcon } from 'lucide-react'
import { toast } from 'sonner'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

export const Route = createFileRoute('/app/users/')({
  component: UsersIndexComponent,
  beforeLoad: async ({ context }) => {
    const { user } = context as any
    if (user?.role !== 'admin') {
      throw redirect({
        to: '/app',
      })
    }
  }
})

function UsersIndexComponent() {
  const { data: users, isPending } = useUsers()
  const updateRoleMutation = useUpdateUserRole()
  const [searchQuery, setSearchQuery] = useState('')

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner className="size-8" />
      </div>
    )
  }

  const handleRoleChange = (userId: string, newRole: string) => {
    updateRoleMutation.mutate(
      { id: userId, role: newRole },
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

  const totalUsers = users?.length ?? 0
  const adminsCount = users?.filter((u) => u.role === 'admin').length ?? 0
  const tutorsCount = users?.filter((u) => u.role === 'tutor').length ?? 0
  const studentsCount = users?.filter((u) => u.role === 'student').length ?? 0

  const filteredUsers = users?.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  ) ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground mt-1">Manage platform membership, user profile accounts, and role permissions.</p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <UsersIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Administrators</CardTitle>
            <ShieldAlertIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminsCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Instructors / Tutors</CardTitle>
            <UserCheckIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tutorsCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Enrolled Students</CardTitle>
            <GraduationCapIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentsCount}</div>
          </CardContent>
        </Card>
      </div>


      <InputGroup className='max-w-lg'>
        <InputGroupAddon>
          <SearchIcon className="size-4 text-muted-foreground" />
        </InputGroupAddon>
        <InputGroupInput
          type="text"
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)} />
      </InputGroup>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]"></TableHead>
            <TableHead>User Name</TableHead>
            <TableHead>Email Address</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Joined Date</TableHead>
            <TableHead className="w-[120px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.length > 0 ? (
            filteredUsers.map((u) => (
              <TableRow key={u.id}>
                <TableCell>
                  <Avatar className="size-8">
                    <AvatarImage src={u.image || undefined} alt={u.name || ''} />
                    <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                      {(u.name || 'U').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="font-semibold">{u.name}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  <select
                    value={u.role || 'student'}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    disabled={updateRoleMutation.isPending}
                    className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="student">Student</option>
                    <option value="tutor">Tutor</option>
                    <option value="admin">Admin</option>
                  </select>

                </TableCell>
                <TableCell>{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <Link to="/app/users/$userId" params={{ userId: u.id }} className={buttonVariants({ variant: "ghost", size: "icon" })}>
                    <EyeIcon />
                  </Link>
                </TableCell>
              </TableRow>
            ))
          ) : (
              <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                No users registered in database.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
