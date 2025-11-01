"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Send, Bot, User, Settings, Wrench, Target, Cpu, Home, UserCircle, Shield, Search } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

type Context = "general" | "strategy" | "mechanical" | "simulation";
type Mode = "frc" | "general";

const contextConfig = {
  general: {
    label: "Genel FRC",
    icon: Bot,
    description: "Genel FRC konuları"
  },
  strategy: {
    label: "Strateji",
    icon: Target,
    description: "Robot stratejileri ve oyun analizi"
  },
  mechanical: {
    label: "Mekanik",
    icon: Wrench,
    description: "Robot mekaniği ve tasarım"
  },
  simulation: {
    label: "Simülasyon",
    icon: Cpu,
    description: "Robot simülasyonu ve test"
  }
};

export function FRCChat() {
  const { data: session } = useSession();
  const [selectedMode, setSelectedMode] = useState<Mode>("frc");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Merhaba! FRC (FIRST Robotics Competition) AI asistanınızım. Sadece FRC konularında uzmanım ve bilgilerimi Blue Alliance, WPILib Documentation ve FIRST resmi kaynaklarından alıyorum.\n\nSize nasıl yardımcı olabilirim?\n• Robot programlama (WPILib - Java/C++/Python)\n• Mekanik tasarım ve motor seçimi\n• Strateji ve oyun analizi\n• Simülasyon ve test\n• Yarışma kuralları\n\nSorularınızı sorabilirsiniz! (Not: FRC dışı sorulara yanıt veremem)"
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedContext, setSelectedContext] = useState<Context>("general");
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Karakter sayısı hesaplama fonksiyonu
  const getCharCount = (text: string) => {
    return text.trim().length;
  };
  
  const charCount = getCharCount(inputMessage);
  const maxChars = 200;
  const isOverLimit = charCount > maxChars;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading || isOverLimit) return;

    const userMessage: Message = {
      role: "user",
      content: inputMessage.trim()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: newMessages,
          context: selectedContext,
          mode: selectedMode,
          conversationId: conversationId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Typing effect for assistant message
      const assistantMessage = data.messages[data.messages.length - 1];
      const assistantText = assistantMessage?.content || "";

      // Start with empty assistant message, then type it out
      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      let index = 0;
      const typingIntervalMs = 15; // speed of typing effect

      await new Promise<void>((resolve) => {
        const intervalId = setInterval(() => {
          index += 1;
          setMessages(prev => {
            const updated = [...prev];
            const lastIdx = updated.length - 1;
            if (lastIdx >= 0 && updated[lastIdx].role === "assistant") {
              updated[lastIdx] = {
                role: "assistant",
                content: assistantText.slice(0, index)
              };
            }
            return updated;
          });
          if (index >= assistantText.length) {
            clearInterval(intervalId);
            resolve();
          }
        }, typingIntervalMs);
      });

      if (data.conversationId) {
        setConversationId(data.conversationId);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = (mode?: Mode) => {
    const effectiveMode = mode ?? selectedMode;
    setMessages([{
      role: "assistant",
      content: effectiveMode === "frc"
        ? "Merhaba! FRC (FIRST Robotics Competition) AI asistanınızım. Sadece FRC konularında uzmanım ve bilgilerimi Blue Alliance, WPILib Documentation ve FIRST resmi kaynaklarından alıyorum.\n\nSize nasıl yardımcı olabilirim?\n• Robot programlama (WPILib - Java/C++/Python)\n• Mekanik tasarım ve motor seçimi\n• Strateji ve oyun analizi\n• Simülasyon ve test\n• Yarışma kuralları\n\nSorularınızı sorabilirsiniz! (Not: FRC dışı sorulara yanıt veremem)"
        : "Merhaba! FRC (FIRST Robotics Competition) AI asistanınızım. Bu modda da sadece FRC konularında yardımcı olabilirim. FRC ile ilgili sorularınız için buradayım!"
    }]);
    setConversationId(null);
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ background: 'linear-gradient(135deg, #3A006F 0%, #5A008F 50%, #8A00FF 100%)' }}>
      {/* Header */}
      <div className="border-b border-white/20 p-3 sm:p-4" style={{ background: 'linear-gradient(135deg, #3A006F 0%, #5A008F 50%, #8A00FF 100%)' }}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 sm:space-x-3 group">
            <img
              src="/8f28b76859c1479d839d270409be3586.jpg"
              alt="Callister Logo"
              className="w-8 h-8 sm:w-12 sm:h-12 object-cover rounded-xl transition-transform group-hover:scale-[1.02]"
            />
            <div className="min-w-0 flex-1">
              <h1 className="text-sm sm:text-xl font-bold text-white truncate">
                Callister FRC AI Assistant
              </h1>
              <p className="text-xs sm:text-sm text-gray-400 truncate">
                {selectedMode === "frc" ? contextConfig[selectedContext].description : "FRC konularında yardımcı"}
              </p>
            </div>
          </Link>
          <div className="flex items-center space-x-1 sm:space-x-2">
            {session?.user?.status === "pending" && (
              <div className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-yellow-300">
                <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm font-medium hidden sm:inline">Onay Bekleniyor</span>
              </div>
            )}
            
            <Link
              href="/discover-teams"
              className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 rounded-lg transition-colors duration-200 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-white"
            >
              <Search className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm font-medium hidden sm:inline">
                Takım Keşfet
              </span>
            </Link>
            
            <Link
              href="/profile"
              className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 rounded-lg transition-colors duration-200 bg-white/20 hover:bg-white/30 text-white"
            >
              <UserCircle className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm font-medium hidden sm:inline">
                Profil
              </span>
            </Link>
            
            {/* Mode toggle */}
            <div className="flex items-center bg-white/20 rounded-lg overflow-hidden border border-white/30 mr-2">
              <button
                onClick={() => {
                  if (selectedMode !== "general") {
                    setSelectedMode("general");
                    clearChat("general");
                  }
                }}
                className={`px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium transition-colors min-w-[90px] sm:min-w-[104px] text-center ${selectedMode === "general" ? "bg-white/40 text-white" : "text-white/80 hover:bg-white/20"}`}
                title="FRC genel konular"
              >
                FRC Genel
              </button>
              <button
                onClick={() => {
                  if (selectedMode !== "frc") {
                    setSelectedMode("frc");
                    clearChat("frc");
                  }
                }}
                className={`px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium transition-colors min-w-[90px] sm:min-w-[104px] text-center ${selectedMode === "frc" ? "bg-white/40 text-white" : "text-white/80 hover:bg-white/20"}`}
                title="FRC uzman modları (Strateji, Mekanik, Simülasyon)"
              >
                FRC Uzman
              </button>
            </div>

            {selectedMode === "frc" && (
            <div className="relative">
              <button
                onClick={() => setShowContextMenu(!showContextMenu)}
                className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 rounded-lg transition-colors duration-200 bg-white/20 hover:bg-white/30 text-white"
              >
                <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm font-medium hidden sm:inline">
                  {contextConfig[selectedContext].label}
                </span>
              </button>
              
              {showContextMenu && (
                <div className="absolute right-0 mt-2 w-64 border border-white/20 rounded-lg shadow-lg z-10 bg-white/10 backdrop-blur-sm">
                  <div className="p-2">
                    <div className="text-xs font-semibold uppercase tracking-wide mb-2 text-white/70">
                      Uzmanlık Alanı
                    </div>
                    {Object.entries(contextConfig).map(([key, config]) => {
                      const Icon = config.icon;
                      return (
                        <button
                          key={key}
                          onClick={() => {
                            setSelectedContext(key as Context);
                            setShowContextMenu(false);
                          }}
                          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                            selectedContext === key
                              ? "bg-white/30 text-white"
                              : "hover:bg-white/20 text-white/80"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <div>
                            <div className="font-medium">{config.label}</div>
                            <div className="text-xs text-white/60">{config.description}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            )}
            
            <button
              onClick={() => clearChat()}
              className="px-2 sm:px-3 py-2 text-xs sm:text-sm rounded-lg transition-colors duration-200 text-white/80 hover:text-white hover:bg-white/20"
            >
              <span className="hidden sm:inline">Temizle</span>
              <span className="sm:hidden">×</span>
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-2 sm:p-4 space-y-4 sm:space-y-6">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`flex items-start space-x-2 sm:space-x-3 max-w-3xl ${
                  message.role === "user" ? "flex-row-reverse space-x-reverse" : ""
                }`}
              >
                <div
                  className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === "user"
                      ? "bg-white/30 backdrop-blur-sm border border-white/40"
                      : "bg-white/20 backdrop-blur-sm border border-white/30"
                  }`}
                >
                  {message.role === "user" ? (
                    <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  ) : (
                    <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  )}
                </div>
                <div
                  className={`px-3 sm:px-4 py-2 sm:py-3 rounded-2xl max-w-full transition-colors duration-200 ${
                    message.role === "user"
                      ? "bg-white/30 backdrop-blur-sm text-white border border-white/40"
                      : "bg-white/20 backdrop-blur-sm text-white border border-white/30"
                  }`}
                >
                  <div 
                    className="whitespace-pre-wrap prose prose-xs sm:prose-sm max-w-none text-sm sm:text-base"
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
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-2 sm:space-x-3 max-w-3xl">
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-white/20 backdrop-blur-sm border border-white/30">
                  <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
                <div className="px-3 sm:px-4 py-2 sm:py-3 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full animate-bounce bg-white/60"></div>
                    <div className="w-2 h-2 rounded-full animate-bounce bg-white/60" style={{ animationDelay: "0.1s" }}></div>
                    <div className="w-2 h-2 rounded-full animate-bounce bg-white/60" style={{ animationDelay: "0.2s" }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-white/20 p-3 sm:p-4" style={{ background: 'linear-gradient(135deg, #3A006F 0%, #5A008F 50%, #8A00FF 100%)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="flex space-x-2 sm:space-x-3">
            <div className="flex-1">
              <div className="relative">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={selectedMode === "frc" ? "FRC hakkında sorunuzu yazın... (Maksimum 200 karakter)" : "Sorunuzu yazın... (Maksimum 200 karakter)"}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-2xl focus:ring-2 focus:ring-white/50 focus:border-transparent resize-none transition-colors bg-white/20 backdrop-blur-sm text-white placeholder-white/60 text-sm sm:text-base ${
                    isOverLimit ? 'border-red-400 focus:ring-red-400' : 'border-white/30'
                  }`}
                  rows={1}
                  style={{ minHeight: "40px", maxHeight: "120px" }}
                />
                <div className={`absolute bottom-2 right-3 text-xs ${
                  isOverLimit ? 'text-red-400' : 'text-white/60'
                }`}>
                  {charCount}/{maxChars}
                </div>
              </div>
            </div>
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading || isOverLimit}
              className={`px-3 sm:px-6 py-2 sm:py-3 rounded-2xl transition-colors duration-200 flex items-center space-x-1 sm:space-x-2 border ${
                isOverLimit 
                  ? 'bg-red-500/20 text-red-300 border-red-400 cursor-not-allowed' 
                  : 'bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              <Send className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline text-sm sm:text-base">Gönder</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
