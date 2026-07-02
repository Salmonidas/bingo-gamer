'use client';

import { useState } from 'react';
import confetti from 'canvas-confetti';

declare global {
  interface Window {
    createLemonSqueezy: () => void;
    LemonSqueezy: {
      Setup: (options: { eventHandler?: (event: unknown) => void }) => void;
      Refresh: () => void;
      Url: { Open: (url: string) => void; Close: () => void; };
      Affiliate: { GetID: () => string | null; Build: (url: string) => string; };
    };
  }
}

export function useDonation() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleDonateChoice = (choice: 'lemonsqueezy' | 'github') => {
    if (isProcessing) return;
    setIsProcessing(true);

    const GITHUB_SPONSORS_URL = 'https://github.com/sponsors/Salmonidas';
    const CHECKOUT_URL = 'https://salmonidas.lemonsqueezy.com/checkout/buy/61c04df0-3855-4fff-87ca-fe084713823e';

    if (choice === 'lemonsqueezy') {
      if (typeof window !== 'undefined') {
        // JIT Initialization to avoid SSR/Script-load race conditions
        if (!window.LemonSqueezy && window.createLemonSqueezy) {
          window.createLemonSqueezy();
        }
        
        const ls = window.LemonSqueezy;
        if (ls) {
          ls.Setup({
            eventHandler: (event: any) => {
              if (event.event === 'Checkout.Success') {
                confetti({
                  particleCount: 150,
                  spread: 70,
                  origin: { y: 0.6 },
                  colors: ['#2dd4bf', '#fbbf24', '#f87171', '#818cf8']
                });
                setShowToast(true);
                setTimeout(() => setShowToast(false), 4000);
              }
            }
          });
          ls.Url.Open(CHECKOUT_URL);
          setTimeout(() => setIsProcessing(false), 500);
          return;
        }
      }
      
      // Safety Fallback if LemonSqueezy is blocked
      window.open(CHECKOUT_URL, '_blank', 'noopener,noreferrer');
      setTimeout(() => setIsProcessing(false), 500);
      
    } else if (choice === 'github') {
      window.open(GITHUB_SPONSORS_URL, '_blank', 'noopener,noreferrer');
      setTimeout(() => setIsProcessing(false), 500);
    }
  };

  return {
    isProcessing,
    handleDonateChoice,
    showToast
  };
}
