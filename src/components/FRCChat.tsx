"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Send, Bot, User, Home, UserCircle, Trash2, Menu, X, Languages } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';
import { useLanguage } from "@/contexts/LanguageContext";

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
  const { data: session } = useSession();
  const { language, setLanguage, t } = useLanguage();
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

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

    try {
      const response = await fetch('/api/chat', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: newMessages,
          context: selectedContext,
          mode: selectedMode,
          conversationId: conversationId,
          language: language,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      const assistantMessage = data.messages[data.messages.length - 1];
      const assistantText = assistantMessage?.content || "";

      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      let index = 0;
      const typingIntervalMs = 15;

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
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-3 group">
              <img
                src="/8f28b76859c1479d839d270409be3586.jpg"
                alt="Callister Logo"
                className="w-8 h-8 lg:w-10 lg:h-10 object-cover rounded-xl transition-transform group-hover:scale-105"
              />
              <div>
                <h1 className="text-base lg:text-lg font-bold text-gray-900">
                  Callister AI
                </h1>
                <p className="text-xs text-gray-500 hidden sm:block">
                  FRC AI Assistant
                </p>
              </div>
            </Link>
            
            <div className="hidden md:flex items-center space-x-2">
              <button
                onClick={() => setLanguage(language === "tr" ? "en" : "tr")}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                title={language === "tr" ? "Switch to English" : "Türkçe'ye Geç"}
              >
                <Languages className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">{language.toUpperCase()}</span>
              </button>
              
              <Link
                href="/"
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Home className="w-4 h-4" />
                <span className="text-sm font-medium">{t("common.home")}</span>
              </Link>
              
              <Link
                href="/profile"
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <UserCircle className="w-4 h-4" />
                <span className="text-sm font-medium">{t("common.profile")}</span>
              </Link>
              
              <button
                onClick={clearChat}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-sm font-medium">{t("common.clear")}</span>
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-50"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-2 border-t border-gray-100">
              <Link
                href="/"
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Home className="w-4 h-4" />
                <span className="text-sm font-medium">Ana Sayfa</span>
              </Link>
              
              <Link
                href="/profile"
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <UserCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Profil</span>
              </Link>
              
              <button
                onClick={() => {
                  clearChat();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center space-x-2 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-sm font-medium">Temizle</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
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
                        : "bg-white border border-gray-200 text-gray-900"
                    }`}
                  >
                    <div className={`prose prose-sm max-w-none ${message.role === "user" ? "prose-invert" : ""}`}>
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeHighlight]}
                        components={{
                          code: ({node, inline, className, children, ...props}: any) => {
                            return inline ? (
                              <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm" {...props}>
                                {children}
                              </code>
                            ) : (
                              <code className={className} {...props}>
                                {children}
                              </code>
                            );
                          },
                          a: ({node, children, ...props}: any) => (
                            <a className="text-blue-600 hover:text-blue-700 underline" target="_blank" rel="noopener noreferrer" {...props}>
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
                  <div className="px-6 py-4 rounded-2xl bg-white border border-gray-200">
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
      <div className="sticky bottom-0 bg-white border-t border-gray-200 py-4">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex space-x-3">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t("chat.placeholder")}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white text-gray-900 placeholder-gray-400"
              rows={1}
              style={{ minHeight: "48px", maxHeight: "120px" }}
            />
            
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="px-6 py-3 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">{t("chat.send")}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
