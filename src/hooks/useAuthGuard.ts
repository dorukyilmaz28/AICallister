"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface UseAuthGuardOptions {
  requireAuth?: boolean;
  requireRole?: string;
  requireStatus?: string;
  redirectTo?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  teamId?: string;
  teamNumber?: string;
}

// Token-based auth için session benzeri yapı
function getTokenBasedSession(): { user: User | null; isAuthenticated: boolean } | null {
  if (typeof window === 'undefined') return null;
  
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  if (!token || !userStr) {
    return { user: null, isAuthenticated: false };
  }
  
  try {
    const user = JSON.parse(userStr) as User;
    return { user, isAuthenticated: true };
  } catch (e) {
    return { user: null, isAuthenticated: false };
  }
}

export function useAuthGuard(options: UseAuthGuardOptions = {}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<{ user: User | null; isAuthenticated: boolean } | null>(null);

  const {
    requireAuth = true,
    requireRole,
    requireStatus,
    redirectTo = "/auth/signin"
  } = options;

  useEffect(() => {
    // Token-based session kontrolü
    const tokenSession = getTokenBasedSession();
    setSession(tokenSession);
    setLoading(false);

    // Loading tamamlandıktan sonra kontrol yap
    if (!tokenSession) {
      if (requireAuth) {
        router.push(redirectTo);
      }
      return;
    }

    if (requireAuth && !tokenSession.isAuthenticated) {
      router.push(redirectTo);
      return;
    }

    if (tokenSession.user) {
      if (requireRole && tokenSession.user.role !== requireRole) {
        router.push("/");
        return;
      }

      if (requireStatus && tokenSession.user.status !== requireStatus) {
        if (tokenSession.user.status === "pending") {
          router.push("/auth/pending-approval");
          return;
        }
        router.push("/");
        return;
      }
    }
  }, [router, requireAuth, requireRole, requireStatus, redirectTo]);

  return {
    session: session ? { user: session.user } : null,
    status: loading ? "loading" : (session?.isAuthenticated ? "authenticated" : "unauthenticated"),
    isLoading: loading,
    isAuthenticated: session?.isAuthenticated || false,
    hasRole: (role: string) => session?.user?.role === role,
    hasStatus: (status: string) => session?.user?.status === status,
  };
}
