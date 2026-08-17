import { Metadata } from 'next';
import { locales } from '@/middleware';

export const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bingo-gamer.vercel.app';
const DEFAULT_LOCALE = 'en-US';

/**
 * Generates dynamic, SEO-compliant canonical and hreflang (alternates) metadata
 * for any given page route and current locale.
 *
 * @param currentLocale - The active locale (e.g. 'en-US', 'es-ES', 'ca')
 * @param path - The page subpath without locale (e.g. '' for home, 'privacy', 'create', 'play/123')
 */
export function getLocalizedAlternates(currentLocale: string, path: string = ''): Metadata['alternates'] {
  const normalizedPath = path ? (path.startsWith('/') ? path : `/${path}`) : '';

  const languages: Record<string, string> = {};

  locales.forEach((loc) => {
    languages[loc] = `${BASE_URL}/${loc}${normalizedPath}`;
  });

  // Mandatory Google SEO fallback for unmatched client languages
  languages['x-default'] = `${BASE_URL}/${DEFAULT_LOCALE}${normalizedPath}`;

  return {
    canonical: `${BASE_URL}/${currentLocale}${normalizedPath}`,
    languages,
  };
}
