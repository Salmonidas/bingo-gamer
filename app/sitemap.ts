import { MetadataRoute } from 'next';
import { locales } from '../middleware';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://bingo-gamer.vercel.app';
  const publicSubpaths = ['', '/create', '/import', '/privacy', '/terms', '/cookies'];

  const sitemapEntries: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
  ];

  for (const path of publicSubpaths) {
    for (const locale of locales) {
      const url = `${baseUrl}/${locale}${path}`;
      const isHome = path === '';

      sitemapEntries.push({
        url,
        lastModified: new Date(),
        changeFrequency: isHome ? 'daily' : 'monthly',
        priority: isHome ? 0.8 : 0.5,
      });
    }
  }

  return sitemapEntries;
}
