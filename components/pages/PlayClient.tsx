'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { detectBingo } from '@/lib/bingo-detector';
import { getAllLocalCellImages } from '@/lib/idb';
import Navbar from '@/components/layout/Navbar';
import BingoGrid from '@/components/ui/BingoGrid';
import BingoWinCelebration from '@/components/ui/BingoWinCelebration';
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
  allow_community: boolean;
  share_token: string;
  expires_at: string | null;
  cells: CellData[];
}

interface PlayClientProps {
  shareToken: string;
}

export default function PlayCardClient({ shareToken }: PlayClientProps) {
  const t = useTranslations('game');
  const tc = useTranslations('common');
  const locale = useLocale();

  const [card, setCard] = useState<BingoCard | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Local community player state
  const [markedPositions, setMarkedPositions] = useState<number[]>([]);
  const [linesCompletedCount, setLinesCompletedCount] = useState<number>(0);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [cellImages, setCellImages] = useState<Record<number, string>>({});
  
  const [celebration, setCelebration] = useState<{ show: boolean; type: 'line' | 'bingo' | null }>({
    show: false,
    type: null
  });

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

  const handleClearSelection = () => {
    if (!card) return;
    const initiallyMarked: number[] = [];
    if (card.free_space) {
      const midPoint = Math.floor((card.grid_size * card.grid_size) / 2);
      initiallyMarked.push(midPoint);
    }
    setMarkedPositions(initiallyMarked);
    setLinesCompletedCount(0);
    
    const storedKey = `bg_play_marked_${card.id}`;
    localStorage.setItem(storedKey, JSON.stringify(initiallyMarked));
    setShowClearConfirm(false);
  };

  useEffect(() => {
    async function loadCard() {
      try {
        const res = await fetch(`/api/cards/play/${shareToken}`);
        if (res.ok) {
          const data: BingoCard = await res.json();
          setCard(data);
          
          // Load public player marked cells from local storage
          const storedKey = `bg_play_marked_${data.id}`;
          const stored = localStorage.getItem(storedKey);
          if (stored) {
            const parsed = JSON.parse(stored) as number[];
            setMarkedPositions(parsed);
            
            // Check lines
            const status = detectBingo(parsed, data.grid_size);
            setLinesCompletedCount(status.lineCount);
          } else {
            // Check free space if applicable
            const initiallyMarked: number[] = [];
            if (data.free_space) {
              const midPoint = Math.floor((data.grid_size * data.grid_size) / 2);
              initiallyMarked.push(midPoint);
              setMarkedPositions(initiallyMarked);
            }
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
  }, [shareToken]);

  const handleCellToggle = (position: number) => {
    if (!card) return;

    let newMarked: number[];
    const isCurrentlyMarked = markedPositions.includes(position);
    
    if (isCurrentlyMarked) {
      newMarked = markedPositions.filter(p => p !== position);
    } else {
      newMarked = [...markedPositions, position];
    }
    setMarkedPositions(newMarked);

    // Save user state locally
    const storedKey = `bg_play_marked_${card.id}`;
    localStorage.setItem(storedKey, JSON.stringify(newMarked));

    // Audio click effect
    try {
      if (!isCurrentlyMarked) {
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
      // Safe fail-safe
    }

    // Check lines and blackout
    const status = detectBingo(newMarked, card.grid_size);
    
    if (!isCurrentlyMarked) {
      if (status.isBlackout) {
        setCelebration({ show: true, type: 'bingo' });
      } else if (status.lineCount > linesCompletedCount) {
        setCelebration({ show: true, type: 'line' });
      }
    }
    
    setLinesCompletedCount(status.lineCount);
  };

  if (loading) {
    return (
      <div style={{
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
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#06080c',
        color: 'var(--text-muted)'
      }}>
        <p style={{ marginBottom: '20px' }}>Card is not public or does not exist.</p>
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
          background: '#06080c',
          padding: '32px 24px',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
          width: '100%'
        }}>
          {/* Header content */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            textAlign: 'center'
          }}>
            <span style={{
              fontSize: '0.80rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--accent-cyan)',
              fontWeight: 700
            }}>
              🎮 {t('spectatorMode')}
            </span>
            
            <h1 className="glow-text" style={{ fontSize: '2.5rem', color: 'var(--text-primary)', textTransform: 'none' }}>
              {card.title}
            </h1>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>
              Event: <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{card.event_name || 'Generic Event'}</span>
            </p>
          </div>

          {/* N×N Bingo grid board */}
          <BingoGrid
            cells={card.cells}
            gridSize={card.grid_size}
            themeColor={card.theme_color}
            markedPositions={markedPositions}
            onCellToggle={handleCellToggle}
            cellImages={cellImages}
          />
        </div>

        {/* Buttons (Excluded from PNG export wrapper) */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '24px' }}>
          <button onClick={() => setShowClearConfirm(true)} className="interactive-pill">
            <span>🧹</span>
            <span>{t('clearSelectionBtn')}</span>
          </button>
          <button onClick={handleExportPng} className="interactive-pill interactive-pill-primary" disabled={isExporting}>
            <span>{isExporting ? tc('loading') : '🖼️'}</span>
            <span>{t('exportPngBtn')}</span>
          </button>
        </div>

        {/* Win Alert overlays */}
        <BingoWinCelebration
          show={celebration.show}
          type={celebration.type}
          onClose={() => setCelebration({ show: false, type: null })}
        />

        {/* Clear Selection Confirmation Modal */}
        <AnimatePresence>
          {showClearConfirm && (
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
                      onClick={() => setShowClearConfirm(false)}
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

      </main>
    </>
  );
}
