'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { authClient } from '@/lib/auth-client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await authClient.signIn.email({
      email: email.trim(),
      password,
    });

    if (error) {
      setError(error.message || 'An error occurred');
      setLoading(false);
      return;
    }

    router.push('/home');
    router.refresh();
  };

  const handleGoogleLogin = async () => {
    await authClient.signIn.social({
      provider: 'google',
      callbackURL: `${window.location.origin}/home`,
    });
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      {/* Abstract Background Elements - contained within relative parent */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="bg-primary/10 absolute top-1/4 left-1/4 h-150 w-150 rounded-full blur-[120px]" />
        <div className="bg-primary/5 absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full blur-[80px]" />
      </div>

      <div className="bg-surface relative z-10 flex w-full max-w-5xl overflow-hidden rounded-2xl shadow-2xl shadow-black/60">
        {/* Left branding panel - desktop only */}
        <div className="bg-surface-container hidden flex-col items-start justify-between p-12 md:flex md:w-5/12">
          <Link href="/home" className="text-display-lg text-primary font-bold tracking-tighter">
            FLIX
          </Link>
          <div>
            <h2 className="text-headline-md text-on-background mb-3 font-semibold">
              Millions of movies, one place.
            </h2>
            <p className="text-body-sm text-muted">
              Stream the best cinema, anytime, anywhere. Sign in to your account to continue.
            </p>
          </div>
          <p className="text-label-caps text-muted">© 2026 Flix. All rights reserved.</p>
        </div>

        {/* Right form panel */}
        <div className="w-full p-8 md:w-7/12 md:p-12">
          {/* Logo - only visible on mobile where left panel is hidden */}
          <div className="mb-8 text-center md:text-left">
            <Link
              href="/home"
              className="text-display-lg text-primary font-bold tracking-tighter md:hidden"
            >
              FLIX
            </Link>
            <h2 className="text-headline-sm text-on-background mb-1 hidden font-semibold md:block">
              Welcome back
            </h2>
            <p className="text-body-sm text-muted mt-2">Sign in to continue</p>
          </div>

          {error && (
            <div className="bg-error/10 text-body-sm text-error border-error/20 mb-4 rounded border p-3">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
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
                className="border-surface-bright bg-surface-container text-body-sm text-on-surface focus:border-primary h-12 w-full rounded border px-4 focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-label-caps text-on-surface">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-label-caps text-muted hover:text-primary"
                >
                  Forgot?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-surface-bright bg-surface-container text-body-sm text-on-surface focus:border-primary h-12 w-full rounded border px-4 focus:outline-none"
              />
            </div>

            <Button type="submit" size="lg" className="mt-4 w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 flex items-center justify-between">
            <div className="bg-surface-bright h-px w-full"></div>
            <span className="text-label-caps text-muted px-4">OR</span>
            <div className="bg-surface-bright h-px w-full"></div>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <Button
              variant="secondary"
              className="w-full"
              onClick={handleGoogleLogin}
              type="button"
            >
              Continue with Google
            </Button>
            <Button
              variant="secondary"
              className="w-full cursor-not-allowed opacity-50"
              type="button"
              title="TODO: Set up Apple Developer credentials"
            >
              Continue with Apple
            </Button>
          </div>

          <p className="text-body-sm text-muted mt-6 text-center">
            Don't have an account?{' '}
            <Link href="/register" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>
        {/* end right form panel */}
      </div>
      {/* end flex split card */}
    </div>
  );
}
