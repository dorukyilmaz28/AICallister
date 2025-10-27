"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AutoJoinTeam() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      // Kullanıcının takım numarasını al ve takımına yönlendir
      fetch(`/api/users/${session.user.id}/team`)
        .then(res => res.json())
        .then(data => {
          if (data.teamId) {
            router.push(`/teams/${data.teamId}`);
          } else {
            router.push("/profile");
          }
        })
        .catch(() => {
          router.push("/profile");
        });
    } else if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [session, status, router]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3A006F 0%, #5A008F 50%, #8A00FF 100%)' }}>
      <div className="text-white text-xl">Takımınıza yönlendiriliyorsunuz...</div>
    </div>
  );
}
