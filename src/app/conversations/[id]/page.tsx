"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { User, LogOut, MessageSquare, Settings, Calendar, Bot, ArrowLeft, Send, Trash2, Download, Share2, Printer, Copy, Check } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  title: string;
  context: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  user: {
    name: string;
    email: string;
  };
}

export default function ConversationDetail() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const conversationId = params.id as string;
  
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (session && conversationId) {
      fetchConversation();
    }
  }, [session, status, router, conversationId]);

  const fetchConversation = async () => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}`);
      if (response.ok) {
        const data = await response.json();
        setConversation(data.conversation);
        setMessages(data.messages);
      } else {
        setError("Konuşma bulunamadı.");
      }
    } catch (error) {
      console.error("Error fetching conversation:", error);
      setError("Konuşma yüklenirken hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const handleDeleteConversation = async () => {
    if (!conversationId) return;
    
    const confirmed = window.confirm("Bu konuşmayı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.");
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/profile");
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Konuşma silinirken hata oluştu.");
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
      setError("Konuşma silinirken hata oluştu.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportMarkdown = async () => {
    if (!conversationId) return;
    
    try {
      const response = await fetch(`/api/conversations/${conversationId}/export?format=markdown`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `conversation-${conversationId}.md`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Error exporting conversation:", error);
    }
  };

  const handleExportJSON = async () => {
    if (!conversationId) return;
    
    try {
      const response = await fetch(`/api/conversations/${conversationId}/export?format=json`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `conversation-${conversationId}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Error exporting conversation:", error);
    }
  };

  const handleCreateShareLink = async () => {
    if (!conversationId) return;
    
    try {
      const response = await fetch(`/api/conversations/${conversationId}/share`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ expiresInDays: 30 })
      });

      if (response.ok) {
        const data = await response.json();
        setShareUrl(data.shareUrl);
      }
    } catch (error) {
      console.error("Error creating share link:", error);
    }
  };

  const handleCopyShareLink = async () => {
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
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

  const getContextLabel = (context: string) => {
    const labels = {
      general: "Genel FRC",
      strategy: "Strateji",
      mechanical: "Mekanik",
      simulation: "Simülasyon",
    };
    return labels[context as keyof typeof labels] || context;
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
            href="/profile"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 border border-white/30 rounded-lg text-white transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Profile Dön</span>
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
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <Link
              href="/profile"
              className="flex items-center space-x-1 text-white/70 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">Profil</span>
            </Link>
            <div className="h-6 w-px bg-white/30 hidden sm:block"></div>
            <img
              src="/8f28b76859c1479d839d270409be3586.jpg"
              alt="Callister Logo"
              className="w-8 h-8 sm:w-10 sm:h-10 object-cover rounded-xl"
            />
            <h1 className="text-sm sm:text-xl font-bold text-white truncate">
              Konuşma Detayı
            </h1>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={handleExportMarkdown}
              className="p-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-white transition-colors duration-200"
              title="Markdown olarak indir"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={handleCreateShareLink}
              className="p-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-white transition-colors duration-200"
              title="Paylaşım linki oluştur"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={handlePrint}
              className="p-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-white transition-colors duration-200"
              title="Yazdır"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={handleDeleteConversation}
              disabled={isDeleting}
              className="p-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-white transition-colors duration-200 disabled:opacity-50"
              title={isDeleting ? "Siliniyor..." : "Konuşmayı Sil"}
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <Link
              href="/chat"
              className="p-2 bg-white/20 hover:bg-white/30 border border-white/30 rounded-lg text-white transition-colors duration-200"
              title="Yeni Sohbet"
            >
              <Bot className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Conversation Info */}
          {conversation && (
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">{conversation.title}</h2>
                <div className="flex items-center space-x-2 px-3 py-1 bg-white/20 rounded-lg">
                  <Settings className="w-4 h-4 text-white" />
                  <span className="text-white text-sm">{getContextLabel(conversation.context)}</span>
                </div>
              </div>
              <div className="flex items-center space-x-6 text-sm text-white/70 mb-4">
                <span className="flex items-center space-x-1">
                  <MessageSquare className="w-4 h-4" />
                  <span>{conversation.messageCount} mesaj</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(conversation.createdAt)}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <User className="w-4 h-4" />
                  <span>{conversation.user.name}</span>
                </span>
              </div>
              {shareUrl && (
                <div className="mt-4 p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-white text-sm mb-2">Paylaşım Linki:</p>
                      <input
                        type="text"
                        value={shareUrl}
                        readOnly
                        className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white text-sm"
                      />
                    </div>
                    <button
                      onClick={handleCopyShareLink}
                      className="ml-2 p-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
                      title="Kopyala"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Messages */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-6">Mesajlar</h3>
            
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 text-white/30 mx-auto mb-4" />
                <p className="text-white/70 text-lg">Bu konuşmada mesaj bulunmuyor</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`flex items-start space-x-3 max-w-3xl ${
                        message.role === "user" ? "flex-row-reverse space-x-reverse" : ""
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.role === "user"
                            ? "bg-white/30 backdrop-blur-sm border border-white/40"
                            : "bg-white/20 backdrop-blur-sm border border-white/30"
                        }`}
                      >
                        {message.role === "user" ? (
                          <User className="w-4 h-4 text-white" />
                        ) : (
                          <Bot className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div
                        className={`px-4 py-3 rounded-2xl max-w-full transition-colors duration-200 ${
                          message.role === "user"
                            ? "bg-white/30 backdrop-blur-sm text-white border border-white/40"
                            : "bg-white/20 backdrop-blur-sm text-white border border-white/30"
                        }`}
                      >
                        <div 
                          className="whitespace-pre-wrap prose prose-sm max-w-none text-sm"
                          dangerouslySetInnerHTML={{
                            __html: message.content
                              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                              .replace(/\*(.*?)\*/g, '<em>$1</em>')
                              .replace(/\n/g, '<br>')
                              .replace(/<\| begin_of_sentence \|>/g, '')
                              .replace(/<\| end_of_sentence \|>/g, '')
                              .replace(/<\|.*?\|>/g, '')
                              .replace(/REDACTED_SPECIAL_TOKEN/g, '')
                              .replace(/REDACTED.*?TOKEN/g, '')
                              .replace(/\[REDACTED.*?\]/g, '')
                          }}
                        />
                        <div className="text-xs text-white/50 mt-2">
                          {formatDate(message.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
