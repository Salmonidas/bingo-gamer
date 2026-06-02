'use client';

import React, { useEffect, useState, use } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { getLocalLogo, saveLocalCellImage, deleteLocalCellImage, getAllLocalCellImages, getLocalCard, saveLocalCard } from '@/lib/idb';
import { detectBingo, CompletedLine } from '@/lib/bingo-detector';
import Navbar from '@/components/layout/Navbar';
import BingoGrid from '@/components/ui/BingoGrid';
import BingoWinCelebration from '@/components/ui/BingoWinCelebration';
import CardSettingsModal from '@/components/ui/CardSettingsModal';
import CellImageModal from '@/components/ui/CellImageModal';
import ShareTemplateModal from '@/components/ui/ShareTemplateModal';
import Link from 'next/link';

interface CellData {
  id: string;
  position: number;
  content: string;
  is_free: boolean;
  is_marked: boolean;
}

interface BingoCard {
  id: string;
  title: string;
  event_name: string | null;
  theme_color: string;
  grid_size: number;
  free_space: boolean;
  is_public: boolean;
  edit_token: string;
  expires_at: string | null;
  cells: CellData[];
}

interface PageProps {
  params: Promise<{ editToken: string }>;
}

export default function EditCardPage({ params }: PageProps) {
  const { editToken } = use(params);
  const t = useTranslations('game');
  const tc = useTranslations('common');
  const locale = useLocale();

  const [card, setCard] = useState<BingoCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  
  // Gameplay states
  const [markedPositions, setMarkedPositions] = useState<number[]>([]);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isEditingMode, setIsEditingMode] = useState(true);
  
  // Modal & Alerts states
  const [showSettings, setShowSettings] = useState(false);
  const [showClearTextsConfirm, setShowClearTextsConfirm] = useState(false);
  const [showClearMarkingsConfirm, setShowClearMarkingsConfirm] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isClearingTexts, setIsClearingTexts] = useState(false);

  // Cell Background Customization States
  const [cellImages, setCellImages] = useState<Record<number, string>>({});
  const [showCellImageModal, setShowCellImageModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedPositionForImage, setSelectedPositionForImage] = useState<number | null>(null);

  const [celebration, setCelebration] = useState<{ show: boolean; type: 'line' | 'bingo' | null }>({
    show: false,
    type: null
  });
  
  // Notification level configuration per session
  const [notificationLevel, setNotificationLevel] = useState<'silent' | 'line' | 'bingo'>('line');
  const [linesCompletedCount, setLinesCompletedCount] = useState<number>(0);

  const loadHtml2Canvas = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      if ((window as any).html2canvas) {
        resolve((window as any).html2canvas);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
      script.onload = () => resolve((window as any).html2canvas);
      script.onerror = (e) => reject(e);
      document.head.appendChild(script);
    });
  };

  const handleExportPng = async () => {
    if (!card) return;
    setIsExporting(true);
    try {
      const html2canvas = await loadHtml2Canvas();
      const exportElement = document.getElementById('bingo-card-export');
      if (exportElement) {
        const canvas = await html2canvas(exportElement, {
          backgroundColor: '#06080c',
          scale: 2,
          logging: false,
          useCORS: true,
          allowTaint: true
        });
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `bingo-card-${card.title.toLowerCase().replace(/\s+/g, '-')}.png`;
        link.href = dataUrl;
        link.click();
      }
    } catch {
      // Safe fail-safe
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearSelection = async () => {
    if (!card) return;
    setShowClearMarkingsConfirm(false);

    const initiallyMarked: number[] = [];
    if (card.free_space) {
      const midPoint = Math.floor((card.grid_size * card.grid_size) / 2);
      initiallyMarked.push(midPoint);
    }
    setMarkedPositions(initiallyMarked);
    setLinesCompletedCount(0);

    try {
      const updatedCells = card.cells.map(c => ({
        ...c,
        is_marked: c.is_free ? true : false
      }));
      const updatedCard = { ...card, cells: updatedCells };
      setCard(updatedCard);
      await saveLocalCard(updatedCard);
    } catch {
      // Safe fail-safe
    }
  };

  const handleClearTexts = async () => {
    if (!card) return;
    setIsClearingTexts(true);
    try {
      const updatedCells = card.cells.map(c => ({
        ...c,
        content: c.is_free ? '★ FREE SPACE ★' : '',
        is_marked: c.is_free ? true : false
      }));
      const updatedCard = { ...card, cells: updatedCells };
      setCard(updatedCard);
      await saveLocalCard(updatedCard);

      // Delete all cell background images from IndexedDB
      for (const cell of card.cells) {
        await deleteLocalCellImage(card.id, cell.position);
      }
      setCellImages({}); // Clear the local background images state
    } catch {
      // Safe fail-safe
    } finally {
      setIsClearingTexts(false);
      setShowClearTextsConfirm(false);
    }
  };

  useEffect(() => {
    async function loadCard() {
      // Local ownership check
      try {
        const ownedStr = localStorage.getItem('bg_owned_cards') || '[]';
        const ownedCards = JSON.parse(ownedStr);
        if (!ownedCards.includes(editToken)) {
          setAccessDenied(true);
          setLoading(false);
          return;
        }
      } catch {
        setAccessDenied(true);
        setLoading(false);
        return;
      }

      try {
        const data = await getLocalCard(editToken);
        if (data) {
          setCard(data);
          
          // Set initially marked cells from DB
          const initiallyMarked = data.cells
            .filter((c: any) => c.is_marked)
            .map((c: any) => c.position);
          setMarkedPositions(initiallyMarked);

          // Trigger initial completed line checks
          const initialStatus = detectBingo(initiallyMarked, data.grid_size);
          setLinesCompletedCount(initialStatus.lineCount);

          // Load local cached logo if available
          const localLogo = await getLocalLogo(data.id);
          if (localLogo) {
            setLogoUrl(localLogo);
          }

          // Load local cached cell background images
          const localCellImages = await getAllLocalCellImages(data.id);
          setCellImages(localCellImages);
        }
      } catch {
        // Safe fail-safe
      } finally {
        setLoading(false);
      }
    }
    loadCard();
  }, [editToken]);

  const handleCellToggle = async (position: number) => {
    if (!card) return;

    // Toggle local state
    let newMarked: number[];
    const isCurrentlyMarked = markedPositions.includes(position);
    
    if (isCurrentlyMarked) {
      newMarked = markedPositions.filter(p => p !== position);
    } else {
      newMarked = [...markedPositions, position];
    }
    setMarkedPositions(newMarked);

    // Audio sound triggers
    try {
      if (!isCurrentlyMarked) {
        // Play simple procedural synthesizer click
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      }
    } catch {
      // Safe audio API fail-safe
    }

    // Check Win/Line completions
    const status = detectBingo(newMarked, card.grid_size);
    
    if (!isCurrentlyMarked) {
      // 1. Check Full Bingo Card (Blackout) completion
      if (status.isBlackout) {
        if (notificationLevel !== 'silent') {
          setCelebration({ show: true, type: 'bingo' });
        }
      } 
      // 2. Check Line completion
      else if (status.lineCount > linesCompletedCount) {
        if (notificationLevel === 'line') {
          setCelebration({ show: true, type: 'line' });
        }
      }
    }
    
    setLinesCompletedCount(status.lineCount);

    // Sync to local IndexedDB
    try {
      const updatedCells = card.cells.map(c => {
        if (c.position === position) {
          return { ...c, is_marked: !isCurrentlyMarked };
        }
        return c;
      });
      const updatedCard = { ...card, cells: updatedCells };
      setCard(updatedCard);
      await saveLocalCard(updatedCard);
    } catch {
      // Safe fail-safe
    }
  };

  const handleCellEdit = async (position: number, newContent: string) => {
    if (!card) return;

    const updatedCells = card.cells.map(c => {
      if (c.position === position) {
        return { ...c, content: newContent };
      }
      return c;
    });

    const updatedCard = { ...card, cells: updatedCells };
    setCard(updatedCard);

    try {
      await saveLocalCard(updatedCard);
    } catch {
      // Safe fail-safe
    }
  };

  const handleSaveCellImage = async (position: number, imageUrl: string) => {
    if (!card) return;
    try {
      await saveLocalCellImage(card.id, position, imageUrl);
      setCellImages(prev => ({ ...prev, [position]: imageUrl }));
    } catch {
      // Safe fail-safe
    }
  };

  const handleRemoveCellImage = async (position: number) => {
    if (!card) return;
    try {
      await deleteLocalCellImage(card.id, position);
      setCellImages(prev => {
        const next = { ...prev };
        delete next[position];
        return next;
      });
    } catch {
      // Safe fail-safe
    }
  };

  const handleShuffle = async () => {
    if (!card) return;
    // Client-side visual shuffle of cell contents
    const shuffledCells = [...card.cells].sort(() => Math.random() - 0.5);
    // Remap positions
    const remapped = shuffledCells.map((c, i) => ({ ...c, position: i }));
    
    // Reset markings for safety (keep free space marked if enabled)
    const updatedCells = remapped.map(c => ({
      ...c,
      is_marked: c.is_free ? true : false
    }));
    
    const updatedCard = { ...card, cells: updatedCells };
    setCard(updatedCard);
    await saveLocalCard(updatedCard);
    
    setMarkedPositions(card.free_space ? [Math.floor((card.grid_size * card.grid_size) / 2)] : []);
    setLinesCompletedCount(0);
  };

  if (accessDenied) {
    return (
      <>
        <Navbar />
        <main style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>
          <div style={{ textAlign: 'center', padding: '40px', background: 'var(--bg-surface)', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '16px', color: 'var(--text-primary)' }}>🔒 Private Card</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
              This card can only be edited on the device and browser where it was created.
            </p>
            <Link href={`/${locale}/create`} className="interactive-pill interactive-pill-primary" style={{ display: 'inline-flex', marginTop: '24px' }}>
              <span>➕</span>
              <span>{tc('createBtn')}</span>
            </Link>
          </div>
        </main>
      </>
    );
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#06080c',
        color: 'var(--text-muted)'
      }}>
        {tc('loading')}
      </div>
    );
  }

  if (!card) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#06080c',
        color: 'var(--text-muted)'
      }}>
        <p style={{ marginBottom: '20px' }}>Card not found or expired.</p>
        <Link href={`/${locale}`} className="interactive-pill">
          {tc('back')}
        </Link>
      </div>
    );
  }
return (
    <>
      <Navbar />
      <main style={{
        padding: '120px 24px 60px 24px',
        maxWidth: '900px',
        margin: '0 auto',
        position: 'relative'
      }}>
        
        {/* Export Wrapper containing Card Content */}
        <div id="bingo-card-export" style={{
          background: 'var(--bg-surface)',
          padding: '32px 24px',
          borderRadius: '24px',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-diffused)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
          width: '100%'
        }}>
          {/* Main interactive header */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            textAlign: 'center'
          }}>
            <h1 className="glow-text" style={{ fontSize: '2.5rem', color: 'var(--text-primary)', textTransform: 'none', margin: 0 }}>
              {card.title}
            </h1>
            {card.event_name && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>
                Event: <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{card.event_name}</span>
              </p>
            )}
          </div>

          {/* Dynamic N×N grid layout */}
          <div style={{ position: 'relative', marginTop: logoUrl ? '40px' : '0', width: '100%' }}>
            {logoUrl && (
              <div style={{
                position: 'absolute',
                top: '-40px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 10,
                background: 'var(--bg-surface)',
                padding: '8px 16px',
                borderRadius: '12px',
                border: `1px solid ${card.theme_color}33`,
                boxShadow: `var(--shadow-diffused), 0 0 15px ${card.theme_color}33`,
                backdropFilter: 'blur(10px)'
              }}>
                <img
                  src={logoUrl}
                  alt="Logo"
                  style={{
                    maxHeight: '60px',
                    maxWidth: '180px',
                    objectFit: 'contain'
                  }}
                />
              </div>
            )}
            <BingoGrid
              cells={card.cells}
              gridSize={card.grid_size}
              themeColor={card.theme_color}
              markedPositions={markedPositions}
              onCellToggle={handleCellToggle}
              isEditingMode={isEditingMode}
              onCellEdit={handleCellEdit}
              cellImages={cellImages}
              onCellDoubleClick={(position) => {
                setSelectedPositionForImage(position);
                setShowCellImageModal(true);
              }}
            />
          </div>
        </div>

        {/* Quick utility controls (Excluded from PNG export) */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '24px', marginBottom: '24px' }}>
          {isEditingMode ? (
            <>
              <button onClick={() => setShowSettings(true)} className="interactive-pill">
                <span>{t('settingsBtn')}</span>
              </button>
              <button onClick={() => setShowClearTextsConfirm(true)} className="interactive-pill" style={{ color: '#ef4444' }}>
                <span>🗑️</span>
                <span>{t('clearTextsBtn')}</span>
              </button>
            </>
          ) : (
            <button onClick={() => setShowClearMarkingsConfirm(true)} className="interactive-pill" style={{ color: 'var(--accent-amber)' }}>
              <span>🧹</span>
              <span>{t('clearSelectionBtn')}</span>
            </button>
          )}

          <button onClick={handleShuffle} className="interactive-pill">
            <span>🔀</span>
            <span>{t('shuffle')}</span>
          </button>
          <button onClick={handleExportPng} className="interactive-pill" disabled={isExporting}>
            <span>{isExporting ? tc('loading') : '🖼️'}</span>
            <span>{t('exportPngBtn')}</span>
          </button>
          <button onClick={() => setShowShareModal(true)} className="interactive-pill" style={{ borderColor: 'var(--accent-cyan)' }}>
            <span>📤</span>
            <span>{t('shareTemplateBtn')}</span>
          </button>
        </div>

        {/* Dynamic Notification Level Selection */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '24px',
          background: 'var(--bg-surface)',
          padding: '8px 16px',
          borderRadius: '100px',
          width: 'max-content',
          margin: '0 auto 24px auto',
          border: '1px solid var(--border-light)'
        }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            🔔 {t('notificationLevel')}:
          </span>
          <select
            value={notificationLevel}
            onChange={(e) => setNotificationLevel(e.target.value as any)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-body)',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="silent" style={{ background: 'var(--bg-surface)' }}>{t('notifSilent')}</option>
            <option value="line" style={{ background: 'var(--bg-surface)' }}>{t('notifLine')}</option>
            <option value="bingo" style={{ background: 'var(--bg-surface)' }}>{t('notifBingo')}</option>
          </select>
        </div>

        {/* Mode Toggle Switch: Edit vs Play */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '4px',
          background: 'rgba(6, 8, 12, 0.6)',
          backdropFilter: 'blur(12px)',
          border: '1px solid var(--border-light)',
          padding: '4px',
          borderRadius: '100px',
          width: 'max-content',
          margin: '0 auto 24px auto',
          boxShadow: '0 0 20px rgba(0,0,0,0.5)'
        }}>
          <button
            onClick={() => setIsEditingMode(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              border: 'none',
              borderRadius: '100px',
              padding: '8px 20px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              background: isEditingMode ? card.theme_color : 'transparent',
              color: isEditingMode ? '#000000' : 'var(--text-muted)',
              boxShadow: isEditingMode ? `0 0 15px ${card.theme_color}66` : 'none'
            }}
          >
            <span>✏️</span>
            <span>{t('editMode')}</span>
          </button>
          <button
            onClick={() => setIsEditingMode(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              border: 'none',
              borderRadius: '100px',
              padding: '8px 20px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              background: !isEditingMode ? card.theme_color : 'transparent',
              color: !isEditingMode ? '#000000' : 'var(--text-muted)',
              boxShadow: !isEditingMode ? `0 0 15px ${card.theme_color}66` : 'none'
            }}
          >
            <span>🎮</span>
            <span>{t('playMode')}</span>
          </button>
        </div>

        {/* Multi-celebration overlay */}
        <BingoWinCelebration
          show={celebration.show}
          type={celebration.type}
          onClose={() => setCelebration({ show: false, type: null })}
        />

        {/* Settings overlay */}
        <CardSettingsModal
          show={showSettings}
          card={card}
          onClose={() => setShowSettings(false)}
          onSave={async (updatedCard) => {
            setCard(updatedCard);
            
            // Set marked cells from updated DB data (some might be deleted/pruned)
            const updatedMarked = updatedCard.cells
              .filter((c: any) => c.is_marked)
              .map((c: any) => c.position);
            setMarkedPositions(updatedMarked);
 
            // Recheck completed lines count based on new grid size & markings
            const status = detectBingo(updatedMarked, updatedCard.grid_size);
            setLinesCompletedCount(status.lineCount);
 
            // Reload local cached logo if available (in case it was updated in Settings modal)
            const localLogo = await getLocalLogo(updatedCard.id);
            if (localLogo) {
              setLogoUrl(localLogo);
            } else {
              setLogoUrl(null);
            }
          }}
        />

        {/* Share Template overlay */}
        <ShareTemplateModal
          show={showShareModal}
          card={card}
          cellImages={cellImages}
          onClose={() => setShowShareModal(false)}
        />

        {/* Clear Selection Confirmation Modal */}
        <AnimatePresence>
          {showClearMarkingsConfirm && (
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
              <motion.div
                initial={{ scale: 0.95, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 30 }}
                className="double-bezel-outer"
                style={{ maxWidth: '450px', width: '100%' }}
              >
                <div className="double-bezel-inner" style={{ padding: '24px', textAlign: 'center' }}>
                  <h3 className="glow-text" style={{ fontSize: '1.5rem', marginBottom: '16px', color: 'var(--accent-amber)' }}>
                    ⚠️ {t('clearSelectionBtn')}
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '24px', lineHeight: '1.5' }}>
                    {t('clearSelectionConfirm')}
                  </p>
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <button
                      onClick={() => setShowClearMarkingsConfirm(false)}
                      className="interactive-pill"
                      style={{ padding: '8px 20px' }}
                    >
                      {tc('cancel')}
                    </button>
                    <button
                      onClick={handleClearSelection}
                      className="interactive-pill interactive-pill-primary"
                      style={{
                        padding: '8px 20px',
                        background: 'var(--accent-amber)',
                        boxShadow: '0 0 15px rgba(245, 158, 11, 0.4)',
                        color: '#000'
                      }}
                    >
                      {tc('save')}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Clear Cell Texts Confirmation Modal */}
        <AnimatePresence>
          {showClearTextsConfirm && (
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
              <motion.div
                initial={{ scale: 0.95, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 30 }}
                className="double-bezel-outer"
                style={{ maxWidth: '450px', width: '100%' }}
              >
                <div className="double-bezel-inner" style={{ padding: '24px', textAlign: 'center' }}>
                  <h3 className="glow-text" style={{ fontSize: '1.5rem', marginBottom: '16px', color: '#ef4444' }}>
                    {t('clearTextsConfirmTitle')}
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '24px', lineHeight: '1.5' }}>
                    {t('clearTextsConfirmDesc')}
                  </p>
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <button
                      onClick={() => setShowClearTextsConfirm(false)}
                      className="interactive-pill"
                      style={{ padding: '8px 20px' }}
                      disabled={isClearingTexts}
                    >
                      {tc('cancel')}
                    </button>
                    <button
                      onClick={handleClearTexts}
                      className="interactive-pill interactive-pill-primary"
                      style={{
                        padding: '8px 20px',
                        background: '#ef4444',
                        boxShadow: '0 0 15px rgba(239, 68, 68, 0.4)',
                        color: '#fff'
                      }}
                      disabled={isClearingTexts}
                    >
                      {isClearingTexts ? tc('loading') : t('clearTextsConfirmBtn')}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cell Image Customization Modal */}
        <CellImageModal
          show={showCellImageModal}
          position={selectedPositionForImage ?? 0}
          currentImageUrl={selectedPositionForImage !== null ? (cellImages[selectedPositionForImage] || null) : null}
          onClose={() => {
            setShowCellImageModal(false);
            setSelectedPositionForImage(null);
          }}
          onSave={(imageUrl) => {
            if (selectedPositionForImage !== null) {
              handleSaveCellImage(selectedPositionForImage, imageUrl);
            }
          }}
          onRemove={() => {
            if (selectedPositionForImage !== null) {
              handleRemoveCellImage(selectedPositionForImage);
            }
          }}
        />

      </main>
    </>
  );
}
