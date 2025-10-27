"use client";

import { FRCChat } from "@/components/FRCChat";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3A006F 0%, #5A008F 50%, #8A00FF 100%)' }}>
        <div className="text-white text-xl">Yükleniyor...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return <FRCChat />;
}
