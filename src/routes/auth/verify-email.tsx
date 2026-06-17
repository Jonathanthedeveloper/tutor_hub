import { useForm } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { MailIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { Spinner } from '@/components/ui/spinner'
import { authClient } from '@/lib/auth-client'

const searchSchema = z.object({
  email: z.email().optional(),
})

export const Route = createFileRoute('/auth/verify-email')({
  validateSearch: (search: Record<string, unknown>) => {
    return searchSchema.parse(search)
  },
  component: VerifyEmail,
})

const verifyEmailOtp = z.object({
  otp: z.string().length(6, 'Code must be 6 digits'),
})

function VerifyEmail() {
  const { email } = Route.useSearch()
  const router = useRouter()
  const [timeLeft, setTimeLeft] = useState(60)

  useEffect(() => {
    if (timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft])

  const { mutate: verifyEmail, isPending } = useMutation({
    mutationKey: ['verify-email'],
    mutationFn: async (otp: string) => {
      if (!email) throw new Error('Email is required')
      const { error } = await authClient.emailOtp.verifyEmail({
        email,
        otp,
      })
      if (error) throw error
    },
    onError: (error) => {
      toast.error(error.message)
    },
    onSuccess: () => {
      toast.success('Email verified successfully')
      router.navigate({ to: '/app' })
    },
  })

  const { mutate: sendVerificationOtp, isPending: isSendingOtp } = useMutation({
    mutationFn: async () => {
      if (!email) throw new Error('Email is required')
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: 'email-verification',
      })
      if (error) throw error
    },
    onSuccess: () => {
      toast.success('Verification code sent successfully')
      setTimeLeft(60)
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const form = useForm({
    defaultValues: {
      otp: '',
    },
    validators: {
      onSubmit: verifyEmailOtp,
    },
    onSubmit: ({ value }) => {
      verifyEmail(value.otp)
    },
  })

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-8">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="flex items-center justify-center size-16 rounded-full bg-primary/10">
            <MailIcon className="size-8 text-primary" />
          </div>
        </div>

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Check your email
          </h1>
          <p className="text-sm text-muted-foreground">
            We've sent a 6-digit verification code to
          </p>
          {email && (
            <p className="text-sm font-medium text-foreground">{email}</p>
          )}
        </div>

        {/* OTP Input */}
        <form
          className="space-y-6"
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
        >
          <div className="flex justify-center">
            <form.Field name="otp">
              {(field) => (
                <InputOTP
                  maxLength={6}
                  value={field.state.value}
                  onChange={(value) =>
                    field.handleChange(value.replace(/\D/g, ''))
                  }
                  disabled={isPending}
                >
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
              )}
            </form.Field>
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={
              isPending || form.state.values.otp.replace(/\D/g, '').length !== 6
            }
          >
            {isPending ? <Spinner /> : 'Verify Email'}
          </Button>
        </form>

        {/* Resend Section */}
        <div className="text-center text-sm">
          <span className="text-muted-foreground">
            Didn't receive the code?{' '}
          </span>
          <Button
            variant="link"
            className="p-0 h-auto font-semibold text-primary hover:underline"
            disabled={timeLeft > 0 || isSendingOtp || !email}
            onClick={() => sendVerificationOtp()}
          >
            {isSendingOtp ? (
              <Spinner />
            ) : timeLeft > 0 ? (
              `Resend in ${timeLeft}s`
            ) : (
              'Resend code'
            )}
          </Button>
        </div>

        {/* Back to Login */}
        <div className="text-center text-sm">
          <Link
            to="/auth/login"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to login
          </Link>
        </div>
      </div>
    </div>
  )
}
