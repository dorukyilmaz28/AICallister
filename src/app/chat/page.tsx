"use client";

import { FRCChat } from "@/components/FRCChat";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export default function ChatPage() {
  const { isLoading } = useAuthGuard({ 
    requireAuth: true, 
    requireStatus: "approved" 
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3A006F 0%, #5A008F 50%, #8A00FF 100%)' }}>
        <div className="text-white text-xl">Yükleniyor...</div>
      </div>
    );
  }

  return <FRCChat />;
}
