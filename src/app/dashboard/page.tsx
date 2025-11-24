"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import Link from "next/link";
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
} from "lucide-react";
import Loading from "@/components/Loading";

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
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && session) {
      fetchDashboardStats();
    }
  }, [isAuthenticated, session]);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch("/api/dashboard/stats");
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard
          </h1>
          <p className="text-gray-600">
            Hoş geldin, {session?.user?.name}! İşte aktivite özetin.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Conversations Card */}
          <Link
            href="/conversations"
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">
              Konuşmalar
            </h3>
            <p className="text-2xl font-bold text-gray-900">
              {stats.totalConversations}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {stats.totalMessages} mesaj
            </p>
          </Link>

          {/* Code Snippets Card */}
          <Link
            href="/code-snippets"
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Code className="h-6 w-6 text-purple-600" />
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">
              Kod Snippet'leri
            </h3>
            <p className="text-2xl font-bold text-gray-900">
              {stats.totalCodeSnippets}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {stats.favoriteSnippets} favori
            </p>
          </Link>

          {/* Team Card */}
          <Link
            href="/teams"
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              {stats.teamRole === "admin" && (
                <Award className="h-5 w-5 text-yellow-500" />
              )}
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Takım</h3>
            <p className="text-2xl font-bold text-gray-900">
              {stats.teamMembers}
            </p>
            <p className="text-xs text-gray-500 mt-2 capitalize">
              {stats.teamRole === "admin" ? "Yönetici" : "Üye"}
            </p>
          </Link>

          {/* Academy Card */}
          <Link
            href="/academy"
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">
              Academy
            </h3>
            <p className="text-2xl font-bold text-gray-900">-</p>
            <p className="text-xs text-gray-500 mt-2">Kurslara göz at</p>
          </Link>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Weekly Activity Chart */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
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
                      <span className="text-sm font-medium text-gray-700">
                        {new Date(day.date).toLocaleDateString("tr-TR", {
                          weekday: "short",
                        })}
                      </span>
                      <span className="text-sm text-gray-500">
                        {total} aktivite
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                      <span>{day.conversations} konuşma</span>
                      <span>{day.snippets} snippet</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Son Aktiviteler
              </h2>
              <Activity className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {stats.recentActivity.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Henüz aktivite yok
                </p>
              ) : (
                stats.recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg"
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
                      <p className="font-medium text-gray-900">
                        {activity.title}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
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
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Hızlı İşlemler
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/chat"
              className="flex flex-col items-center justify-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <MessageSquare className="h-6 w-6 text-purple-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">
                Yeni Sohbet
              </span>
            </Link>
            <Link
              href="/code-snippets/new"
              className="flex flex-col items-center justify-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Code className="h-6 w-6 text-blue-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">
                Kod Ekle
              </span>
            </Link>
            <Link
              href="/teams"
              className="flex flex-col items-center justify-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <Users className="h-6 w-6 text-green-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">
                Takımlar
              </span>
            </Link>
            <Link
              href="/academy"
              className="flex flex-col items-center justify-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <BookOpen className="h-6 w-6 text-orange-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">
                Academy
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

