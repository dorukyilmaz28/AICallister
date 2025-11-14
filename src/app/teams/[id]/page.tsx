"use client";

import { useSession, signOut } from "next-auth/react";
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
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const { language, setLanguage } = useLanguage();
  const teamId = params.id as string;
  
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
  
  const markAllNotificationsAsRead = async () => {
    try {
      await fetch(`/api/teams/${teamId}/notifications`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllAsRead: true })
      });
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

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (session && teamId) {
      fetchTeam();
    }
  }, [session, status, router, teamId]);

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
      const response = await fetch(`/api/teams/${teamId}`);
      if (response.ok) {
        const data = await response.json();
        setTeam(data.team);
        setUserRole(data.userRole);
        // Chats array'ini kontrol et ve sırala
        const chats = data.team?.chats || [];
        const sortedChats = chats.sort((a: any, b: any) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        setMessages(sortedChats);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Takım bulunamadı.");
      }
    } catch (error) {
      console.error("Error fetching team:", error);
      setError("Takım yüklenirken hata oluştu.");
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
      const response = await fetch(`/api/teams/${teamId}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: messageContent,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Mesajı local state'e ekle ve sırala
        const newMessages = [...messages, data.message].sort((a: any, b: any) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        setMessages(newMessages);
        // Mesaj gönderildikten hemen sonra scroll et
        setTimeout(() => scrollToBottom(), 100);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Mesaj gönderilirken hata oluştu.");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Mesaj gönderilirken hata oluştu.");
    } finally {
      setIsSending(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/teams/${teamId}/chat`);
      if (response.ok) {
        const data = await response.json();
        // Mesajları tarihe göre sırala (en eski en üstte)
        const sortedMessages = (data.messages || []).sort((a: any, b: any) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        setMessages(sortedMessages);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`/api/teams/${teamId}/notifications`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm("Bu mesajı silmek istediğinizden emin misiniz?")) {
      return;
    }

    try {
      const response = await fetch(`/api/teams/${teamId}/chat`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messageId: messageId,
        }),
      });

      if (response.ok) {
        // Mesajı local state'den kaldır
        setMessages(messages.filter(msg => msg.id !== messageId));
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Mesaj silinirken hata oluştu.");
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      setError("Mesaj silinirken hata oluştu.");
    }
  };

  const handleClearAllMessages = async () => {
    if (!confirm("TÜM MESAJLARI silmek istediğinizden emin misiniz?\n\nBu işlem geri alınamaz!")) {
      return;
    }

    try {
      const response = await fetch(`/api/teams/${teamId}/chat`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clearAll: true,
        }),
      });

      if (response.ok) {
        // Tüm mesajları local state'den kaldır
        setMessages([]);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Mesajlar silinirken hata oluştu.");
      }
    } catch (error) {
      console.error("Error clearing all messages:", error);
      setError("Mesajlar silinirken hata oluştu.");
    }
  };

  const handleRemoveMember = async (userId: string, userName: string) => {
    if (!confirm(`${userName} kullanıcısını takımdan çıkarmak istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/teams/${teamId}/members/${userId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        const data = await response.json();
        // Başarı mesajı göster
        alert(data.message || "Üye başarıyla çıkarıldı.");
        // Takım bilgilerini yeniden yükle
        fetchTeam();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Üye çıkarılırken hata oluştu.");
      }
    } catch (error) {
      console.error("Error removing member:", error);
      setError("Üye çıkarılırken hata oluştu.");
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
        return "Yönetici";
      case "mentor":
        return "Mentor";
      default:
        return "Üye";
    }
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-white text-xl mb-4">{error}</div>
          <Link
            href="/teams"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 border border-white/30 rounded-lg text-white transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Takımlara Dön</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Modern Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Left: Back + Team Info */}
            <div className="flex items-center space-x-4">
              <Link
                href="/teams"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline text-sm font-medium">Takımlara Dön</span>
              </Link>
              <div className="h-6 w-px bg-gray-200"></div>
              <div className="flex items-center space-x-3">
                <img
                  src="/8f28b76859c1479d839d270409be3586.jpg"
                  alt="Callister Logo"
                  className="w-12 h-12 lg:w-16 lg:h-16 object-cover rounded-xl"
                />
                <div>
                  <h1 className="text-lg font-bold text-gray-900">{team?.name}</h1>
                  {team?.teamNumber && (
                    <p className="text-gray-500 text-sm">#{team.teamNumber}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setLanguage(language === "tr" ? "en" : "tr")}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors"
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
                <span className="hidden sm:inline">AI Sohbet</span>
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 px-4 py-2 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg text-red-600 text-sm font-medium transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Çıkış Yap</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Pending approval banner */}
        {!team?.isMember && team?.pendingJoinRequest && (
          <div className="bg-yellow-50 border-b border-yellow-200 px-4 sm:px-6 lg:px-8 py-2">
            <div className="container mx-auto">
              <p className="text-yellow-800 text-sm font-medium">
                Katılım isteğiniz gönderildi. Yönetici onayı bekleniyor.
              </p>
            </div>
          </div>
        )}
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Team Info Sidebar - Modern Design */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Takım Bilgileri</h2>
              
              {team?.description && (
                <p className="text-gray-600 text-sm mb-6 leading-relaxed">{team.description}</p>
              )}
              
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Üyeler</p>
                    <p className="text-gray-900 font-semibold">{team?.members.length} kişi</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Mesajlar</p>
                    <p className="text-gray-900 font-semibold">{team?.chats.length} mesaj</p>
                  </div>
                </div>
                <div className="text-xs text-gray-500 pt-2">
                  Oluşturuldu: {team && formatDate(team.createdAt)}
                </div>
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-4">Takım Üyeleri</h3>
              <div className="space-y-2">
                {team?.members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center space-x-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors group"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {member.user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 text-sm font-medium truncate">
                        {member.user.name}
                      </p>
                      <div className="flex items-center space-x-1.5 mt-0.5">
                        {getRoleIcon(member.role)}
                        <span className="text-gray-500 text-xs">
                          {getRoleLabel(member.role)}
                        </span>
                      </div>
                    </div>
                    {/* Silme butonu - sadece yöneticilere görünür ve kendini silemez */}
                    {(userRole === 'captain' || userRole === 'manager' || userRole === 'mentor' || userRole === 'admin') && 
                     member.user.id !== session?.user?.id && (
                      <button
                        onClick={() => handleRemoveMember(member.user.id, member.user.name)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg text-red-600 hover:text-red-700 transition-all duration-200"
                        title={`${member.user.name} kullanıcısını çıkar`}
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
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm h-[500px] md:h-[600px] lg:h-[700px] flex flex-col">
              {/* Chat Header */}
              <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 bg-gray-50 rounded-t-2xl">
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-bold text-gray-900">Takım Sohbeti</h3>
                  {/* Mobile Team Info Button */}
                  <button
                    onClick={() => setShowTeamInfo(!showTeamInfo)}
                    className="lg:hidden p-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 transition-colors"
                    title="Takım bilgileri"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                  {/* Admin Panel Button */}
                  {(userRole === 'captain' || userRole === 'manager' || userRole === 'mentor') && (
                    <Link
                      href={`/teams/${teamId}/admin`}
                      className="p-2 bg-purple-100 hover:bg-purple-200 rounded-lg text-purple-600 transition-colors"
                      title="Admin Paneli"
                    >
                      <Settings2 className="w-4 h-4" />
                    </Link>
                  )}
                  {/* Notification Button */}
                  <button
                    onClick={toggleNotifications}
                    className="relative p-2 bg-blue-100 hover:bg-blue-200 rounded-lg text-blue-600 transition-colors"
                    title="Bildirimler"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                </div>
                {messages.length > 0 && (
                  <button
                    onClick={handleClearAllMessages}
                    className="flex items-center space-x-2 px-3 py-2 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg text-red-600 hover:text-red-700 transition-colors text-sm font-medium"
                    title="Tüm mesajları sil"
                  >
                    <Trash className="w-4 h-4" />
                    <span className="hidden sm:inline">Tümünü Sil</span>
                    <span className="sm:hidden">Sil</span>
                  </button>
                )}
              </div>
              
              {/* Mobile Team Info Dropdown */}
              {showTeamInfo && (
                <div className="lg:hidden border-t border-gray-200 p-4 bg-white">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-bold text-gray-900">Takım Bilgileri</h4>
                      <button
                        onClick={() => setShowTeamInfo(false)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                    
                    {team?.description && (
                      <p className="text-gray-600 text-sm leading-relaxed">{team.description}</p>
                    )}
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded-lg">
                        <Users className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="text-gray-500 text-xs">Üyeler</p>
                          <p className="text-gray-900 font-semibold text-sm">{team?.members.length}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 p-2 bg-purple-50 rounded-lg">
                        <MessageSquare className="w-4 h-4 text-purple-600" />
                        <div>
                          <p className="text-gray-500 text-xs">Mesajlar</p>
                          <p className="text-gray-900 font-semibold text-sm">{team?.chats.length}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
                      Oluşturuldu: {team && formatDate(team.createdAt)}
                    </div>
                    
                    <div className="space-y-2 pt-2 border-t border-gray-200">
                      <h5 className="text-sm font-bold text-gray-900 mb-3">Takım Üyeleri</h5>
                      {team?.members.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg"
                        >
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                            {member.user.name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-900 text-sm font-medium truncate">
                              {member.user.name}
                            </p>
                            <div className="flex items-center space-x-1.5 mt-0.5">
                              {getRoleIcon(member.role)}
                              <span className="text-gray-500 text-xs">
                                {getRoleLabel(member.role)}
                              </span>
                            </div>
                          </div>
                          {/* Silme butonu - sadece yöneticilere görünür ve kendini silemez */}
                          {(userRole === 'captain' || userRole === 'manager' || userRole === 'mentor' || userRole === 'admin') && 
                           member.user.id !== session?.user?.id && (
                            <button
                              onClick={() => handleRemoveMember(member.user.id, member.user.name)}
                              className="p-1.5 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg text-red-600 hover:text-red-700 transition-colors"
                              title={`${member.user.name} kullanıcısını çıkar`}
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
                <div className="lg:hidden border-t border-gray-200 p-4 bg-white">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-bold text-gray-900">Bildirimler</h4>
                      <button
                        onClick={() => setShowNotifications(false)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                    
                    {notifications.length === 0 ? (
                      <div className="text-center py-8">
                        <Bell className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-600 text-sm">Henüz bildirim yok</p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-3 rounded-lg border ${
                              notification.isRead 
                                ? 'bg-gray-50 border-gray-200' 
                                : 'bg-blue-50 border-blue-200'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h5 className="text-gray-900 text-sm font-medium mb-1">
                                  {notification.title}
                                </h5>
                                <p className="text-gray-600 text-xs mb-2">
                                  {notification.message}
                                </p>
                                <div className="text-gray-500 text-xs">
                                  {formatDate(notification.createdAt)}
                                </div>
                              </div>
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1"></div>
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
                  <div className="absolute z-20 right-4 top-2 w-96 max-h-96 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-base font-bold text-gray-900">Bildirimler</h4>
                      <button
                        onClick={() => setShowNotifications(false)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                    {notifications.length === 0 ? (
                      <div className="text-center py-8">
                        <Bell className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-600 text-sm">Henüz bildirim yok</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-3 rounded-lg border ${
                              notification.isRead 
                                ? 'bg-gray-50 border-gray-200' 
                                : 'bg-blue-50 border-blue-200'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h5 className="text-gray-900 text-sm font-medium mb-1">
                                  {notification.title}
                                </h5>
                                <p className="text-gray-600 text-xs mb-2">
                                  {notification.message}
                                </p>
                                <div className="text-gray-500 text-xs">
                                  {formatDate(notification.createdAt)}
                                </div>
                              </div>
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1"></div>
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
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-gray-50">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg font-medium">Henüz mesaj yok</p>
                    <p className="text-gray-400 text-sm mt-1">İlk mesajı siz gönderin!</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.user.id === session.user?.id ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`flex items-start space-x-3 max-w-[75%] md:max-w-md ${
                          message.user.id === session.user?.id ? "flex-row-reverse space-x-reverse" : ""
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white font-semibold text-sm ${
                          message.user.id === session.user?.id 
                            ? "bg-gradient-to-br from-purple-500 to-blue-500" 
                            : "bg-gradient-to-br from-gray-400 to-gray-500"
                        }`}>
                          {message.user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col space-y-1">
                          <div className="text-xs text-gray-500 px-2">
                            {message.user.id === session.user?.id ? "Sen" : message.user.name}
                          </div>
                          <div
                            className={`px-4 py-2.5 rounded-2xl max-w-full transition-colors duration-200 group ${
                              message.user.id === session.user?.id
                                ? "bg-gradient-to-br from-purple-500 to-blue-500 text-white rounded-br-sm"
                                : "bg-white border border-gray-200 text-gray-900 rounded-bl-sm shadow-sm"
                            }`}
                          >
                            <div className="text-sm whitespace-pre-wrap break-words">
                              {message.content}
                            </div>
                            <div className={`flex items-center justify-between mt-1.5 ${
                              message.user.id === session.user?.id ? "text-white/70" : "text-gray-400"
                            }`}>
                              <div className="text-xs">
                                {formatDate(message.createdAt)}
                              </div>
                              {/* Sadece kendi mesajlarını silebilir */}
                              {message.user.id === session.user?.id && (
                                <button
                                  onClick={() => handleDeleteMessage(message.id)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-white/20 rounded-full ml-2"
                                  title="Mesajı sil"
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
              <div className="border-t border-gray-200 p-4 bg-white rounded-b-2xl">
                <form onSubmit={handleSendMessage} className="flex space-x-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Mesaj yazın..."
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm transition-all"
                    disabled={isSending}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || isSending}
                    className="px-4 py-3 bg-gradient-to-br from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-md hover:shadow-lg disabled:shadow-none"
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
