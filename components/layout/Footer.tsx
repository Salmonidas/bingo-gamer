'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import DonationModal from '@/components/ui/DonationModal';

export default function Footer() {
  const t = useTranslations('footer');
  const currentYear = new Date().getFullYear();
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const handleDonateClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDonationModalOpen(true);
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
          
          <a href="#" onClick={handleDonateClick} style={{ color: 'var(--text-muted)', textDecoration: 'none', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)' } onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)' }>
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
              <Image 
                src="https://salmonidas-dev.vercel.app/logo.webp" 
                alt="Salmónidas Logo" 
                width={16}
                height={16}
                unoptimized
                style={{
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
              <span>Salmónidas</span>
            </a>
          </div>
        </div>
      </motion.footer>

      <DonationModal 
        show={isDonationModalOpen} 
        onClose={() => setIsDonationModalOpen(false)} 
      />
    </>
  );
}
