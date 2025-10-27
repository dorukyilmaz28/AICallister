"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { User, LogOut, MessageSquare, Settings, Calendar, Bot } from "lucide-react";

interface Conversation {
  id: string;
  title: string;
  context: string;
  createdAt: string;
  messageCount: number;
}

export default function Profile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (session) {
      fetchConversations();
    }
  }, [session, status, router]);

  const fetchConversations = async () => {
    try {
      const response = await fetch("/api/conversations");
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getContextLabel = (context: string) => {
    const labels = {
      general: "Genel FRC",
      strategy: "Strateji",
      mechanical: "Mekanik",
      simulation: "Simülasyon",
    };
    return labels[context as keyof typeof labels] || context;
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3A006F 0%, #5A008F 50%, #8A00FF 100%)' }}>
        <div className="text-white text-xl">Yükleniyor...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #3A006F 0%, #5A008F 50%, #8A00FF 100%)' }}>
      {/* Header */}
      <div className="border-b border-white/20 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src="/8f28b76859c1479d839d270409be3586.jpg"
              alt="Callister Logo"
              className="w-10 h-10 object-cover rounded-xl"
            />
            <h1 className="text-xl font-bold text-white">
              Callister FRC AI
            </h1>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              href="/chat"
              className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 border border-white/30 rounded-lg text-white transition-colors duration-200"
            >
              <Bot className="w-4 h-4" />
              <span>AI Sohbet</span>
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-white transition-colors duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span>Çıkış Yap</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/20">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{session.user?.name}</h2>
                <p className="text-white/70">{session.user?.email}</p>
                <p className="text-white/50 text-sm">
                  {conversations.length} konuşma
                </p>
              </div>
            </div>
          </div>

          {/* Conversations */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Konuşma Geçmişi</h3>
              <Link
                href="/chat"
                className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 border border-white/30 rounded-lg text-white transition-colors duration-200"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Yeni Sohbet</span>
              </Link>
            </div>

            {conversations.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 text-white/30 mx-auto mb-4" />
                <p className="text-white/70 text-lg mb-4">Henüz konuşmanız yok</p>
                <p className="text-white/50 mb-6">AI asistanı ile ilk sohbetinizi başlatın!</p>
                <Link
                  href="/chat"
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-white/20 hover:bg-white/30 border border-white/30 rounded-lg text-white transition-colors duration-200"
                >
                  <Bot className="w-5 h-5" />
                  <span>Sohbet Başlat</span>
                </Link>
              </div>
            ) : (
              <div className="grid gap-4">
                {conversations.map((conversation) => (
                  <Link
                    key={conversation.id}
                    href={`/conversations/${conversation.id}`}
                    className="block p-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-colors duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-white font-medium mb-1">
                          {conversation.title || "Başlıksız Konuşma"}
                        </h4>
                        <div className="flex items-center space-x-4 text-sm text-white/60">
                          <span className="flex items-center space-x-1">
                            <Settings className="w-3 h-3" />
                            <span>{getContextLabel(conversation.context)}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <MessageSquare className="w-3 h-3" />
                            <span>{conversation.messageCount} mesaj</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(conversation.createdAt)}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
