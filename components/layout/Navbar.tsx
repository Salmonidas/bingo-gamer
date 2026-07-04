'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useTheme } from '@/components/providers/ThemeProvider';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function Navbar() {
  const t = useTranslations('navbar');
  const locale = useLocale();
  const { theme, toggleTheme } = useTheme();
  const [langOpen, setLangOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const languages = [
    { code: 'id', label: 'Bahasa Indonesia' },
    { code: 'es-ES', label: 'Castellano (España)' },
    { code: 'ca', label: 'Català' },
    { code: 'de-DE', label: 'Deutsch' },
    { code: 'en-AU', label: 'English (AU)' },
    { code: 'en-CA', label: 'English (CA)' },
    { code: 'en-IN', label: 'English (IN)' },
    { code: 'en-GB', label: 'English (UK)' },
    { code: 'en-US', label: 'English (US)' },
    { code: 'es-419', label: 'Español (Latinoamérica)' },
    { code: 'es-US', label: 'Español (EE. UU.)' },
    { code: 'eu-ES', label: 'Euskara' },
    { code: 'fr-CA', label: 'Français (CA)' },
    { code: 'fr-FR', label: 'Français (FR)' },
    { code: 'gl-ES', label: 'Galego' },
    { code: 'it-IT', label: 'Italiano' },
    { code: 'ca-ES-mallorca', label: 'Mallorquí' },
    { code: 'pt-BR', label: 'Português (BR)' },
    { code: 'pt-PT', label: 'Português (PT)' },
    { code: 'tr-TR', label: 'Türkçe' },
    { code: 'ca-ES-valencia', label: 'Valencià' },
    { code: 'vi', label: 'Tiếng Việt' },
    { code: 'ru-RU', label: 'Русский' },
    { code: 'hi-IN', label: 'हिन्दी' },
    { code: 'th', label: 'ไทย' },
    { code: 'ja-JP', label: '日本語' },
    { code: 'zh-CN', label: '简体中文' },
    { code: 'ko-KR', label: '한국어' },
    { code: 'ar', label: 'العربية' },
  ];

  const currentLang = languages.find(l => l.code === locale) || languages[0];

  const filteredLanguages = searchQuery
    ? languages.filter(l => l.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : languages;

  const closeLangMenu = useCallback(() => {
    setLangOpen(false);
    setSearchQuery('');
    setHighlightedIndex(-1);
  }, []);

  useEffect(() => {
    if (!langOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(e.target as Node)
      ) {
        closeLangMenu();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [langOpen, closeLangMenu]);

  useEffect(() => {
    if (langOpen && typeof window !== 'undefined' && window.innerWidth >= 768) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [langOpen]);

  const scrollToHighlighted = useCallback((index: number) => {
    if (!listRef.current) return;
    const items = listRef.current.querySelectorAll('[role="option"]');
    if (items[index]) {
      items[index].scrollIntoView({ block: 'nearest' });
    }
  }, []);

  const handleDropdownKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        const next = Math.min(highlightedIndex + 1, filteredLanguages.length - 1);
        setHighlightedIndex(next);
        scrollToHighlighted(next);
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        const prev = Math.max(highlightedIndex - 1, 0);
        setHighlightedIndex(prev);
        scrollToHighlighted(prev);
        break;
      }
      case 'Enter': {
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredLanguages[highlightedIndex]) {
          window.location.href = `/${filteredLanguages[highlightedIndex].code}`;
          closeLangMenu();
        }
        break;
      }
      case 'Escape': {
        e.preventDefault();
        closeLangMenu();
        triggerRef.current?.focus();
        break;
      }
    }
  }, [highlightedIndex, filteredLanguages, closeLangMenu, scrollToHighlighted]);

  const handleTriggerKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (['ArrowDown', 'Enter', ' '].includes(e.key)) {
      e.preventDefault();
      setLangOpen(true);
    }
  }, []);

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

          {/* Language Switcher — Combobox ARIA 1.2 */}
          <div style={{ position: 'relative' }}>
            <motion.button
              ref={triggerRef}
              whileHover={{ scale: 1.05 }}
              onClick={() => setLangOpen(!langOpen)}
              onKeyDown={handleTriggerKeyDown}
              role="combobox"
              aria-expanded={langOpen}
              aria-haspopup="listbox"
              aria-controls="language-listbox"
              aria-label="Select language"
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
              <span style={{ fontWeight: 600 }}>{currentLang.label}</span>
            </motion.button>

            <AnimatePresence>
              {langOpen && (
                <motion.div
                  ref={dropdownRef}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  onKeyDown={handleDropdownKeyDown}
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 12px)',
                    right: 0,
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-light)',
                    borderRadius: '16px',
                    padding: '0',
                    boxShadow: 'var(--shadow-diffused)',
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: '220px',
                    maxHeight: '60vh',
                    overflow: 'hidden',
                  }}
                >
                  {/* Search Input */}
                  <div style={{
                    padding: '8px 12px',
                    borderBottom: '1px solid var(--border-light)',
                    flexShrink: 0,
                  }}>
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setHighlightedIndex(0);
                      }}
                      placeholder="🔍"
                      aria-autocomplete="list"
                      aria-controls="language-listbox"
                      aria-activedescendant={
                        highlightedIndex >= 0 && filteredLanguages[highlightedIndex]
                          ? `option-${filteredLanguages[highlightedIndex].code}`
                          : undefined
                      }
                      style={{
                        width: '100%',
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        color: 'var(--text-primary)',
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.85rem',
                        padding: '4px 0',
                      }}
                    />
                  </div>

                  {/* Language List */}
                  <div
                    ref={listRef}
                    role="listbox"
                    id="language-listbox"
                    aria-label="Languages"
                    style={{
                      overflowY: 'auto',
                      scrollbarWidth: 'thin',
                      padding: '4px 8px 8px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                    }}
                  >
                    {filteredLanguages.length === 0 ? (
                      <div style={{
                        padding: '12px',
                        color: 'var(--text-secondary, #888)',
                        textAlign: 'center',
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.85rem',
                      }}>
                        —
                      </div>
                    ) : (
                      filteredLanguages.map((lang, index) => {
                        const isActive = lang.code === locale;
                        const isHighlighted = index === highlightedIndex;
                        return (
                          <div
                            key={lang.code}
                            role="option"
                            id={`option-${lang.code}`}
                            aria-selected={isActive}
                            onClick={() => {
                              window.location.href = `/${lang.code}`;
                              closeLangMenu();
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '8px',
                              padding: '8px 12px',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              color: isActive ? 'var(--accent-cyan, #00d4ff)' : 'var(--text-primary)',
                              fontFamily: 'var(--font-body)',
                              fontSize: '0.85rem',
                              fontWeight: isActive ? 600 : 400,
                              background: isHighlighted
                                ? 'rgba(255, 255, 255, 0.08)'
                                : isActive
                                  ? 'rgba(0, 212, 255, 0.06)'
                                  : 'transparent',
                              transition: 'background 0.1s ease',
                            }}
                            onMouseEnter={() => setHighlightedIndex(index)}
                          >
                            <span>{lang.label}</span>
                            {isActive && (
                              <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>✓</span>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
