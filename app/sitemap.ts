import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://bingo-gamer.vercel.app';
  const locales = ['en', 'es', 'fr', 'de', 'ja', 'zh', 'it', 'pt'];

  const localeRoutes: MetadataRoute.Sitemap = locales.map((locale) => ({
    url: `${baseUrl}/${locale}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...localeRoutes,
  ];
}
