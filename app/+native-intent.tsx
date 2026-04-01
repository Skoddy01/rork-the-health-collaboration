export function redirectSystemPath(_opts: { path: string; initial: boolean }) {
  console.log('[NativeIntent] Redirecting to root');
  return '/';
}
