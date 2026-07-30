import React from 'react';
import { Metadata } from 'next';
import { Plus_Jakarta_Sans, Rajdhani } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Script from 'next/script';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { UserProvider } from '@/components/providers/UserProvider';
import Footer from '@/components/layout/Footer';
import CookieBanner from '@/components/ui/CookieBanner';
import SupportToast from '@/components/ui/SupportToast';
import '@/styles/globals.css';
import { locales } from '../../middleware';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-body',
});

const rajdhani = Rajdhani({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  display: 'swap',
  variable: '--font-display',
});

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
    manifest: '/manifest.json',
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: 'Bingo Gamer',
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

// Supported locales are now imported from middleware

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

  // RTL Support for Arabic
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir} className={`${plusJakartaSans.variable} ${rajdhani.variable}`} suppressHydrationWarning>
      <body>
        <Script src="https://app.lemonsqueezy.com/js/lemon.js" strategy="afterInteractive" />
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

declare global {
  interface Window {
    createLemonSqueezy: () => void;
    LemonSqueezy: {
      Setup: (options: { eventHandler?: (event: unknown) => void }) => void;
      Refresh: () => void;
      Url: { Open: (url: string) => void; Close: () => void; };
      Affiliate: { GetID: () => string | null; Build: (url: string) => string; };
    };
  }
}
