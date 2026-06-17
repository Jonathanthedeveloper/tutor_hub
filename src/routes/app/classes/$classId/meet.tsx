import * as React from 'react'
import { Component, type ReactNode } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { buttonVariants } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useUser } from '@/features/auth/hooks'
import { useSession, useMeetingToken } from '@/features/class-sessions/hooks'
import { ArrowLeftIcon, VideoIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { JitsiMeeting } from '@jitsi/react-sdk'

export const Route = createFileRoute('/app/classes/$classId/meet')({
  component: InAppMeetingComponent,
})

interface ErrorBoundaryProps {
  fallback: ReactNode
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

class JitsiErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false
  }

  public static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true }
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("JitsiMeeting loading error boundary caught an error:", error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback
    }

    return this.props.children
  }
}

function InAppMeetingComponent() {
  const { classId } = Route.useParams()
  const navigate = useNavigate()
  const user = useUser()
  const { data: session, isPending: loadingSession } = useSession(classId)
  const { data: tokenData, isPending: loadingToken } = useMeetingToken(classId)

  if (!user) return null

  const isPending = loadingSession || loadingToken

  if (!session || isPending) {
    return (
      <div className="space-y-4 h-[calc(100vh-8rem)] min-h-[500px] flex flex-col">
        <div className="flex flex-wrap items-center justify-between gap-4 shrink-0 bg-muted/30 border p-3 rounded-xl">
          <div className="flex items-center gap-3">
            <Link
              to="/app/classes/$classId"
              params={{ classId }}
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'gap-1.5')}
            >
              <ArrowLeftIcon />
              Leave Class
            </Link>
          </div>
        </div>
        <div className="flex-1 border rounded-xl overflow-hidden bg-black shadow-lg relative min-h-0 flex items-center justify-center">
          <Spinner className="size-8 text-primary" />
        </div>
      </div>
    )
  }

  if (!tokenData?.domain) {
    throw new Error("Jitsi domain is not configured on the server.")
  }

  // Clean domain protocol for @jitsi/react-sdk
  const cleanDomain = tokenData.domain.replace(/^(https?:\/\/)/, "")

  return (
    <div className="space-y-4 h-[calc(100vh-8rem)] min-h-[500px] flex flex-col">
      {/* Top Banner Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 shrink-0 bg-muted/30 border p-3 rounded-xl">
        <div className="flex items-center gap-3">
          <Link
            to="/app/classes/$classId"
            params={{ classId }}
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'gap-1.5')}
          >
            <ArrowLeftIcon />
            Leave Class
          </Link>
          <div className="space-y-0.5">
            <h1 className="text-sm font-bold flex items-center gap-1.5 leading-none">
              <VideoIcon className="size-4 text-emerald-500 animate-pulse shrink-0" />
              {session?.title || 'Classroom Session'}
            </h1>
            <p className="text-[10px] text-muted-foreground">
              Joined as <span className="capitalize font-semibold">{user.role}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Embedded Meeting Frame container */}
      <div className="flex-1 border rounded-xl overflow-hidden bg-black shadow-lg relative min-h-0">
        <JitsiErrorBoundary fallback={
          <div className="flex flex-col items-center justify-center p-8 text-center bg-card text-card-foreground h-full rounded-xl gap-4 max-w-md mx-auto">
            <div className="p-3 bg-destructive/10 text-destructive rounded-full">
              <VideoIcon className="size-8" />
            </div>
            <h2 className="text-lg font-bold">Virtual Classroom Load Error</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We couldn't load the Jitsi Meet classroom script from <code className="font-mono text-xs px-1 py-0.5 bg-muted rounded">https://{cleanDomain}</code>.
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              If you are running locally, your browser may be blocking the connection because of Jitsi's self-signed SSL certificate.
            </p>
            <a
              href={`https://${cleanDomain}`}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ variant: "default" }), "w-full mt-2 gap-2")}
            >
              Trust Jitsi Certificate &rarr;
            </a>
            <p className="text-[10px] text-muted-foreground/80 mt-1">
              Clicking the button will open Jitsi in a new tab. Accept the security warning/exception, then return here and refresh the page.
            </p>
          </div>
        }>
          <JitsiMeeting
            domain={cleanDomain}
            roomName={`tutor-hub-class-session-${session.id}`}
            jwt={tokenData?.token ?? undefined}
            userInfo={{
              displayName: user.name,
              email: user.email,
            }}
            configOverwrite={{
              startWithAudioMuted: true,
              startWithVideoMuted: true,
              prejoinPageEnabled: false,
              disableThirdPartyRequests: true,
            }}
            interfaceConfigOverwrite={{
              TOOLBAR_BUTTONS: [
                'microphone',
                'camera',
                'closedcaptions',
                'desktop',
                'fullscreen',
                'fodeviceselection',
                'hangup',
                'profile',
                'chat',
                'recording',
                'livestreaming',
                'etherpad',
                'sharedvideo',
                'settings',
                'raisehand',
                'videoquality',
                'filmstrip',
                'invite',
                'feedback',
                'stats',
                'shortcuts',
                'tileview',
                'videobackgroundblur',
                'download',
                'help',
                'mute-everyone',
                'security',
              ],
            }}
            onApiReady={(api) => {
              api.on('videoConferenceLeft', () => {
                navigate({ to: `/app/classes/${session.id}` })
              })
            }}
            getIFrameRef={(iframeRef) => {
              iframeRef.style.height = '100%'
            }}
          />
        </JitsiErrorBoundary>
      </div>
    </div>
  )
}
