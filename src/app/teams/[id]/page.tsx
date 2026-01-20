"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { User, LogOut, Users, Bot, ArrowLeft, Send, MessageSquare, Settings, Crown, Shield, Trash2, Trash, Info, Settings2, Bell, Languages } from "lucide-react";
import Loading from "@/components/Loading";
import { useLanguage } from "@/contexts/LanguageContext";

interface TeamMember {
  id: string;
  role: string;
  joinedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface TeamChat {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface Team {
  id: string;
  name: string;
  description?: string;
  teamNumber?: string;
  createdAt: string;
  updatedAt: string;
  members: TeamMember[];
  chats: TeamChat[];
  isMember?: boolean;
  pendingJoinRequest?: boolean;
}

export default function TeamDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { language, setLanguage, t } = useLanguage();
  const teamId = params.id as string;
  
  // Token-based auth
  const [user, setUser] = useState<any>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [userRole, setUserRole] = useState<string>("");
  const [messages, setMessages] = useState<TeamChat[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [showTeamInfo, setShowTeamInfo] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
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
        fetchTeam();
      }
    } catch (e) {
      router.push("/auth/signin");
    }
  }, [router, teamId]);
  
  const markAllNotificationsAsRead = async () => {
    try {
      const { api } = await import('@/lib/api');
      await api.patch(`/api/teams/${teamId}/notifications/`, { markAllAsRead: true });
      setUnreadCount(0);
    } catch (error) {
      // ignore
    }
  };

  const toggleNotifications = async () => {
    const willOpen = !showNotifications;
    setShowNotifications(willOpen);
    if (willOpen) {
      await fetchNotifications();
      await markAllNotificationsAsRead();
    }
  };

  // fetchTeam zaten yukarıdaki useEffect'te çağrılıyor

  // Auto-refresh mesajları ve takım bilgileri her 3 saniyede bir
  useEffect(() => {
    if (!teamId) return;

    const interval = setInterval(() => {
      fetchTeam(); // Takım bilgilerini ve üyeleri yenile
      fetchMessages();
      fetchNotifications();
    }, 3000);

    return () => clearInterval(interval);
  }, [teamId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchTeam = async () => {
    try {
      const { api } = await import('@/lib/api');
      const data = await api.get(`/api/teams/${teamId}/`);
      setTeam(data.team);
      setUserRole(data.userRole);
      // Chats array'ini kontrol et ve sırala
      const chats = data.team?.chats || [];
      const sortedChats = chats.sort((a: any, b: any) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      setMessages(sortedChats);
    } catch (error: any) {
      console.error("Error fetching team:", error);
      setError(error?.message || error?.error || "Takım yüklenirken hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || isSending) return;

    const messageContent = newMessage.trim();
    setNewMessage("");
    setIsSending(true);

    try {
      const { api } = await import('@/lib/api');
      const data = await api.post(`/api/teams/${teamId}/chat/`, {
        content: messageContent,
      });
      // Mesajı local state'e ekle ve sırala
      const newMessages = [...messages, data.message].sort((a: any, b: any) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      setMessages(newMessages);
      // Mesaj gönderildikten hemen sonra scroll et
      setTimeout(() => scrollToBottom(), 100);
    } catch (error: any) {
      console.error("Error sending message:", error);
      setError(error?.message || error?.error || "Mesaj gönderilirken hata oluştu.");
    } finally {
      setIsSending(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const { api } = await import('@/lib/api');
      const data = await api.get(`/api/teams/${teamId}/chat/`);
      // Mesajları tarihe göre sırala (en eski en üstte)
      const sortedMessages = (data.messages || []).sort((a: any, b: any) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      setMessages(sortedMessages);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const { api } = await import('@/lib/api');
      const data = await api.get(`/api/teams/${teamId}/notifications/`);
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const handleSignOut = async () => {
    // Token-based logout
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push("/");
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm(t("teamChat.deleteConfirm"))) {
      return;
    }

    try {
      const { api } = await import('@/lib/api');
      await api.delete(`/api/teams/${teamId}/chat/`, {
        messageId: messageId,
      });
      // Mesajı local state'den kaldır
      setMessages(messages.filter(msg => msg.id !== messageId));
    } catch (error: any) {
      console.error("Error deleting message:", error);
      setError(error?.message || error?.error || "Mesaj silinirken hata oluştu.");
    }
  };

  const handleClearAllMessages = async () => {
    if (!confirm(t("teamChat.deleteAllConfirm"))) {
      return;
    }

    try {
      const { api } = await import('@/lib/api');
      await api.delete(`/api/teams/${teamId}/chat/`, {
        clearAll: true,
      });
      // Tüm mesajları local state'den kaldır
      setMessages([]);
    } catch (error: any) {
      console.error("Error clearing all messages:", error);
      setError(error?.message || error?.error || t("teamChat.errorDeletingMessages"));
    }
  };

  const handleRemoveMember = async (userId: string, userName: string) => {
    if (!confirm(`${userName} ${t("teamChat.removeMemberConfirm")}`)) {
      return;
    }

    try {
      const { api } = await import('@/lib/api');
      const data = await api.delete(`/api/teams/${teamId}/members/${userId}/`);
      // Başarı mesajı göster
      alert(data.message || t("teamChat.memberRemoved"));
      // Takım bilgilerini yeniden yükle
      fetchTeam();
    } catch (error: any) {
      console.error("Error removing member:", error);
      setError(error?.message || error?.error || t("teamChat.errorRemovingMember"));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "captain":
      case "manager":
        return <Crown className="w-4 h-4 text-yellow-400" />;
      case "mentor":
        return <Shield className="w-4 h-4 text-blue-400" />;
      default:
        return <User className="w-4 h-4 text-white/60" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "captain":
      case "manager":
        return t("teamChat.role.admin");
      case "mentor":
        return t("teamChat.role.mentor");
      default:
        return t("teamChat.role.member");
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 transition-colors">
        <Loading />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 transition-colors">
        <div className="text-center">
          <div className="text-gray-900 dark:text-white text-xl mb-4">{error}</div>
          <Link
            href="/teams"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 border border-gray-900 rounded-lg text-white transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Takımlara Dön</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors">
      {/* Modern Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Left: Back + Team Info */}
            <div className="flex items-center space-x-4">
              <Link
                href="/teams"
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline text-sm font-medium">Takımlara Dön</span>
              </Link>
              <div className="h-6 w-px bg-gray-200 dark:bg-gray-700"></div>
              <div className="flex items-center space-x-3">
                <img
                  src="/8f28b76859c1479d839d270409be3586.jpg"
                  alt="Callister Logo"
                  className="w-12 h-12 lg:w-16 lg:h-16 object-cover rounded-xl"
                />
                <div>
                  <h1 className="text-lg font-bold text-gray-900 dark:text-white">{team?.name}</h1>
                  {team?.teamNumber && (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">#{team.teamNumber}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setLanguage(language === "tr" ? "en" : "tr")}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-200 transition-colors"
                title={language === "tr" ? "Switch to English" : "Türkçe'ye Geç"}
              >
                <Languages className="w-4 h-4" />
                <span className="hidden sm:inline text-sm font-medium">{language.toUpperCase()}</span>
              </button>
              <Link
                href="/chat"
                className="flex items-center space-x-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 rounded-lg text-white text-sm font-medium transition-colors"
              >
                <Bot className="w-4 h-4" />
                <span className="hidden sm:inline">{t("teamChat.aiChat")}</span>
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 px-4 py-2 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-700 rounded-lg text-red-600 dark:text-red-300 text-sm font-medium transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">{t("teamChat.signOut")}</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Pending approval banner */}
        {!team?.isMember && team?.pendingJoinRequest && (
          <div className="bg-yellow-50 border-b border-yellow-200 px-4 sm:px-6 lg:px-8 py-2">
            <div className="container mx-auto">
              <p className="text-yellow-800 text-sm font-medium">
                {t("teamChat.pendingRequest")}
              </p>
            </div>
          </div>
        )}
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Team Info Sidebar - Modern Design */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t("teamChat.teamInfo")}</h2>
              
              {team?.description && (
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 leading-relaxed">{team.description}</p>
              )}
              
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">{t("teamChat.members")}</p>
                    <p className="text-gray-900 dark:text-white font-semibold">{team?.members.length} {t("teamChat.person")}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">{t("teamChat.messages")}</p>
                    <p className="text-gray-900 dark:text-white font-semibold">{team?.chats.length} {t("teamChat.message")}</p>
                  </div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 pt-2">
                  {t("teamChat.created")} {team && formatDate(team.createdAt)}
                </div>
              </div>

              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t("teamChat.teamMembers")}</h3>
              <div className="space-y-2">
                {team?.members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors group"
                  >
                    <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {member.user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 dark:text-white text-sm font-medium truncate">
                        {member.user.name}
                      </p>
                      <div className="flex items-center space-x-1.5 mt-0.5">
                        {getRoleIcon(member.role)}
                        <span className="text-gray-500 dark:text-gray-400 text-xs">
                          {getRoleLabel(member.role)}
                        </span>
                      </div>
                    </div>
                    {/* Silme butonu - sadece yöneticilere görünür ve kendini silemez */}
                    {(userRole === 'captain' || userRole === 'manager' || userRole === 'mentor' || userRole === 'admin') && 
                     member.user.id !== user?.id && (
                      <button
                        onClick={() => handleRemoveMember(member.user.id, member.user.name)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-700 rounded-lg text-red-600 dark:text-red-300 hover:text-red-700 transition-all duration-200"
                        title={`${member.user.name} ${t("teamChat.removeUser")}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chat Area - Modern Design */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm h-[500px] md:h-[600px] lg:h-[700px] flex flex-col">
              {/* Chat Header */}
              <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 rounded-t-2xl gap-2">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate">{t("teamChat.title")}</h3>
                <div className="flex items-center space-x-1.5 sm:space-x-2 flex-shrink-0">
                  {/* Mobile Team Info Button */}
                  <button
                    onClick={() => setShowTeamInfo(!showTeamInfo)}
                    className="lg:hidden p-1.5 sm:p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-200 transition-colors"
                    title={t("teamChat.teamInfoTitle")}
                  >
                    <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                  {/* Admin Panel Button */}
                  {(userRole === 'captain' || userRole === 'manager' || userRole === 'mentor') && (
                    <Link
                      href={`/teams/${teamId}/admin`}
                      className="p-1.5 sm:p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-200 transition-colors"
                      title={t("teamChat.adminPanel")}
                    >
                      <Settings2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </Link>
                  )}
                  {/* Notification Button */}
                  <button
                    onClick={toggleNotifications}
                    className="relative p-1.5 sm:p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-200 transition-colors"
                    title={t("teamChat.notifications")}
                  >
                    <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-semibold">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                  {/* Delete All Messages Button */}
                  {messages.length > 0 && (
                    <button
                      onClick={handleClearAllMessages}
                      className="p-1.5 sm:p-2 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg text-red-600 dark:text-red-300 transition-colors"
                      title={t("teamChat.deleteAllMessages")}
                    >
                      <Trash className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  )}
                </div>
              </div>
              
              {/* Mobile Team Info Dropdown */}
              {showTeamInfo && (
                <div className="lg:hidden border-t border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-gray-900">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-bold text-gray-900 dark:text-white">{t("teamChat.teamInfo")}</h4>
                      <button
                        onClick={() => setShowTeamInfo(false)}
                        className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                    
                    {team?.description && (
                      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{team.description}</p>
                    )}
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <Users className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                        <div>
                          <p className="text-gray-500 dark:text-gray-400 text-xs">{t("teamChat.members")}</p>
                          <p className="text-gray-900 dark:text-white font-semibold text-sm">{team?.members.length}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <MessageSquare className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                        <div>
                          <p className="text-gray-500 dark:text-gray-400 text-xs">{t("teamChat.messages")}</p>
                          <p className="text-gray-900 dark:text-white font-semibold text-sm">{team?.chats.length}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-800">
                      {t("teamChat.created")} {team && formatDate(team.createdAt)}
                    </div>
                    
                    <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-800">
                      <h5 className="text-sm font-bold text-gray-900 dark:text-white mb-3">{t("teamChat.teamMembers")}</h5>
                      {team?.members.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between gap-3 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg"
                        >
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                              {member.user.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-gray-900 dark:text-white text-sm font-medium truncate">
                                {member.user.name}
                              </p>
                              <div className="flex items-center space-x-1.5 mt-0.5">
                                {getRoleIcon(member.role)}
                                <span className="text-gray-500 dark:text-gray-400 text-xs">
                                  {getRoleLabel(member.role)}
                                </span>
                              </div>
                            </div>
                          </div>
                          {/* Silme butonu - sadece yöneticilere görünür ve kendini silemez */}
                          {(userRole === 'captain' || userRole === 'manager' || userRole === 'mentor' || userRole === 'admin') && 
                           member.user.id !== user?.id && (
                            <button
                              onClick={() => handleRemoveMember(member.user.id, member.user.name)}
                              className="p-2 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-700 rounded-lg text-red-600 dark:text-red-300 hover:text-red-700 transition-colors flex-shrink-0"
                              title={`${member.user.name} ${t("teamChat.removeUser")}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Notification Dropdown (Mobile) */}
              {showNotifications && (
                <div className="lg:hidden border-t border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-gray-900">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-bold text-gray-900 dark:text-white">{t("teamChat.notifications")}</h4>
                      <button
                        onClick={() => setShowNotifications(false)}
                        className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                    
                    {notifications.length === 0 ? (
                      <div className="text-center py-8">
                        <Bell className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-600 dark:text-gray-300 text-sm">{t("teamChat.noNotifications")}</p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-3 rounded-lg border ${
                              notification.isRead 
                                ? 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700' 
                                : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h5 className="text-gray-900 dark:text-white text-sm font-medium mb-1">
                                  {notification.title}
                                </h5>
                                <p className="text-gray-600 dark:text-gray-300 text-xs mb-2">
                                  {notification.message}
                                </p>
                                <div className="text-gray-500 dark:text-gray-400 text-xs">
                                  {formatDate(notification.createdAt)}
                                </div>
                              </div>
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-gray-700 rounded-full ml-2 mt-1"></div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Notification Dropdown (Desktop) */}
              {showNotifications && (
                <div className="hidden lg:block relative">
                  <div className="absolute z-20 right-4 top-2 w-96 max-h-96 overflow-y-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-base font-bold text-gray-900 dark:text-white">{t("teamChat.notifications")}</h4>
                      <button
                        onClick={() => setShowNotifications(false)}
                        className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                    {notifications.length === 0 ? (
                      <div className="text-center py-8">
                        <Bell className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-600 dark:text-gray-300 text-sm">{t("teamChat.noNotifications")}</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-3 rounded-lg border ${
                              notification.isRead 
                                ? 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700' 
                                : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h5 className="text-gray-900 dark:text-white text-sm font-medium mb-1">
                                  {notification.title}
                                </h5>
                                <p className="text-gray-600 dark:text-gray-300 text-xs mb-2">
                                  {notification.message}
                                </p>
                                <div className="text-gray-500 dark:text-gray-400 text-xs">
                                  {formatDate(notification.createdAt)}
                                </div>
                              </div>
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-gray-700 rounded-full ml-2 mt-1"></div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-gray-50 dark:bg-gray-900 transition-colors">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">{t("teamChat.noMessages")}</p>
                    <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">{t("teamChat.sendFirstMessage")}</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.user.id === user?.id ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`flex items-start space-x-3 max-w-[75%] md:max-w-md ${
                          message.user.id === user?.id ? "flex-row-reverse space-x-reverse" : ""
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white font-semibold text-sm ${
                          message.user.id === user?.id 
                            ? "bg-gray-900" 
                            : "bg-gray-600"
                        }`}>
                          {message.user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col space-y-1">
                          <div className="text-xs text-gray-500 dark:text-gray-400 px-2">
                            {message.user.id === user?.id ? "Sen" : message.user.name}
                          </div>
                          <div
                            className={`px-4 py-2.5 rounded-2xl max-w-full transition-colors duration-200 group ${
                              message.user.id === user?.id
                                ? "bg-gray-900 text-white rounded-br-sm"
                                : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-sm shadow-sm"
                            }`}
                          >
                            <div className="text-sm whitespace-pre-wrap break-words">
                              {message.content}
                            </div>
                            <div className={`flex items-center justify-between mt-1.5 ${
                              message.user.id === user?.id ? "text-white/70" : "text-gray-400 dark:text-gray-500"
                            }`}>
                              <div className="text-xs">
                                {formatDate(message.createdAt)}
                              </div>
                              {/* Sadece kendi mesajlarını silebilir */}
                              {message.user.id === user?.id && (
                                <button
                                  onClick={() => handleDeleteMessage(message.id)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-white/20 rounded-full ml-2"
                                  title={t("teamChat.deleteMessage")}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="border-t border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-gray-900 rounded-b-2xl">
                <form onSubmit={handleSendMessage} className="flex space-x-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={t("teamChat.writeMessage")}
                    className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm transition-all"
                    disabled={isSending}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || isSending}
                    className="px-4 py-3 bg-gray-900 dark:bg-gray-800 hover:bg-gray-800 dark:hover:bg-gray-700 text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-md hover:shadow-lg disabled:shadow-none"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
