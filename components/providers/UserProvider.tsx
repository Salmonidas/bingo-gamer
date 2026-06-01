'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type UserContextType = {
  userId: string;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    let id = localStorage.getItem('bg_anon_user_id');
    if (!id) {
      // Create cryptographically secure random UUID
      id = 'anon_' + crypto.randomUUID();
      localStorage.setItem('bg_anon_user_id', id);
    }
    setUserId(id);
    
    // Synchronize to cookie for Next.js Server Components
    document.cookie = `bg_anon_user_id=${id}; path=/; max-age=31536000; SameSite=Strict; Secure`;
  }, []);

  return (
    <UserContext.Provider value={{ userId }}>
      {/* Do not render children until client-side userId is loaded to prevent server hydration mismatch */}
      {userId ? children : (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#06080c',
          color: '#8899b8',
          fontFamily: 'sans-serif'
        }}>
          Loading Gaming Profile...
        </div>
      )}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}
