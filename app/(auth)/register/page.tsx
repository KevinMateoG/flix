"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { createClient } from "@/lib/supabase/client"

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Client-side validation
    if (name.trim().length < 2) {
      setError("Please enter your full name.")
      setLoading(false)
      return
    }

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

    // 1. Sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: name }
      }
    })

    if (authError) {
      const msg = authError.message.toLowerCase()
      if (msg.includes('already registered')) {
        setError("This email is already registered. Try signing in instead.")
      } else if (msg.includes('rate limit') || msg.includes('email rate')) {
        setError("Too many sign-up attempts. Please wait a few minutes and try again.")
      } else {
        setError(authError.message)
      }
      setLoading(false)
      return
    }

    // When Supabase "Confirm email" is ON, a duplicate email returns user: null, error: null
    // (Supabase silently sends a new confirmation email instead of exposing the duplicate)
    if (!authData.user) {
      setError("This email is already registered. Please check your inbox or try signing in.")
      setLoading(false)
      return
    }

    // 2. Create the profile row
    const { error: profileError } = await supabase.from('profiles').insert([
      {
        id: authData.user.id,
        display_name: name.trim(),
      }
    ])

    if (profileError) {
      // Ignore unique constraint violation (profile already exists from a previous attempt)
      if (!profileError.code?.includes('23505')) {
        console.error("Error creating profile:", profileError)
      }
    }

    // Success — redirect to home
    router.push("/home")
    router.refresh()
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      {/* Abstract Background Elements - contained within relative parent */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute right-1/4 top-1/4 h-150 w-150 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/4 h-96 w-96 rounded-full bg-primary/5 blur-[80px]" />
      </div>
      
      <div className="relative z-10 flex w-full max-w-5xl overflow-hidden rounded-2xl bg-surface shadow-2xl shadow-black/60">
        {/* Left branding panel - desktop only */}
        <div className="hidden md:flex md:w-5/12 flex-col items-start justify-between bg-surface-container p-12">
          <Link href="/home" className="text-display-lg font-bold tracking-tighter text-primary">
            FLIX
          </Link>
          <div>
            <h2 className="text-headline-md font-semibold text-on-background mb-3">Join the experience.</h2>
            <p className="text-body-sm text-muted">Create your free account and start streaming thousands of films from around the world.</p>
          </div>
          <p className="text-label-caps text-muted">© 2026 Flix. All rights reserved.</p>
        </div>

        {/* Right form panel */}
        <div className="w-full md:w-7/12 p-8 md:p-12">
          {/* Logo - only visible on mobile */}
          <div className="mb-8 text-center md:text-left">
            <Link href="/home" className="text-display-lg font-bold tracking-tighter text-primary md:hidden">
              FLIX
            </Link>
            <h2 className="hidden md:block text-headline-sm font-semibold text-on-background mb-1">Create your account</h2>
            <p className="text-body-sm mt-2 text-muted">Join Flix today, it&apos;s free.</p>
          </div>

        {error && (
          <div className="mb-4 rounded bg-error/10 p-3 text-body-sm text-error border border-error/20">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="name" className="text-label-caps text-on-surface">Name</label>
            <input 
              id="name"
              type="text" 
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="h-12 w-full rounded border border-surface-bright bg-surface-container px-4 text-body-sm text-on-surface focus:border-primary focus:outline-none"
            />
          </div>

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
            <label htmlFor="password" className="text-label-caps text-on-surface">Password</label>
            <input 
              id="password"
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="h-12 w-full rounded border border-surface-bright bg-surface-container px-4 text-body-sm text-on-surface focus:border-primary focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="confirmPassword" className="text-label-caps text-on-surface">Confirm Password</label>
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
            {loading ? "Creating account..." : "Sign Up"}
          </Button>
        </form>

        <p className="mt-6 text-center text-body-sm text-muted">
          Already have an account? <Link href="/login" className="text-primary hover:underline">Sign in</Link>
          </p>
        </div>{/* end right form panel */}
      </div>{/* end flex split card */}
    </div>
  )
}
