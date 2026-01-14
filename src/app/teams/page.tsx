"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { User, LogOut, Users, Bot, ArrowLeft, Settings, MessageSquare, Search, Home, Languages } from "lucide-react";
import Loading from "@/components/Loading";
import { useLanguage } from "@/contexts/LanguageContext";

interface Team {
  id: string;
  name: string;
  description?: string;
  teamNumber?: string;
  createdAt: string;
  updatedAt: string;
  members: Array<{
    id: string;
    role: string;
    joinedAt: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  }>;
  _count: {
    members: number;
    chats: number;
  };
}

export default function TeamsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [joinRequestMessage, setJoinRequestMessage] = useState("");
  const [showJoinForm, setShowJoinForm] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (session) {
      fetchTeams();
    }
  }, [session, status, router]);

  const fetchTeams = async () => {
    try {
      const response = await fetch("/api/teams");
      if (response.ok) {
        const data = await response.json();
        setTeams(data.teams);
      } else {
        setError("Takımlar yüklenirken hata oluştu.");
      }
    } catch (error) {
      console.error("Error fetching teams:", error);
      setError("Takımlar yüklenirken hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const handleJoinRequest = async (teamId: string) => {
    if (!joinRequestMessage.trim()) {
      setError("Lütfen katılım mesajınızı yazın.");
      return;
    }

    try {
      const response = await fetch(`/api/teams/${teamId}/join-requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: joinRequestMessage.trim(),
        }),
      });

      if (response.ok) {
        setJoinRequestMessage("");
        setShowJoinForm(null);
        setError("");
        alert("Katılım isteğiniz gönderildi!");
      } else {
        const errorData = await response.json();
        setError(errorData.error || "İstek gönderilirken hata oluştu.");
      }
    } catch (error) {
      console.error("Error sending join request:", error);
      setError("İstek gönderilirken hata oluştu.");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 transition-colors">
        <Loading />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors">
      {/* Modern Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <div className="flex items-center space-x-4">
              <Link
                href="/profile"
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline text-sm font-medium">Profil</span>
              </Link>
              <div className="h-6 w-px bg-gray-200"></div>
              <div className="flex items-center space-x-3">
                <img
                  src="/8f28b76859c1479d839d270409be3586.jpg"
                  alt="Callister Logo"
                  className="w-12 h-12 lg:w-16 lg:h-16 object-cover rounded-xl"
                />
                <h1 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white">
                  Takımlarım
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setLanguage(language === "tr" ? "en" : "tr")}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-200 transition-colors"
                title={language === "tr" ? "Switch to English" : "Türkçe'ye Geç"}
              >
                <Languages className="w-4 h-4" />
                <span className="hidden sm:inline text-sm font-medium">{language.toUpperCase()}</span>
              </button>
              <Link
                href="/"
                className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-200 transition-colors"
                title="Ana Sayfa"
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline text-sm font-medium">Ana Sayfa</span>
              </Link>
              <Link
                href="/chat"
                className="flex items-center space-x-2 px-3 py-2 bg-blue-100 dark:bg-blue-900/40 hover:bg-blue-200 dark:hover:bg-blue-900/60 rounded-lg text-blue-600 dark:text-blue-300 transition-colors"
                title="AI Asistan"
              >
                <Bot className="w-4 h-4" />
                <span className="hidden sm:inline text-sm font-medium">AI Asistan</span>
              </Link>
              <Link
                href="/discover-teams"
                className="flex items-center space-x-2 px-3 py-2 bg-green-100 dark:bg-green-900/40 hover:bg-green-200 dark:hover:bg-green-900/60 rounded-lg text-green-600 dark:text-green-300 transition-colors"
                title="Takım Keşfet"
              >
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline text-sm font-medium">Takım Keşfet</span>
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 px-3 py-2 bg-red-100 dark:bg-red-900/40 hover:bg-red-200 dark:hover:bg-red-900/60 rounded-lg text-red-600 dark:text-red-300 transition-colors"
                title="Çıkış Yap"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline text-sm font-medium">Çıkış Yap</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="max-w-7xl mx-auto">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Teams List */}
          {teams.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Henüz hiç takımınız yok</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teams.map((team, index) => (
                <div
                  key={team.id}
                  className="group bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  style={{ 
                    animation: `fadeIn 0.5s ease-out ${index * 0.1}s both`
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    {team.teamNumber && (
                      <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-700 rounded-lg text-blue-700 dark:text-blue-300 text-xs font-bold">
                        #{team.teamNumber}
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{team.name}</h3>
                  
                  {team.description && (
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2 leading-relaxed">{team.description}</p>
                  )}
                  
                  <div className="flex items-center space-x-4 text-sm mb-4 pb-4 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Users className="w-3 h-3 text-blue-600" />
                      </div>
                      <span className="text-gray-600 dark:text-gray-300">{team._count.members} üye</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">
                        <MessageSquare className="w-3 h-3 text-purple-600" />
                      </div>
                      <span className="text-gray-600 dark:text-gray-300">{team._count.chats} mesaj</span>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                    Oluşturuldu: {formatDate(team.createdAt)}
                  </div>
                  
                  <div className="space-y-2">
                    <Link
                      href={`/teams/${team.id}`}
                      className="block w-full px-4 py-2.5 bg-gray-900 hover:bg-gray-800 rounded-xl text-white text-center font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      Takıma Git
                    </Link>
                    
                    {/* Katılım İsteği Butonu */}
                    <button
                      onClick={() => setShowJoinForm(team.id)}
                      className="w-full px-4 py-2.5 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-700 rounded-xl text-blue-600 dark:text-blue-300 hover:text-blue-700 dark:hover:text-blue-200 transition-colors duration-200 text-sm font-semibold"
                    >
                      Katılım İsteği Gönder
                    </button>
                    
                    {/* Katılım İsteği Formu */}
                    {showJoinForm === team.id && (
                      <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                        <textarea
                          value={joinRequestMessage}
                          onChange={(e) => setJoinRequestMessage(e.target.value)}
                          placeholder="Neden bu takıma katılmak istediğinizi açıklayın..."
                          className="w-full px-3 py-2 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm mb-3 resize-none"
                          rows={3}
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleJoinRequest(team.id)}
                            className="flex-1 px-3 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-white transition-colors duration-200 text-sm font-semibold"
                          >
                            Gönder
                          </button>
                          <button
                            onClick={() => {
                              setShowJoinForm(null);
                              setJoinRequestMessage("");
                            }}
                            className="flex-1 px-3 py-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-200 transition-colors duration-200 text-sm font-semibold"
                          >
                            İptal
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}      </style>
    </div>
  );
}
