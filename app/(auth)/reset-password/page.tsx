"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { createClient } from "@/lib/supabase/client"

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessionReady, setSessionReady] = useState(false)
  const [sessionError, setSessionError] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
        setSessionReady(true)
      }
    })

    const timeout = setTimeout(() => {
      setSessionReady(prev => {
        if (!prev) setSessionError(true)
        return prev
      })
    }, 3000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (password.length < 6) {
      setError("Password must be at least 6 characters.")
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message.toLowerCase().includes('same password')
        ? "New password must be different from your current one."
        : error.message)
      setLoading(false)
      return
    }

    await supabase.auth.signOut({ scope: 'others' })
    router.push("/home")
    router.refresh()
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      {/* Background - contained in relative parent */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/3 top-1/3 h-125 w-125 rounded-full bg-primary/10 blur-[120px]" />
      </div>

      <div className="relative z-10 flex w-full max-w-5xl overflow-hidden rounded-2xl bg-surface shadow-2xl shadow-black/60">
        {/* Left branding panel - desktop only */}
        <div className="hidden md:flex md:w-5/12 flex-col items-start justify-between bg-surface-container p-12">
          <Link href="/home" className="text-display-lg font-bold tracking-tighter text-primary">
            FLIX
          </Link>
          <div>
            <h2 className="text-headline-md font-semibold text-on-background mb-3">Set a new password.</h2>
            <p className="text-body-sm text-muted">Choose a strong password to keep your account secure.</p>
          </div>
          <p className="text-label-caps text-muted">© 2026 Flix. All rights reserved.</p>
        </div>

        {/* Right form panel */}
        <div className="w-full md:w-7/12 p-8 md:p-12">
          {/* Logo - mobile only */}
          <div className="mb-8 text-center md:text-left">
            <Link href="/home" className="text-display-lg font-bold tracking-tighter text-primary md:hidden">
              FLIX
            </Link>
            <h2 className="hidden md:block text-headline-sm font-semibold text-on-background mb-1">Set a new password</h2>
            <p className="text-body-sm mt-2 text-muted">Enter and confirm your new password below.</p>
          </div>

          {/* Invalid / expired link */}
          {sessionError && (
            <div className="flex flex-col items-center gap-4 rounded-xl bg-error/10 p-6 text-center border border-error/20">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-error/20">
                <svg className="h-6 w-6 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <h3 className="text-headline-sm font-semibold text-on-surface mb-1">Link expired or invalid</h3>
                <p className="text-body-sm text-muted">
                  This reset link has expired or already been used. Please request a new one.
                </p>
              </div>
              <Link
                href="/forgot-password"
                className="mt-2 inline-flex h-10 w-full items-center justify-center rounded bg-primary px-4 text-body-sm font-semibold text-on-primary transition-colors hover:bg-primary/90"
              >
                Request New Link
              </Link>
            </div>
          )}

          {/* Verifying session */}
          {!sessionReady && !sessionError && (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-surface-bright border-t-primary" />
              <p className="text-body-sm text-muted">Verifying reset link...</p>
            </div>
          )}

          {/* Password form */}
          {sessionReady && !sessionError && (
            <>
              {error && (
                <div className="mb-4 rounded bg-error/10 p-3 text-body-sm text-error border border-error/20">
                  {error}
                </div>
              )}

              <form onSubmit={handleUpdate} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label htmlFor="password" className="text-label-caps text-on-surface">New Password</label>
                  <input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    autoFocus
                    className="h-12 w-full rounded border border-surface-bright bg-surface-container px-4 text-body-sm text-on-surface focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="confirmPassword" className="text-label-caps text-on-surface">Confirm New Password</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="h-12 w-full rounded border border-surface-bright bg-surface-container px-4 text-body-sm text-on-surface focus:border-primary focus:outline-none"
                  />
                </div>

                <Button type="submit" size="lg" className="mt-4 w-full" disabled={loading}>
                  {loading ? "Updating password..." : "Update Password"}
                </Button>
              </form>
            </>
          )}

          <div className="mt-6 text-center">
            <Link href="/login" className="text-body-sm text-primary hover:underline">
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
