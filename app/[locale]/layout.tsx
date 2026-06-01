import React from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { UserProvider } from '@/components/providers/UserProvider';
import Footer from '@/components/layout/Footer';
import CookieBanner from '@/components/ui/CookieBanner';
import SupportToast from '@/components/ui/SupportToast';
import '@/styles/globals.css';

// Meta definitions for SEO best practices
export const metadata = {
  title: 'Bingo Gamer — predictions bingo live streams',
  description: 'Create and play prediction bingo cards live during gaming events like Summer Game Fest, Xbox Showcase and Nintendo Direct!',
};

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
