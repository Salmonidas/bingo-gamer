import React from 'react';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { getLocalizedAlternates } from '@/lib/metadata';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'legal.cookies' });
  return {
    title: t('title'),
    alternates: getLocalizedAlternates(locale, 'cookies'),
  };
}

export default async function CookiesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'legal.cookies' });
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
      <div style={{ color: 'var(--text-muted)', lineHeight: '1.8' }}>
        <p style={{ fontStyle: 'italic' }}>{t('updated')}: 2026-07-02</p>
        
        <h2 style={{ color: 'var(--text-primary)', marginTop: '32px', marginBottom: '16px' }}>{t('p1_title')}</h2>
        <p>{t('p1_text')}</p>
        
        <h2 style={{ color: 'var(--text-primary)', marginTop: '32px', marginBottom: '16px' }}>{t('p2_title')}</h2>
        <p>{t('p2_text')}</p>
        
        <h2 style={{ color: 'var(--text-primary)', marginTop: '32px', marginBottom: '16px' }}>{t('p3_title')}</h2>
        <p>{t('p3_text')}</p>

        <div style={{ 
          marginTop: '32px', 
          padding: '20px 24px', 
          background: 'var(--bg-surface-nested)', 
          border: '1px solid var(--accent-cyan)',
          borderRadius: '12px'
        }}>
          <h2 style={{ color: 'var(--accent-cyan)', marginTop: '0', marginBottom: '12px', fontSize: '1.1rem' }}>{t('p4_title')}</h2>
          <p style={{ margin: 0 }}>{t('p4_text')}</p>
        </div>
        
        <h2 style={{ color: 'var(--text-primary)', marginTop: '32px', marginBottom: '16px' }}>{t('p5_title')}</h2>
        <p>{t('p5_text')}</p>
      </div>
    </main>
  );
}
