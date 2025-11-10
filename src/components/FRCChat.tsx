"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Send, Bot, User, Settings, Wrench, Target, Cpu, Home, UserCircle, Shield, Search, Trash2, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';

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
      content: "Merhaba! FRC (FIRST Robotics Competition) AI asistanınızım. Bilgilerimi The Blue Alliance, WPILib Documentation ve FIRST resmi kaynaklarından alıyorum.\n\n**Size nasıl yardımcı olabilirim?**\n• Robot programlama (WPILib - Java/C++/Python)\n• Mekanik tasarım ve motor seçimi\n• Strateji ve oyun analizi\n• Simülasyon ve test\n• Yarışma kuralları ve FRC takımları\n\nSorularınızı sorabilirsiniz! 🚀"
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedContext, setSelectedContext] = useState<Context>("general");
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [voiceLanguage, setVoiceLanguage] = useState<'tr-TR' | 'en-US'>('tr-TR');
  const [autoSpeak, setAutoSpeak] = useState(false); // AI cevabını otomatik oku
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Speech hooks
  const { 
    isListening, 
    transcript, 
    isSupported: speechSupported,
    error: speechError,
    startListening, 
    stopListening,
    resetTranscript 
  } = useSpeechRecognition(voiceLanguage);
  
  const {
    speak,
    stop: stopSpeaking,
    isSpeaking,
    isSupported: ttsSupported
  } = useSpeechSynthesis(voiceLanguage);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Sesli transcript'i input'a yaz
  useEffect(() => {
    if (transcript) {
      setInputMessage(transcript);
    }
  }, [transcript]);

  // AI cevabını otomatik sesli oku
  useEffect(() => {
    if (autoSpeak && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant' && !isLoading) {
        // Markdown'ı temizle (sadece metin oku)
        const cleanText = lastMessage.content
          .replace(/[#*`_\[\]]/g, '') // Markdown karakterleri
          .replace(/https?:\/\/[^\s]+/g, '') // URL'leri kaldır
          .substring(0, 500); // İlk 500 karakter
        
        speak(cleanText);
      }
    }
  }, [messages, autoSpeak, isLoading, speak]);

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
    setMessages([{
      role: "assistant",
      content: "Merhaba! FRC (FIRST Robotics Competition) AI asistanınızım. Bilgilerimi The Blue Alliance, WPILib Documentation ve FIRST resmi kaynaklarından alıyorum.\n\n**Size nasıl yardımcı olabilirim?**\n• Robot programlama (WPILib - Java/C++/Python)\n• Mekanik tasarım ve motor seçimi\n• Strateji ve oyun analizi\n• Simülasyon ve test\n• Yarışma kuralları ve FRC takımları\n\nSorularınızı sorabilirsiniz! 🚀"
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
              href="/"
              className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 rounded-lg transition-colors duration-200 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-white"
            >
              <Home className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm font-medium hidden sm:inline">
                Ana Sayfa
              </span>
            </Link>
            
            <Link
              href="/profile"
              className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 bg-white/20 hover:bg-white/30 border border-white/30 text-white"
            >
              <UserCircle className="w-4 h-4" />
              <span className="hidden md:inline">Profil</span>
            </Link>
            
            <button
              onClick={() => clearChat()}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-white"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden md:inline">Temizle</span>
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
                  <div className="prose prose-xs sm:prose-sm max-w-none text-sm sm:text-base prose-invert prose-headings:text-white prose-p:text-white/90 prose-strong:text-white prose-code:text-blue-300 prose-pre:bg-black/30 prose-pre:border prose-pre:border-white/20 prose-a:text-blue-300 prose-a:no-underline hover:prose-a:underline">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeHighlight]}
                      components={{
                        code: ({node, inline, className, children, ...props}: any) => {
                          return inline ? (
                            <code className="bg-black/30 px-1 py-0.5 rounded text-blue-300" {...props}>
                              {children}
                            </code>
                          ) : (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          );
                        },
                        a: ({node, children, ...props}: any) => (
                          <a className="text-blue-300 hover:text-blue-200 underline" target="_blank" rel="noopener noreferrer" {...props}>
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
          {/* Sesli kontroller */}
          {(speechSupported || ttsSupported) && (
            <div className="mb-2 flex items-center justify-between text-white/80 text-xs sm:text-sm">
              <div className="flex items-center space-x-2">
                {speechSupported && (
                  <div className="flex items-center space-x-1">
                    <Mic className="w-3 h-3" />
                    <span>Sesli soru</span>
                  </div>
                )}
                {ttsSupported && (
                  <div className="flex items-center space-x-1">
                    <Volume2 className="w-3 h-3" />
                    <span>Sesli yanıt</span>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {/* Dil seçici */}
                <select
                  value={voiceLanguage}
                  onChange={(e) => setVoiceLanguage(e.target.value as 'tr-TR' | 'en-US')}
                  className="px-2 py-1 rounded bg-white/10 border border-white/20 text-white text-xs"
                >
                  <option value="tr-TR">🇹🇷 Türkçe</option>
                  <option value="en-US">🇺🇸 English</option>
                </select>
                {/* Otomatik okuma toggle */}
                {ttsSupported && (
                  <button
                    onClick={() => setAutoSpeak(!autoSpeak)}
                    className={`px-2 py-1 rounded text-xs transition-colors ${
                      autoSpeak 
                        ? 'bg-green-500/30 border border-green-500/50' 
                        : 'bg-white/10 border border-white/20'
                    }`}
                    title="AI cevabını otomatik sesli oku"
                  >
                    {autoSpeak ? '🔊 Auto' : '🔇 Manuel'}
                  </button>
                )}
              </div>
            </div>
          )}
          
          <div className="flex space-x-2 sm:space-x-3">
            <div className="flex-1">
              <div className="relative">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={isListening ? "🎤 Dinleniyor..." : selectedMode === "frc" ? "FRC hakkında sorunuzu yazın veya 🎤 kullanın..." : "Sorunuzu yazın..."}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 pr-12 border border-white/30 rounded-2xl focus:ring-2 focus:ring-white/50 focus:border-transparent resize-none transition-colors bg-white/20 backdrop-blur-sm text-white placeholder-white/60 text-sm sm:text-base"
                  rows={1}
                  style={{ minHeight: "40px", maxHeight: "120px" }}
                />
                {/* Mikrofon butonu (textarea içinde sağda) */}
                {speechSupported && (
                  <button
                    onClick={() => {
                      if (isListening) {
                        stopListening();
                      } else {
                        resetTranscript();
                        startListening();
                      }
                    }}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all ${
                      isListening 
                        ? 'bg-red-500 text-white animate-pulse' 
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                    title={isListening ? "Dinlemeyi durdur" : "Sesli soru sor"}
                  >
                    {isListening ? (
                      <MicOff className="w-4 h-4" />
                    ) : (
                      <Mic className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
              {/* Sesli hata mesajı */}
              {speechError && (
                <p className="text-red-300 text-xs mt-1">{speechError}</p>
              )}
            </div>
            
            {/* Speaker butonu (AI cevabını oku) */}
            {ttsSupported && messages.length > 1 && (
              <button
                onClick={() => {
                  if (isSpeaking) {
                    stopSpeaking();
                  } else {
                    const lastAssistant = messages.filter(m => m.role === 'assistant').pop();
                    if (lastAssistant) {
                      const cleanText = lastAssistant.content
                        .replace(/[#*`_\[\]]/g, '')
                        .replace(/https?:\/\/[^\s]+/g, '')
                        .substring(0, 500);
                      speak(cleanText);
                    }
                  }
                }}
                className={`px-3 sm:px-4 py-2 sm:py-3 rounded-2xl transition-colors duration-200 flex items-center space-x-1 border ${
                  isSpeaking
                    ? 'bg-blue-500/30 border-blue-500/50 text-white'
                    : 'bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30'
                }`}
                title={isSpeaking ? "Okumayı durdur" : "Son cevabı sesli oku"}
              >
                {isSpeaking ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
            )}
            
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="px-3 sm:px-6 py-2 sm:py-3 rounded-2xl transition-colors duration-200 flex items-center space-x-1 sm:space-x-2 border bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
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
