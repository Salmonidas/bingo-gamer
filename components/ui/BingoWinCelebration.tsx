'use client';

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';

import { useTranslations } from 'next-intl';

interface BingoWinCelebrationProps {
  show: boolean;
  type: 'line' | 'bingo' | null;
  onClose: () => void;
}

export default function BingoWinCelebration({ show, type, onClose }: BingoWinCelebrationProps) {
  const t = useTranslations('game');

  useEffect(() => {
    if (show && type) {
      // Trigger a beautiful double confetti cascade!
      const duration = 3 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#00e5ff', '#7c3aed', '#ffb400']
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#00e5ff', '#7c3aed', '#ffb400']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      
      frame();
    }
  }, [show, type]);

  return (
    <AnimatePresence>
      {show && type && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2000,
            background: 'rgba(6, 8, 12, 0.85)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <motion.div
            initial={{ scale: 0.8, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: 50, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 100, damping: 15 }}
            style={{ textAlign: 'center', padding: '24px' }}
          >
            <span style={{ fontSize: '5rem', display: 'block', marginBottom: '24px' }}>
              {type === 'bingo' ? '🏆' : '🎉'}
            </span>
            
            <h2 className="glow-text" style={{
              fontSize: '4rem',
              fontWeight: 700,
              background: type === 'bingo'
                ? 'linear-gradient(135deg, var(--accent-amber), var(--accent-cyan))'
                : 'linear-gradient(135deg, var(--accent-cyan), var(--accent-violet))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '16px',
              textTransform: 'uppercase',
              letterSpacing: '0.1em'
            }}>
              {type === 'bingo' ? t('celebrationBingoTitle') : t('celebrationLineTitle')}
            </h2>

            <p style={{
              color: 'var(--text-muted)',
              fontSize: '1.2rem',
              fontFamily: 'var(--font-body)',
              textTransform: 'none',
              letterSpacing: '0'
            }}>
              {type === 'bingo' 
                ? t('celebrationBingoDesc')
                : t('celebrationLineDesc')}
            </p>
            
            <span style={{
              display: 'inline-block',
              marginTop: '32px',
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
              border: '1px solid var(--border-light)',
              padding: '6px 16px',
              borderRadius: '100px',
              background: 'rgba(255,255,255,0.03)'
            }}>
              {t('clickToClose')}
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
