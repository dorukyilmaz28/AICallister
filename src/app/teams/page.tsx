"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { User, LogOut, Users, Plus, Bot, ArrowLeft, Settings, MessageSquare, Search, Home } from "lucide-react";

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
            <Link
              href="/profile"
              className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Profile Dön</span>
            </Link>
            <div className="h-6 w-px bg-white/30"></div>
            <img
              src="/8f28b76859c1479d839d270409be3586.jpg"
              alt="Callister Logo"
              className="w-10 h-10 object-cover rounded-xl"
            />
            <h1 className="text-xl font-bold text-white">
              Takımlarım
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <Link
              href="/"
              className="flex items-center space-x-2 px-2 md:px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-white transition-colors duration-200"
            >
              <Home className="w-4 h-4" />
              <span className="hidden md:inline">Ana Sayfa</span>
            </Link>
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center space-x-2 px-2 md:px-4 py-2 bg-white/20 hover:bg-white/30 border border-white/30 rounded-lg text-white transition-colors duration-200"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden md:inline">Oluştur</span>
            </button>
            <Link
              href="/discover-teams"
              className="flex items-center space-x-2 px-2 md:px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-white transition-colors duration-200"
            >
              <Search className="w-4 h-4" />
              <span className="hidden md:inline">Keşfet</span>
            </Link>
            <Link
              href="/chat"
              className="flex items-center space-x-2 px-2 md:px-4 py-2 bg-white/20 hover:bg-white/30 border border-white/30 rounded-lg text-white transition-colors duration-200"
            >
              <Bot className="w-4 h-4" />
              <span className="hidden md:inline">AI</span>
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 px-2 md:px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-white transition-colors duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Çıkış</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-6">
              <p className="text-red-200">{error}</p>
            </div>
          )}

          {/* Create Team Form */}
          {showCreateForm && (
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/20">
              <h2 className="text-xl font-bold text-white mb-4">Yeni Takım Oluştur</h2>
              <form onSubmit={handleCreateTeam} className="space-y-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Takım Adı *
                  </label>
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                    placeholder="Örn: Callister Robotics"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Takım Numarası
                  </label>
                  <input
                    type="text"
                    value={teamNumber}
                    onChange={(e) => setTeamNumber(e.target.value)}
                    className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                    placeholder="Örn: 1234"
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Açıklama
                  </label>
                  <textarea
                    value={teamDescription}
                    onChange={(e) => setTeamDescription(e.target.value)}
                    className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                    placeholder="Takımınız hakkında kısa bir açıklama..."
                    rows={3}
                  />
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="px-6 py-2 bg-white/30 hover:bg-white/40 border border-white/40 rounded-lg text-white transition-colors duration-200 disabled:opacity-50"
                  >
                    {isCreating ? "Oluşturuluyor..." : "Takım Oluştur"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-6 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-white transition-colors duration-200"
                  >
                    İptal
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Teams List */}
          {teams.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-white/30 mx-auto mb-4" />
              <p className="text-white/70 text-lg mb-4">Henüz hiç takımınız yok</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-6 py-3 bg-white/20 hover:bg-white/30 border border-white/30 rounded-lg text-white transition-colors duration-200"
              >
                İlk Takımınızı Oluşturun
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teams.map((team) => (
                <div
                  key={team.id}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-colors duration-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">{team.name}</h3>
                    {team.teamNumber && (
                      <span className="px-2 py-1 bg-white/20 rounded text-white text-xs">
                        #{team.teamNumber}
                      </span>
                    )}
                  </div>
                  
                  {team.description && (
                    <p className="text-white/70 text-sm mb-4">{team.description}</p>
                  )}
                  
                  <div className="flex items-center space-x-4 text-sm text-white/60 mb-4">
                    <span className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{team._count.members} üye</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <MessageSquare className="w-4 h-4" />
                      <span>{team._count.chats} mesaj</span>
                    </span>
                  </div>
                  
                  <div className="text-xs text-white/50 mb-4">
                    Oluşturuldu: {formatDate(team.createdAt)}
                  </div>
                  
                  <div className="space-y-2">
                    <Link
                      href={`/teams/${team.id}`}
                      className="block w-full px-4 py-2 bg-white/20 hover:bg-white/30 border border-white/30 rounded-lg text-white text-center transition-colors duration-200"
                    >
                      Takıma Git
                    </Link>
                    
                    {/* Katılım İsteği Butonu */}
                    <button
                      onClick={() => setShowJoinForm(team.id)}
                      className="w-full px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-300 hover:text-blue-200 transition-colors duration-200 text-sm"
                    >
                      Katılım İsteği Gönder
                    </button>
                    
                    {/* Katılım İsteği Formu */}
                    {showJoinForm === team.id && (
                      <div className="mt-3 p-3 bg-white/10 rounded-lg border border-white/20">
                        <textarea
                          value={joinRequestMessage}
                          onChange={(e) => setJoinRequestMessage(e.target.value)}
                          placeholder="Neden bu takıma katılmak istediğinizi açıklayın..."
                          className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm mb-2"
                          rows={3}
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleJoinRequest(team.id)}
                            className="flex-1 px-3 py-1 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-green-300 hover:text-green-200 transition-colors duration-200 text-sm"
                          >
                            Gönder
                          </button>
                          <button
                            onClick={() => {
                              setShowJoinForm(null);
                              setJoinRequestMessage("");
                            }}
                            className="flex-1 px-3 py-1 bg-gray-500/20 hover:bg-gray-500/30 border border-gray-500/30 rounded-lg text-gray-300 hover:text-gray-200 transition-colors duration-200 text-sm"
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
    </div>
  );
}
