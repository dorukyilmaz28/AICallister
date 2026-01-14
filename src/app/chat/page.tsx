"use client";

import { FRCChat } from "@/components/FRCChat";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import Loading from "@/components/Loading";

export default function ChatPage() {
  const { isLoading } = useAuthGuard({ 
    requireAuth: true, 
    requireStatus: "approved" 
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 transition-colors">
        <Loading />
      </div>
    );
  }

  return <FRCChat />;
}
