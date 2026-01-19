"use client";

import { useEffect, useRef } from "react";

function AutoJoinEffect() {
  const attemptedRef = useRef(false);

  useEffect(() => {
    // Token-based auto join (Capacitor/static export için)
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) return;
    if (attemptedRef.current) return;

    try {
      const user = JSON.parse(userStr);
      
      // If user has a teamNumber but no bound teamId, send a join request automatically
      if (user?.teamNumber && !user?.teamId) {
        attemptedRef.current = true;
        (async () => {
          try {
            const { api } = await import('@/lib/api');
            await api.post("/api/teams/join/", { teamNumber: user.teamNumber });
          } catch {
            // ignore errors; user can still join manually
          }
        })();
      }
    } catch {
      // ignore errors
    }
  }, []);

  return null;
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AutoJoinEffect />
      {children}
    </>
  );
}
