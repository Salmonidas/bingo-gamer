import React from 'react';
import { getTranslations } from 'next-intl/server';
import { getLocalizedAlternates } from '@/lib/metadata';
import CardEditClient from '@/components/pages/CardEditClient';

interface PageProps {
  params: Promise<{ locale: string; editToken: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale, editToken } = await params;
  const t = await getTranslations({ locale, namespace: 'game' });

  return {
    title: t('editMode'),
    alternates: getLocalizedAlternates(locale, `card/${editToken}`),
    robots: { index: false, follow: false },
  };
}

export default async function EditCardPage({ params }: PageProps) {
  const { editToken } = await params;
  return <CardEditClient editToken={editToken} />;
}
