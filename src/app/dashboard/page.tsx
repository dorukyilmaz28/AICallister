"use client";

import { useEffect, useState } from "react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MessageSquare,
  Code,
  Users,
  Trophy,
  TrendingUp,
  Clock,
  BookOpen,
  Award,
  Activity,
  BarChart3,
  Calendar,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import Loading from "@/components/Loading";
import { redirectToAcademy } from "@/lib/academy-api";

interface DashboardStats {
  totalConversations: number;
  totalMessages: number;
  totalCodeSnippets: number;
  favoriteSnippets: number;
  teamMembers: number;
  teamRole: string;
  recentActivity: Array<{
    type: string;
    title: string;
    date: string;
  }>;
  weeklyActivity: Array<{
    date: string;
    conversations: number;
    snippets: number;
  }>;
}

export default function DashboardPage() {
  const { session, isAuthenticated } = useAuthGuard({ requireAuth: true });
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && session) {
      fetchDashboardStats();
    }
  }, [isAuthenticated, session]);

  const fetchDashboardStats = async () => {
    try {
      const { api } = await import('@/lib/api');
      const data = await api.get("/api/dashboard/stats");
      setStats(data);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 transition-colors">
        <Loading />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Veriler yüklenemedi.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 transition-colors">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Geri Dön</span>
            </Link>
            <a
              href={redirectToAcademy("/html/main.html")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors text-sm"
            >
              <ExternalLink className="h-4 w-4" />
              <span>FRC Academy</span>
            </a>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Hoş geldin, {session?.user?.name}! İşte aktivite özetin.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Conversations Card */}
          <Link
            href="/conversations"
            className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-800"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
              Konuşmalar
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.totalConversations}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {stats.totalMessages} mesaj
            </p>
          </Link>

          {/* Code Snippets Card */}
          <Link
            href="/code-snippets"
            className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-800"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Code className="h-6 w-6 text-purple-600" />
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
              Kod Snippet'leri
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.totalCodeSnippets}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {stats.favoriteSnippets} favori
            </p>
          </Link>

          {/* Team Card */}
          <Link
            href="/teams"
            className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-800"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              {stats.teamRole === "admin" && (
                <Award className="h-5 w-5 text-yellow-500" />
              )}
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Takım</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.teamMembers}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 capitalize">
              {stats.teamRole === "admin" ? "Yönetici" : "Üye"}
            </p>
          </Link>

          {/* Academy Card */}
          <a
            href={redirectToAcademy("/html/main.html")}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-800"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-orange-600" />
              </div>
              <ExternalLink className="h-4 w-4 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
              Academy
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">FRC</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Yeni sekmede aç</p>
          </a>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Weekly Activity Chart */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Haftalık Aktivite
              </h2>
              <BarChart3 className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {stats.weeklyActivity.map((day, index) => {
                const maxValue = Math.max(
                  ...stats.weeklyActivity.map((d) => d.conversations + d.snippets)
                );
                const total = day.conversations + day.snippets;
                const percentage = maxValue > 0 ? (total / maxValue) * 100 : 0;

                return (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {new Date(day.date).toLocaleDateString("tr-TR", {
                          weekday: "short",
                        })}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {total} aktivite
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                      <span>{day.conversations} konuşma</span>
                      <span>{day.snippets} snippet</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Son Aktiviteler
              </h2>
              <Activity className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {stats.recentActivity.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  Henüz aktivite yok
                </p>
              ) : (
                stats.recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"
                  >
                    <div className="p-2 bg-purple-100 rounded-lg">
                      {activity.type === "conversation" && (
                        <MessageSquare className="h-4 w-4 text-purple-600" />
                      )}
                      {activity.type === "snippet" && (
                        <Code className="h-4 w-4 text-purple-600" />
                      )}
                      {activity.type === "team" && (
                        <Users className="h-4 w-4 text-purple-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {activity.title}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(activity.date).toLocaleDateString("tr-TR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Hızlı İşlemler
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/chat"
              className="flex flex-col items-center justify-center p-4 bg-purple-50 dark:bg-purple-900/40 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/60 transition-colors"
            >
              <MessageSquare className="h-6 w-6 text-purple-600 mb-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Yeni Sohbet
              </span>
            </Link>
            <Link
              href="/code-snippets/new"
              className="flex flex-col items-center justify-center p-4 bg-blue-50 dark:bg-blue-900/40 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors"
            >
              <Code className="h-6 w-6 text-blue-600 mb-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Kod Ekle
              </span>
            </Link>
            <Link
              href="/teams"
              className="flex flex-col items-center justify-center p-4 bg-green-50 dark:bg-green-900/40 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/60 transition-colors"
            >
              <Users className="h-6 w-6 text-green-600 mb-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Takımlar
              </span>
            </Link>
            <a
              href={redirectToAcademy("/html/main.html")}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-4 bg-orange-50 dark:bg-orange-900/40 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/60 transition-colors"
            >
              <BookOpen className="h-6 w-6 text-orange-600 mb-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Academy
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

