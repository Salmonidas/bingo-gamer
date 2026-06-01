import React from 'react';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'legal.privacy' });
  return { title: t('title') };
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'legal.privacy' });
  const globalT = await getTranslations({ locale, namespace: 'legal' });

  return (
    <main style={{ padding: '64px 24px', maxWidth: '800px', margin: '0 auto', flexGrow: 1 }}>
      <div style={{ marginBottom: '32px' }}>
        <Link href="/" className="interactive-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', padding: '8px 16px' }}>
          <span>←</span>
          <span>{globalT('backHome')}</span>
        </Link>
      </div>
      <h1 className="glow-text" style={{ fontSize: '2.5rem', marginBottom: '24px' }}>{t('title')}</h1>
      <div style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
        <p>{t('updated')}: {new Date().toLocaleDateString()}</p>
        
        <h2 style={{ color: 'var(--text-primary)', marginTop: '32px', marginBottom: '16px' }}>{t('p1_title')}</h2>
        <p>{t('p1_text')}</p>
        
        <h2 style={{ color: 'var(--text-primary)', marginTop: '32px', marginBottom: '16px' }}>{t('p2_title')}</h2>
        <p>{t('p2_text')}</p>
        
        <h2 style={{ color: 'var(--text-primary)', marginTop: '32px', marginBottom: '16px' }}>{t('p3_title')}</h2>
        <p>{t('p3_text')}</p>
      </div>
    </main>
  );
}
