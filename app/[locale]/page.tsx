'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { getAllLocalCards, deleteLocalCard } from '@/lib/idb';

interface BingoCard {
  id: string;
  title: string;
  event_name: string | null;
  theme_color: string;
  grid_size: number;
  free_space: boolean;
  is_public: boolean;
  allow_community: boolean;
  edit_token: string;
  share_token: string;
  expires_at: string | null;
  created_at: string;
}

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const tc = useTranslations('common');
  const locale = useLocale();
  const [cards, setCards] = useState<BingoCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCards() {
      try {
        const localCards = await getAllLocalCards();
        setCards(localCards);
      } catch (err) {
        // Safe fail-safe
      } finally {
        setLoading(false);
      }
    }
    loadCards();
  }, []);

  const handleDelete = async (editToken: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(tc('delete') + '?')) return;

    try {
      await deleteLocalCard(editToken);
      setCards(cards.filter(c => c.edit_token !== editToken));
    } catch {
      // Safe fail-safe
    }
  };

  const getDaysRemaining = (expiryStr: string | null) => {
    if (!expiryStr) return null;
    const expiry = new Date(expiryStr);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <>
      <Navbar />
      <main style={{
        minHeight: '100vh',
        padding: '120px 24px 60px 24px',
        maxWidth: '1200px',
        margin: '0 auto',
        position: 'relative'
      }}>
        {/* Hero title block with spring load reveal */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 50, damping: 20 }}
          style={{ textAlign: 'center', marginBottom: '60px' }}
        >
          <span style={{
            fontSize: '0.8rem',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            fontWeight: 700,
            background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-violet))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'inline-block',
            marginBottom: '12px'
          }}>
            {tc('title')}
          </span>
          <h1 className="glow-text" style={{ fontSize: '3rem', marginBottom: '16px' }}>
            {t('title')}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
            {tc('subtitle')}
          </p>
        </motion.div>

        {/* Loading skeleton */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
            <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>{tc('loading')}</span>
          </div>
        ) : cards.length === 0 ? (
          /* Empty state */
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="double-bezel-outer"
            style={{ maxWidth: '600px', margin: '0 auto' }}
          >
            <div className="double-bezel-inner" style={{ textAlign: 'center', padding: '48px 32px' }}>
              <span style={{ fontSize: '4rem', display: 'block', marginBottom: '24px' }}>🃏</span>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '32px' }}>
                {t('empty')}
              </p>
              <Link href={`/${locale}/create`} style={{ textDecoration: 'none' }}>
                <button className="interactive-pill interactive-pill-primary">
                  <span>➕</span>
                  <span>{t('createBtn')}</span>
                </button>
              </Link>
            </div>
          </motion.div>
        ) : (
          /* Bento Cards Grid */
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '24px',
            alignItems: 'stretch'
          }}>
            {cards.map((card, idx) => {
              const daysLeft = getDaysRemaining(card.expires_at);
              const isExpired = daysLeft !== null && daysLeft <= 0;

              return (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05, type: 'spring', stiffness: 80 }}
                >
                  <Link href={`/${locale}/card/${card.edit_token}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="double-bezel-outer" style={{ height: '100%' }}>
                      <div className="double-bezel-inner" style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        minHeight: '220px',
                        borderLeft: `4px solid ${card.theme_color || 'var(--accent-cyan)'}`
                      }}>
                        <div>
                          {/* Event Tag */}
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '12px'
                          }}>
                            <span style={{
                              fontFamily: 'var(--font-display)',
                              fontSize: '0.85rem',
                              fontWeight: 700,
                              color: 'var(--text-muted)',
                              textTransform: 'uppercase'
                            }}>
                              {card.event_name || 'EVENT'}
                            </span>
                            
                            {/* Expiry Badge */}
                            {card.expires_at && (
                              <span style={{
                                fontSize: '0.75rem',
                                padding: '3px 8px',
                                borderRadius: '100px',
                                background: isExpired ? 'rgba(239, 68, 68, 0.15)' : 'rgba(251, 191, 36, 0.15)',
                                color: isExpired ? '#ef4444' : '#fbbf24',
                                fontWeight: 600
                              }}>
                                {isExpired ? tc('expired') : tc('expiresIn', { days: daysLeft })}
                              </span>
                            )}
                          </div>

                          {/* Card Title */}
                          <h3 style={{
                            fontSize: '1.5rem',
                            marginBottom: '16px',
                            color: 'var(--text-primary)',
                            lineHeight: '1.2'
                          }}>
                            {card.title}
                          </h3>
                        </div>

                        {/* Card metadata / actions */}
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginTop: '24px',
                          borderTop: '1px solid var(--border-light)',
                          paddingTop: '16px'
                        }}>
                          <span style={{
                            fontSize: '0.85rem',
                            color: 'var(--text-muted)',
                            fontWeight: 500
                          }}>
                            📏 {card.grid_size}x{card.grid_size} {card.free_space ? '• ⭐️' : ''}
                          </span>
                          
                          <motion.button
                            whileHover={{ scale: 1.1, color: '#ef4444' }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => handleDelete(card.edit_token, e)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--text-muted)',
                              cursor: 'pointer',
                              fontSize: '0.9rem',
                              padding: '4px'
                            }}
                          >
                            🗑️
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
