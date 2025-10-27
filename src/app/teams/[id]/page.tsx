"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { User, LogOut, Users, Bot, ArrowLeft, Send, MessageSquare, Settings, Crown, Shield } from "lucide-react";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (session && teamId) {
      fetchTeam();
    }
  }, [session, status, router, teamId]);

  // Auto-refresh mesajları her 3 saniyede bir
  useEffect(() => {
    if (!teamId) return;

    const interval = setInterval(() => {
      fetchMessages();
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
        // Auto-refresh zaten çalışıyor, gereksiz fetch kaldırıldı
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

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
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
        return "Kaptan";
      case "mentor":
        return "Mentor";
      default:
        return "Üye";
    }
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3A006F 0%, #5A008F 50%, #8A00FF 100%)' }}>
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
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #3A006F 0%, #5A008F 50%, #8A00FF 100%)' }}>
      {/* Header */}
      <div className="border-b border-white/20 p-4">
        <div className="container mx-auto flex items-center justify-between">
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
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Team Info Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 sticky top-4">
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
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 h-[600px] flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
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
                        className={`flex items-start space-x-3 max-w-3xl ${
                          message.user.id === session.user?.id ? "flex-row-reverse space-x-reverse" : ""
                        }`}
                      >
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <div
                          className={`px-4 py-3 rounded-2xl max-w-full transition-colors duration-200 ${
                            message.user.id === session.user?.id
                              ? "bg-white/30 backdrop-blur-sm text-white border border-white/40"
                              : "bg-white/20 backdrop-blur-sm text-white border border-white/30"
                          }`}
                        >
                          <div className="text-sm font-medium text-white/80 mb-1">
                            {message.user.name} ({message.user.email})
                          </div>
                          <div className="text-sm whitespace-pre-wrap">
                            {message.content}
                          </div>
                          <div className="text-xs text-white/50 mt-2">
                            {formatDate(message.createdAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="border-t border-white/20 p-4">
                <form onSubmit={handleSendMessage} className="flex space-x-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Takımınıza mesaj yazın..."
                    className="flex-1 px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                    disabled={isSending}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || isSending}
                    className="px-4 py-2 bg-white/30 hover:bg-white/40 border border-white/40 rounded-lg text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
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
