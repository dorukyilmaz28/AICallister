"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Users, CheckCircle, XCircle, Clock, User, Mail, MessageSquare, Bell, Home, Bot, Languages } from "lucide-react";
import Loading from "@/components/Loading";
import { useLanguage } from "@/contexts/LanguageContext";

interface JoinRequest {
  id: string;
  status: string;
  message?: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export default function AdminDashboard() {
  const router = useRouter();
  const params = useParams();
  const { language, setLanguage, t } = useLanguage();
  const teamId = params.id as string;
  
  // Token-based auth
  const [user, setUser] = useState<any>(null);
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<'requests' | 'notifications'>('notifications');
  
  // Token-based auth kontrolü
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
      router.push("/auth/signin");
      return;
    }
    
    try {
      const userData = JSON.parse(userStr);
      setUser(userData);
      if (teamId) {
        fetchRequests();
        fetchNotifications();
      }
    } catch (e) {
      router.push("/auth/signin");
    }
  }, [router, teamId]);

  // fetchData zaten yukarıdaki useEffect'te çağrılıyor

  const fetchRequests = async () => {
    try {
      const { api } = await import('@/lib/api');
      const data = await api.get(`/api/teams/${teamId}/join-requests/`);
      setRequests(data.requests || []);
    } catch (error: any) {
      console.error("Error fetching requests:", error);
      setError(error?.message || error?.error || t("admin.errorFetchingRequests"));
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const { api } = await import('@/lib/api');
      const data = await api.get(`/api/teams/${teamId}/notifications/`);
      setNotifications(data.notifications || []);
    } catch (error: any) {
      console.error("Error fetching notifications:", error);
      setError(error?.message || error?.error || t("admin.errorFetchingNotifications"));
    }
  };

  const handleNotificationAction = async (notificationId: string, action: 'approve' | 'reject') => {
    try {
      const notification = notifications.find(n => n.id === notificationId);
      if (!notification || !notification.user) return;

      if (action === 'approve') {
        // Kullanıcıyı takıma ekle
        const { api } = await import('@/lib/api');
        await api.post(`/api/teams/${teamId}/join-requests/`, {
          userId: notification.user.id,
          message: "Admin tarafından onaylandı"
        });

        // Bildirimi güncelle
        await api.patch(`/api/teams/${teamId}/notifications/`, {
          notificationId: notificationId,
          markAllAsRead: false
        });

        // Bildirimleri yeniden yükle
        await fetchNotifications();
      } else {
        // Bildirimi okundu olarak işaretle
        const { api } = await import('@/lib/api');
        await api.patch(`/api/teams/${teamId}/notifications/`, {
          notificationId: notificationId,
          markAllAsRead: false
        });

        await fetchNotifications();
      }
    } catch (error) {
      console.error("Error processing notification:", error);
      setError(t("admin.errorProcessing"));
    }
  };

  const handleRequestAction = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      setError("");
      const { api } = await import('@/lib/api');
      await api.patch(`/api/teams/${teamId}/join-requests/${requestId}/`, { action });
      // İstekleri yeniden yükle
      await fetchRequests();
      await fetchNotifications();
    } catch (error: any) {
      console.error("Error processing request:", error);
      setError(error?.message || error?.error || t("admin.errorProcessing"));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return t("admin.pending");
      case 'approved':
        return t("admin.approved");
      case 'rejected':
        return t("admin.rejected");
      default:
        return t("admin.unknown");
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              href={`/teams/${teamId}`}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t("admin.backToTeam")}</span>
            </Link>
            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700"></div>
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-gray-900 dark:text-white" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t("admin.panel")}</h1>
            </div>
          </div>
          <div className="flex items-center space-x-3">
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
              className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>{t("common.home")}</span>
            </Link>
            <Link
              href="/chat"
              className="flex items-center space-x-2 px-3 py-2 bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 border border-blue-500 dark:border-blue-600 rounded-lg text-white transition-colors"
              title={t("chat.title")}
            >
              <Bot className="w-4 h-4" />
              <span>{t("chat.title")}</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
              <div className="flex items-center space-x-3">
                <Clock className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{t("admin.pendingRequests")}</p>
                  <p className="text-gray-900 dark:text-white text-2xl font-bold">
                    {requests.filter(r => r.status === 'pending').length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{t("admin.approved")}</p>
                  <p className="text-gray-900 dark:text-white text-2xl font-bold">
                    {requests.filter(r => r.status === 'approved').length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
              <div className="flex items-center space-x-3">
                <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{t("admin.rejected")}</p>
                  <p className="text-gray-900 dark:text-white text-2xl font-bold">
                    {requests.filter(r => r.status === 'rejected').length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 mb-6 shadow-sm">
            <div className="flex border-b border-gray-200 dark:border-gray-800">
              <button
                onClick={() => setActiveTab('notifications')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors duration-200 ${
                  activeTab === 'notifications'
                    ? 'text-gray-900 dark:text-white border-b-2 border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Bell className="w-4 h-4" />
                  <span>{t("admin.notifications")}</span>
                  {notifications.filter(n => n.type === 'join_request').length > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {notifications.filter(n => n.type === 'join_request').length}
                    </span>
                  )}
                </div>
              </button>
              <button
                onClick={() => setActiveTab('requests')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors duration-200 ${
                  activeTab === 'requests'
                    ? 'text-gray-900 dark:text-white border-b-2 border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>{t("admin.joinRequests")}</span>
                  {requests.filter(r => r.status === 'pending').length > 0 && (
                    <span className="bg-yellow-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {requests.filter(r => r.status === 'pending').length}
                    </span>
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <p className="text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Content */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
            {activeTab === 'notifications' ? (
              <>
                <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t("admin.notifications")}</h2>
                </div>
                
                <div className="p-6">
                  {notifications.filter(n => n.type === 'join_request').length === 0 ? (
                    <div className="text-center py-12">
                      <Bell className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400 text-lg">{t("admin.noJoinNotifications")}</p>
                      <p className="text-gray-500 dark:text-gray-500 text-sm">{t("admin.newMembersWillAppear")}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {notifications.filter(n => n.type === 'join_request').map((notification) => (
                        <div
                          key={notification.id}
                          className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3 flex-1">
                              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-1">
                                  <h3 className="text-gray-900 dark:text-white font-medium">{notification.user?.name}</h3>
                                  <div className="flex items-center space-x-1">
                                    <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                                    <span className="text-gray-600 dark:text-gray-400 text-sm">{t("admin.pending")}</span>
                                  </div>
                                </div>
                                
                                <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 text-sm mb-2">
                                  <Mail className="w-3 h-3" />
                                  <span>{notification.user?.email}</span>
                                </div>
                                
                                <div className="flex items-start space-x-1 text-gray-700 dark:text-gray-300 text-sm">
                                  <MessageSquare className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                  <span>{notification.message}</span>
                                </div>
                                
                                <div className="text-gray-500 dark:text-gray-500 text-xs mt-2">
                                  {formatDate(notification.createdAt)}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 ml-4">
                              <button
                                onClick={() => handleNotificationAction(notification.id, 'approve')}
                                className="flex items-center space-x-1 px-3 py-1 bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-600 border border-green-600 dark:border-green-700 rounded-lg text-white transition-colors duration-200 text-sm"
                              >
                                <CheckCircle className="w-4 h-4" />
                                <span>{t("admin.approve")}</span>
                              </button>
                              
                              <button
                                onClick={() => handleNotificationAction(notification.id, 'reject')}
                                className="flex items-center space-x-1 px-3 py-1 bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-600 border border-red-600 dark:border-red-700 rounded-lg text-white transition-colors duration-200 text-sm"
                              >
                                <XCircle className="w-4 h-4" />
                                <span>{t("admin.reject")}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t("admin.joinRequests")}</h2>
                </div>
                
                <div className="p-6">
                  {requests.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400 text-lg">{t("admin.noJoinRequests")}</p>
                      <p className="text-gray-500 dark:text-gray-500 text-sm">{t("admin.requestsWillAppear")}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {requests.map((request) => (
                        <div
                          key={request.id}
                          className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div className="flex items-start space-x-3 flex-1 min-w-0">
                              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                                <User className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-1 flex-wrap">
                                  <h3 className="text-gray-900 dark:text-white font-medium break-words">{request.user.name}</h3>
                                  <div className="flex items-center space-x-1 flex-shrink-0">
                                    {getStatusIcon(request.status)}
                                    <span className="text-gray-600 dark:text-gray-400 text-sm">
                                      {getStatusText(request.status)}
                                    </span>
                                  </div>
                                </div>
                                
                                <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 text-sm mb-2">
                                  <Mail className="w-3 h-3 flex-shrink-0" />
                                  <span className="break-all">{request.user.email}</span>
                                </div>
                                
                                {request.message && (
                                  <div className="flex items-start space-x-1 text-gray-700 dark:text-gray-300 text-sm mb-2">
                                    <MessageSquare className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                    <span className="break-words">{request.message}</span>
                                  </div>
                                )}
                                
                                <div className="text-gray-500 dark:text-gray-500 text-xs mt-2">
                                  {formatDate(request.createdAt)}
                                </div>
                              </div>
                            </div>
                            
                            {request.status === 'pending' && (
                              <div className="flex items-center justify-end sm:justify-start space-x-2 flex-shrink-0">
                                <button
                                  onClick={() => handleRequestAction(request.id, 'approve')}
                                  className="flex items-center justify-center space-x-1 px-4 py-2 bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-600 border border-green-600 dark:border-green-700 rounded-lg text-white transition-colors duration-200 text-sm font-medium min-w-[100px]"
                                  title={t("admin.approve")}
                                >
                                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                                  <span>{t("admin.approve")}</span>
                                </button>
                                
                                <button
                                  onClick={() => handleRequestAction(request.id, 'reject')}
                                  className="flex items-center justify-center space-x-1 px-4 py-2 bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-600 border border-red-600 dark:border-red-700 rounded-lg text-white transition-colors duration-200 text-sm font-medium min-w-[100px]"
                                  title={t("admin.reject")}
                                >
                                  <XCircle className="w-4 h-4 flex-shrink-0" />
                                  <span>{t("admin.reject")}</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
