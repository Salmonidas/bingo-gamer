'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

interface BingoCellProps {
  content: string;
  isMarked: boolean;
  isFree: boolean;
  themeColor: string;
  onClick: () => void;
  isEditingMode?: boolean;
  onEdit?: (newContent: string) => void;
  gridSize?: number;
  bgImageUrl?: string | null;
  onDoubleClick?: () => void;
}

export default function BingoCell({
  content,
  isMarked,
  isFree,
  themeColor,
  onClick,
  isEditingMode = false,
  onEdit,
  gridSize = 5,
  bgImageUrl = null,
  onDoubleClick
}: BingoCellProps) {
  const t = useTranslations('game');
  const [isEditingThis, setIsEditingThis] = useState(false);
  const [editVal, setEditVal] = useState(content);
  const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setEditVal(content);
  }, [content]);

  useEffect(() => {
    return () => {
      if (clickTimeout) {
        clearTimeout(clickTimeout);
      }
    };
  }, [clickTimeout]);

  const handleBlur = () => {
    setIsEditingThis(false);
    if (onEdit && editVal !== content) {
      onEdit(editVal);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.currentTarget.blur();
    } else if (e.key === 'Escape') {
      setEditVal(content);
      setIsEditingThis(false);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isEditingMode) {
      if (isFree) return;
      
      if (clickTimeout) {
        // Second click within 250ms -> Double click!
        clearTimeout(clickTimeout);
        setClickTimeout(null);
        if (onDoubleClick) {
          onDoubleClick();
        }
      } else {
        // First click -> Start timer
        const timeout = setTimeout(() => {
          setClickTimeout(null);
          setIsEditingThis(true);
        }, 250);
        setClickTimeout(timeout);
      }
    } else {
      onClick();
    }
  };

  // Free space styling preset
  const displayColor = isFree ? 'var(--accent-amber)' : themeColor;

  const isEmpty = !content || content.trim() === '';

  // Dynamic cell sizing configurations based on gridSize
  let padding = '8px';
  let fontSize = '0.85rem';
  let emptyFontSize = '0.75rem';
  let borderRadius = '16px';
  let starSize = '0.75rem';
  let starTop = '6px';
  let starRight = '8px';

  if (gridSize > 5 && gridSize <= 8) {
    padding = '6px';
    fontSize = '0.75rem';
    emptyFontSize = '0.65rem';
    borderRadius = '12px';
    starSize = '0.65rem';
    starTop = '4px';
    starRight = '6px';
  } else if (gridSize > 8 && gridSize <= 12) {
    padding = '4px';
    fontSize = '0.62rem';
    emptyFontSize = '0.52rem';
    borderRadius = '8px';
    starSize = '0.55rem';
    starTop = '3px';
    starRight = '4px';
  } else if (gridSize > 12) {
    padding = '2px';
    fontSize = '0.5rem';
    emptyFontSize = '0.45rem';
    borderRadius = '6px';
    starSize = '0.45rem';
    starTop = '2px';
    starRight = '3px';
  }

  // Adjust display text for empty cells to prevent stretching on large grids
  const displayContent = isEmpty 
    ? (isEditingMode 
        ? (gridSize > 8 
            ? '+' 
            : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'center', pointerEvents: 'none' }}>
                  <span style={{ fontSize: emptyFontSize }}>+ {t('clickToEdit')}</span>
                  <span style={{ fontSize: '0.55rem', opacity: 0.6, fontWeight: 500 }}>({t('cellImageHint')})</span>
                </div>
              )
          ) 
        : '') 
    : content;

  if (isEditingThis && isEditingMode && !isFree) {
    return (
      <div
        style={{
          aspectRatio: '1',
          position: 'relative',
          borderRadius: borderRadius,
          padding: padding,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-surface-nested)',
          border: `1px solid ${themeColor}`,
          boxShadow: `0 0 10px ${themeColor}33`,
        }}
      >
        <textarea
          autoFocus
          value={editVal}
          onChange={(e) => setEditVal(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          maxLength={255}
          placeholder={gridSize > 8 ? '' : t('clickToEditPlaceholder')}
          style={{
            width: '100%',
            height: '100%',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            resize: 'none',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-body)',
            fontSize: fontSize,
            textAlign: 'center',
            padding: '2px 0 0 0',
            margin: '0',
            overflow: 'hidden',
          }}
        />
      </div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: isFree ? 1 : 1.03, y: isFree ? 0 : -2 }}
      whileTap={{ scale: isFree ? 1 : 0.97 }}
      onClick={handleClick}
      style={{
        aspectRatio: '1',
        cursor: isFree ? 'default' : 'pointer',
        position: 'relative',
        borderRadius: borderRadius,
        padding: padding,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        userSelect: 'none',
        transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
        backgroundImage: bgImageUrl
          ? `url(${bgImageUrl})`
          : isMarked 
            ? `radial-gradient(circle at center, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))`
            : 'none',
        backgroundColor: bgImageUrl || isMarked ? 'transparent' : 'var(--bg-surface-nested)',
        backgroundSize: bgImageUrl ? 'cover' : 'auto',
        backgroundPosition: bgImageUrl ? 'center' : 'auto',
        backgroundRepeat: bgImageUrl ? 'no-repeat' : 'auto',
        border: `1px ${isEmpty && isEditingMode ? 'dashed' : 'solid'} ${
          isMarked 
            ? displayColor 
            : isFree 
              ? 'rgba(251, 191, 36, 0.4)' 
              : isEmpty && isEditingMode
                ? 'var(--border-light)'
                : 'var(--border-light)'
        }`,
        boxShadow: isMarked 
          ? `inset 0 0 12px rgba(255, 255, 255, 0.05), 0 0 15px ${displayColor}33`
          : 'none'
      }}
    >
      {/* Dark overlay inside cell to make text on background images highly readable */}
      {bgImageUrl && (
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: `calc(${borderRadius} - 1px)`,
          background: 'rgba(0, 0, 0, 0.4)',
          zIndex: 0,
          pointerEvents: 'none'
        }} />
      )}

      {/* Glow aura inside card */}
      {isMarked && (
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: `calc(${borderRadius} - 1px)`,
          background: bgImageUrl 
            ? 'transparent' 
            : `radial-gradient(circle, ${displayColor}1a 0%, transparent 70%)`,
          pointerEvents: 'none',
          zIndex: 0
        }} />
      )}

      {/* Free space star icon indicator */}
      {isFree && (
        <span style={{
          position: 'absolute',
          top: starTop,
          right: starRight,
          fontSize: starSize,
          color: 'var(--accent-amber)',
          opacity: 0.8
        }}>
          ★
        </span>
      )}

      {/* Main Text Content */}
      <span style={{
        fontSize: isEmpty ? emptyFontSize : fontSize,
        fontWeight: isFree || isMarked || bgImageUrl ? '700' : '500',
        lineHeight: '1.3',
        fontFamily: isFree ? 'var(--font-display)' : 'var(--font-body)',
        color: bgImageUrl 
          ? '#ffffff'
          : isMarked 
            ? 'var(--text-primary)' 
            : isFree 
              ? 'var(--accent-amber)' 
              : isEmpty
                ? 'var(--text-muted)'
                : 'var(--text-primary)',
        textShadow: bgImageUrl
          ? '2px 2px 4px rgba(0,0,0,0.95), -2px -2px 4px rgba(0,0,0,0.95), 2px -2px 4px rgba(0,0,0,0.95), -2px 2px 4px rgba(0,0,0,0.95)'
          : isMarked 
            ? `0 0 8px ${displayColor}66` 
            : 'none',
        zIndex: 1,
        wordBreak: 'break-word',
        hyphens: 'auto'
      }}>
        {displayContent}
      </span>
    </motion.div>
  );
}
