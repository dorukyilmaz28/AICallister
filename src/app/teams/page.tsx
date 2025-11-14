"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { User, LogOut, Users, Plus, Bot, ArrowLeft, Settings, MessageSquare, Search, Home, Languages } from "lucide-react";
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
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [joinRequestMessage, setJoinRequestMessage] = useState("");
  const [showJoinForm, setShowJoinForm] = useState<string | null>(null);

  // Form state
  const [teamName, setTeamName] = useState("");
  const [teamDescription, setTeamDescription] = useState("");
  const [teamNumber, setTeamNumber] = useState("");

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

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!teamName.trim()) {
      setError("Takım adı gereklidir.");
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch("/api/teams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: teamName.trim(),
          description: teamDescription.trim() || undefined,
          teamNumber: teamNumber.trim() || undefined,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setTeams([data.team, ...teams]);
        setTeamName("");
        setTeamDescription("");
        setTeamNumber("");
        setShowCreateForm(false);
        setError("");
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Takım oluşturulurken hata oluştu.");
      }
    } catch (error) {
      console.error("Error creating team:", error);
      setError("Takım oluşturulurken hata oluştu.");
    } finally {
      setIsCreating(false);
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Modern Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <div className="flex items-center space-x-4">
              <Link
                href="/profile"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
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
                <h1 className="text-lg lg:text-xl font-bold text-gray-900">
                  Takımlarım
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setLanguage(language === "tr" ? "en" : "tr")}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors"
                title={language === "tr" ? "Switch to English" : "Türkçe'ye Geç"}
              >
                <Languages className="w-4 h-4" />
                <span className="hidden sm:inline text-sm font-medium">{language.toUpperCase()}</span>
              </button>
              <Link
                href="/"
                className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors"
                title="Ana Sayfa"
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline text-sm font-medium">Ana Sayfa</span>
              </Link>
              <Link
                href="/chat"
                className="flex items-center space-x-2 px-3 py-2 bg-blue-100 hover:bg-blue-200 rounded-lg text-blue-600 transition-colors"
                title="AI Asistan"
              >
                <Bot className="w-4 h-4" />
                <span className="hidden sm:inline text-sm font-medium">AI Asistan</span>
              </Link>
              <button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center space-x-2 px-3 py-2 bg-purple-100 hover:bg-purple-200 rounded-lg text-purple-600 transition-colors"
                title="Takım Oluştur"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline text-sm font-medium">Takım Oluştur</span>
              </button>
              <Link
                href="/discover-teams"
                className="flex items-center space-x-2 px-3 py-2 bg-green-100 hover:bg-green-200 rounded-lg text-green-600 transition-colors"
                title="Takım Keşfet"
              >
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline text-sm font-medium">Takım Keşfet</span>
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 px-3 py-2 bg-red-100 hover:bg-red-200 rounded-lg text-red-600 transition-colors"
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
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Create Team Form */}
          {showCreateForm && (
            <div className="bg-white rounded-2xl p-6 md:p-8 mb-8 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Yeni Takım Oluştur</h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleCreateTeam} className="space-y-5">
                <div>
                  <label className="block text-gray-900 text-sm font-semibold mb-2">
                    Takım Adı *
                  </label>
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Örn: Callister Robotics"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-900 text-sm font-semibold mb-2">
                    Takım Numarası
                  </label>
                  <input
                    type="text"
                    value={teamNumber}
                    onChange={(e) => setTeamNumber(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Örn: 9024"
                  />
                </div>
                <div>
                  <label className="block text-gray-900 text-sm font-semibold mb-2">
                    Açıklama
                  </label>
                  <textarea
                    value={teamDescription}
                    onChange={(e) => setTeamDescription(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                    placeholder="Takımınız hakkında kısa bir açıklama..."
                    rows={3}
                  />
                </div>
                <div className="flex items-center space-x-3 pt-2">
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="px-6 py-3 bg-gradient-to-br from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                  >
                    {isCreating ? "Oluşturuluyor..." : "Takım Oluştur"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-6 py-3 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-xl text-gray-700 font-semibold transition-colors"
                  >
                    İptal
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Teams List */}
          {teams.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Henüz hiç takımınız yok</h3>
              <p className="text-gray-600 mb-6">İlk takımınızı oluşturarak başlayın</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-6 py-3 bg-gradient-to-br from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
              >
                İlk Takımınızı Oluşturun
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teams.map((team, index) => (
                <div
                  key={team.id}
                  className="group bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  style={{ 
                    animation: `fadeIn 0.5s ease-out ${index * 0.1}s both`
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    {team.teamNumber && (
                      <span className="px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-xs font-bold">
                        #{team.teamNumber}
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{team.name}</h3>
                  
                  {team.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">{team.description}</p>
                  )}
                  
                  <div className="flex items-center space-x-4 text-sm mb-4 pb-4 border-b border-gray-100">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Users className="w-3 h-3 text-blue-600" />
                      </div>
                      <span className="text-gray-600">{team._count.members} üye</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">
                        <MessageSquare className="w-3 h-3 text-purple-600" />
                      </div>
                      <span className="text-gray-600">{team._count.chats} mesaj</span>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 mb-4">
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
                      className="w-full px-4 py-2.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-blue-600 hover:text-blue-700 transition-colors duration-200 text-sm font-semibold"
                    >
                      Katılım İsteği Gönder
                    </button>
                    
                    {/* Katılım İsteği Formu */}
                    {showJoinForm === team.id && (
                      <div className="mt-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <textarea
                          value={joinRequestMessage}
                          onChange={(e) => setJoinRequestMessage(e.target.value)}
                          placeholder="Neden bu takıma katılmak istediğinizi açıklayın..."
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm mb-3 resize-none"
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
                            className="flex-1 px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 transition-colors duration-200 text-sm font-semibold"
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
