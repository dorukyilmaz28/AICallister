"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  Users, 
  UserCheck, 
  UserX, 
  Crown, 
  Clock, 
  CheckCircle, 
  XCircle,
  Trash2,
  Shield,
  Home,
  Sparkles,
  Languages
} from "lucide-react";
import Link from "next/link";
import Loading from "@/components/Loading";
import { useLanguage } from "@/contexts/LanguageContext";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  joinedAt?: string;
  requestedAt?: string;
}

interface TeamInfo {
  team: {
    id: string;
    name: string;
    teamNumber: string;
    description: string;
    adminId: string;
  };
  currentUser: {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
  };
  approvedMembers: TeamMember[];
  pendingMembers: TeamMember[];
}

export default function TeamAdminPanel() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const [teamInfo, setTeamInfo] = useState<TeamInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    if (session.user.role !== "admin") {
      router.push("/");
      return;
    }

    fetchTeamInfo();
  }, [session, status, router]);

  const fetchTeamInfo = async () => {
    try {
      const response = await fetch("/api/teams/info");
      const data = await response.json();
      
      if (response.ok) {
        setTeamInfo(data);
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError(t("admin.errorFetchingTeam"));
    } finally {
      setLoading(false);
    }
  };

  const handleMemberAction = async (userId: string, action: string) => {
    setActionLoading(`${userId}-${action}`);
    setError("");

    try {
      const response = await fetch("/api/teams/manage-member", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, action }),
      });

      const data = await response.json();

      if (response.ok) {
        await fetchTeamInfo();
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError(t("admin.errorProcessing"));
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loading />
      </div>
    );
  }

  if (!teamInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-gray-900 dark:text-white text-xl">{t("admin.teamNotFound")}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <img
                src="/8f28b76859c1479d839d270409be3586.jpg"
                alt="Callister Logo"
                className="w-8 h-8 lg:w-10 lg:h-10 object-cover rounded-xl"
              />
              <div>
                <h1 className="text-base lg:text-lg font-bold text-gray-900 dark:text-white">
                  {t("admin.panel")}
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                  {t("admin.teamManagement")}
                </p>
              </div>
            </div>
            
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
                href="/"
                className="flex items-center space-x-2 px-4 py-2 bg-gray-900 dark:bg-gray-800 hover:bg-gray-800 dark:hover:bg-gray-700 rounded-lg text-white text-sm font-medium transition-colors"
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">{t("common.home")}</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-12 lg:py-16 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full mb-6 shadow-sm">
              <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("admin.dashboard")}</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              {t("admin.teamManagement")}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
              {teamInfo.team.name} #{teamInfo.team.teamNumber}
            </p>
            <div className="flex items-center space-x-6 text-gray-700 dark:text-gray-300">
              <div className="flex items-center space-x-2">
                <UserCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="font-semibold">{teamInfo.approvedMembers.length} {t("admin.approvedMembers")}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                <span className="font-semibold">{teamInfo.pendingMembers.length} {t("admin.pending")}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="max-w-5xl mx-auto">
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Pending Members */}
          {teamInfo.pendingMembers.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 lg:p-8 mb-8 border border-gray-200 dark:border-gray-800 shadow-sm">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{t("admin.pendingApproval")}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{teamInfo.pendingMembers.length} {t("admin.users")}</p>
                </div>
              </div>

              <div className="space-y-3">
                {teamInfo.pendingMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl hover:shadow-md transition-all"
                  >
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{member.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{member.email}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleMemberAction(member.id, "approve")}
                        disabled={actionLoading === `${member.id}-approve`}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 rounded-lg text-white text-sm font-medium transition-colors disabled:opacity-50 shadow-sm"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>{t("admin.approve")}</span>
                      </button>
                      <button
                        onClick={() => handleMemberAction(member.id, "reject")}
                        disabled={actionLoading === `${member.id}-reject`}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 rounded-lg text-white text-sm font-medium transition-colors disabled:opacity-50 shadow-sm"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>{t("admin.reject")}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Approved Members */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 lg:p-8 border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{t("admin.approvedMembers")}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{teamInfo.approvedMembers.length} {t("admin.activeMembers")}</p>
              </div>
            </div>

            <div className="space-y-3">
              {teamInfo.approvedMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white">{member.name}</h4>
                        {member.id === teamInfo.team.adminId && (
                          <Crown className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{member.email}</p>
                    </div>
                  </div>
                  {member.id !== teamInfo.team.adminId && (
                    <button
                      onClick={() => handleMemberAction(member.id, "remove")}
                      disabled={actionLoading === `${member.id}-remove`}
                      className="p-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 transition-colors disabled:opacity-50"
                      title={t("admin.removeMember")}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
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
      `}</style>
    </div>
  );
}
