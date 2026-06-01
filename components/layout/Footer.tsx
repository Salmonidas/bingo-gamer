'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function Footer() {
  const t = useTranslations('footer');
  const currentYear = new Date().getFullYear();
  const [showDonationAlert, setShowDonationAlert] = useState(false);
  const [isCheckingSponsor, setIsCheckingSponsor] = useState(false);

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
      <motion.footer 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        style={{
          marginTop: 'auto',
          padding: '48px 16px 32px 16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
          fontFamily: 'var(--font-body)',
          fontSize: '0.85rem',
          color: 'var(--text-muted)'
        }}
      >
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/terms" style={{ color: 'var(--text-muted)', textDecoration: 'none' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
            {t('terms')}
          </Link>
          <Link href="/privacy" style={{ color: 'var(--text-muted)', textDecoration: 'none' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
            {t('privacy')}
          </Link>
          <Link href="/cookies" style={{ color: 'var(--text-muted)', textDecoration: 'none' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
            {t('cookies')}
          </Link>
          
          <a href="#" onClick={handleDonateClick} style={{ color: 'var(--text-muted)', textDecoration: 'none', opacity: isCheckingSponsor ? 0.5 : 1, cursor: isCheckingSponsor ? 'wait' : 'pointer' }} onMouseEnter={(e) => { if (!isCheckingSponsor) e.currentTarget.style.color = 'var(--text-primary)' }} onMouseLeave={(e) => { if (!isCheckingSponsor) e.currentTarget.style.color = 'var(--text-muted)' }}>
            {t('donate')}
          </a>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          flexWrap: 'wrap'
        }}>
          <span>© {currentYear} Bingo Gamer.</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '8px' }}>
            <span>{t('developedBy')}</span>
            <a 
              href="https://salmonidas-dev.vercel.app/" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '100px',
                background: 'var(--bg-bezel)',
                border: '1px solid var(--border-light)',
                color: 'var(--text-primary)',
                textDecoration: 'none',
                fontWeight: 600,
                transition: 'var(--transition-fluid)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-cyan)';
                e.currentTarget.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-light)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <img 
                src="https://salmonidas-dev.vercel.app/logo.webp" 
                alt="Salmónidas Logo" 
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
                onError={(e) => {
                  e.currentTarget.src = "https://salmonidas-dev.vercel.app/icon.png";
                }}
              />
              <span>Salmónidas</span>
            </a>
          </div>
        </div>
      </motion.footer>

      {/* Donation Paused Toast/Alert */}
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
              {t('donationPaused')}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
