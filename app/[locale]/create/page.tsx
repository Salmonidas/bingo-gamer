import React from 'react';
import { getTranslations } from 'next-intl/server';
import { getLocalizedAlternates } from '@/lib/metadata';
import CreateCardClient from '@/components/pages/CreateClient';

interface CreatePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: CreatePageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'create' });

  return {
    title: t('title'),
    alternates: getLocalizedAlternates(locale, 'create'),
  };
}

export default async function CreatePage() {
  return <CreateCardClient />;
}
