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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-900 text-xl">Yükleniyor...</div>
      </div>
    );
  }

  return <FRCChat />;
}
