import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function SleepSoundsRedirect() {
  const router = useRouter();

  useEffect(() => {
    console.log('[SleepSounds] Redirecting to better-sleep');
    router.replace('/mind/better-sleep');
  }, [router]);

  return null;
}
