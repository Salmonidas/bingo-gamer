'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';

interface ShareModalProps {
  show: boolean;
  editToken: string;
  shareToken: string;
  isPublic: boolean;
  onClose: () => void;
}

export default function ShareModal({ show, editToken, shareToken, isPublic, onClose }: ShareModalProps) {
  const t = useTranslations('share');
  const [copiedType, setCopiedType] = useState<'edit' | 'play' | null>(null);

  if (!show) return null;

  const getFullUrl = (path: string) => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}${path}`;
  };

  const editUrl = getFullUrl(`/card/${editToken}`);
  const playUrl = getFullUrl(`/play/${shareToken}`);

  const handleCopy = (url: string, type: 'edit' | 'play') => {
    navigator.clipboard.writeText(url);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
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
            padding: '24px'
          }}
        >
          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 30 }}
            className="double-bezel-outer"
            style={{ maxWidth: '550px', width: '100%' }}
          >
            <div className="double-bezel-inner" style={{ position: 'relative' }}>
              
              {/* Close Button */}
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
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>

              <h2 className="glow-text" style={{ fontSize: '1.75rem', marginBottom: '24px', textAlign: 'center' }}>
                {t('title')}
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* 1. Private Creator Edit Link */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--accent-amber)' }}>
                    ⚠️ {t('editLink')}
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      readOnly
                      value={editUrl}
                      style={{
                        flex: 1,
                        background: 'var(--bg-surface-nested)',
                        border: '1px solid var(--border-light)',
                        borderRadius: '8px',
                        padding: '10px 12px',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem',
                        fontFamily: 'monospace'
                      }}
                    />
                    <button
                      onClick={() => handleCopy(editUrl, 'edit')}
                      className="interactive-pill"
                      style={{ padding: '8px 16px', fontSize: '0.9rem', flexShrink: 0 }}
                    >
                      {copiedType === 'edit' ? t('copied') : t('copy')}
                    </button>
                  </div>
                </div>

                {/* 2. Public Play Link */}
                {isPublic ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--accent-cyan)' }}>
                      🔗 {t('playLink')}
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        readOnly
                        value={playUrl}
                        style={{
                          flex: 1,
                          background: 'var(--bg-surface-nested)',
                          border: '1px solid var(--border-light)',
                          borderRadius: '8px',
                          padding: '10px 12px',
                          color: 'var(--text-primary)',
                          fontSize: '0.85rem',
                          fontFamily: 'monospace'
                        }}
                      />
                      <button
                        onClick={() => handleCopy(playUrl, 'play')}
                        className="interactive-pill interactive-pill-primary"
                        style={{ padding: '8px 16px', fontSize: '0.9rem', flexShrink: 0 }}
                      >
                        {copiedType === 'play' ? t('copied') : t('copy')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{
                    padding: '12px',
                    borderRadius: '8px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px dashed rgba(239, 68, 68, 0.3)',
                    color: '#ef4444',
                    fontSize: '0.9rem',
                    textAlign: 'center'
                  }}>
                    This card is currently set to Private. Enable public mode in Settings to generate a play sharing link.
                  </div>
                )}

                {/* QR Code Placeholder */}
                {isPublic && (
                  <div style={{
                    marginTop: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                    borderTop: '1px solid var(--border-light)',
                    paddingTop: '20px'
                  }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {t('qrCode')}
                    </span>
                    {/* Generates a simple, beautiful CSS/SVG QR code placeholder containing the URL! */}
                    <div style={{
                      width: '120px',
                      height: '120px',
                      background: '#fff',
                      padding: '8px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: 'var(--shadow-diffused)'
                    }}>
                      <div style={{
                        width: '100%',
                        height: '100%',
                        backgroundImage: 'radial-gradient(circle, #000 20%, transparent 20%), radial-gradient(circle, #000 20%, transparent 20%)',
                        backgroundSize: '10px 10px',
                        backgroundPosition: '0 0, 5px 5px',
                        opacity: 0.8
                      }} />
                    </div>
                  </div>
                )}

              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
