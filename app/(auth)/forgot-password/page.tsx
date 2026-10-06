'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { authClient } from '@/lib/auth-client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // @ts-ignore - plugin method not fully typed in client
    const { error } = await authClient.forgetPassword({
      email,
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message || 'An error occurred');
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      {/* Background - contained in relative parent */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="bg-primary/10 absolute top-1/3 left-1/3 h-125 w-125 rounded-full blur-[120px]" />
      </div>

      <div className="bg-surface relative z-10 flex w-full max-w-5xl overflow-hidden rounded-2xl shadow-2xl shadow-black/60">
        {/* Left branding panel - desktop only */}
        <div className="bg-surface-container hidden flex-col items-start justify-between p-12 md:flex md:w-5/12">
          <Link href="/home" className="text-display-lg text-primary font-bold tracking-tighter">
            FLIX
          </Link>
          <div>
            <h2 className="text-headline-md text-on-background mb-3 font-semibold">
              Forgot your password?
            </h2>
            <p className="text-body-sm text-muted">
              No worries. Enter your email and we&apos;ll send you a link to reset it in seconds.
            </p>
          </div>
          <p className="text-label-caps text-muted">© 2026 Flix. All rights reserved.</p>
        </div>

        {/* Right form panel */}
        <div className="w-full p-8 md:w-7/12 md:p-12">
          {/* Logo - mobile only */}
          <div className="mb-8 text-center md:text-left">
            <Link
              href="/home"
              className="text-display-lg text-primary font-bold tracking-tighter md:hidden"
            >
              FLIX
            </Link>
            <h2 className="text-headline-sm text-on-background mb-1 hidden font-semibold md:block">
              Reset your password
            </h2>
            <p className="text-body-sm text-muted mt-2">
              Enter your email to receive a reset link.
            </p>
          </div>

          {error && (
            <div className="bg-error/10 text-body-sm text-error border-error/20 mb-4 rounded border p-3">
              {error}
            </div>
          )}

          {success ? (
            <div className="bg-primary/10 flex flex-col items-center gap-4 rounded-xl p-6 text-center">
              <div className="bg-primary/20 flex h-12 w-12 items-center justify-center rounded-full">
                <svg
                  className="text-primary h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-headline-sm text-on-surface mb-1 font-semibold">
                  Check your inbox
                </h3>
                <p className="text-body-sm text-muted">
                  We sent a reset link to{' '}
                  <span className="text-on-surface font-medium">{email}</span>. The link expires in
                  1 hour.
                </p>
              </div>
              <Link
                href="/login"
                className="border-on-background/20 text-body-sm hover:bg-on-background/10 mt-2 inline-flex h-10 w-full items-center justify-center rounded border bg-transparent px-4 font-semibold transition-colors"
              >
                Return to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleReset} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label htmlFor="email" className="text-label-caps text-on-surface">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  className="border-surface-bright bg-surface-container text-body-sm text-on-surface focus:border-primary h-12 w-full rounded border px-4 focus:outline-none"
                />
              </div>

              <Button type="submit" size="lg" className="mt-4 w-full" disabled={loading}>
                {loading ? 'Sending link...' : 'Send Reset Link'}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link href="/login" className="text-body-sm text-primary hover:underline">
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
