import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'es', 'fr', 'de', 'ja', 'zh', 'it', 'pt'],
  defaultLocale: 'en',
  localeDetection: true
});

export const config = {
  // Match only internationalized pathnames, skipping api and cron static routes
  matcher: ['/', '/(de|en|es|fr|it|ja|pt|zh)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)']
};
