"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { User, LogOut, Users, Search, ArrowLeft, CheckCircle, Clock, UserPlus, Shield, Home } from "lucide-react";

interface Team {
  id: string;
  name: string;
  description?: string;
  teamNumber?: string;
  createdAt: string;
  memberCount: number;
  isMember: boolean;
  hasPendingRequest: boolean;
}

export default function DiscoverTeamsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [teams, setTeams] = useState<Team[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sendingRequest, setSendingRequest] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (session) {
      fetchTeams();
    }
  }, [session, status, router]);

  useEffect(() => {
    // Arama filtresi
    if (searchQuery.trim() === "") {
      setFilteredTeams(teams);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = teams.filter(
        (team) =>
          team.name.toLowerCase().includes(query) ||
          team.teamNumber?.toLowerCase().includes(query) ||
          team.description?.toLowerCase().includes(query)
      );
      setFilteredTeams(filtered);
    }
  }, [searchQuery, teams]);

  const fetchTeams = async () => {
    try {
      setError("");
      const response = await fetch("/api/teams/discover");
      if (response.ok) {
        const data = await response.json();
        setTeams(data.teams || []);
        setFilteredTeams(data.teams || []);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Takımlar yüklenirken hata oluştu.");
      }
    } catch (error) {
      console.error("Error fetching teams:", error);
      setError("Takımlar yüklenirken hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRequest = async (teamId: string) => {
    try {
      setSendingRequest(teamId);
      setError("");

      const response = await fetch(`/api/teams/${teamId}`, {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message || "Katılma isteğiniz gönderildi!");
        // Takımları yeniden yükle
        await fetchTeams();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "İstek gönderilirken hata oluştu.");
      }
    } catch (error) {
      console.error("Error sending join request:", error);
      setError("İstek gönderilirken hata oluştu.");
    } finally {
      setSendingRequest(null);
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
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <img
              src="/8f28b76859c1479d839d270409be3586.jpg"
              alt="Callister Logo"
              className="w-8 h-8 sm:w-10 sm:h-10 object-cover rounded-xl"
            />
            <h1 className="text-base sm:text-xl font-bold text-white truncate">
              Takım Keşfet
            </h1>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Link
              href="/"
              className="p-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-white transition-colors duration-200"
              title="Ana Sayfa"
            >
              <Home className="w-4 h-4" />
            </Link>
            <Link
              href="/teams"
              className="p-2 bg-white/20 hover:bg-white/30 border border-white/30 rounded-lg text-white transition-colors duration-200"
              title="Takımlarım"
            >
              <Users className="w-4 h-4" />
            </Link>
            <Link
              href="/profile"
              className="p-2 bg-white/20 hover:bg-white/30 border border-white/30 rounded-lg text-white transition-colors duration-200"
              title="Profil"
            >
              <User className="w-4 h-4" />
            </Link>
            <button
              onClick={handleSignOut}
              className="p-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-white transition-colors duration-200"
              title="Çıkış Yap"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Search Bar */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/20">
            <div className="flex items-center space-x-3 mb-4">
              <Search className="w-6 h-6 text-white" />
              <h2 className="text-2xl font-bold text-white">Takım Ara</h2>
            </div>
            <input
              type="text"
              placeholder="Takım adı, numara veya açıklama ile ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-6">
              <p className="text-red-300">{error}</p>
            </div>
          )}

          {/* Teams Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeams.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Users className="w-16 h-16 text-white/30 mx-auto mb-4" />
                <p className="text-white/70 text-lg mb-2">
                  {searchQuery ? "Arama sonucu bulunamadı" : "Henüz kayıtlı takım yok"}
                </p>
                <p className="text-white/50">
                  {searchQuery ? "Farklı bir arama deneyin" : "İlk takımı siz oluşturun!"}
                </p>
              </div>
            ) : (
              filteredTeams.map((team) => (
                <div
                  key={team.id}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-1">
                        {team.name}
                      </h3>
                      {team.teamNumber && (
                        <p className="text-white/60 text-sm">#{team.teamNumber}</p>
                      )}
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  {team.description && (
                    <p className="text-white/70 text-sm mb-4 line-clamp-2">
                      {team.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2 text-white/60 text-sm">
                      <Users className="w-4 h-4" />
                      <span>{team.memberCount} üye</span>
                    </div>
                    <div className="text-white/50 text-xs">
                      {formatDate(team.createdAt)}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    {team.isMember ? (
                      <Link
                        href={`/teams/${team.id}`}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg text-green-300 transition-colors duration-200"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Üyesiniz - Görüntüle</span>
                      </Link>
                    ) : team.hasPendingRequest ? (
                      <button
                        disabled
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-yellow-300 cursor-not-allowed"
                      >
                        <Clock className="w-4 h-4" />
                        <span>İstek Bekliyor</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleJoinRequest(team.id)}
                        disabled={sendingRequest === team.id}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-purple-300 hover:text-purple-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>
                          {sendingRequest === team.id ? "Gönderiliyor..." : "Katılma İsteği Gönder"}
                        </span>
                      </button>
                    )}
                    
                    <Link
                      href={`/teams/${team.id}`}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white/70 hover:text-white transition-colors duration-200"
                    >
                      <span>Detayları Gör</span>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

