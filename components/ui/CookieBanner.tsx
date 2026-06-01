'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function CookieBanner() {
  const t = useTranslations('cookieConsent');
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if user already accepted
    const consent = localStorage.getItem('bingo_cookie_consent');
    if (!consent) {
      const timer = setTimeout(() => setShow(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('bingo_cookie_consent', 'true');
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 100 }}
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '24px',
            right: '24px',
            zIndex: 9999,
            display: 'flex',
            justifyContent: 'center',
            pointerEvents: 'none'
          }}
        >
          <div className="double-bezel-outer" style={{ pointerEvents: 'auto', maxWidth: '800px', width: '100%', padding: '4px' }}>
            <div className="double-bezel-inner" style={{ 
              display: 'flex', 
              flexWrap: 'wrap',
              alignItems: 'center', 
              justifyContent: 'space-between',
              gap: '16px',
              padding: '16px 24px'
            }}>
              <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)', flex: '1 1 300px', lineHeight: '1.5' }}>
                {t('message')}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <Link href="/cookies" style={{ color: 'var(--accent-cyan)', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 600 }}>
                  {t('learnMore')}
                </Link>
                <button 
                  onClick={handleAccept}
                  className="interactive-pill interactive-pill-primary"
                  style={{ padding: '8px 24px', fontSize: '0.95rem' }}
                >
                  {t('accept')}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
