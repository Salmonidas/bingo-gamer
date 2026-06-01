import { cookies } from 'next/headers';

export const USER_ID_COOKIE = 'bg_anon_user_id';

/**
 * Retrieves the anonymous user ID from the server-side cookies.
 * Since Next.js cookies() is async, this function is async as well.
 */
export async function getUserIdServer(): Promise<string> {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get(USER_ID_COOKIE)?.value;
    if (userId) return userId;
  } catch {
    // Fail-safe for non-request contexts
  }
  
  // Return a generic fallback. Client-side UserProvider will verify and synchronize.
  return 'guest-temp-id';
}
