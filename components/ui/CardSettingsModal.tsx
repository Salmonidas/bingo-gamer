'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { saveLocalLogo, getLocalLogo, deleteLocalLogo, saveLocalCard } from '@/lib/idb';

interface CardSettingsModalProps {
  show: boolean;
  card: {
    id: string;
    title: string;
    event_name?: string | null;
    grid_size: number;
    free_space: boolean;
    is_public: boolean;
    expires_at?: string | null;
    theme_color: string;
    edit_token: string;
  };
  onClose: () => void;
  onSave: (updatedCard: any) => void;
}

export default function CardSettingsModal({ show, card, onClose, onSave }: CardSettingsModalProps) {
  const t = useTranslations('create');
  const tg = useTranslations('game');
  const tc = useTranslations('common');
  const locale = useLocale();

  const [title, setTitle] = useState(card.title);
  const [eventName, setEventName] = useState(card.event_name || '');
  const [gridSize, setGridSize] = useState(card.grid_size);
  const [freeSpace, setFreeSpace] = useState(card.free_space);
  const [expiresAt, setExpiresAt] = useState('');
  const [themeColor, setThemeColor] = useState(card.theme_color);
  
  const [logoBase64, setLogoBase64] = useState<string | null>(null);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Load dates, resets, and cached logo
  useEffect(() => {
    if (card.expires_at) {
      // Format to YYYY-MM-DDTHH:MM
      const date = new Date(card.expires_at);
      const tzOffset = date.getTimezoneOffset() * 60000;
      const localISOTime = new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
      setExpiresAt(localISOTime);
    } else {
      setExpiresAt('');
    }
    setTitle(card.title);
    setEventName(card.event_name || '');
    setGridSize(card.grid_size);
    setFreeSpace(card.free_space);
    setThemeColor(card.theme_color);
    setLogoBase64(null);
    setShowConfirm(false);

    // Fetch existing cached logo from IndexedDB
    const fetchLogo = async () => {
      const localLogo = await getLocalLogo(card.id);
      if (localLogo) {
        setLogoPreview(localLogo);
        if (localLogo.startsWith('http://') || localLogo.startsWith('https://')) {
          setImageUrlInput(localLogo);
        } else {
          setImageUrlInput('');
        }
      } else {
        setLogoPreview(null);
        setImageUrlInput('');
      }
    };
    fetchLogo();
  }, [card, show]);


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
    if (!show) return;
    const handleGlobalPaste = (e: ClipboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }
      handlePaste(e);
    };
    
    window.addEventListener('paste', handleGlobalPaste);
    return () => window.removeEventListener('paste', handleGlobalPaste);
  }, [show]);

  if (!show) return null;

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

  const checkDestructive = () => {
    // Checking if grid is shrunken OR free space setting toggled
    const isShrinking = gridSize < card.grid_size;
    const isFreeSpaceChanged = freeSpace !== card.free_space;
    return isShrinking || isFreeSpaceChanged;
  };

  const handlePreSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (checkDestructive()) {
      setShowConfirm(true);
    } else {
      executeSave();
    }
  };

  const executeSave = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const oldGridSize = card.grid_size;
      const oldTotalCells = oldGridSize * oldGridSize;
      const newTotalCells = gridSize * gridSize;

      // A. Grow/Shrink cells array
      let updatedCells = (card as any).cells ? [...(card as any).cells] : [];
      if (newTotalCells < oldTotalCells) {
        // Shrunk: slice elements
        updatedCells = updatedCells.slice(0, newTotalCells);
      } else if (newTotalCells > oldTotalCells) {
        // Grown: add empty elements
        for (let i = oldTotalCells; i < newTotalCells; i++) {
          updatedCells.push({
            id: crypto.randomUUID(),
            position: i,
            content: '',
            is_free: false,
            is_marked: false
          });
        }
      }

      // B. Adjusting Free Space position and toggles
      const formerMidPoint = Math.floor(oldTotalCells / 2);
      const newMidPoint = Math.floor(newTotalCells / 2);

      updatedCells = updatedCells.map((c, i) => {
        const isCentral = freeSpace && (i === newMidPoint);
        if (isCentral) {
          return {
            ...c,
            position: i,
            is_free: true,
            is_marked: true,
            content: c.content && c.content !== '' && c.content !== '★ FREE SPACE ★' ? c.content : '★ FREE SPACE ★'
          };
        } else {
          const wasFormerCentral = card.free_space && (i === formerMidPoint);
          if (wasFormerCentral) {
            return {
              ...c,
              position: i,
              is_free: false,
              is_marked: false,
              content: c.content === '★ FREE SPACE ★' ? '' : c.content
            };
          } else {
            return {
              ...c,
              position: i,
              is_free: false
            };
          }
        }
      });

      const updatedCard = {
        ...card,
        title: title || `${eventName || 'Gaming'} Predictions`,
        event_name: eventName || null,
        theme_color: themeColor,
        grid_size: gridSize,
        free_space: freeSpace,
        is_public: false,
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
        cells: updatedCells
      };

      await saveLocalCard(updatedCard);
      
      // Save uploaded/pasted logo or URL locally to IndexedDB if provided, otherwise clear it
      const logoToSave = imageUrlInput || logoBase64;
      if (logoToSave) {
        await saveLocalLogo(card.id, logoToSave);
      } else {
        await deleteLocalLogo(card.id);
      }

      onSave(updatedCard);
      onClose();
    } catch {
      // Safe fallback
    } finally {
      setSubmitting(false);
      setShowConfirm(false);
    }
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
            padding: '24px',
            overflowY: 'auto'
          }}
        >
          <motion.div
            initial={{ scale: 0.95, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 30 }}
            className="double-bezel-outer"
            style={{ maxWidth: '650px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}
          >
            <div className="double-bezel-inner" style={{ position: 'relative' }}>
              
              {/* Close button */}
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
                  cursor: 'pointer',
                  zIndex: 10
                }}
              >
                ✕
              </button>

              {!showConfirm ? (
                <>
                  <h2 className="glow-text" style={{ fontSize: '1.75rem', marginBottom: '24px', textAlign: 'center' }}>
                    {tg('settingsModalTitle')}
                  </h2>

                  <form onSubmit={handlePreSaveSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
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
                            padding: '10px',
                            color: 'var(--text-primary)',
                            fontFamily: 'var(--font-body)',
                            fontSize: '0.9rem'
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
                            padding: '10px',
                            color: 'var(--text-primary)',
                            fontFamily: 'var(--font-body)',
                            fontSize: '0.9rem'
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
                          padding: '10px',
                          color: 'var(--text-primary)',
                          fontFamily: 'var(--font-body)',
                          fontSize: '0.9rem'
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
                        <span style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {t('freeSpace')}
                          <span title={t('freeSpaceTooltip')} style={{ cursor: 'help', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', width: '18px', height: '18px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold' }}>i</span>
                        </span>
                      </label>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.85rem' }}>{t('expiry')}</label>
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
                            fontFamily: 'var(--font-body)',
                            fontSize: '0.85rem'
                          }}
                        />
                      </div>
                    </div>

                    {/* Theme pickers & uploads */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.85rem' }}>{t('colorTheme')}</label>
                        <input
                          type="color"
                          value={themeColor}
                          onChange={(e) => setThemeColor(e.target.value)}
                          style={{
                            border: 'none',
                            background: 'transparent',
                            width: '100%',
                            height: '38px',
                            cursor: 'pointer'
                          }}
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.85rem' }}>
                          {t('uploadLogo')}
                        </label>
                        
                        {/* Drag, Drop and Paste Area */}
                        <div
                          onDragEnter={handleDrag}
                          onDragOver={handleDrag}
                          onDragLeave={handleDrag}
                          onDrop={handleDrop}
                          onPaste={handlePaste}
                          onClick={() => document.getElementById('settings-logo-input')?.click()}
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
                            id="settings-logo-input"
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

                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: '1.2', margin: 0 }}>
                          ⚠️ {t('logoHelp')}
                        </p>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                      <button
                        type="button"
                        onClick={onClose}
                        className="interactive-pill"
                        style={{ flex: 1, justifyContent: 'center', padding: '12px' }}
                      >
                        {tc('cancel')}
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="interactive-pill interactive-pill-primary"
                        style={{ flex: 1, justifyContent: 'center', padding: '12px' }}
                      >
                        {submitting ? tc('loading') : tc('save')}
                      </button>
                    </div>

                  </form>
                </>
              ) : (
                /* Destructive Actions Confirmation Screen */
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    padding: '16px 8px'
                  }}
                >
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '2px solid #ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                    color: '#ef4444',
                    marginBottom: '20px'
                  }}>
                    ⚠️
                  </div>

                  <h2 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.5rem',
                    color: '#ef4444',
                    marginBottom: '12px',
                    fontWeight: 700
                  }}>
                    {tg('settingsConfirmTitle')}
                  </h2>

                  <p style={{
                    color: 'var(--text-muted)',
                    fontSize: '1rem',
                    lineHeight: '1.5',
                    marginBottom: '28px',
                    maxWidth: '420px'
                  }}>
                    {tg('settingsConfirmDesc')}
                  </p>

                  <div style={{ display: 'flex', gap: '16px', width: '100%', maxWidth: '380px' }}>
                    <button
                      onClick={() => setShowConfirm(false)}
                      className="interactive-pill"
                      style={{ flex: 1, justifyContent: 'center', padding: '12px' }}
                    >
                      {tg('settingsCancelBtn')}
                    </button>
                    <button
                      onClick={executeSave}
                      disabled={submitting}
                      className="interactive-pill"
                      style={{
                        flex: 1,
                        justifyContent: 'center',
                        padding: '12px',
                        background: '#ef4444',
                        border: '1px solid #ef4444',
                        color: '#fff'
                      }}
                    >
                      {submitting ? tc('loading') : tg('settingsConfirmBtn')}
                    </button>
                  </div>
                </motion.div>
              )}

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
