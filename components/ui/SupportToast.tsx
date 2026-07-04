'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import DonationModal from '@/components/ui/DonationModal';

export default function SupportToast() {
  const t = useTranslations('supportToast');
  const [show, setShow] = useState(false);
  const [showFarewell, setShowFarewell] = useState(false);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem('bingo_support_dismissed');
    if (!isDismissed) {
      const timer = setTimeout(() => {
        setShow(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setShowFarewell(true);
  };

  const handleFarewellClose = () => {
    localStorage.setItem('bingo_support_dismissed', 'true');
    setShowFarewell(false);
    setShow(false);
  };

  const handleDonateClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDonationModalOpen(true);
  };

  return (
    <>
      <AnimatePresence>
        {show && !showFarewell && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              position: 'fixed',
              bottom: '88px',
              left: '50%',
              zIndex: 9999,
              width: '90%',
              maxWidth: '460px'
            }}
          >
            <div className="double-bezel-outer" style={{ padding: '4px' }}>
              <div className="double-bezel-inner" style={{
                background: 'var(--bg-surface)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                textAlign: 'center',
                boxShadow: 'var(--shadow-diffused)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                    {t('title')}
                  </h3>
                  <button
                    onClick={() => setShow(false)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      fontSize: '1.2rem',
                      padding: '4px'
                    }}
                    aria-label="Close"
                  >
                    ✕
                  </button>
                </div>
                
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                  {t('description')}
                </p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                  <a
                    href="#"
                    onClick={handleDonateClick}
                    className="interactive-pill interactive-pill-primary"
                    style={{
                      textDecoration: 'none',
                      display: 'block',
                      padding: '10px',
                      fontSize: '0.95rem',
                      cursor: 'pointer'
                    }}
                  >
                    {t('donateAction')}
                  </a>
                  <button
                    onClick={handleDismiss}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      fontSize: '0.85rem',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      padding: '4px'
                    }}
                  >
                    {t('dismiss')}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showFarewell && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              position: 'fixed',
              bottom: '88px',
              left: '50%',
              zIndex: 9999,
              width: '90%',
              maxWidth: '460px'
            }}
          >
            <div className="double-bezel-outer" style={{ padding: '4px' }}>
              <div className="double-bezel-inner" style={{
                background: 'var(--bg-surface)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                textAlign: 'center',
                boxShadow: 'var(--shadow-diffused)'
              }}>
                <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                  {t('farewellTitle')}
                </h3>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                  {t('farewellText')}
                </p>
                <button
                  onClick={handleFarewellClose}
                  className="interactive-pill interactive-pill-primary"
                  style={{ padding: '10px', fontSize: '0.95rem', marginTop: '4px' }}
                >
                  {t('farewellClose')}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <DonationModal 
        show={isDonationModalOpen} 
        onClose={() => setIsDonationModalOpen(false)} 
      />
    </>
  );
}

