'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { compressCard } from '@/lib/compression';

interface ShareTemplateModalProps {
  show: boolean;
  card: any;
  cellImages: Record<number, string>;
  onClose: () => void;
}

export default function ShareTemplateModal({ show, card, cellImages, onClose }: ShareTemplateModalProps) {
  const t = useTranslations('share');
  const tc = useTranslations('common');
  const locale = useLocale();

  const [shareUrl, setShareUrl] = useState('');
  const [compressing, setCompressing] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!show || !card) return;

    async function generateLink() {
      setCompressing(true);
      setCopied(false);
      try {
        const compressed = await compressCard(card, cellImages);
        const url = `${window.location.origin}/${locale}/import#${compressed}`;
        setShareUrl(url);
      } catch (err) {
        // Safe fail-safe
      } finally {
        setCompressing(false);
      }
    }

    generateLink();
  }, [show, card, cellImages, locale]);

  if (!show) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Safe fallback
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1500,
            background: 'rgba(6, 8, 12, 0.85)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            overflowY: 'auto'
          }}
        >
          <motion.div
            initial={{ scale: 0.95, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 30 }}
            className="double-bezel-outer"
            style={{ maxWidth: '550px', width: '100%' }}
          >
            <div className="double-bezel-inner" style={{ position: 'relative', padding: '32px 24px' }}>
              
              {/* Close button */}
              <button 
                onClick={onClose}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '1.25rem',
                  cursor: 'pointer',
                  zIndex: 10
                }}
              >
                ✕
              </button>

              <h2 className="glow-text" style={{ fontSize: '1.75rem', marginBottom: '16px', textAlign: 'center' }}>
                📤 {t('title')}
              </h2>

              <p style={{
                color: 'var(--text-muted)',
                fontSize: '0.95rem',
                lineHeight: '1.5',
                textAlign: 'center',
                marginBottom: '24px'
              }}>
                {t('desc')}
              </p>

              {compressing ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '30px 0' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{tc('loading')}</span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Share Link Input Box */}
                  <div style={{
                    display: 'flex',
                    background: 'var(--bg-surface-nested)',
                    border: '1px solid var(--border-light)',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    width: '100%'
                  }}>
                    <input
                      type="text"
                      readOnly
                      value={shareUrl}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        padding: '12px',
                        fontSize: '0.85rem',
                        flex: 1,
                        outline: 'none',
                        fontFamily: 'monospace'
                      }}
                      onClick={(e) => (e.target as HTMLInputElement).select()}
                    />
                    <button
                      onClick={handleCopy}
                      style={{
                        background: copied ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.05)',
                        border: 'none',
                        borderLeft: '1px solid var(--border-light)',
                        color: copied ? '#000' : 'var(--text-primary)',
                        padding: '0 20px',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        transition: 'all 0.2s ease',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {copied ? t('copied') : t('copy')}
                    </button>
                  </div>

                  {/* Warning message */}
                  <div style={{
                    background: 'rgba(251, 191, 36, 0.05)',
                    border: '1px solid rgba(251, 191, 36, 0.2)',
                    borderRadius: '8px',
                    padding: '12px',
                    fontSize: '0.8rem',
                    color: '#fbbf24',
                    lineHeight: '1.4'
                  }}>
                    ⚠️ {t('warning')}
                  </div>

                  <button
                    onClick={onClose}
                    className="interactive-pill"
                    style={{ justifyContent: 'center', padding: '12px', marginTop: '12px' }}
                  >
                    {tc('cancel')}
                  </button>
                </div>
              )}

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
