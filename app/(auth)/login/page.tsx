"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { createClient } from "@/lib/supabase/client"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (error) {
      // Map Supabase technical messages to readable ones
      const msg = error.message.toLowerCase()
      if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
        setError("Incorrect email or password. Please try again.")
      } else if (msg.includes('email not confirmed')) {
        setError("Please verify your email address before signing in. Check your inbox.")
      } else if (msg.includes('too many requests')) {
        setError("Too many attempts. Please wait a moment and try again.")
      } else {
        setError(error.message)
      }
      setLoading(false)
      return
    }

    router.push("/home")
    router.refresh()
  }

  const handleGoogleLogin = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      {/* Abstract Background Elements - contained within relative parent */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-1/4 h-150 w-150 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-primary/5 blur-[80px]" />
      </div>

      <div className="relative z-10 flex w-full max-w-5xl overflow-hidden rounded-2xl bg-surface shadow-2xl shadow-black/60">
        {/* Left branding panel - desktop only */}
        <div className="hidden md:flex md:w-5/12 flex-col items-start justify-between bg-surface-container p-12">
          <Link href="/home" className="text-display-lg font-bold tracking-tighter text-primary">
            FLIX
          </Link>
          <div>
            <h2 className="text-headline-md font-semibold text-on-background mb-3">Millions of movies, one place.</h2>
            <p className="text-body-sm text-muted">Stream the best cinema, anytime, anywhere. Sign in to your account to continue.</p>
          </div>
          <p className="text-label-caps text-muted">© 2026 Flix. All rights reserved.</p>
        </div>

        {/* Right form panel */}
        <div className="w-full md:w-7/12 p-8 md:p-12">
          {/* Logo - only visible on mobile where left panel is hidden */}
          <div className="mb-8 text-center md:text-left">
            <Link href="/home" className="text-display-lg font-bold tracking-tighter text-primary md:hidden">
              FLIX
            </Link>
            <h2 className="hidden md:block text-headline-sm font-semibold text-on-background mb-1">Welcome back</h2>
            <p className="text-body-sm mt-2 text-muted">Sign in to continue</p>
          </div>

        {error && (
          <div className="mb-4 rounded bg-error/10 p-3 text-body-sm text-error border border-error/20">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-label-caps text-on-surface">Email</label>
            <input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 w-full rounded border border-surface-bright bg-surface-container px-4 text-body-sm text-on-surface focus:border-primary focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-label-caps text-on-surface">Password</label>
              <Link href="/forgot-password" className="text-label-caps text-muted hover:text-primary">Forgot?</Link>
            </div>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-12 w-full rounded border border-surface-bright bg-surface-container px-4 text-body-sm text-on-surface focus:border-primary focus:outline-none"
            />
          </div>

          <Button type="submit" size="lg" className="mt-4 w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="mt-6 flex items-center justify-between">
          <div className="h-px w-full bg-surface-bright"></div>
          <span className="px-4 text-label-caps text-muted">OR</span>
          <div className="h-px w-full bg-surface-bright"></div>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <Button variant="secondary" className="w-full" onClick={handleGoogleLogin} type="button">
            Continue with Google
          </Button>
          <Button variant="secondary" className="w-full opacity-50 cursor-not-allowed" type="button" title="TODO: Set up Apple Developer credentials">
            Continue with Apple
          </Button>
        </div>

        <p className="mt-6 text-center text-body-sm text-muted">
          Don't have an account? <Link href="/register" className="text-primary hover:underline">Sign up</Link>
        </p>
        </div>{/* end right form panel */}
      </div>{/* end flex split card */}
    </div>
  )
}

