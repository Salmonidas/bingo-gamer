'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { saveLocalLogo, saveLocalCard } from '@/lib/idb';

export default function CreateCardPage() {
  const t = useTranslations('create');
  const tc = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [eventName, setEventName] = useState('');
  const [gridSize, setGridSize] = useState(5);
  const [freeSpace, setFreeSpace] = useState(false);
  const [expiresAt, setExpiresAt] = useState('');
  const [themeColor, setThemeColor] = useState('#00E5FF');
  
  const [logoBase64, setLogoBase64] = useState<string | null>(null);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setLogoBase64(base64);
      setLogoPreview(base64);
      setImageUrlInput('');
    };
    reader.readAsDataURL(file);
  };

  const handlePaste = (e: React.ClipboardEvent | ClipboardEvent) => {
    const file = e.clipboardData?.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setLogoBase64(base64);
        setLogoPreview(base64);
        setImageUrlInput('');
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      // Don't intercept if user is typing in an input field (except maybe the URL one, but standard paste is fine)
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }
      handlePaste(e);
    };
    
    window.addEventListener('paste', handleGlobalPaste);
    return () => window.removeEventListener('paste', handleGlobalPaste);
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setLogoBase64(base64);
        setLogoPreview(base64);
        setImageUrlInput('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setImageUrlInput(url);
    if (url.startsWith('http://') || url.startsWith('https://')) {
      setLogoPreview(url);
      setLogoBase64(null);
    } else if (url.trim() === '') {
      setLogoPreview(null);
    }
  };

  const handleClearLogo = () => {
    setLogoBase64(null);
    setImageUrlInput('');
    setLogoPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    try {
      const totalCells = gridSize * gridSize;
      const formattedCells: any[] = [];
      const midPoint = Math.floor(totalCells / 2);
      
      for (let i = 0; i < totalCells; i++) {
        if (freeSpace && i === midPoint) {
          formattedCells.push({
            position: i,
            content: '★ FREE SPACE ★',
            is_free: true
          });
        } else {
          formattedCells.push({
            position: i,
            content: '',
            is_free: false
          });
        }
      }

      const cardId = crypto.randomUUID();
      const editToken = crypto.randomUUID();
      const shareToken = crypto.randomUUID();

      const createdCard = {
        id: cardId,
        user_id: 'local',
        title: title || `${eventName || 'Gaming'} Predictions`,
        event_name: eventName || null,
        theme_color: themeColor,
        grid_size: gridSize,
        free_space: freeSpace,
        is_public: false,
        allow_community: false,
        edit_token: editToken,
        share_token: shareToken,
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        cells: formattedCells
      };

      await saveLocalCard(createdCard);

      // Save uploaded/pasted logo or URL locally to IndexedDB using card UUID
      const logoToSave = imageUrlInput || logoBase64;
      if (logoToSave) {
        await saveLocalLogo(createdCard.id, logoToSave);
      }

      // Add to owned cards for private browser access
      try {
        const ownedStr = localStorage.getItem('bg_owned_cards') || '[]';
        const ownedCards = JSON.parse(ownedStr);
        if (!ownedCards.includes(createdCard.edit_token)) {
          ownedCards.push(createdCard.edit_token);
          localStorage.setItem('bg_owned_cards', JSON.stringify(ownedCards));
        }
      } catch {
        localStorage.setItem('bg_owned_cards', JSON.stringify([createdCard.edit_token]));
      }

      router.push(`/${locale}/card/${createdCard.edit_token}`);
    } catch {
      // Safe fail-safe
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <main style={{
        padding: '120px 24px 60px 24px',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="double-bezel-outer"
        >
          <div className="double-bezel-inner">
            <h1 className="glow-text" style={{ fontSize: '2rem', marginBottom: '32px', textAlign: 'center' }}>
              {t('title')}
            </h1>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Event & Card title details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>{t('eventName')}</label>
                  <input
                    type="text"
                    required
                    placeholder={t('eventNamePlaceholder')}
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    style={{
                      background: 'var(--bg-surface-nested)',
                      border: '1px solid var(--border-light)',
                      borderRadius: '8px',
                      padding: '12px',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-body)'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>{t('cardTitle')}</label>
                  <input
                    type="text"
                    required
                    placeholder={t('cardTitlePlaceholder')}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={{
                      background: 'var(--bg-surface-nested)',
                      border: '1px solid var(--border-light)',
                      borderRadius: '8px',
                      padding: '12px',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-body)'
                    }}
                  />
                </div>
              </div>

              {/* Grid Config number input */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>
                  {t('gridSize', { size: gridSize })}
                </label>
                <input
                  type="number"
                  min="3"
                  max="20"
                  value={gridSize}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (!isNaN(val)) {
                      setGridSize(Math.min(20, Math.max(3, val)));
                    } else {
                      setGridSize(3);
                    }
                  }}
                  style={{
                    background: 'var(--bg-surface-nested)',
                    border: '1px solid var(--border-light)',
                    borderRadius: '8px',
                    padding: '12px',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-body)'
                  }}
                />
              </div>

              {/* Toggles */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={freeSpace}
                    onChange={(e) => setFreeSpace(e.target.checked)}
                    style={{ accentColor: 'var(--accent-cyan)', width: '18px', height: '18px' }}
                  />
                  <span style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {t('freeSpace')}
                    <span title={t('freeSpaceTooltip')} style={{ cursor: 'help', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', width: '18px', height: '18px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>i</span>
                  </span>
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9rem' }}>{t('expiry')}</label>
                  <input
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    style={{
                      background: 'var(--bg-surface-nested)',
                      border: '1px solid var(--border-light)',
                      borderRadius: '8px',
                      padding: '8px',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-body)'
                    }}
                  />
                </div>
              </div>

              {/* Theme pickers & uploads */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>{t('colorTheme')}</label>
                  <input
                    type="color"
                    value={themeColor}
                    onChange={(e) => setThemeColor(e.target.value)}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      width: '100%',
                      height: '42px',
                      cursor: 'pointer'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>
                    {t('uploadLogo')}
                  </label>
                  
                  {/* Drag, Drop and Paste Area */}
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onPaste={handlePaste}
                    onClick={() => document.getElementById('create-logo-input')?.click()}
                    tabIndex={0}
                    style={{
                      border: dragActive 
                        ? `2px dashed ${themeColor}` 
                        : '1px dashed var(--border-light)',
                      borderRadius: '10px',
                      padding: '16px',
                      background: dragActive ? 'rgba(0,229,255,0.05)' : 'var(--bg-surface-nested)',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      minHeight: '100px',
                      position: 'relative',
                      outline: 'none'
                    }}
                  >
                    <input
                      id="create-logo-input"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      style={{ display: 'none' }}
                    />
                    
                    {logoPreview ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <img
                          src={logoPreview}
                          alt="Logo Preview"
                          onError={(e) => {
                            setLogoPreview(null);
                            setLogoBase64(null);
                            setImageUrlInput('');
                            // Not using alert to avoid blocking, just clear the broken image
                          }}
                          style={{
                            maxHeight: '60px',
                            maxWidth: '180px',
                            objectFit: 'contain',
                            borderRadius: '6px',
                            boxShadow: `0 0 10px ${themeColor}33`
                          }}
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClearLogo();
                          }}
                          style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            color: '#ef4444',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            fontFamily: 'var(--font-body)'
                          }}
                        >
                          {tc('delete')}
                        </button>
                      </div>
                    ) : (
                      <>
                        <span style={{ fontSize: '1.5rem' }}>📷</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                          {t('uploadLogoDragPaste')}
                        </span>
                      </>
                    )}
                  </div>

                  {/* URL Paste Input */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                    <input
                      type="url"
                      value={imageUrlInput}
                      onChange={handleUrlChange}
                      placeholder={t('logoUrlPlaceholder')}
                      style={{
                        background: 'var(--bg-surface-nested)',
                        border: '1px solid var(--border-light)',
                        borderRadius: '8px',
                        padding: '10px',
                        color: 'var(--text-primary)',
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>

                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.3' }}>
                    ⚠️ {t('logoHelp')}
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="interactive-pill interactive-pill-primary"
                style={{ width: '100%', justifyContent: 'center', marginTop: '16px', padding: '14px' }}
              >
                <span>{submitting ? tc('loading') : t('submitBtn')}</span>
              </button>

            </form>
          </div>
        </motion.div>
      </main>
    </>
  );
}
