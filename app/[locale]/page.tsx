import React from 'react';
import { getTranslations } from 'next-intl/server';
import { getLocalizedAlternates } from '@/lib/metadata';
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
  return <DashboardClient />;
}
