"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Send, Bot, User, Home, UserCircle, Trash2, Menu, X, Languages, Image as ImageIcon, XCircle, FileText, Search, Type } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';
import { useLanguage } from "@/contexts/LanguageContext";

interface Message {
  role: "user" | "assistant";
  content: string;
  images?: string[]; // Base64 data URIs veya URLs
  pdfs?: { name: string; data: string }[]; // PDF dosyaları
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
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

    const MAX_PDF_SIZE = 20 * 1024 * 1024; // 20MB

    Array.from(files).forEach((file) => {
      if (file.type === 'application/pdf') {
        // Dosya boyutu kontrolü
        if (file.size > MAX_PDF_SIZE) {
          alert(`PDF dosyası çok büyük: ${(file.size / 1024 / 1024).toFixed(2)}MB\nMaksimum boyut: 20MB`);
          return;
        }

        const reader = new FileReader();
        
        reader.onerror = () => {
          console.error("PDF okuma hatası");
          alert(`PDF dosyası okunamadı: ${file.name}`);
        };

        reader.onload = (e) => {
          try {
            const result = e.target?.result as string;
            if (result) {
              setUploadedPDFs(prev => [...prev, { name: file.name, data: result }]);
            }
          } catch (error) {
            console.error("PDF işleme hatası:", error);
            alert(`PDF dosyası işlenirken hata oluştu: ${file.name}`);
          }
        };
        
        reader.readAsDataURL(file);
      } else {
        alert(`Geçersiz dosya tipi: ${file.name}\nLütfen PDF dosyası yükleyin.`);
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

  const sendMessage = async () => {
    if ((!inputMessage.trim() && uploadedImages.length === 0 && uploadedPDFs.length === 0) || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: inputMessage.trim() || (uploadedImages.length > 0 ? "Bu resimleri analiz et" : uploadedPDFs.length > 0 ? "Bu PDF'i analiz et" : ""),
      images: uploadedImages.length > 0 ? [...uploadedImages] : undefined,
      pdfs: uploadedPDFs.length > 0 ? [...uploadedPDFs] : undefined
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputMessage("");
    setUploadedImages([]); // Clear uploaded images
    setUploadedPDFs([]); // Clear uploaded PDFs
    setIsLoading(true);
    
    // Kullanıcı mesajı gönderildiğinde bir kere scroll yap
    setTimeout(() => {
      scrollToBottom();
    }, 100);
    
    // PDF'leri de message'a ekle (chat API'de handle edilecek)
    const messageData: any = {
      messages: newMessages,
      context: selectedContext,
      mode: selectedMode,
      conversationId: conversationId,
      language: language,
    };
    
    if (uploadedPDFs.length > 0) {
      // Sadece geçerli PDF'leri gönder
      const validPDFs = uploadedPDFs.filter(pdf => pdf.data && pdf.data.length > 0);
      if (validPDFs.length > 0) {
        messageData.pdfs = validPDFs.map(pdf => ({ name: pdf.name, data: pdf.data }));
      } else {
        console.warn("Yüklenen PDF'ler geçersiz, gönderilmiyor");
      }
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
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.error || `HTTP hatası! Durum: ${response.status}`;
        throw new Error(errorMsg);
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
                content: assistantText.slice(0, index),
                images: assistantImages
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
        if (error.message.includes("çok büyük") || error.message.includes("too large")) {
          errorMessage = `PDF hatası: ${error.message}\n\nLütfen daha küçük bir PDF dosyası yükleyin (maksimum 20MB).`;
        } else if (error.message.includes("işlenemedi") || error.message.includes("processing")) {
          errorMessage = `PDF hatası: ${error.message}\n\nLütfen geçerli bir PDF dosyası yüklediğinizden emin olun.`;
        } else if (error.message.includes("API") || error.message.includes("Gemini")) {
          errorMessage = `AI servisi hatası: ${error.message}\n\nLütfen birkaç dakika sonra tekrar deneyin.`;
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
                    {/* PDF'leri göster */}
                    {message.pdfs && message.pdfs.length > 0 && (
                      <div className="mb-3 space-y-2">
                        {message.pdfs.map((pdf, pdfIndex) => (
                          <div key={pdfIndex} className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg border ${
                            message.role === "user" 
                              ? "bg-gray-800 border-gray-700" 
                              : "bg-gray-100 border-gray-300"
                          }`}>
                            <FileText className={`w-5 h-5 flex-shrink-0 ${
                              message.role === "user" ? "text-red-400" : "text-red-500"
                            }`} />
                            <span className={`text-sm font-medium ${
                              message.role === "user" ? "text-gray-100" : "text-gray-700"
                            } truncate max-w-[250px]`} title={pdf.name}>
                              {pdf.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    
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
