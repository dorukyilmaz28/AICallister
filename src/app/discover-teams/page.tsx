"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Users, Search, UserPlus, Clock, CheckCircle, Home, ArrowRight, Sparkles } from "lucide-react";
import Loading from "@/components/Loading";

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

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading />
      </div>
    );
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
              <div>
                <h1 className="text-base lg:text-lg font-bold text-gray-900">
                  Takım Keşfet
                </h1>
                <p className="text-xs text-gray-500 hidden sm:block">
                  FRC Takımları
                </p>
              </div>
            </Link>
            
            <div className="flex items-center space-x-2">
              <Link
                href="/profile"
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
              >
                Profil
              </Link>
              <Link
                href="/teams"
                className="px-4 py-2 bg-gray-900 hover:bg-gray-800 rounded-lg text-white text-sm font-semibold transition-colors"
              >
                Takımlarım
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-12 lg:py-16 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white rounded-full mb-6 shadow-sm">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">FRC Community</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Takım Keşfet
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              FRC takımlarına katılın ve birlikte çalışın
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Takım ara (isim, numara veya açıklama)..."
                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Teams Grid */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm max-w-4xl mx-auto">
              {error}
            </div>
          )}

          {filteredTeams.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Takım bulunamadı</h3>
              <p className="text-gray-600 mb-8">Arama kriterlerinizi değiştirmeyi deneyin</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
              {filteredTeams.map((team, index) => (
                <div
                  key={team.id}
                  className="group bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  style={{ 
                    animation: `fadeIn 0.5s ease-out ${index * 0.1}s both`
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    {team.teamNumber && (
                      <span className="px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-xs font-bold">
                        #{team.teamNumber}
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {team.name}
                  </h3>
                  
                  {team.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {team.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-sm text-gray-600">
                      {team.memberCount} üye
                    </span>

                    {team.isMember ? (
                      <Link
                        href={`/teams/${team.id}`}
                        className="inline-flex items-center space-x-1 text-green-600 text-sm font-semibold"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Üyesin</span>
                      </Link>
                    ) : team.hasPendingRequest ? (
                      <span className="inline-flex items-center space-x-1 text-yellow-600 text-sm font-semibold">
                        <Clock className="w-4 h-4" />
                        <span>Beklemede</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleJoinRequest(team.id)}
                        disabled={sendingRequest === team.id}
                        className="inline-flex items-center space-x-1 px-4 py-2 bg-gray-900 hover:bg-gray-800 rounded-lg text-white text-sm font-semibold transition-all disabled:opacity-50 shadow-sm hover:shadow-md"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>{sendingRequest === team.id ? "Gönderiliyor..." : "Katıl"}</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

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
      `}</style>
    </div>
  );
}
