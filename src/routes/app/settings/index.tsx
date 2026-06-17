import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authClient } from '@/lib/auth-client'
import { toast } from 'sonner'
import { useUser, useUploadProfileImage } from '@/features/auth/hooks'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { LockIcon, UserIcon, ShieldCheckIcon } from 'lucide-react'
import { z } from "zod"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

export const Route = createFileRoute('/app/settings/')({
  component: SettingsComponent,
})

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  avatarUrl: z.string().optional().or(z.literal('')),
})

type ProfileFormData = z.infer<typeof profileSchema>

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type PasswordFormData = z.infer<typeof passwordSchema>

function SettingsComponent() {
  const user = useUser()
  const queryClient = useQueryClient()
  const uploadImageMutation = useUploadProfileImage()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    uploadImageMutation.mutate(file, {
      onSuccess: (res) => {
        const currentName = profileForm.getValues('name') || user?.name || ''
        updateProfileMutation.mutate(
          { name: currentName, image: res.url },
          {
            onSuccess: () => {
              profileForm.setValue('avatarUrl', res.url, { shouldDirty: false })
              toast.success('Profile photo updated!')
            },
            onError: (err: any) => {
              profileForm.setValue('avatarUrl', res.url, { shouldDirty: true })
              toast.error(err.message || 'Failed to save profile photo')
            },
          }
        )
      },
      onError: (err: any) => {
        toast.error(err.message || 'Failed to upload image')
      }
    })
  }

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      avatarUrl: '',
    },
  })

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  // Mutation to update profile info
  const updateProfileMutation = useMutation({
    mutationFn: async (data: { name: string; image: string }) => {
      const { data: res, error } = await authClient.updateUser({
        name: data.name,
        image: data.image,
      })
      if (error) throw error
      return res
    },
    onSuccess: () => {
      toast.success('Profile updated successfully!')
      queryClient.invalidateQueries({ queryKey: ['session'] })
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update profile details')
    },
  })

  // Mutation to change password
  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const { data: res, error } = await authClient.changePassword({
        newPassword: data.newPassword,
        currentPassword: data.currentPassword,
        revokeOtherSessions: true,
      })
      if (error) throw error
      return res
    },
    onSuccess: () => {
      toast.success('Password updated successfully!')
      passwordForm.reset()
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update password')
    },
  })

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[450px]">
        <Spinner className="size-8" />
      </div>
    )
  }

  // Set initial values when user data is available
  if (user && !profileForm.formState.isDirty && profileForm.formState.defaultValues?.name === '') {
    profileForm.reset({
      name: user.name || '',
      avatarUrl: user.image || '',
    })
  }

  const handleProfileSubmit = profileForm.handleSubmit((data) => {
    updateProfileMutation.mutate({ name: data.name, image: data.avatarUrl || '' })
  })

  const handlePasswordSubmit = passwordForm.handleSubmit((data) => {
    changePasswordMutation.mutate({ currentPassword: data.currentPassword, newPassword: data.newPassword })
  })

  // Initials for avatar fallback
  const getInitials = (userName: string) => {
    if (!userName) return 'TH'
    return userName
      .split(' ')
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  return (
    <div className="mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your tutor profile, email preferences, and password security.</p>
      </div>

      <Tabs defaultValue="profile" className="w-full space-y-6">
        <TabsList className="grid w-full max-w-[400px] grid-cols-2">
          <TabsTrigger value="profile" className="gap-2">
            <UserIcon />
            Profile Details
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <LockIcon />
            Security & Login
          </TabsTrigger>
        </TabsList>

        {/* PROFILE TAB */}
        <TabsContent value="profile">
          <form onSubmit={handleProfileSubmit}>
            <Card className="">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal account information and custom display photo.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Preview & Upload Area */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-6 p-4 border rounded-lg bg-muted/20">
                  <Avatar size="lg">
                    <AvatarImage src={profileForm.watch('avatarUrl')} alt={profileForm.watch('name')} />
                    <AvatarFallback className="text-lg font-bold bg-primary/10 text-primary">
                      {getInitials(profileForm.watch('name'))}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Profile Photo</Label>
                    <div className="flex items-center gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('avatar-file-input')?.click()}
                        disabled={uploadImageMutation.isPending}
                        className="cursor-pointer"
                      >
                        {uploadImageMutation.isPending ? 'Uploading...' : 'Upload Image'}
                      </Button>
                      {profileForm.watch('avatarUrl') && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10 cursor-pointer"
                          onClick={() => profileForm.setValue('avatarUrl', '', { shouldDirty: true })}
                        >
                          Remove Photo
                        </Button>
                      )}
                    </div>
                    <input
                      id="avatar-file-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <p className="text-xs text-muted-foreground">Supported formats: JPG, PNG, or GIF. Max size: 5MB.</p>
                  </div>
                </div>

                {/* Form fields */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Controller
                      name="name"
                      control={profileForm.control}
                      render={({ field, fieldState }) => (
                        <div className="space-y-1">
                          <Input
                            {...field}
                            id="name"
                            type="text"
                            placeholder="e.g. Sarah Jenkins"
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
                    <Label className="flex items-center gap-1.5">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={user.email}
                      disabled
                      className="bg-muted text-muted-foreground cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label className="flex items-center gap-1.5">
                      Account Role
                    </Label>
                    <div className="flex items-center p-3 border rounded-lg bg-muted/15 max-w-xs justify-between">
                      <span className="text-sm font-semibold capitalize text-foreground">{user.role || 'Student'}</span>
                      <Badge className="bg-primary/15 text-primary border-transparent pointer-events-none uppercase text-[10px]">
                        Active Member
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-3 border-t bg-muted/10 py-4">
                <Button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="gap-2"
                >
                  {updateProfileMutation.isPending ? (
                    <>
                      <Spinner className="size-4" />
                      Saving changes...
                    </>
                  ) : (
                    'Save Profile Details'
                  )}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>

        {/* SECURITY TAB */}
        <TabsContent value="security">
          <form onSubmit={handlePasswordSubmit}>
            <Card className="">
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update the security credentials used to log in to your account.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Controller
                    name="currentPassword"
                    control={passwordForm.control}
                    render={({ field, fieldState }) => (
                      <div className="space-y-1">
                        <PasswordInput
                          {...field}
                          id="current-password"
                          placeholder="Enter your current password"
                          aria-invalid={fieldState.invalid}
                        />
                        {fieldState.invalid && (
                          <p className="text-xs text-destructive">{fieldState.error?.message}</p>
                        )}
                      </div>
                    )}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Controller
                      name="newPassword"
                      control={passwordForm.control}
                      render={({ field, fieldState }) => (
                        <div className="space-y-1">
                          <PasswordInput
                            {...field}
                            id="new-password"
                            placeholder="Minimum 8 characters"
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
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Controller
                      name="confirmPassword"
                      control={passwordForm.control}
                      render={({ field, fieldState }) => (
                        <div className="space-y-1">
                          <PasswordInput
                            {...field}
                            id="confirm-password"
                            placeholder="Retype your new password"
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

                <div className="flex items-start gap-3 p-4 border rounded-lg bg-yellow-500/5 text-yellow-800 dark:text-yellow-200 mt-4 border-yellow-500/20 text-sm">
                  <ShieldCheckIcon className="size-5 shrink-0 mt-0.5 text-yellow-600 dark:text-yellow-400" />
                  <p className="leading-relaxed">
                    Changing your password will automatically log out all other active sessions for this account on other devices.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-3 border-t bg-muted/10 py-4">
                <Button
                  type="submit"
                  disabled={changePasswordMutation.isPending}
                  className="gap-2"
                >
                  {changePasswordMutation.isPending ? (
                    <>
                      <Spinner className="size-4" />
                      Updating password...
                    </>
                  ) : (
                    'Change Password'
                  )}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  )
}
