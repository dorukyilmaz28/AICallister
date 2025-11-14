"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Bot, User, ArrowLeft, Home } from "lucide-react";
import Loading from "@/components/Loading";

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
  user: {
    name: string;
    email: string;
  };
  messages: Message[];
}

export default function SharedConversationPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (token) {
      fetchSharedConversation();
    }
  }, [token]);

  const fetchSharedConversation = async () => {
    try {
      const response = await fetch(`/api/conversations/share/${token}`);
      if (response.ok) {
        const data = await response.json();
        setConversation(data.conversation);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Konuşma yüklenirken hata oluştu.");
      }
    } catch (error) {
      console.error("Error fetching shared conversation:", error);
      setError("Konuşma yüklenirken hata oluştu.");
    } finally {
      setIsLoading(false);
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading />
      </div>
    );
  }

  if (error || !conversation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-white text-xl mb-4">{error || "Konuşma bulunamadı."}</div>
          <Link
            href="/"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 border border-white/30 rounded-lg text-white transition-colors duration-200"
          >
            <Home className="w-4 h-4" />
            <span>Ana Sayfa</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-white/20 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link
              href="/"
              className="flex items-center space-x-1 text-white/70 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Ana Sayfa</span>
            </Link>
          </div>
          <div className="flex items-center space-x-2">
            <Link
              href="/"
              className="p-2 bg-white/20 hover:bg-white/30 border border-white/30 rounded-lg text-white transition-colors"
            >
              <Home className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Conversation Info */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4">{conversation.title}</h2>
            <div className="flex items-center space-x-6 text-sm text-white/70">
              <span>Bağlam: {conversation.context}</span>
              <span>Oluşturulma: {formatDate(conversation.createdAt)}</span>
              <span>Kullanıcı: {conversation.user.name}</span>
            </div>
          </div>

          {/* Messages */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-6">Mesajlar</h3>
            
            <div className="space-y-4">
              {conversation.messages.map((message, index) => (
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
          </div>
        </div>
      </div>
    </div>
  );
}

