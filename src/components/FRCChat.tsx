"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Send, Bot, User, Home, UserCircle, Trash2, Menu, X, Languages, Image as ImageIcon, XCircle, FileText, Search, Type, Sparkles } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';
import { useLanguage } from "@/contexts/LanguageContext";

interface Message {
  role: "user" | "assistant";
  content: string;
  images?: string[]; // Base64 data URIs veya URLs
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
  const [uploadedImages, setUploadedImages] = useState<string[]>([]); // Base64 image URIs
  const [uploadedPDFs, setUploadedPDFs] = useState<{name: string, data: string}[]>([]); // Base64 PDF URIs
  const [showImageGenerator, setShowImageGenerator] = useState(false);
  const [imagePrompt, setImagePrompt] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          if (result) {
            setUploadedImages(prev => [...prev, result]);
          }
        };
        reader.readAsDataURL(file);
      }
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePDFUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (file.type === 'application/pdf') {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          if (result) {
            setUploadedPDFs(prev => [...prev, { name: file.name, data: result }]);
          }
        };
        reader.readAsDataURL(file);
      }
    });

    // Reset input
    if (pdfInputRef.current) {
      pdfInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const removePDF = (index: number) => {
    setUploadedPDFs(prev => prev.filter((_, i) => i !== index));
  };

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/image/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: imagePrompt.trim(),
          model: 'gemini-2.5-flash-image',
          aspectRatio: '1:1',
          imageSize: '1K'
        })
      });

      const data = await response.json();
      if (data.error) {
        // Quota hatası için özel mesaj göster
        if (data.requiresBilling) {
          throw new Error(data.error + "\n\n💡 Çözüm: Google Cloud Console'da billing account ekleyin veya daha sonra tekrar deneyin.");
        }
        throw new Error(data.error);
      }

      // Üretilen resmi mesaj olarak göster
      const generatedMessage: Message = {
        role: "assistant",
        content: `**Oluşturulan Görsel:**\n\nPrompt: "${imagePrompt.trim()}"`,
        images: [data.image]
      };

      setMessages(prev => [...prev, generatedMessage]);
      setImagePrompt("");
      setShowImageGenerator(false);
    } catch (error: any) {
      console.error("Image generation error:", error);
      const errorMessage = error.message || "Görsel oluşturulurken hata oluştu.";
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `**Görsel Oluşturma Hatası**\n\n${errorMessage}\n\n**Not:** Görsel oluşturma özelliği Google Cloud billing account gerektirir. Detaylar için [Gemini API dokümantasyonunu](https://ai.google.dev/gemini-api/docs/image-generation) kontrol edin.`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if ((!inputMessage.trim() && uploadedImages.length === 0 && uploadedPDFs.length === 0) || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: inputMessage.trim() || (uploadedImages.length > 0 ? "Bu resimleri analiz et" : uploadedPDFs.length > 0 ? "Bu PDF'i analiz et" : ""),
      images: uploadedImages.length > 0 ? [...uploadedImages] : undefined
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputMessage("");
    setUploadedImages([]); // Clear uploaded images
    setUploadedPDFs([]); // Clear uploaded PDFs
    setIsLoading(true);
    
    // PDF'leri de message'a ekle (chat API'de handle edilecek)
    const messageData: any = {
      messages: newMessages,
      context: selectedContext,
      mode: selectedMode,
      conversationId: conversationId,
      language: language,
    };
    
    if (uploadedPDFs.length > 0) {
      messageData.pdfs = uploadedPDFs.map(pdf => ({ name: pdf.name, data: pdf.data }));
    }

    try {
      const response = await fetch('/api/chat', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messageData),
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
      const assistantImages = assistantMessage?.images || [];

      setMessages(prev => [...prev, { role: "assistant", content: "", images: assistantImages }]);

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
                content: assistantText.slice(0, index),
                images: assistantImages
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
                    {/* Resimleri göster */}
                    {message.images && message.images.length > 0 && (
                      <div className="mb-3 space-y-2">
                        {message.images.map((img, imgIndex) => (
                          <div key={imgIndex} className="relative inline-block">
                            <img 
                              src={img} 
                              alt={`Uploaded image ${imgIndex + 1}`}
                              className="max-w-xs rounded-lg border border-gray-200"
                              style={{ maxHeight: "300px" }}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Mesaj içeriği */}
                    {message.content && (
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
          {/* Yüklenen dosyalar önizlemesi */}
          {(uploadedImages.length > 0 || uploadedPDFs.length > 0) && (
            <div className="mb-3 space-y-3 bg-gray-50 rounded-xl p-3 border border-gray-200">
              {/* Resim önizlemeleri */}
              {uploadedImages.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Yüklenen Resimler ({uploadedImages.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {uploadedImages.map((img, index) => (
                      <div key={index} className="relative inline-block group">
                        <img 
                          src={img} 
                          alt={`Preview ${index + 1}`}
                          className="w-24 h-24 object-cover rounded-lg border-2 border-gray-300 hover:border-blue-500 transition-colors"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                          title="Resmi kaldır"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  {/* Resim analizi hızlı butonları */}
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
                    <button
                      onClick={async () => {
                        if (uploadedImages.length === 0) return;
                        setIsLoading(true);
                        try {
                          const response = await fetch('/api/image/analyze', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              image: uploadedImages[0],
                              task: 'analyze'
                            })
                          });
                          const data = await response.json();
                          if (data.error) throw new Error(data.error);
                          
                          const analysisMessage: Message = {
                            role: "assistant",
                            content: data.result,
                            images: uploadedImages
                          };
                          setMessages(prev => [...prev, analysisMessage]);
                        } catch (error: any) {
                          console.error("Analysis error:", error);
                          setMessages(prev => [...prev, {
                            role: "assistant",
                            content: "Resim analizi sırasında hata oluştu: " + error.message
                          }]);
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                      disabled={isLoading || uploadedImages.length === 0}
                      className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 shadow-sm"
                      title="Resmi analiz et"
                    >
                      <Search className="w-4 h-4" />
                      <span>Analiz Et</span>
                    </button>
                    
                    <button
                      onClick={async () => {
                        if (uploadedImages.length === 0) return;
                        setIsLoading(true);
                        try {
                          const response = await fetch('/api/image/analyze', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              image: uploadedImages[0],
                              task: 'ocr'
                            })
                          });
                          const data = await response.json();
                          if (data.error) throw new Error(data.error);
                          
                          const ocrMessage: Message = {
                            role: "assistant",
                            content: `**Resimdeki Metin:**\n\n${data.result}`,
                            images: uploadedImages
                          };
                          setMessages(prev => [...prev, ocrMessage]);
                        } catch (error: any) {
                          console.error("OCR error:", error);
                          setMessages(prev => [...prev, {
                            role: "assistant",
                            content: "Metin okuma sırasında hata oluştu: " + error.message
                          }]);
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                      disabled={isLoading || uploadedImages.length === 0}
                      className="px-4 py-2 text-sm font-medium rounded-lg bg-green-500 hover:bg-green-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 shadow-sm"
                      title="Resimdeki metni oku"
                    >
                      <Type className="w-4 h-4" />
                      <span>Metni Oku</span>
                    </button>
                    
                    <button
                      onClick={async () => {
                        if (uploadedImages.length === 0) return;
                        setIsLoading(true);
                        try {
                          const response = await fetch('/api/image/detect', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              image: uploadedImages[0]
                            })
                          });
                          const data = await response.json();
                          if (data.error) throw new Error(data.error);
                          
                          const detections = Array.isArray(data.detections) ? data.detections : [data.detections];
                          const detectionText = detections.map((det: any, idx: number) => 
                            `${idx + 1}. **${det.label || 'Nesne'}**: Box [${det.box_2d?.join(', ') || 'N/A'}]`
                          ).join('\n');
                          
                          const detectionMessage: Message = {
                            role: "assistant",
                            content: `**Tespit Edilen Nesneler:**\n\n${detectionText}`,
                            images: uploadedImages
                          };
                          setMessages(prev => [...prev, detectionMessage]);
                        } catch (error: any) {
                          console.error("Detection error:", error);
                          setMessages(prev => [...prev, {
                            role: "assistant",
                            content: "Nesne tespiti sırasında hata oluştu: " + error.message
                          }]);
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                      disabled={isLoading || uploadedImages.length === 0}
                      className="px-4 py-2 text-sm font-medium rounded-lg bg-purple-500 hover:bg-purple-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 shadow-sm"
                      title="Nesneleri tespit et"
                    >
                      <Search className="w-4 h-4" />
                      <span>Nesne Tespiti</span>
                    </button>
                  </div>
                </div>
              )}
              
              {/* PDF önizlemeleri */}
              {uploadedPDFs.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Yüklenen PDF'ler ({uploadedPDFs.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {uploadedPDFs.map((pdf, index) => (
                      <div key={index} className="relative inline-flex items-center space-x-2 px-3 py-2 bg-white rounded-lg border-2 border-gray-300 hover:border-blue-500 transition-colors group">
                        <FileText className="w-5 h-5 text-red-500" />
                        <span className="text-sm text-gray-700 truncate max-w-[200px]" title={pdf.name}>
                          {pdf.name}
                        </span>
                        <button
                          onClick={() => removePDF(index)}
                          className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                          title="PDF'i kaldır"
                        >
                          <XCircle className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Resim Üretme Modal/Form */}
          {showImageGenerator && (
            <div className="mb-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-800 flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span>Görsel Oluştur</span>
                </h3>
                <button
                  onClick={() => {
                    setShowImageGenerator(false);
                    setImagePrompt("");
                  }}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  placeholder="Örn: Bir robot resmi, güneş doğumu, kedi..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleGenerateImage();
                    }
                  }}
                />
                <button
                  onClick={handleGenerateImage}
                  disabled={!imagePrompt.trim() || isLoading}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center space-x-2 shadow-md"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Üret</span>
                </button>
              </div>
            </div>
          )}
          
          <div className="flex space-x-3">
            {/* Resim yükleme butonu */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors flex items-center space-x-2 flex-shrink-0"
              title="Resim yükle"
            >
              <ImageIcon className="w-5 h-5 text-gray-600" />
            </label>
            
            {/* PDF yükleme butonu */}
            <input
              ref={pdfInputRef}
              type="file"
              accept="application/pdf"
              multiple
              onChange={handlePDFUpload}
              className="hidden"
              id="pdf-upload"
            />
            <label
              htmlFor="pdf-upload"
              className="px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors flex items-center space-x-2 flex-shrink-0"
              title="PDF yükle"
            >
              <FileText className="w-5 h-5 text-red-500" />
            </label>
            
            {/* Resim üretme butonu */}
            <button
              onClick={() => setShowImageGenerator(!showImageGenerator)}
              className={`px-4 py-3 rounded-xl border transition-colors flex items-center space-x-2 flex-shrink-0 ${
                showImageGenerator 
                  ? 'bg-purple-100 border-purple-300' 
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
              title="Görsel oluştur"
            >
              <Sparkles className="w-5 h-5 text-purple-600" />
            </button>
            
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
              disabled={(!inputMessage.trim() && uploadedImages.length === 0 && uploadedPDFs.length === 0) || isLoading}
              className="px-6 py-3 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 flex-shrink-0"
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
