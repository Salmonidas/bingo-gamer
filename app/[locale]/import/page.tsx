import React from 'react';
import { getTranslations } from 'next-intl/server';
import { getLocalizedAlternates } from '@/lib/metadata';
import ImportClient from '@/components/pages/ImportClient';

interface ImportPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: ImportPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'share' });

  return {
    title: t('importTitle'),
    alternates: getLocalizedAlternates(locale, 'import'),
  };
}

export default async function ImportPage() {
  return <ImportClient />;
}
