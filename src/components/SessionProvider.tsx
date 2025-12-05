"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

function AutoJoinEffect() {
  const { data: session, status } = useSession();
  const attemptedRef = useRef(false);

  useEffect(() => {
    if (status !== "authenticated") return;
    if (attemptedRef.current) return;

    const user = session?.user as any;

    // If user has a teamNumber but no bound teamId, send a join request automatically
    if (user?.teamNumber && !user?.teamId) {
      attemptedRef.current = true;
      fetch("/api/teams/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamNumber: user.teamNumber }),
      }).catch(() => {
        // ignore errors; user can still join manually
      });
    }
  }, [session, status]);

  return null;
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthSessionProvider>
      <AutoJoinEffect />
      {children}
    </NextAuthSessionProvider>
  );
}
