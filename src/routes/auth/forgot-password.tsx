import { useForm } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { ArrowLeftIcon } from 'lucide-react'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { authClient } from '@/lib/auth-client'

export const Route = createFileRoute('/auth/forgot-password')({
  head: () => ({
    meta: [{ title: 'Forgot Password | Whales Hub' }],
  }),
  component: ForgotPasswordPage,
})

const forgotPasswordSchema = z.object({
  email: z.email('Please enter a valid email address'),
})

function ForgotPasswordPage() {
  const router = useRouter()

  const { mutate: sendResetOtp, isPending } = useMutation({
    mutationFn: async (values: z.infer<typeof forgotPasswordSchema>) => {
      const { error } = await authClient.forgetPassword.emailOtp({
        email: values.email,
      })
      if (error) throw error
      return values.email
    },
    onSuccess: (email) => {
      toast.success('Password reset code sent')
      router.navigate({
        to: '/auth/reset-password',
        search: { email },
      })
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to send reset code')
    },
  })

  const form = useForm({
    defaultValues: {
      email: '',
    },
    validators: {
      onSubmit: forgotPasswordSchema,
    },
    onSubmit: ({ value }) => {
      sendResetOtp(value)
    },
  })

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">

          <h1 className="text-3xl font-bold tracking-tight">
            Forgot password?
          </h1>
          <p className="mt-2 text-muted-foreground">
            No worries, we'll send you reset instructions.
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
              name="email"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0
                return (
                  <Field data-invalid={isInvalid} className="space-y-2">
                    <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="email"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      autoComplete="email"
                      placeholder="name@example.com"
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
            {isPending ? <Spinner /> : 'Send reset code'}
          </Button>
        </form>

        <div className="text-center">
          <Link
            to="/auth/login"
            className={buttonVariants({ variant: 'ghost' })}
          >
            <ArrowLeftIcon />
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
