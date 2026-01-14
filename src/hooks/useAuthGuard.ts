"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface UseAuthGuardOptions {
  requireAuth?: boolean;
  requireRole?: string;
  requireStatus?: string;
  redirectTo?: string;
}

export function useAuthGuard(options: UseAuthGuardOptions = {}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const {
    requireAuth = true,
    requireRole,
    requireStatus,
    redirectTo = "/auth/signin"
  } = options;

  useEffect(() => {
    if (status === "loading") return;

    if (requireAuth && !session) {
      router.push(redirectTo);
      return;
    }

    if (session?.user) {
      if (requireRole && session.user.role !== requireRole) {
        router.push("/");
        return;
      }

      if (requireStatus && session.user.status !== requireStatus) {
        if (session.user.status === "pending") {
          router.push("/auth/pending-approval");
          return;
        }
        router.push("/");
        return;
      }
    }
  }, [session, status, router, requireAuth, requireRole, requireStatus, redirectTo]);

  return {
    session,
    status,
    isLoading: status === "loading",
    isAuthenticated: !!session,
    hasRole: (role: string) => session?.user?.role === role,
    hasStatus: (status: string) => session?.user?.status === status,
  };
}
