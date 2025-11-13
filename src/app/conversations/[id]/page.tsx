"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { User, MessageSquare, Settings, Calendar, Bot, ArrowLeft, Trash2, Home } from "lucide-react";

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-900 text-xl">Yükleniyor...</div>
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
          <div className="text-gray-900 text-xl mb-4">{error}</div>
          <Link
            href="/profile"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 rounded-lg text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Profile Dön</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/profile"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium hidden sm:inline">Profil</span>
              </Link>
              <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>
              <img
                src="/8f28b76859c1479d839d270409be3586.jpg"
                alt="Callister Logo"
                className="w-8 h-8 object-cover rounded-xl"
              />
              <h1 className="text-base lg:text-lg font-bold text-gray-900">
                Konuşma Detayı
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleDeleteConversation}
                disabled={isDeleting}
                className="p-2 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg text-red-600 transition-colors disabled:opacity-50"
                title={isDeleting ? "Siliniyor..." : "Konuşmayı Sil"}
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <Link
                href="/chat"
                className="px-4 py-2 bg-gray-900 hover:bg-gray-800 rounded-lg text-white text-sm font-medium transition-colors"
                title="Yeni Sohbet"
              >
                Yeni Sohbet
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Conversation Info */}
          {conversation && (
            <div className="bg-white rounded-2xl p-6 lg:p-8 mb-8 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">{conversation.title}</h2>
                <div className="flex items-center space-x-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg">
                  <Settings className="w-4 h-4 text-blue-600" />
                  <span className="text-blue-700 text-sm font-medium">{getContextLabel(conversation.context)}</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
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
            </div>
          )}

          {/* Messages */}
          <div className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-200 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Mesajlar</h3>
            
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">Bu konuşmada mesaj bulunmuyor</p>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    style={{ 
                      animation: `fadeIn 0.5s ease-out ${index * 0.1}s both`
                    }}
                  >
                    <div
                      className={`flex items-start space-x-3 max-w-3xl ${
                        message.role === "user" ? "flex-row-reverse space-x-reverse" : ""
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.role === "user"
                            ? "bg-gray-900"
                            : "bg-gradient-to-br from-blue-500 to-purple-600"
                        }`}
                      >
                        {message.role === "user" ? (
                          <User className="w-4 h-4 text-white" />
                        ) : (
                          <Bot className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div
                        className={`px-5 py-4 rounded-2xl max-w-full ${
                          message.role === "user"
                            ? "bg-gray-900 text-white"
                            : "bg-gray-50 border border-gray-200 text-gray-900"
                        }`}
                      >
                        <div 
                          className="whitespace-pre-wrap text-sm leading-relaxed"
                          dangerouslySetInnerHTML={{
                            __html: message.content
                              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                              .replace(/\*(.*?)\*/g, '<em>$1</em>')
                              .replace(/\n/g, '<br>')
                          }}
                        />
                        <div className={`text-xs mt-2 ${message.role === "user" ? "text-gray-300" : "text-gray-500"}`}>
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
