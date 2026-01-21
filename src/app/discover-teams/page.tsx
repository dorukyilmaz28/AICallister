"use client";

// Token-based auth for Capacitor (useSession removed)
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Users, Search, UserPlus, Clock, CheckCircle, Home, ArrowRight, Sparkles, Languages } from "lucide-react";
import Loading from "@/components/Loading";
import { useLanguage } from "@/contexts/LanguageContext";

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
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  
  const [teams, setTeams] = useState<Team[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sendingRequest, setSendingRequest] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
      router.push("/auth/signin");
      return;
    }

    fetchTeams();
  }, [router]);

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
      const { api } = await import('@/lib/api');
      const data = await api.get("/api/teams/discover/");
      // Tüm takımları göster (veritabanındaki tüm takımlar)
      const allTeams = data.teams || [];
      setTeams(allTeams);
      setFilteredTeams(allTeams);
    } catch (error: any) {
      console.error("Error fetching teams:", error);
      setError(t("discover.errorLoading"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRequest = async (teamId: string) => {
    try {
      setSendingRequest(teamId);
      setError("");

      const { api } = await import('@/lib/api');
      const data = await api.post(`/api/teams/${teamId}/`, {});

      alert(data.message || t("discover.joinSuccess"));
      await fetchTeams();
    } catch (error: any) {
      console.error("Error sending join request:", error);
      setError(error?.message || error?.error || t("discover.errorSending"));
    } finally {
      setSendingRequest(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-3">
              <img
                src="/8f28b76859c1479d839d270409be3586.jpg"
                alt="Callister Logo"
                className="w-12 h-12 lg:w-16 lg:h-16 object-cover rounded-xl"
              />
              <div>
                <h1 className="text-base lg:text-lg font-bold text-gray-900 dark:text-white">
                  {t("discover.title")}
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                  {t("discover.subtitle")}
                </p>
              </div>
            </Link>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setLanguage(language === "tr" ? "en" : "tr")}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300 transition-colors"
                title={language === "tr" ? "Switch to English" : "Türkçe'ye Geç"}
              >
                <Languages className="w-4 h-4" />
                <span className="hidden sm:inline text-sm font-medium">{language.toUpperCase()}</span>
              </button>
              <Link
                href="/profile"
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors text-sm font-medium"
              >
                {t("common.profile")}
              </Link>
              <Link
                href="/teams"
                className="px-4 py-2 bg-gray-900 dark:bg-gray-800 hover:bg-gray-800 dark:hover:bg-gray-700 rounded-lg text-white text-sm font-semibold transition-colors"
              >
                {t("common.teams")}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-12 lg:py-16 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full mb-6 shadow-sm">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">FRC Community</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              {t("discover.hero.title")}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              {t("discover.hero.subtitle")}
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("discover.search.placeholder")}
                className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Teams Grid */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm max-w-4xl mx-auto">
              {error}
            </div>
          )}

          {filteredTeams.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t("discover.noTeams")}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8">{t("discover.noTeamsDesc")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
              {filteredTeams.map((team, index) => (
                <div
                  key={team.id}
                  className="group bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  style={{ 
                    animation: `fadeIn 0.5s ease-out ${index * 0.1}s both`
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    {team.teamNumber && (
                      <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg text-blue-700 dark:text-blue-400 text-xs font-bold">
                        #{team.teamNumber}
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {team.name}
                  </h3>
                  
                  {team.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {team.description}
                    </p>
                  )}

                  <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-3">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {team.memberCount} {team.memberCount === 1 ? t("discover.member") : t("discover.members")}
                      </span>
                      {team.isMember && (
                        <span className="inline-flex items-center space-x-1 text-green-600 dark:text-green-400 text-sm font-semibold">
                          <CheckCircle className="w-4 h-4" />
                          <span>{t("discover.isMember")}</span>
                        </span>
                      )}
                      {team.hasPendingRequest && (
                        <span className="inline-flex items-center space-x-1 text-yellow-600 dark:text-yellow-400 text-sm font-semibold">
                          <Clock className="w-4 h-4" />
                          <span>{t("discover.pending")}</span>
                        </span>
                      )}
                    </div>

                    {/* Action Buttons - Vertical Stack */}
                    <div className="flex flex-col gap-3">
                      {team.isMember && (
                        <Link
                          href={`/teams/${team.id}`}
                          className="w-full flex items-center justify-center px-4 py-3.5 bg-gray-900 dark:bg-gray-800 hover:bg-gray-800 dark:hover:bg-gray-700 rounded-xl text-white text-base font-semibold transition-all shadow-sm hover:shadow-md"
                        >
                          <ArrowRight className="w-5 h-5 mr-2" />
                          <span>Takıma Git</span>
                        </Link>
                      )}
                      
                      {!team.isMember && !team.hasPendingRequest && (
                        <button
                          onClick={() => handleJoinRequest(team.id)}
                          disabled={sendingRequest === team.id}
                          className="w-full flex items-center justify-center px-4 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl text-white text-base font-semibold transition-all disabled:opacity-50 shadow-sm hover:shadow-md"
                        >
                          <UserPlus className="w-5 h-5 mr-2" />
                          <span>{sendingRequest === team.id ? t("discover.sending") : "Katılım İsteği Gönder"}</span>
                        </button>
                      )}
                    </div>
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
