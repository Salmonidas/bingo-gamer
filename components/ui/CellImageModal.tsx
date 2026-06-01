'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';

interface CellImageModalProps {
  show: boolean;
  position: number;
  currentImageUrl: string | null;
  onClose: () => void;
  onSave: (imageUrl: string) => void;
  onRemove: () => void;
}

export default function CellImageModal({
  show,
  position,
  currentImageUrl,
  onClose,
  onSave,
  onRemove
}: CellImageModalProps) {
  const t = useTranslations('game');
  const tc = useTranslations('common');
  const [urlInput, setUrlInput] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (show) {
      setPreviewUrl(currentImageUrl);
      setUrlInput(currentImageUrl && !currentImageUrl.startsWith('data:') ? currentImageUrl : '');
    }
  }, [show, currentImageUrl]);

  // Focus modal to listen to paste events
  useEffect(() => {
    if (show && modalRef.current) {
      modalRef.current.focus();
    }
  }, [show]);

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (event.target?.result) {
              setPreviewUrl(event.target.result as string);
              setUrlInput(''); // clear text url if pasting
            }
          };
          reader.readAsDataURL(blob);
        }
        e.preventDefault();
        break;
      }
    }
  };

  const handleUrlChange = (val: string) => {
    setUrlInput(val);
    if (val.trim() === '') {
      setPreviewUrl(null);
    } else {
      setPreviewUrl(val);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPreviewUrl(event.target.result as string);
          setUrlInput('');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    const finalUrl = previewUrl || urlInput;
    if (finalUrl && finalUrl.trim() !== '') {
      onSave(finalUrl.trim());
    } else {
      onRemove();
    }
    onClose();
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
            zIndex: 1600,
            background: 'rgba(6, 8, 12, 0.85)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px'
          }}
          onClick={onClose}
        >
          <motion.div
            ref={modalRef}
            tabIndex={-1}
            initial={{ scale: 0.95, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 30 }}
            className="double-bezel-outer"
            style={{ 
              maxWidth: '500px', 
              width: '100%',
              outline: 'none'
            }}
            onClick={(e) => e.stopPropagation()}
            onPaste={handlePaste}
          >
            <div className="double-bezel-inner" style={{ padding: '28px' }}>
              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <h3 className="glow-text" style={{ fontSize: '1.6rem', margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
                  🖼️ {t('cellImageModalTitle')}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0, lineHeight: '1.4' }}>
                  {t('cellImageModalDesc')}
                </p>
              </div>

              {/* Paste / Drop Target Zone */}
              <div 
                style={{
                  border: '2px dashed rgba(255, 255, 255, 0.15)',
                  borderRadius: '16px',
                  padding: '20px',
                  textAlign: 'center',
                  background: 'rgba(255, 255, 255, 0.02)',
                  marginBottom: '20px',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '160px',
                  transition: 'border-color 0.3s ease'
                }}
              >
                {previewUrl ? (
                  <div style={{ position: 'relative', width: '100%', height: '140px', display: 'flex', justifyContent: 'center' }}>
                    <img 
                      src={previewUrl} 
                      alt="Cell Background Preview" 
                      style={{ 
                        maxHeight: '100%', 
                        maxWidth: '100%', 
                        borderRadius: '12px',
                        objectFit: 'contain',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
                      }} 
                    />
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text-muted)' }}>
                    <span style={{ fontSize: '2.5rem' }}>📋</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                      {t('cellImageUrlPlaceholder') ? 'Haz clic aquí y pulsa Ctrl+V para pegar' : 'Press Ctrl+V to paste or choose a file'}
                    </span>
                    <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>o selecciona un archivo local</span>
                    <label 
                      className="interactive-pill" 
                      style={{ 
                        marginTop: '8px', 
                        cursor: 'pointer', 
                        fontSize: '0.75rem', 
                        padding: '6px 14px',
                        background: 'rgba(255, 255, 255, 0.05)' 
                      }}
                    >
                      <span>📁 Seleccionar</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileChange} 
                        style={{ display: 'none' }} 
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* URL Input */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '6px' }}>
                  O introduce una URL directa de imagen:
                </label>
                <input
                  type="text"
                  placeholder={t('cellImageUrlPlaceholder')}
                  value={urlInput}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-light)',
                    borderRadius: '12px',
                    padding: '10px 14px',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.9rem',
                    outline: 'none',
                    transition: 'border-color 0.3s'
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button
                  onClick={onClose}
                  className="interactive-pill"
                  style={{ padding: '8px 20px' }}
                >
                  {tc('cancel')}
                </button>
                {previewUrl && (
                  <button
                    onClick={() => {
                      onRemove();
                      onClose();
                    }}
                    className="interactive-pill"
                    style={{ padding: '8px 20px', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                  >
                    {t('cellImageRemoveBtn')}
                  </button>
                )}
                <button
                  onClick={handleSave}
                  className="interactive-pill interactive-pill-primary"
                  style={{
                    padding: '8px 20px',
                    minWidth: '120px'
                  }}
                >
                  {t('cellImageSaveBtn')}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
