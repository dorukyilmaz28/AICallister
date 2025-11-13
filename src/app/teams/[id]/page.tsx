"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { User, LogOut, Users, Bot, ArrowLeft, Send, MessageSquare, Settings, Crown, Shield, Trash2, Trash, Info, Settings2, Bell } from "lucide-react";

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
      <div className="min-h-screen flex items-center justify-center" className="bg-gray-50">
        <div className="text-white text-xl">Yükleniyor...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" className="bg-gray-50">
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
    <div className="min-h-screen" className="bg-gray-50">
      {/* Header */}
      <div className="border-b border-white/20 p-3 md:p-4">
        <div className="container mx-auto">
          {/* Pending approval banner - Top level */}
          {!team?.isMember && team?.pendingJoinRequest && (
            <div className="mb-3 md:mb-4 bg-yellow-500/10 border border-yellow-500/30 text-yellow-200 px-3 py-2 rounded-lg">
              Katılım isteğiniz gönderildi. Yönetici onayı bekleniyor.
            </div>
          )}
          {/* Mobile Header */}
          <div className="flex items-center justify-between mb-3 md:hidden">
            <Link
              href="/teams"
              className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Geri</span>
            </Link>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSignOut}
                className="p-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-white transition-colors duration-200"
                title="Çıkış Yap"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden md:flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link
                href="/teams"
                className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Takımlara Dön</span>
              </Link>
              <div className="h-6 w-px bg-white/30"></div>
              <img
                src="/8f28b76859c1479d839d270409be3586.jpg"
                alt="Callister Logo"
                className="w-10 h-10 object-cover rounded-xl"
              />
              <div>
                <h1 className="text-xl font-bold text-white">{team?.name}</h1>
                {team?.teamNumber && (
                  <p className="text-white/60 text-sm">#{team.teamNumber}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                href="/chat"
                className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 border border-white/30 rounded-lg text-white transition-colors duration-200"
              >
                <Bot className="w-4 h-4" />
                <span>AI Sohbet</span>
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-white transition-colors duration-200"
              >
                <LogOut className="w-4 h-4" />
                <span>Çıkış Yap</span>
              </button>
            </div>
          </div>

          {/* Mobile Team Info */}
          <div className="md:hidden flex items-center space-x-3">
            <img
              src="/8f28b76859c1479d839d270409be3586.jpg"
              alt="Callister Logo"
              className="w-8 h-8 object-cover rounded-lg"
            />
            <div>
              <h1 className="text-lg font-bold text-white">{team?.name}</h1>
              {team?.teamNumber && (
                <p className="text-white/60 text-xs">#{team.teamNumber}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 md:px-4 py-4 md:py-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
          {/* Team Info Sidebar - Hidden on mobile */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-white/20 sticky top-4">
              <h2 className="text-lg font-bold text-white mb-4">Takım Bilgileri</h2>
              
              {team?.description && (
                <p className="text-white/70 text-sm mb-4">{team.description}</p>
              )}
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-2 text-sm text-white/60">
                  <Users className="w-4 h-4" />
                  <span>{team?.members.length} üye</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-white/60">
                  <MessageSquare className="w-4 h-4" />
                  <span>{team?.chats.length} mesaj</span>
                </div>
                <div className="text-xs text-white/50">
                  Oluşturuldu: {team && formatDate(team.createdAt)}
                </div>
              </div>

              <h3 className="text-md font-bold text-white mb-3">Takım Üyeleri</h3>
              <div className="space-y-2">
                {team?.members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center space-x-3 p-2 bg-white/10 rounded-lg"
                  >
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">
                        {member.user.name}
                      </p>
                      <div className="flex items-center space-x-1">
                        {getRoleIcon(member.role)}
                        <span className="text-white/60 text-xs">
                          {getRoleLabel(member.role)}
                        </span>
                      </div>
                    </div>
                    {/* Silme butonu - sadece yöneticilere görünür ve kendini silemez */}
                    {(userRole === 'captain' || userRole === 'manager' || userRole === 'mentor' || userRole === 'admin') && 
                     member.user.id !== session?.user?.id && (
                      <button
                        onClick={() => handleRemoveMember(member.user.id, member.user.name)}
                        className="p-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-300 hover:text-red-200 transition-colors duration-200"
                        title={`${member.user.name} kullanıcısını çıkar`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chat Area - Full width on mobile */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 h-[500px] md:h-[600px] flex flex-col">
              {/* Chat Header with Clear All Button */}
              <div className="flex items-center justify-between p-3 md:p-4 border-b border-white/20">
                <div className="flex items-center space-x-2">
                  <h3 className="text-base md:text-lg font-bold text-white">Takım Sohbeti</h3>
                  {/* Mobile Team Info Button */}
                  <button
                    onClick={() => setShowTeamInfo(!showTeamInfo)}
                    className="lg:hidden p-1 bg-white/20 hover:bg-white/30 border border-white/30 rounded-lg text-white transition-colors duration-200"
                    title="Takım bilgileri"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                  {/* Admin Panel Button */}
                  {(userRole === 'captain' || userRole === 'manager' || userRole === 'mentor') && (
                    <Link
                      href={`/teams/${teamId}/admin`}
                      className="p-1 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-purple-300 hover:text-purple-200 transition-colors duration-200"
                      title="Admin Paneli"
                    >
                      <Settings2 className="w-4 h-4" />
                    </Link>
                  )}
                  {/* Notification Button */}
                  <button
                  onClick={toggleNotifications}
                    className="relative p-1 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-300 hover:text-blue-200 transition-colors duration-200"
                    title="Bildirimler"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                </div>
                {messages.length > 0 && (
                  <button
                    onClick={handleClearAllMessages}
                    className="flex items-center space-x-1 md:space-x-2 px-2 md:px-3 py-1 md:py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-300 hover:text-red-200 transition-colors duration-200 text-xs md:text-sm"
                    title="Tüm mesajları sil"
                  >
                    <Trash className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="hidden sm:inline">Tümünü Sil</span>
                    <span className="sm:hidden">Sil</span>
                  </button>
                )}
              </div>
              
              {/* Mobile Team Info Dropdown */}
              {showTeamInfo && (
                <div className="lg:hidden border-t border-white/20 p-4 bg-white/5">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white">Takım Bilgileri</h4>
                      <button
                        onClick={() => setShowTeamInfo(false)}
                        className="text-white/60 hover:text-white"
                      >
                        ×
                      </button>
                    </div>
                    
                    {team?.description && (
                      <p className="text-white/70 text-xs">{team.description}</p>
                    )}
                    
                    <div className="grid grid-cols-2 gap-2 text-xs text-white/60">
                      <div className="flex items-center space-x-1">
                        <Users className="w-3 h-3" />
                        <span>{team?.members.length} üye</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageSquare className="w-3 h-3" />
                        <span>{team?.chats.length} mesaj</span>
                      </div>
                    </div>
                    
                    <div className="text-xs text-white/50">
                      Oluşturuldu: {team && formatDate(team.createdAt)}
                    </div>
                    
                    <div className="space-y-2">
                      <h5 className="text-xs font-bold text-white">Takım Üyeleri</h5>
                      {team?.members.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center space-x-2 p-2 bg-white/10 rounded-lg"
                        >
                          <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                            <User className="w-3 h-3 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-xs font-medium truncate">
                              {member.user.name}
                            </p>
                            <div className="flex items-center space-x-1">
                              {getRoleIcon(member.role)}
                              <span className="text-white/60 text-xs">
                                {getRoleLabel(member.role)}
                              </span>
                            </div>
                          </div>
                          {/* Silme butonu - sadece yöneticilere görünür ve kendini silemez */}
                          {(userRole === 'captain' || userRole === 'manager' || userRole === 'mentor' || userRole === 'admin') && 
                           member.user.id !== session?.user?.id && (
                            <button
                              onClick={() => handleRemoveMember(member.user.id, member.user.name)}
                              className="p-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-300 hover:text-red-200 transition-colors duration-200"
                              title={`${member.user.name} kullanıcısını çıkar`}
                            >
                              <Trash2 className="w-3 h-3" />
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
                <div className="lg:hidden border-t border-white/20 p-4 bg-white/5">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white">Bildirimler</h4>
                      <button
                        onClick={() => setShowNotifications(false)}
                        className="text-white/60 hover:text-white"
                      >
                        ×
                      </button>
                    </div>
                    
                    {notifications.length === 0 ? (
                      <div className="text-center py-8">
                        <Bell className="w-12 h-12 text-white/30 mx-auto mb-2" />
                        <p className="text-white/70 text-sm">Henüz bildirim yok</p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-3 rounded-lg border ${
                              notification.isRead 
                                ? 'bg-white/5 border-white/10' 
                                : 'bg-blue-500/10 border-blue-500/20'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h5 className="text-white text-sm font-medium mb-1">
                                  {notification.title}
                                </h5>
                                <p className="text-white/70 text-xs mb-2">
                                  {notification.message}
                                </p>
                                <div className="text-white/50 text-xs">
                                  {formatDate(notification.createdAt)}
                                </div>
                              </div>
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-blue-400 rounded-full ml-2 mt-1"></div>
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
                  <div className="absolute z-20 right-4 top-2 w-96 max-h-96 overflow-y-auto bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-bold text-white">Bildirimler</h4>
                      <button
                        onClick={() => setShowNotifications(false)}
                        className="text-white/60 hover:text-white"
                      >
                        ×
                      </button>
                    </div>
                    {notifications.length === 0 ? (
                      <div className="text-center py-8">
                        <Bell className="w-12 h-12 text-white/30 mx-auto mb-2" />
                        <p className="text-white/70 text-sm">Henüz bildirim yok</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-3 rounded-lg border ${
                              notification.isRead 
                                ? 'bg-white/5 border-white/10' 
                                : 'bg-blue-500/10 border-blue-500/20'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h5 className="text-white text-sm font-medium mb-1">
                                  {notification.title}
                                </h5>
                                <p className="text-white/70 text-xs mb-2">
                                  {notification.message}
                                </p>
                                <div className="text-white/50 text-xs">
                                  {formatDate(notification.createdAt)}
                                </div>
                              </div>
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-blue-400 rounded-full ml-2 mt-1"></div>
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
              <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-3 md:space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-16 h-16 text-white/30 mx-auto mb-4" />
                    <p className="text-white/70 text-lg">Henüz mesaj yok</p>
                    <p className="text-white/50 text-sm">İlk mesajı siz gönderin!</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.user.id === session.user?.id ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`flex items-start space-x-2 md:space-x-3 max-w-xs md:max-w-3xl ${
                          message.user.id === session.user?.id ? "flex-row-reverse space-x-reverse" : ""
                        }`}
                      >
                        <div className="w-6 h-6 md:w-8 md:h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-3 h-3 md:w-4 md:h-4 text-white" />
                        </div>
                        <div
                          className={`px-3 md:px-4 py-2 md:py-3 rounded-xl md:rounded-2xl max-w-full transition-colors duration-200 group relative ${
                            message.user.id === session.user?.id
                              ? "bg-white/30 backdrop-blur-sm text-white border border-white/40"
                              : "bg-white/20 backdrop-blur-sm text-white border border-white/30"
                          }`}
                        >
                          <div className="text-xs md:text-sm font-medium text-white/80 mb-1">
                            <span className="hidden sm:inline">{message.user.name} ({message.user.email})</span>
                            <span className="sm:hidden">{message.user.name}</span>
                          </div>
                          <div className="text-xs md:text-sm whitespace-pre-wrap">
                            {message.content}
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="text-xs text-white/50">
                              {formatDate(message.createdAt)}
                            </div>
                            {/* Sadece kendi mesajlarını silebilir */}
                            {message.user.id === session.user?.id && (
                              <button
                                onClick={() => handleDeleteMessage(message.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-red-500/20 rounded-full"
                                title="Mesajı sil"
                              >
                                <Trash2 className="w-3 h-3 text-red-400 hover:text-red-300" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="border-t border-white/20 p-3 md:p-4">
                <form onSubmit={handleSendMessage} className="flex space-x-2 md:space-x-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Mesaj yazın..."
                    className="flex-1 px-3 md:px-4 py-2 md:py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm md:text-base"
                    disabled={isSending}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || isSending}
                    className="px-3 md:px-4 py-2 bg-white/30 hover:bg-white/40 border border-white/40 rounded-lg text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    <Send className="w-4 h-4 md:w-5 md:h-5" />
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
