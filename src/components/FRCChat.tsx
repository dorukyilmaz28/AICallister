"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
// Token-based auth (useSession removed)
import { Send, Bot, User, Home, UserCircle, Trash2, Menu, X, Languages, Moon, Sun } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "next-themes";

interface Message {
  role: "user" | "assistant";
  content: string;
}

type Context = "general" | "strategy" | "mechanical" | "simulation";
type Mode = "frc" | "general";

const contextConfig = {
  general: {
    label: "Genel FRC",
    description: "Genel FRC konuları"
  },
  strategy: {
    label: "Strateji",
    description: "Robot stratejileri ve oyun analizi"
  },
  mechanical: {
    label: "Mekanik",
    description: "Robot mekaniği ve tasarım"
  },
  simulation: {
    label: "Simülasyon",
    description: "Robot simülasyonu ve test"
  }
};

export function FRCChat() {
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [selectedMode, setSelectedMode] = useState<Mode>("frc");
  
  const getWelcomeMessage = () => {
    return language === "en"
      ? "Hello! I'm your FRC (FIRST Robotics Competition) AI assistant. I get my knowledge from The Blue Alliance, WPILib Documentation, and official FIRST resources.\n\n**How can I help you?**\n• Robot programming (WPILib - Java/C++/Python)\n• Mechanical design and motor selection\n• Strategy and game analysis\n• Simulation and testing\n• Competition rules and FRC teams\n\nFeel free to ask me anything! 🚀"
      : "Merhaba! FRC (FIRST Robotics Competition) AI asistanınızım. Bilgilerimi The Blue Alliance, WPILib Documentation ve FIRST resmi kaynaklarından alıyorum.\n\n**Size nasıl yardımcı olabilirim?**\n• Robot programlama (WPILib - Java/C++/Python)\n• Mekanik tasarım ve motor seçimi\n• Strateji ve oyun analizi\n• Simülasyon ve test\n• Yarışma kuralları ve FRC takımları\n\nSorularınızı sorabilirsiniz! 🚀";
  };
  
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: getWelcomeMessage()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedContext, setSelectedContext] = useState<Context>("general");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Sadece ilk yüklemede ve yeni mesaj eklendiğinde scroll yap
  // Typing sırasında scroll yapma
  useEffect(() => {
    // Sadece mesaj sayısı değiştiğinde ve typing yapılmıyorsa scroll yap
    if (messages.length > 0 && !isLoading) {
      // Kısa bir gecikme ile scroll yap (DOM güncellemesi için)
      const timeoutId = setTimeout(() => {
        scrollToBottom();
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [messages.length]); // Sadece mesaj sayısı değiştiğinde tetikle

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: inputMessage.trim()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputMessage("");
    setIsLoading(true);
    
    // Kullanıcı mesajı gönderildiğinde bir kere scroll yap
    setTimeout(() => {
      scrollToBottom();
    }, 100);
    
    const messageData: any = {
      messages: newMessages,
      context: selectedContext,
      mode: selectedMode,
      conversationId: conversationId,
      language: language,
    };

    // Retry mekanizması - 3 deneme
    let lastError: any = null;
    let data: any = null;
    const maxRetries = 3;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const { api } = await import('@/lib/api');
        data = await api.post('/api/chat/', messageData);
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        // Başarılı oldu, retry loop'tan çık
        break;
      } catch (error: any) {
        lastError = error;
        
        // Retry yapılabilir hatalar
        const isRetryable = 
          error.message?.includes('timeout') ||
          error.message?.includes('network') ||
          error.message?.includes('ECONNREFUSED') ||
          error.message?.includes('Failed to fetch') ||
          error.message?.includes('503') ||
          error.message?.includes('500') ||
          error.statusCode === 'TIMEOUT' ||
          error.statusCode === 'NETWORK_ERROR' ||
          error.statusCode === 'FETCH_ERROR';
        
        if (isRetryable && attempt < maxRetries) {
          // Exponential backoff: 1s, 2s
          const delay = Math.pow(2, attempt - 1) * 1000;
          console.log(`[Chat] Attempt ${attempt} failed, retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        // Retry yapılamazsa veya son deneme ise hata fırlat
        throw error;
      }
    }
    
    if (!data) {
      throw lastError || new Error('AI servisine erişilemedi.');
    }
    
    try {
      const assistantMessage = data.messages[data.messages.length - 1];
      const assistantText = assistantMessage?.content || "";

      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      let index = 0;
      const typingIntervalMs = 8; // Daha hızlı yazma efekti

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
            // Mesaj tamamlandığında bir kere scroll yap
            setTimeout(() => {
              scrollToBottom();
            }, 100);
            resolve();
          }
        }, typingIntervalMs);
      });

      if (data.conversationId) {
        setConversationId(data.conversationId);
      }
    } catch (error: any) {
      console.error("Chat error:", error);
      let errorMessage = "Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.";
      
      // Daha spesifik hata mesajları
      if (error.message) {
        if (error.message.includes("timeout") || error.message.includes("zaman aşımı")) {
          errorMessage = "⏱️ İstek zaman aşımına uğradı. Lütfen tekrar deneyin.";
        } else if (error.message.includes("network") || error.message.includes("bağlantı")) {
          errorMessage = "🌐 İnternet bağlantısı hatası. Lütfen bağlantınızı kontrol edin ve tekrar deneyin.";
        } else if (error.message.includes("429") || error.message.includes("rate limit")) {
          errorMessage = "🚦 Çok fazla istek gönderildi. Lütfen birkaç dakika bekleyip tekrar deneyin.";
        } else if (error.message.includes("API") || error.message.includes("Gemini")) {
          errorMessage = `🤖 AI servisi hatası: ${error.message}\n\nLütfen birkaç dakika sonra tekrar deneyin.`;
        } else if (error.message.includes("503") || error.message.includes("500")) {
          errorMessage = "🔧 Sunucu geçici olarak kullanılamıyor. Lütfen birkaç dakika sonra tekrar deneyin.";
        }
      }
      
      setMessages(prev => [...prev, {
        role: "assistant",
        content: errorMessage
      }]);
      
      // Hata mesajı eklendiğinde bir kere scroll yap
      setTimeout(() => {
        scrollToBottom();
      }, 100);
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

  const clearChat = () => {
    setMessages([{
      role: "assistant",
      content: getWelcomeMessage()
    }]);
    setConversationId(null);
  };
  
  // Update welcome message when language changes
  useEffect(() => {
    if (messages.length === 1 && messages[0].role === "assistant") {
      setMessages([{
        role: "assistant",
        content: getWelcomeMessage()
      }]);
    }
  }, [language]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-100 dark:border-gray-800 transition-colors">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-3 group">
              <img
                src="/8f28b76859c1479d839d270409be3586.jpg"
                alt="Callister Logo"
                className="w-8 h-8 lg:w-10 lg:h-10 object-cover rounded-xl transition-transform group-hover:scale-105"
              />
              <div>
                <h1 className="text-base lg:text-lg font-bold text-gray-900 dark:text-white">
                  Callister AI
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                  FRC AI Assistant
                </p>
              </div>
            </Link>
            
            <div className="hidden md:flex items-center space-x-2">
              <button
                onClick={() => setLanguage(language === "tr" ? "en" : "tr")}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title={language === "tr" ? "Switch to English" : "Türkçe'ye Geç"}
              >
                <Languages className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{language.toUpperCase()}</span>
              </button>
              
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                title={theme === "dark" ? "Light mode" : "Dark mode"}
              >
                {theme === "dark" ? (
                  <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                )}
              </button>
              
              <Link
                href="/"
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <Home className="w-4 h-4" />
                <span className="text-sm font-medium">{t("common.home")}</span>
              </Link>
              
              <Link
                href="/profile"
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <UserCircle className="w-4 h-4" />
                <span className="text-sm font-medium">{t("common.profile")}</span>
              </Link>
              
              <button
                onClick={clearChat}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-sm font-medium">{t("common.clear")}</span>
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
              <button
                onClick={() => setLanguage(language === "tr" ? "en" : "tr")}
                className="w-full flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <Languages className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{language.toUpperCase()}</span>
              </button>
              
              <button
                onClick={() => {
                  setTheme(theme === "dark" ? "light" : "dark");
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {theme === "dark" ? (
                  <Sun className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                ) : (
                  <Moon className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                )}
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {theme === "dark" ? "Light Mode" : "Dark Mode"}
                </span>
              </button>
              
              <Link
                href="/"
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Home className="w-4 h-4" />
                <span className="text-sm font-medium">{t("common.home")}</span>
              </Link>
              
              <Link
                href="/profile"
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <UserCircle className="w-4 h-4" />
                <span className="text-sm font-medium">{t("common.profile")}</span>
              </Link>
              
              <button
                onClick={() => {
                  clearChat();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center space-x-2 px-4 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-sm font-medium">{t("common.clear")}</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950 transition-colors overscroll-contain">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-4xl pb-safe">
          <div className="space-y-6">
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
                    className={`px-6 py-4 rounded-2xl max-w-full ${
                      message.role === "user"
                        ? "bg-gray-900 text-white"
                        : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                    }`}
                  >
                    {/* Mesaj içeriği */}
                    {message.content && (
                      <div className={`prose prose-sm max-w-none ${
                        message.role === "user"
                          ? "prose-invert"
                          : "prose-neutral dark:prose-invert"
                      }`}>
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[rehypeHighlight]}
                          components={{
                            code: ({node, inline, className, children, ...props}: any) => {
                              return inline ? (
                                <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm" {...props}>
                                  {children}
                                </code>
                              ) : (
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              );
                            },
                            a: ({node, children, ...props}: any) => (
                              <a className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer" {...props}>
                                {children}
                              </a>
                            ),
                          }}
                        >
                          {message.content
                            .replace(/<\| begin_of_sentence \|>/g, '')
                            .replace(/<\| end_of_sentence \|>/g, '')
                            .replace(/<\|.*?\|>/g, '')
                            .replace(/REDACTED_SPECIAL_TOKEN/g, '')
                            .replace(/REDACTED.*?TOKEN/g, '')
                            .replace(/\[REDACTED.*?\]/g, '')
                          }
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-3 max-w-3xl">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-blue-500 to-purple-600">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="px-6 py-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                    <div className="flex space-x-1.5">
                      <div className="w-2 h-2 rounded-full animate-bounce bg-gray-400"></div>
                      <div className="w-2 h-2 rounded-full animate-bounce bg-gray-400" style={{ animationDelay: "0.1s" }}></div>
                      <div className="w-2 h-2 rounded-full animate-bounce bg-gray-400" style={{ animationDelay: "0.2s" }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="sticky bottom-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800 py-3 sm:py-4 transition-colors safe-area-bottom">
        <div className="container mx-auto px-3 sm:px-4 max-w-4xl">
          <div className="flex space-x-2 sm:space-x-3">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t("chat.placeholder")}
              className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm sm:text-base"
              rows={1}
              style={{ minHeight: "44px", maxHeight: "120px" }}
            />
            
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="px-4 sm:px-6 py-3 rounded-xl bg-gray-900 dark:bg-gray-800 hover:bg-gray-800 dark:hover:bg-gray-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 flex-shrink-0 shadow-md min-w-[48px]"
              aria-label={t("chat.send")}
            >
              <Send className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">{t("chat.send")}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
