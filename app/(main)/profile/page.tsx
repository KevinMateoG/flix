import { redirect } from 'next/navigation';
import { User, Settings, CreditCard, LogOut, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getUser, getProfile } from '@/lib/auth';
import { fetchApi } from '@/lib/api';
import { updateProfileRegion } from '@/app/actions/profile';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';

async function signOut() {
  'use server';
  await fetchApi('/api/auth/sign-out', { method: 'POST' });
  redirect('/login');
}

const regions = [
  { code: 'US', name: 'United States' },
  { code: 'MX', name: 'Mexico' },
  { code: 'ES', name: 'Spain' },
  { code: 'AR', name: 'Argentina' },
  { code: 'CO', name: 'Colombia' },
  { code: 'BR', name: 'Brazil' },
];

export default async function ProfilePage() {
  const user = await getUser();
  if (!user) {
    redirect('/login');
  }

  const profile = await getProfile(user.id);

  // Default values if profile hasn't been created yet
  const displayName = profile?.display_name || user.email?.split('@')[0] || 'User';
  const plan = profile?.plan || 'free';
  const region = profile?.region || 'US';

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col px-4 py-6 md:px-12 md:py-10">
      <h1 className="text-display-lg-mobile md:text-display-lg text-on-background mb-8">Profile</h1>

      {/* User Info Card */}
      <div className="bg-surface-container mb-8 flex items-center gap-4 rounded-lg p-6">
        <div className="bg-surface-bright flex h-20 w-20 shrink-0 items-center justify-center rounded-full">
          <User size={40} className="text-on-surface" />
        </div>
        <div className="flex flex-col gap-1">
          <h2 className="text-headline-sm text-on-background font-semibold">{displayName}</h2>
          <p className="text-body-sm text-muted">{user.email}</p>
          <div className="bg-primary/20 text-label-caps text-primary mt-2 inline-flex items-center rounded px-2 py-1 uppercase">
            {plan} Plan
          </div>
        </div>
      </div>

      {/* Options List */}
      <div className="flex flex-col gap-2">
        <h3 className="text-label-caps text-muted mb-2">Account Settings</h3>

        <Link
          href="/settings"
          className="bg-surface-container hover:bg-surface-bright flex w-full items-center justify-between rounded-lg p-4 text-left transition-colors"
        >
          <div className="flex items-center gap-4">
            <Settings size={20} className="text-muted" />
            <span className="text-body-lg text-on-background">App Preferences</span>
          </div>
          <ChevronRight size={20} className="text-muted" />
        </Link>

        <button className="bg-surface-container hover:bg-surface-bright flex w-full items-center justify-between rounded-lg p-4 text-left transition-colors">
          <div className="flex items-center gap-4">
            <CreditCard size={20} className="text-muted" />
            <span className="text-body-lg text-on-background">Billing Details</span>
          </div>
          <ChevronRight size={20} className="text-muted" />
        </button>

        <h3 className="text-label-caps text-muted mt-6 mb-2">Region Settings</h3>
        <form
          action={async (formData) => {
            'use server';
            const newRegion = formData.get('region') as string;
            await updateProfileRegion(newRegion);
            revalidatePath('/profile');
          }}
          className="bg-surface-container border-surface-bright/20 flex flex-col items-start justify-between gap-4 rounded-lg border p-4 sm:flex-row sm:items-center"
        >
          <div className="flex flex-col gap-1">
            <span className="text-body-lg text-on-background">Watch Region</span>
            <p className="text-muted text-xs">
              Filters TMDB content availability and regional stream providers.
            </p>
          </div>
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <select
              name="region"
              defaultValue={region}
              className="border-surface-bright bg-surface-container-high text-body-sm text-on-surface focus:border-primary h-10 w-full cursor-pointer rounded border px-3 focus:outline-none sm:w-40"
            >
              {regions.map((r) => (
                <option key={r.code} value={r.code}>
                  {r.name}
                </option>
              ))}
            </select>
            <Button type="submit" size="sm">
              Save
            </Button>
          </div>
        </form>

        <form action={signOut} className="mt-8">
          <Button
            type="submit"
            variant="secondary"
            className="text-error hover:bg-error/10 hover:text-error border-error/20 w-full gap-2 md:w-auto md:self-start"
          >
            <LogOut size={18} />
            Sign Out
          </Button>
        </form>
      </div>
    </div>
  );
}
