'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';

export default function SupportToast() {
  const t = useTranslations('supportToast');
  const footerT = useTranslations('footer');
  const [show, setShow] = useState(false);
  const [showDonationAlert, setShowDonationAlert] = useState(false);
  const [isCheckingSponsor, setIsCheckingSponsor] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem('bingo_support_dismissed');
    if (!isDismissed) {
      const timer = setTimeout(() => {
        setShow(true);
      }, 5000); // 5 seconds delay
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('bingo_support_dismissed', 'true');
    setShow(false);
  };

  const handleDonateClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isCheckingSponsor) return;
    
    setIsCheckingSponsor(true);
    const GITHUB_USER = "Salmonidas";
    const SPONSORS_URL = `https://github.com/sponsors/${GITHUB_USER}`;

    try {
      const res = await fetch(`https://api.github.com/users/${GITHUB_USER}`, {
        headers: { 'Accept': 'application/vnd.github+json' }
      });
      const data = await res.json();

      if (data.has_sponsors_listing) {
        window.open(SPONSORS_URL, '_blank');
      } else {
        setShowDonationAlert(true);
        setTimeout(() => setShowDonationAlert(false), 5000);
      }
    } catch (_) {
      setShowDonationAlert(true);
      setTimeout(() => setShowDonationAlert(false), 5000);
    } finally {
      setIsCheckingSponsor(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {show && (
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
                      opacity: isCheckingSponsor ? 0.7 : 1,
                      cursor: isCheckingSponsor ? 'wait' : 'pointer'
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
        {showDonationAlert && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            style={{
              position: 'fixed',
              bottom: '90px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'var(--bg-surface-nested)',
              border: '1px solid var(--border-light)',
              padding: '16px 24px',
              borderRadius: '16px',
              boxShadow: 'var(--shadow-diffused)',
              zIndex: 10000,
              maxWidth: '400px',
              textAlign: 'center',
              color: 'var(--text-primary)'
            }}
          >
            <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.5' }}>
              {footerT('donationPaused')}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
