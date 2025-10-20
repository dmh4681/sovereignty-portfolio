import { createBrowserClient as createClient } from '@supabase/ssr';

interface CookieOptions {
  maxAge?: number;
  path?: string;
}

export function createBrowserClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          if (typeof document === 'undefined') return undefined;
          return document.cookie
            .split('; ')
            .find(row => row.startsWith(`${name}=`))
            ?.split('=')[1];
        },
        set(name: string, value: string, options: CookieOptions) {
          if (typeof document === 'undefined') return;
          document.cookie = `${name}=${value}; path=/; ${options.maxAge ? `max-age=${options.maxAge}` : ''}`;
        },
        remove(name: string) {
          if (typeof document === 'undefined') return;
          document.cookie = `${name}=; path=/; max-age=0`;
        }
      }
    }
  );
}
