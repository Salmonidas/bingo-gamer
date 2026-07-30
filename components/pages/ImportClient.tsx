'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { decompressCard } from '@/lib/compression';
import { saveLocalCard, saveLocalCellImage } from '@/lib/idb';
import Navbar from '@/components/layout/Navbar';
import { motion } from 'framer-motion';

export default function ImportClient() {
  const t = useTranslations('share');
  const tc = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function performImport() {
      // Extract compressed data from hash
      const hash = window.location.hash.substring(1);
      if (!hash) {
        setStatus('error');
        setErrorMsg('No template data found in URL.');
        return;
      }

      try {
        // Decompress card template
        const decoded = await decompressCard(hash);
        if (!decoded || !decoded.card) {
          setStatus('error');
          setErrorMsg('Invalid or corrupted template data.');
          return;
        }

        // Generate brand new unique tokens for this private copy
        const newCardId = crypto.randomUUID();
        const newEditToken = crypto.randomUUID();
        const newShareToken = crypto.randomUUID();

        // Reconstruct the new card object
        const importedCard = {
          ...decoded.card,
          id: newCardId,
          user_id: 'local',
          edit_token: newEditToken,
          share_token: newShareToken,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        // 1. Save card settings and cell contents
        await saveLocalCard(importedCard);

        // 2. Save external cell image URLs
        if (decoded.cellImages) {
          const imageKeys = Object.keys(decoded.cellImages).map(Number);
          for (const pos of imageKeys) {
            const imgUrl = decoded.cellImages[pos];
            if (imgUrl) {
              await saveLocalCellImage(newCardId, pos, imgUrl);
            }
          }
        }

        // 3. Register ownership locally to allow private editing
        try {
          const ownedStr = localStorage.getItem('bg_owned_cards') || '[]';
          const ownedCards = JSON.parse(ownedStr);
          if (!ownedCards.includes(newEditToken)) {
            ownedCards.push(newEditToken);
            localStorage.setItem('bg_owned_cards', JSON.stringify(ownedCards));
          }
        } catch {
          localStorage.setItem('bg_owned_cards', JSON.stringify([newEditToken]));
        }

        setStatus('success');
        // Instantly redirect to the private editor
        router.push(`/${locale}/card/${newEditToken}`);
      } catch (err: any) {
        setStatus('error');
        setErrorMsg(err.message || 'Failed to parse and import template.');
      }
    }

    performImport();
  }, [locale, router]);

  return (
    <>
      <Navbar />
      <main style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: 'var(--bg-main)'
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="double-bezel-outer"
          style={{ maxWidth: '480px', width: '100%' }}
        >
          <div className="double-bezel-inner" style={{ textAlign: 'center', padding: '40px 24px' }}>
            {status === 'loading' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                <div className="glow-text" style={{ fontSize: '3rem', animation: 'pulse 1.5s infinite alternate' }}>📥</div>
                <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Importing template...</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
                  Decompressing and building your private clone card offline...
                </p>
              </div>
            )}

            {status === 'error' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                <div style={{ fontSize: '3rem', color: '#ef4444' }}>⚠️</div>
                <h2 style={{ fontSize: '1.5rem', color: '#ef4444', margin: 0 }}>Import Failed</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
                  {errorMsg}
                </p>
                <button
                  onClick={() => router.push(`/${locale}`)}
                  className="interactive-pill"
                  style={{ marginTop: '12px' }}
                >
                  {tc('back')}
                </button>
              </div>
            )}

            {status === 'success' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                <div style={{ fontSize: '3rem', color: 'var(--accent-cyan)' }}>🎉</div>
                <h2 style={{ fontSize: '1.5rem', color: 'var(--accent-cyan)', margin: 0 }}>Cloned Successfully!</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
                  Redirecting to your new private board...
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </>
  );
}
