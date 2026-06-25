import React from 'react';
import { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { UserProvider } from '@/components/providers/UserProvider';
import Footer from '@/components/layout/Footer';
import CookieBanner from '@/components/ui/CookieBanner';
import SupportToast from '@/components/ui/SupportToast';
import '@/styles/globals.css';

interface GenerateMetadataProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: GenerateMetadataProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });

  return {
    title: t('title'),
    description: t('description'),
    metadataBase: new URL('https://bingo-gamer.vercel.app'),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        'en': '/en',
        'es': '/es',
        'fr': '/fr',
        'de': '/de',
        'ja': '/ja',
        'zh': '/zh',
        'it': '/it',
        'pt': '/pt',
      },
    },
    verification: {
      google: 'Xyp89jI-bHwUwOTdgbQ1RqpvXox4hL2qgNmmPgEU9AU',
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: `https://bingo-gamer.vercel.app/${locale}`,
      siteName: 'Bingo Gamer',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: t('title'),
        },
      ],
      locale: locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
      images: ['/og-image.png'],
    },
  };
}

// Supported locales list
const locales = ['en', 'es', 'fr', 'de', 'ja', 'zh', 'it', 'pt'];

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  // Validate that the incoming locale is supported
  if (!locales.includes(locale)) {
    notFound();
  }

  // Get messages for next-intl hydration
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            <UserProvider>
              <div className="grid-bg-mesh" />
              <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
                {children}
                <div style={{ flexGrow: 1 }} />
                <Footer />
              </div>
              <CookieBanner />
              <SupportToast />
            </UserProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
