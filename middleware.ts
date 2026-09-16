import createMiddleware from 'next-intl/middleware';

// Fallbacks genéricos (invisibles en el selector, solo routing y redirección interna)
export const routingFallbacks = [
  'en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'zh'
];

// Locales oficiales públicos (visibles en selector, sitemap e indexación)
export const publicLocales = [
  // Español y variantes regionales
  'es-ES', 'es-419', 'es-US',
  // English variants
  'en-US', 'en-GB', 'en-CA', 'en-AU', 'en-IN',
  // Français
  'fr-FR', 'fr-CA',
  // Other European
  'de-DE', 'it-IT', 'pt-PT', 'pt-BR',
  // Asian
  'zh-CN', 'ja-JP', 'ko-KR', 'hi-IN', 'id', 'th', 'vi',
  // Other
  'ar', 'ru-RU', 'tr-TR',
  // Peninsular co-official + dialectos
  'ca', 'ca-ES-valencia', 'ca-ES-mallorca', 'gl-ES', 'eu-ES'
];

export const locales = [...routingFallbacks, ...publicLocales];

export default createMiddleware({
  locales,
  defaultLocale: 'en-US',
  localeDetection: true
});

export const config = {
  // Match only internationalized pathnames, skipping api, _next, _vercel, etc.
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)', '/']
};
