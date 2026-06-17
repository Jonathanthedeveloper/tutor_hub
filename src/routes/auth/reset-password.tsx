import { useForm } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeftIcon, LockIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { PasswordInput } from '@/components/ui/password-input'
import { Spinner } from '@/components/ui/spinner'
import { authClient } from '@/lib/auth-client'

const searchSchema = z.object({
  email: z.email().optional(),
})

export const Route = createFileRoute('/auth/reset-password')({
  component: ResetPasswordPage,
  validateSearch: (search: Record<string, unknown>) => {
    return searchSchema.parse(search)
  },
})

const passwordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

function ResetPasswordPage() {
  const { email } = Route.useSearch()
  const [step, setStep] = useState<'otp' | 'password' | 'success'>('otp')
  const [otp, setOtp] = useState('')
  const [timeLeft, setTimeLeft] = useState(60)

  useEffect(() => {
    if (timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft])

  const handleOtpComplete = (value: string) => {
    setOtp(value)
    if (value.length === 6) {
      setStep('password')
    }
  }

  const { mutate: resetPassword, isPending } = useMutation({
    mutationFn: async (values: z.infer<typeof passwordSchema>) => {
      if (!email) throw new Error('Email is required')
      const { error } = await authClient.emailOtp.resetPassword({
        email,
        otp,
        password: values.password,
      })
      if (error) throw error
    },
    onSuccess: () => {
      toast.success('Password reset successfully')
      setStep('success')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to reset password')
    },
  })

  const { mutate: resendOtp, isPending: isResending } = useMutation({
    mutationFn: async () => {
      if (!email) throw new Error('Email is required')
      const { error } = await authClient.forgetPassword.emailOtp({
        email,
      })
      if (error) throw error
    },
    onSuccess: () => {
      toast.success('Reset code sent successfully')
      setTimeLeft(60)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to resend code')
    },
  })

  const form = useForm({
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
    validators: {
      onSubmit: passwordSchema,
    },
    onSubmit: ({ value }) => {
      resetPassword(value)
    },
  })

  // Show success message
  if (step === 'success') {
    return (
      <div className="flex flex-col items-center justify-center p-4 bg-background">
        <div className="w-full max-w-md space-y-8 text-center">

          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Password reset complete
            </h1>
            <p className="mt-4 text-muted-foreground">
              Your password has been reset successfully. You can now sign in
              with your new password.
            </p>
          </div>
          <Link to="/auth/login">
            <Button className="w-full">Sign in</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Show no email error - redirect to forgot password
  if (!email) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="mx-auto size-16 rounded-full bg-primary/10 flex items-center justify-center">
            <LockIcon className="size-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Reset your password
            </h1>
            <p className="mt-4 text-muted-foreground">
              To reset your password, please start from the forgot password
              page.
            </p>
          </div>
          <Link to="/auth/forgot-password">
            <Button className="w-full">Go to forgot password</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Step 1: OTP Input
  if (step === 'otp') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="mx-auto size-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <LockIcon className="size-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              Enter your code
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              We've sent a 6-digit code to
            </p>
            <p className="text-sm font-medium text-foreground">{email}</p>
          </div>

          <div className="flex justify-center">
            <InputOTP maxLength={6} value={otp} onChange={handleOtpComplete}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSeparator />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <Button
            className="w-full"
            size="lg"
            disabled={otp.length !== 6}
            onClick={() => setStep('password')}
          >
            Continue
          </Button>

          {/* Resend Section */}
          <div className="text-center text-sm">
            <span className="text-muted-foreground">
              Didn't receive the code?{' '}
            </span>
            <Button
              variant="link"
              className="p-0 h-auto font-semibold text-primary hover:underline"
              disabled={timeLeft > 0 || isResending}
              onClick={() => resendOtp()}
            >
              {isResending ? (
                <Spinner />
              ) : timeLeft > 0 ? (
                `Resend in ${timeLeft}s`
              ) : (
                'Resend code'
              )}
            </Button>
          </div>

          <div className="text-center">
            <Link
              to="/auth/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Step 2: Password Input
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto size-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <LockIcon className="size-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Set new password
          </h1>
          <p className="mt-2 text-muted-foreground">
            Enter your new password below.
          </p>
        </div>

        <form
          className="space-y-6"
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
        >
          <FieldGroup>
            <form.Field
              name="password"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0
                return (
                  <Field data-invalid={isInvalid} className="space-y-2">
                    <FieldLabel htmlFor={field.name}>New Password</FieldLabel>
                    <PasswordInput
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      autoComplete="new-password"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            />
            <form.Field
              name="confirmPassword"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0
                return (
                  <Field data-invalid={isInvalid} className="space-y-2">
                    <FieldLabel htmlFor={field.name}>
                      Confirm Password
                    </FieldLabel>
                    <PasswordInput
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      autoComplete="new-password"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            />
          </FieldGroup>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isPending}
          >
            {isPending ? <Spinner /> : 'Reset password'}
          </Button>
        </form>

        <div className="text-center">
          <Button
            variant="ghost"
            className="text-sm text-muted-foreground"
            onClick={() => setStep('otp')}
          >
            <ArrowLeftIcon className="size-4 mr-1" />
            Back to code entry
          </Button>
        </div>
      </div>
    </div>
  )
}
