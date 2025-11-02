"use client";

import Link from "next/link";
import { Bot, Target, Wrench, Cpu, ArrowRight, Play, Trophy, Zap, User, LogIn, Shield, Users, Settings } from "lucide-react";
import { useSession } from "next-auth/react";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export default function Home() {
  const { session, isAuthenticated } = useAuthGuard({ requireAuth: false });

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #3A006F 0%, #5A008F 50%, #8A00FF 100%)' }}>
      {/* Header */}
      <div className="border-b border-white/20 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src="/8f28b76859c1479d839d270409be3586.jpg"
              alt="Callister Logo"
              className="w-10 h-10 object-cover rounded-xl"
            />
            <h1 className="text-xl font-bold text-white">
              Callister FRC AI
            </h1>
          </div>
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                {session?.user.status === "pending" && (
                  <div className="flex items-center space-x-2 px-4 py-2 bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-yellow-300">
                    <Shield className="w-4 h-4" />
                    <span>Onay Bekleniyor</span>
                  </div>
                )}
                {session?.user.role === "admin" && (
                  <Link
                    href="/teams/admin"
                    className="flex items-center space-x-2 px-2 md:px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-300 hover:text-blue-200 transition-colors duration-200"
                  >
                    <Settings className="w-4 h-4" />
                    <span className="hidden md:inline">Yönetim</span>
                  </Link>
                )}
                <Link
                  href="/profile"
                  className="flex items-center space-x-2 px-2 md:px-4 py-2 bg-white/20 hover:bg-white/30 border border-white/30 rounded-lg text-white transition-colors duration-200"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">{session?.user.name}</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  className="flex items-center space-x-2 px-2 md:px-4 py-2 bg-white/20 hover:bg-white/30 border border-white/30 rounded-lg text-white transition-colors duration-200"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="hidden md:inline">Giriş</span>
                </Link>
                <Link
                  href="/auth/signup"
                  className="flex items-center space-x-2 px-2 md:px-4 py-2 bg-white/30 hover:bg-white/40 border border-white/40 rounded-lg text-white transition-colors duration-200"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden md:inline">Kayıt</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #3A006F 0%, #5A008F 50%, #8A00FF 100%)' }}></div>
        <div className="relative container mx-auto px-4 py-12 sm:py-20">
          <div className="max-w-4xl mx-auto">
            {/* Content - Ortada */}
            <div className="text-white text-center">
              <div className="flex items-center justify-center mb-8 sm:mb-10">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-40 h-40 sm:w-56 sm:h-56 object-cover rounded-full"
                  style={{ boxShadow: '0 0 60px rgba(139, 92, 246, 0.5)' }}
                >
                  <source src="/Callister.MP4.mp4" type="video/mp4" />
                </video>
              </div>
              
              <div className="mb-6">
                <p className="text-blue-200 font-bold text-lg sm:text-xl mb-1">Callister Team</p>
                <p className="text-white/70 font-medium text-sm sm:text-base">AI-Powered FRC Assistant</p>
              </div>
              
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-6 sm:mb-8 text-white drop-shadow-lg">
                Callister FRC AI Assistant
              </h1>
              
              <p className="text-lg sm:text-2xl text-white/80 mb-8 sm:mb-12 leading-relaxed max-w-3xl mx-auto font-medium">
                Robot tasarımından stratejiye, mekanikten simülasyona kadar FRC'nin her alanında 
                uzman desteği alın. Yapay zeka ile güçlendirilmiş akıllı asistanınız.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/chat"
                  className="inline-flex items-center justify-center space-x-3 bg-gradient-to-r from-blue-500/30 to-purple-500/30 backdrop-blur-sm text-white px-8 sm:px-12 py-4 sm:py-5 rounded-2xl font-bold text-lg sm:text-xl hover:from-blue-500/40 hover:to-purple-500/40 transition-all duration-300 shadow-2xl hover:shadow-white/25 transform hover:-translate-y-1 border border-white/30"
                >
                  <Play className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span>AI Asistanı ile Sohbet Et</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 sm:py-20" style={{ background: 'linear-gradient(135deg, #3A006F 0%, #5A008F 50%, #8A00FF 100%)' }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-bold text-white mb-4">Uzmanlık Alanları</h2>
            <p className="text-base sm:text-xl text-gray-300 max-w-2xl mx-auto">
              FRC'nin her alanında uzman desteği alın
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            <div className="group bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:-translate-y-2 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                <Bot className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">Genel FRC</h3>
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                Robot tasarımı, yarışma kuralları ve genel FRC konularında kapsamlı rehberlik.
              </p>
            </div>

            <div className="group bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:-translate-y-2 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                <Target className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">Strateji</h3>
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                Oyun analizi, takım koordinasyonu ve rekabet stratejileri konularında uzmanlık.
              </p>
            </div>

            <div className="group bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:-translate-y-2 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                <Wrench className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">Mekanik</h3>
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                Motor seçimi, güç aktarımı ve mekanik tasarım konularında teknik destek.
              </p>
            </div>

            <div className="group bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:-translate-y-2 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                <Cpu className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">Simülasyon</h3>
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                Robot simülasyonu, fizik motorları ve test ortamları konularında rehberlik.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Technology Section */}
      <div className="py-20" style={{ background: 'linear-gradient(135deg, #3A006F 0%, #5A008F 50%, #8A00FF 100%)' }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Kullandığımız Teknolojiler</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Güçlü yapay zeka ve güncel FRC verileri ile donatılmış sistememiz
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">OpenAI Model</h3>
              <p className="text-gray-300">OpenRouter API ile GPT tabanlı yapay zeka - doğal dil işleme ve kod üretimi</p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">The Blue Alliance API</h3>
              <p className="text-gray-300">Gerçek zamanlı FRC takım verileri, yarışma sonuçları ve performans istatistikleri</p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Wrench className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">WPILib RAG Sistemi</h3>
              <p className="text-gray-300">Resmi WPILib dokümantasyonu ile zenginleştirilmiş akıllı cevap sistemi</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20" style={{ background: 'linear-gradient(135deg, #3A006F 0%, #5A008F 50%, #8A00FF 100%)' }}>
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Callister AI ile FRC Yolculuğunuza Başlayın
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Callister AI asistanınızla robot tasarımından yarışma stratejisine kadar her adımda yanınızda.
          </p>
          <Link
            href="/chat"
            className="inline-flex items-center space-x-3 bg-white/20 backdrop-blur-sm text-white px-12 py-5 rounded-2xl font-bold text-xl hover:bg-white/30 transition-all duration-300 shadow-2xl hover:shadow-white/25 transform hover:-translate-y-1 border border-white/30"
          >
            <span>Callister AI ile Sohbet Et</span>
            <ArrowRight className="w-6 h-6" />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="py-8 border-t border-white/10" style={{ background: 'linear-gradient(135deg, #3A006F 0%, #5A008F 50%, #8A00FF 100%)' }}>
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm">
            © 2025 Callister FRC AI. Tüm hakları saklıdır.
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Powered by OpenAI, The Blue Alliance & WPILib
          </p>
        </div>
      </div>
    </div>
  );
}
