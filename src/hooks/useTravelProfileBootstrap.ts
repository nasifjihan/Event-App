import { useEffect } from 'react';
import { ensureTravelProfile } from '@/api/travelApi';
import { useAuth } from '@/hooks/useAuth';

export function useTravelProfileBootstrap() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    ensureTravelProfile(user.id, user.user_metadata?.full_name).catch(() => {
      // The app should stay usable even before the travel schema migration is applied.
    });
  }, [user]);
}
