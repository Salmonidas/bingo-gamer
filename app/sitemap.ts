import { MetadataRoute } from 'next';
import { locales } from '../middleware';
import { BASE_URL } from '@/lib/metadata';

export default function sitemap(): MetadataRoute.Sitemap {
  const publicSubpaths = ['', '/create', '/import', '/privacy', '/terms', '/cookies'];

  const sitemapEntries: MetadataRoute.Sitemap = [];

  for (const path of publicSubpaths) {
    for (const locale of locales) {
      const url = `${BASE_URL}/${locale}${path}`;
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
