'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { useDonation } from '@/hooks/useDonation';

interface DonationModalProps {
  show: boolean;
  onClose: () => void;
}

export default function DonationModal({ show, onClose }: DonationModalProps) {
  const t = useTranslations('donation');
  const { handleDonateChoice, isProcessing } = useDonation();

  if (!show) return null;

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
            padding: '24px'
          }}
        >
          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 30 }}
            className="double-bezel-outer"
            style={{ maxWidth: '500px', width: '100%' }}
            role="dialog"
            aria-modal="true"
          >
            <div className="double-bezel-inner" style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Close Button */}
              <button 
                onClick={onClose}
                aria-label="Cerrar"
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '1.25rem',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>

              <h2 className="glow-text" style={{ fontSize: '1.75rem', textAlign: 'center', margin: 0 }}>
                {t('title')}
              </h2>

              <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '1rem', margin: 0 }}>
                {t('description')}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                  onClick={() => handleDonateChoice('lemonsqueezy')}
                  disabled={isProcessing}
                  className="interactive-pill interactive-pill-primary"
                  style={{
                    padding: '16px',
                    fontSize: '1rem',
                    textAlign: 'left',
                    width: '100%',
                    opacity: isProcessing ? 0.7 : 1,
                    cursor: isProcessing ? 'wait' : 'pointer',
                    background: 'linear-gradient(135deg, rgba(45,212,191,0.1) 0%, rgba(45,212,191,0.05) 100%)',
                    border: '1px solid var(--accent-cyan)'
                  }}
                >
                  {t('lemonSqueezy')}
                </button>

                <button
                  onClick={() => handleDonateChoice('github')}
                  disabled={isProcessing}
                  className="interactive-pill"
                  style={{
                    padding: '16px',
                    fontSize: '1rem',
                    textAlign: 'left',
                    width: '100%',
                    opacity: isProcessing ? 0.7 : 1,
                    cursor: isProcessing ? 'wait' : 'pointer'
                  }}
                >
                  {t('github')}
                </button>
              </div>

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
