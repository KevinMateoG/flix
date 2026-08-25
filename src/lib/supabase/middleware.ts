import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  const region = request.cookies.get('user_region')?.value || 'US';
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-region', region);

  let supabaseResponse = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request: {
              headers: requestHeaders,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with cross-browser cookies, e.g. Safari.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Unauthenticated users cannot access main app routes
  const isProtectedRoute =
    pathname === '/home' ||
    pathname === '/browse' ||
    pathname.startsWith('/movie/') ||
    pathname.startsWith('/watch/') ||
    pathname === '/profile';

  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Auth routes: redirect logged-in users to /home
  // Exception: /reset-password must always be accessible — the recovery token
  // arrives in the URL hash which the server never sees, so middleware can't
  // tell whether the user is there legitimately.
  const isAuthRoute =
    pathname === '/login' || pathname === '/register' || pathname === '/forgot-password';

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/home';
    return NextResponse.redirect(url);
  }

  if (pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = user ? '/home' : '/login';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
