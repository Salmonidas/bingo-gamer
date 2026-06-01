'use client';

import React, { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useTheme } from '@/components/providers/ThemeProvider';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function Navbar() {
  const t = useTranslations('navbar');
  const locale = useLocale();
  const { theme, toggleTheme } = useTheme();
  const [langOpen, setLangOpen] = useState(false);

  const languages = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { code: 'ja', label: '日本語', flag: '🇯🇵' },
    { code: 'zh', label: '中文', flag: '🇨🇳' },
    { code: 'it', label: 'Italiano', flag: '🇮🇹' },
    { code: 'pt', label: 'Português', flag: '🇧🇷' }
  ];

  const currentLang = languages.find(l => l.code === locale) || languages[0];

  return (
    <motion.header 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 100, damping: 15 }}
      style={{
        position: 'fixed',
        top: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        width: 'max-content',
        maxWidth: '90vw',
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        background: 'rgba(15, 19, 26, 0.65)',
        backdropFilter: 'blur(20px)',
        border: '1px solid var(--border-light)',
        borderRadius: '100px',
        padding: '8px 24px',
        boxShadow: 'var(--shadow-diffused), 0 0 30px rgba(0,0,0,0.4)',
      }}>
        {/* Logo */}
        <Link href={`/${locale}`} style={{ textDecoration: 'none' }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: '1.25rem',
            background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-violet))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            cursor: 'pointer'
          }}>
            🎮 BingoGamer
          </span>
        </Link>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href={`/${locale}`} style={{ textDecoration: 'none' }}>
            <motion.span 
              whileHover={{ scale: 1.05 }}
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                fontSize: '0.95rem',
                color: 'var(--text-primary)',
                textTransform: 'uppercase',
                cursor: 'pointer'
              }}
            >
              {t('dashboard')}
            </motion.span>
          </Link>
          <Link href={`/${locale}/create`} style={{ textDecoration: 'none' }}>
            <motion.span 
              whileHover={{ scale: 1.05 }}
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                fontSize: '0.95rem',
                color: 'var(--text-primary)',
                textTransform: 'uppercase',
                cursor: 'pointer'
              }}
            >
              {t('create')}
            </motion.span>
          </Link>
        </nav>

        {/* Right side utility icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Theme Toggler */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-primary)'
            }}
            title={t('theme')}
          >
            {theme === 'dark' ? '🌙' : '☀️'}
          </motion.button>

          {/* Language Switcher */}
          <div style={{ position: 'relative' }}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => setLangOpen(!langOpen)}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-light)',
                borderRadius: '100px',
                padding: '4px 12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-body)',
                fontSize: '0.85rem'
              }}
            >
              <span>{currentLang.flag}</span>
              <span style={{ textTransform: 'uppercase', fontWeight: 600 }}>{currentLang.code}</span>
            </motion.button>

            <AnimatePresence>
              {langOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 12px)',
                    right: 0,
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-light)',
                    borderRadius: '16px',
                    padding: '8px',
                    boxShadow: 'var(--shadow-diffused)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    minWidth: '150px'
                  }}
                >
                  {languages.map((lang) => (
                    <Link
                      key={lang.code}
                      href={`/${lang.code}`}
                      onClick={() => setLangOpen(false)}
                      style={{ textDecoration: 'none' }}
                    >
                      <motion.div
                        whileHover={{ background: 'rgba(255, 255, 255, 0.05)' }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          color: 'var(--text-primary)',
                          fontFamily: 'var(--font-body)',
                          fontSize: '0.85rem'
                        }}
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.label}</span>
                      </motion.div>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
