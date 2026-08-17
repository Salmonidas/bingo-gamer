import React from 'react';
import { getTranslations } from 'next-intl/server';
import { getLocalizedAlternates, BASE_URL } from '@/lib/metadata';
import DashboardClient from '@/components/pages/DashboardClient';

interface DashboardPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: DashboardPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });

  return {
    title: t('title'),
    description: t('description'),
    alternates: getLocalizedAlternates(locale, ''),
  };
}

export default async function DashboardPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        'name': 'Bingo Gamer',
        'alternateName': ['Bingo Prediction Card Generator', 'Generador de Cartones de Bingo'],
        'url': BASE_URL,
        'applicationCategory': 'GameApplication',
        'operatingSystem': 'All',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD',
        },
        'author': {
          '@type': 'Organization',
          'name': 'Salmónidas',
          'url': 'https://salmonidas-dev.vercel.app',
        },
        'description': 'Create and play prediction bingo cards live during gaming events like Summer Game Fest, Xbox Showcase and Nintendo Direct. Generador de cartones de bingo interactivos.',
      },
      {
        '@type': 'WebSite',
        'name': 'Bingo Gamer',
        'url': BASE_URL,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <DashboardClient />
    </>
  );
}
