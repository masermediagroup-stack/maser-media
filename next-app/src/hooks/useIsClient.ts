import { useSyncExternalStore } from 'react';

function subscribeToClient() {
  return () => {};
}

/** True only after hydration — server and the first client pass both see false. */
export function useIsClient() {
  return useSyncExternalStore(subscribeToClient, () => true, () => false);
}
