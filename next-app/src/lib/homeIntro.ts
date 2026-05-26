export const HOME_INTRO_STORAGE_KEY = 'mm-home-intro-played';
/** Matches `.mm-hero__load-curtain` animation duration + small buffer for `animationend`. */
export const HOME_INTRO_CURTAIN_MS = 1420;

export function hasHomeIntroPlayed() {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    return window.sessionStorage.getItem(HOME_INTRO_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function markHomeIntroPlayed() {
  try {
    window.sessionStorage.setItem(HOME_INTRO_STORAGE_KEY, 'true');
  } catch {
    // Session storage can be unavailable in locked-down browser modes.
  }
}

export function subscribeToIntroStorage() {
  return () => {};
}

export function getIntroStorageSnapshot() {
  return hasHomeIntroPlayed();
}

export function getServerIntroStorageSnapshot() {
  return false;
}
