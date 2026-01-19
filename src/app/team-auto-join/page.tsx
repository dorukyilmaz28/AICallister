"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AutoJoinTeam() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
      router.push("/auth/signin");
      return;
    }

    try {
      const user = JSON.parse(userStr);
      if (user?.id) {
        // Kullanıcının takım numarasını al ve takımına yönlendir
        (async () => {
          try {
            const { api } = await import('@/lib/api');
            const data = await api.get(`/api/users/${user.id}/team`);
            if (data.teamId) {
              router.push(`/teams/${data.teamId}`);
            } else {
              router.push("/profile");
            }
          } catch {
            router.push("/profile");
          }
        })();
      } else {
        router.push("/auth/signin");
      }
    } catch {
      router.push("/auth/signin");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-gray-900 text-xl">Takımınıza yönlendiriliyorsunuz...</div>
    </div>
  );
}
