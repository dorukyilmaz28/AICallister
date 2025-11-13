"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { User, LogOut, MessageSquare, Settings, Calendar, Bot, Users, Search, Home, Code2, ArrowRight, ChevronRight } from "lucide-react";

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
  const [teamInfo, setTeamInfo] = useState<{ teamId: string; teamName: string; teamNumber?: string } | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (session) {
      fetchConversations();
      fetchTeamInfo();
    }
  }, [session, status, router]);

  useEffect(() => {
    if (session?.user?.status === "approved") {
      fetchTeamInfo();
    }
  }, [session?.user?.status]);

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

  const fetchTeamInfo = async () => {
    if (!session?.user?.id) return;
    try {
      const response = await fetch(`/api/users/${session.user.id}/team`);
      if (response.ok) {
        const data = await response.json();
        setTeamInfo({
          teamId: data.teamId,
          teamName: data.teamName,
          teamNumber: data.teamNumber
        });
      } else {
        setTeamInfo(null);
      }
    } catch (error) {
      setTeamInfo(null);
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-900 text-xl">Yükleniyor...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-3">
              <img
                src="/8f28b76859c1479d839d270409be3586.jpg"
                alt="Callister Logo"
                className="w-8 h-8 lg:w-10 lg:h-10 object-cover rounded-xl"
              />
              <h1 className="text-lg lg:text-xl font-bold text-gray-900">
                Callister AI
              </h1>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-2">
              <Link href="/" className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium">
                Ana Sayfa
              </Link>
              <Link href="/chat" className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium">
                Chat
              </Link>
              <Link href="/code-snippets" className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium">
                Snippets
              </Link>
              <Link href="/teams" className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium">
                Takımlar
              </Link>
              <button
                onClick={handleSignOut}
                className="ml-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 rounded-lg text-white text-sm font-medium transition-colors"
              >
                Çıkış Yap
              </button>
            </nav>

            {/* Mobile menu */}
            <div className="md:hidden flex items-center space-x-2">
              <Link href="/" className="p-2 hover:bg-gray-100 rounded-lg">
                <Home className="w-5 h-5 text-gray-600" />
              </Link>
              <button
                onClick={handleSignOut}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <LogOut className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Profile Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white rounded-2xl p-8 lg:p-10 mb-8 border border-gray-200 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <User className="w-10 h-10 lg:w-12 lg:h-12 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">{session.user?.name}</h2>
                  <p className="text-lg text-gray-600 mb-4">{session.user?.email}</p>
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="px-4 py-2 bg-gray-100 rounded-lg">
                      <span className="text-sm font-semibold text-gray-700">{conversations.length} Konuşma</span>
                    </div>
                    {teamInfo && (
                      <Link
                        href={`/teams/${teamInfo.teamId}`}
                        className="group flex items-center space-x-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        <Users className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-semibold text-blue-600">
                          {teamInfo.teamName} {teamInfo.teamNumber && `#${teamInfo.teamNumber}`}
                        </span>
                        <ChevronRight className="w-4 h-4 text-blue-600 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Link
              href="/chat"
              className="group bg-white hover:shadow-lg rounded-2xl p-6 border border-gray-200 transition-all duration-300"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">AI Sohbet</h3>
              <p className="text-sm text-gray-600">Yeni sohbet başlat</p>
            </Link>

            <Link
              href="/code-snippets"
              className="group bg-white hover:shadow-lg rounded-2xl p-6 border border-gray-200 transition-all duration-300"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Code2 className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Kod Snippets</h3>
              <p className="text-sm text-gray-600">Kod kütüphanesi</p>
            </Link>

            <Link
              href="/teams"
              className="group bg-white hover:shadow-lg rounded-2xl p-6 border border-gray-200 transition-all duration-300"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Takımlarım</h3>
              <p className="text-sm text-gray-600">Takım yönetimi</p>
            </Link>

            <Link
              href="/discover-teams"
              className="group bg-white hover:shadow-lg rounded-2xl p-6 border border-gray-200 transition-all duration-300"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Search className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Takım Keşfet</h3>
              <p className="text-sm text-gray-600">Yeni takımlar bul</p>
            </Link>
          </div>

          {/* Conversations */}
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Konuşma Geçmişi</h3>
              <Link
                href="/chat"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 rounded-lg text-white text-sm font-medium transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Yeni Sohbet</span>
              </Link>
            </div>

            {conversations.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <MessageSquare className="w-10 h-10 text-gray-400" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Henüz konuşmanız yok</h4>
                <p className="text-gray-600 mb-8">AI asistanı ile ilk sohbetinizi başlatın!</p>
                <Link
                  href="/chat"
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-gray-900 hover:bg-gray-800 rounded-lg text-white font-semibold transition-colors"
                >
                  <Bot className="w-5 h-5" />
                  <span>Sohbet Başlat</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {conversations.map((conversation) => (
                  <Link
                    key={conversation.id}
                    href={`/conversations/${conversation.id}`}
                    className="block p-6 bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 rounded-xl transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">
                          {conversation.title || "Başlıksız Konuşma"}
                        </h4>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center space-x-1">
                            <Settings className="w-4 h-4" />
                            <span>{getContextLabel(conversation.context)}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <MessageSquare className="w-4 h-4" />
                            <span>{conversation.messageCount} mesaj</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(conversation.createdAt)}</span>
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-6 h-6 text-gray-400 ml-4" />
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
