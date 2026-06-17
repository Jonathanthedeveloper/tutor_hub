import { createFileRoute, Link } from "@tanstack/react-router"
import { buttonVariants } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { ThemeToggle } from "@/components/layout/theme-provider"
import { Spinner } from "@/components/ui/spinner"
import {
  BookOpenIcon,
  CalendarIcon,
  UsersIcon,
  VideoIcon,
  ArrowRightIcon,
  CheckCircle2Icon,
  ShieldCheckIcon,
  LayersIcon,
  FolderOpenIcon,
  SparklesIcon
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/logo"

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: 'Tutor Hub - Live Virtual Tutoring Platform' },
      { name: 'description', content: 'Connect with expert tutors, join live virtual classes, and access resources in a unified learning hub.' },
    ],
  }),
  component: LandingPage,
})

function LandingPage() {
  const { data: session, isPending } = authClient.useSession()

  return (
    <div className="flex min-h-screen flex-col font-sans selection:bg-primary/20">
      {/* 1. STICKY HEADER */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Logo to="/" textClassName="text-xl bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent" iconClassName="h-9 w-9 [&>svg]:size-5" />
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#features" className="transition-colors hover:text-foreground">Features</a>
            <a href="#stats" className="transition-colors hover:text-foreground">Impact</a>
            <a href="#workflows" className="transition-colors hover:text-foreground">How it Works</a>
          </nav>

          {/* Auth Actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {isPending ? (
              <Spinner />
            ) : session ? (
              <Link
                to="/app"
                className={cn(
                  buttonVariants({ variant: "default", size: "sm" }),
                  "gap-1.5 font-medium transition-all"
                )}
              >
                Dashboard
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/auth/login"
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "sm" }),
                    "text-muted-foreground hover:text-foreground hidden sm:inline-flex"
                  )}
                >
                  Sign In
                </Link>
                <Link
                  to="/auth/register"
                  className={cn(
                    buttonVariants({ variant: "default", size: "sm" }),
                    "shadow-sm hover:shadow"
                  )}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden pt-20 pb-16 md:pt-32 md:pb-24">
        {/* Glow Effects */}
        <div className="absolute inset-0 -z-10 bg-radial-gradient from-primary/10 via-transparent to-transparent opacity-60 dark:opacity-40" />
        <div className="absolute -top-40 right-0 -z-10 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute top-60 left-10 -z-10 h-80 w-80 rounded-full bg-indigo-500/5 blur-3xl" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-4xl space-y-8">
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary animate-fade-in">
            <SparklesIcon className="h-3 w-3" />
            <span>Interactive Virtual Classrooms</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-foreground font-serif leading-[1.1]">
            Reshape the Future of Learning, <br className="hidden sm:inline" />
            <span className="bg-linear-to-r from-primary via-primary/95 to-indigo-500 bg-clip-text text-transparent">
              One Class at a Time
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-lg sm:text-xl text-muted-foreground leading-relaxed">
            The ultimate hub for tutors to schedule live virtual sessions, share learning resources, and track student success, all in one premium interface.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
            {session ? (
              <Link
                to="/app"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "w-full sm:w-auto font-medium gap-2 px-8 shadow-md hover:shadow-lg transition-all"
                )}
              >
                Go to Dashboard
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/auth/register"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "w-full sm:w-auto font-medium gap-2 px-8 shadow-md hover:shadow-lg transition-all"
                  )}
                >
                  Join as a Student
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
                <Link
                  to="/auth/register"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "w-full sm:w-auto font-medium px-8 hover:bg-muted/50"
                  )}
                >
                  Teach on Tutor Hub
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Visual Mockup Section */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-16 max-w-5xl">
          <div className="relative rounded-xl border border-border/50 bg-card/65 p-2 shadow-2xl backdrop-blur-sm dark:bg-card/30">
            <div className="rounded-lg border border-border/30 overflow-hidden bg-background">
              <div className="flex items-center justify-between border-b border-border/30 bg-muted/40 px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-destructive/80" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                  <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                </div>
                <div className="text-xs font-medium text-muted-foreground select-none">tutorhub.app/app/dashboard</div>
                <div className="w-12" />
              </div>
              <div className="p-4 sm:p-6 bg-muted/10 grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Simulated Dashboard Sidebar */}
                <div className="space-y-4 border border-border/40 rounded-lg p-4 bg-background shadow-sm">
                  <div className="flex items-center gap-2 border-b border-border/40 pb-3">
                    <div className="h-8 w-8 rounded bg-primary/15 text-primary flex items-center justify-center font-bold">T</div>
                    <div>
                      <div className="text-sm font-semibold leading-none">Tutor Hub</div>
                      <div className="text-[10px] text-muted-foreground">Virtual Academy</div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="h-8 rounded bg-primary/10 text-primary flex items-center px-3 text-xs font-medium gap-2">
                      <LayersIcon className="h-3.5 w-3.5" /> Dashboard
                    </div>
                    <div className="h-8 rounded hover:bg-muted flex items-center px-3 text-xs font-medium text-muted-foreground gap-2">
                      <BookOpenIcon className="h-3.5 w-3.5" /> Courses
                    </div>
                    <div className="h-8 rounded hover:bg-muted flex items-center px-3 text-xs font-medium text-muted-foreground gap-2">
                      <CalendarIcon className="h-3.5 w-3.5" /> Classes
                    </div>
                  </div>
                </div>

                {/* Simulated Class Grid */}
                <div className="md:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold">Upcoming Live Sessions</h4>
                      <p className="text-[10px] text-muted-foreground">Your classes for the next 24 hours</p>
                    </div>
                    <div className="h-7 w-20 rounded bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium shadow-sm">
                      + New Class
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <div className="border border-border/40 rounded-lg p-3 bg-background flex items-center justify-between shadow-sm">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold">Introduction to Advanced Physics</span>
                          <span className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold px-1.5 py-0.5 rounded-full">Live Now</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <CalendarIcon className="h-3 w-3" /> Today, 2:00 PM - 3:30 PM (EST)
                        </p>
                      </div>
                      <div className="h-8 px-3 rounded bg-emerald-600 text-white text-xs font-medium flex items-center justify-center cursor-pointer hover:bg-emerald-500 shadow-sm">
                        Join Class
                      </div>
                    </div>

                    <div className="border border-border/40 rounded-lg p-3 bg-background flex items-center justify-between shadow-sm opacity-85">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-muted-foreground">Calculus II: Taylor Series</span>
                          <span className="text-[9px] bg-primary/10 text-primary font-semibold px-1.5 py-0.5 rounded-full">Scheduled</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <CalendarIcon className="h-3 w-3" /> Tomorrow, 10:00 AM - 11:30 AM (EST)
                        </p>
                      </div>
                      <div className="h-8 px-3 rounded border border-border bg-background hover:bg-muted text-xs font-medium flex items-center justify-center text-muted-foreground">
                        Manage
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. IMPACT STATISTICS SECTION */}
      <section id="stats" className="border-y border-border/30 bg-muted/30 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto space-y-3 mb-12">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl font-serif">Trust & Scale That Speaks For Itself</h2>
            <p className="text-muted-foreground text-sm">Empowering educators and students globally to reach their goals.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8 max-w-4xl mx-auto">
            <div className="text-center space-y-1.5 p-4 rounded-xl bg-card border border-border/40 shadow-sm">
              <div className="text-3xl font-extrabold text-primary md:text-4xl">500+</div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Expert Tutors</div>
            </div>
            <div className="text-center space-y-1.5 p-4 rounded-xl bg-card border border-border/40 shadow-sm">
              <div className="text-3xl font-extrabold text-primary md:text-4xl">12k+</div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Classes Completed</div>
            </div>
            <div className="text-center space-y-1.5 p-4 rounded-xl bg-card border border-border/40 shadow-sm">
              <div className="text-3xl font-extrabold text-primary md:text-4xl">8.5k+</div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Happy Students</div>
            </div>
            <div className="text-center space-y-1.5 p-4 rounded-xl bg-card border border-border/40 shadow-sm">
              <div className="text-3xl font-extrabold text-primary md:text-4xl">99.4%</div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. KEY FEATURES SECTION */}
      <section id="features" className="py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-serif">Everything You Need to Host & Study</h2>
            <p className="text-muted-foreground text-lg">Ditch the disjointed stack of calendars, video tools, and chat groups. Tutor Hub integrates the entire flow.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Feature 1 */}
            <div className="group relative border border-border/40 rounded-xl p-6 hover:border-primary/30 hover:shadow-md transition-all duration-300 bg-card">
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4 transition-transform group-hover:scale-105">
                <CalendarIcon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold mb-2">Live Session Scheduling</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Tutors create courses and schedule live classes with specified start/end times and descriptions. Sessions sync automatically to students' personal dashboard calendars.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group relative border border-border/40 rounded-xl p-6 hover:border-primary/30 hover:shadow-md transition-all duration-300 bg-card">
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4 transition-transform group-hover:scale-105">
                <VideoIcon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold mb-2">Integrated Meeting Classrooms</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Students and tutors join classes directly from their schedules. Live sessions display indicator badges on the dashboard, leading users right into virtual rooms.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group relative border border-border/40 rounded-xl p-6 hover:border-primary/30 hover:shadow-md transition-all duration-300 bg-card">
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4 transition-transform group-hover:scale-105">
                <FolderOpenIcon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold mb-2">Curriculum Resource Vault</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Attach PDFs, presentation slides, download templates, and assignments to individual class sessions. Everything students need is stored directly next to the video room.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group relative border border-border/40 rounded-xl p-6 hover:border-primary/30 hover:shadow-md transition-all duration-300 bg-card">
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4 transition-transform group-hover:scale-105">
                <UsersIcon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold mb-2">One-Click Enrollment</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Browse our complete course catalog, preview syllabus descriptions, choose your instructors, and self-enroll in seconds with a single mouse click.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. WORKFLOWS SECTION */}
      <section id="workflows" className="border-t border-border/30 bg-muted/20 py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <div className="text-center max-w-xl mx-auto space-y-4 mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-serif">Tailored Student & Tutor Experiences</h2>
            <p className="text-muted-foreground text-sm">Two custom portals built to serve distinct educational workflows.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Tutor Journey */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                For Instructors
              </div>
              <h3 className="text-2xl font-bold font-serif">Manage Your Classroom, Stress-Free</h3>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li className="flex gap-3 items-start">
                  <CheckCircle2Icon className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
                  <span><strong>Course Creation:</strong> Organize your lessons under clean subjects and syllabus structures.</span>
                </li>
                <li className="flex gap-3 items-start">
                  <CheckCircle2Icon className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
                  <span><strong>Flexible Scheduling:</strong> Host recurring courses, schedule one-off guest workshops, and cancel classes with automated notifications.</span>
                </li>
                <li className="flex gap-3 items-start">
                  <CheckCircle2Icon className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
                  <span><strong>Student Lists:</strong> Keep track of exactly who is enrolled in your curriculum.</span>
                </li>
              </ul>
            </div>

            {/* Student Journey */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                For Students
              </div>
              <h3 className="text-2xl font-bold font-serif">Interactive Learning on Demand</h3>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li className="flex gap-3 items-start">
                  <CheckCircle2Icon className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Catalog Discovery:</strong> Filter and browse academic programs taught by expert educators.</span>
                </li>
                <li className="flex gap-3 items-start">
                  <CheckCircle2Icon className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>One-Stop Dashboard:</strong> Access all your courses, join running lectures, and download slides from a unified homepage.</span>
                </li>
                <li className="flex gap-3 items-start">
                  <CheckCircle2Icon className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Secure Environment:</strong> Secure student profiles protecting personal data and session integrity.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION */}
      <section className="bg-primary text-primary-foreground py-16 md:py-24 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute inset-0 bg-radial-gradient from-white/10 to-transparent opacity-40" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl space-y-6 relative z-10">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl font-serif">
            Start Learning Live Today
          </h2>
          <p className="mx-auto max-w-xl text-primary-foreground/85 text-base sm:text-lg">
            Create an account in less than two minutes. Browse active courses or launch your first virtual curriculum class immediately.
          </p>
          <div className="pt-4">
            {session ? (
              <Link
                to="/app"
                className={cn(
                  buttonVariants({ variant: "secondary", size: "lg" }),
                  "font-bold px-8 shadow hover:bg-secondary/95 transition-all text-primary"
                )}
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                to="/auth/register"
                className={cn(
                  buttonVariants({ variant: "secondary", size: "lg" }),
                  "font-bold px-8 shadow hover:bg-secondary/95 transition-all text-primary"
                )}
              >
                Sign Up Now
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="border-t border-border/40 bg-background py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-border/20 pb-8">
            <Logo to="/" textClassName="text-base text-foreground font-sans font-bold" iconClassName="h-7 w-7 [&>svg]:size-4" />
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-medium text-muted-foreground">
              <a href="#features" className="hover:text-foreground">Features</a>
              <a href="#stats" className="hover:text-foreground">Impact</a>
              <a href="#workflows" className="hover:text-foreground">How it Works</a>
              <Link to="/auth/login" className="hover:text-foreground">Student Login</Link>
              <Link to="/auth/register" className="hover:text-foreground">Register</Link>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 text-xs text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Tutor Hub. All rights reserved.</p>
            <div className="flex items-center gap-1">
              <ShieldCheckIcon className="h-4 w-4 text-emerald-500" />
              <span>Safe & Secure Education Platform</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
