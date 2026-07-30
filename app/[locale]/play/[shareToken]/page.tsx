import React from 'react';
import { getTranslations } from 'next-intl/server';
import { getLocalizedAlternates } from '@/lib/metadata';
import PlayCardClient from '@/components/pages/PlayClient';

interface PageProps {
  params: Promise<{ locale: string; shareToken: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale, shareToken } = await params;
  const t = await getTranslations({ locale, namespace: 'game' });

  return {
    title: t('spectatorMode'),
    alternates: getLocalizedAlternates(locale, `play/${shareToken}`),
  };
}

export default async function PlayCardPage({ params }: PageProps) {
  const { shareToken } = await params;
  return <PlayCardClient shareToken={shareToken} />;
}
