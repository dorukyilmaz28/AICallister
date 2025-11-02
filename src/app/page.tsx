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
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-300 hover:text-blue-200 transition-colors duration-200"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Takım Yönetimi</span>
                  </Link>
                )}
                <Link
                  href="/profile"
                  className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 border border-white/30 rounded-lg text-white transition-colors duration-200"
                >
                  <User className="w-4 h-4" />
                  <span>{session?.user.name}</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 border border-white/30 rounded-lg text-white transition-colors duration-200"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Giriş Yap</span>
                </Link>
                <Link
                  href="/auth/signup"
                  className="flex items-center space-x-2 px-4 py-2 bg-white/30 hover:bg-white/40 border border-white/40 rounded-lg text-white transition-colors duration-200"
                >
                  <User className="w-4 h-4" />
                  <span>Kayıt Ol</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden min-h-screen flex items-center">
        {/* Animated Background */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #3A006F 0%, #5A008F 50%, #8A00FF 100%)' }}>
          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ top: '10%', left: '10%', animationDuration: '4s' }}></div>
            <div className="absolute w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ top: '60%', right: '10%', animationDuration: '6s', animationDelay: '1s' }}></div>
            <div className="absolute w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ bottom: '20%', left: '50%', animationDuration: '5s', animationDelay: '2s' }}></div>
          </div>
        </div>
        
        <div className="relative container mx-auto px-4 py-12 sm:py-20">
          <div className="max-w-4xl mx-auto">
            {/* Content - Ortada */}
            <div className="text-white text-center">
              {/* Logo - Fade in + Scale */}
              <div className="flex items-center justify-center space-x-3 mb-6 sm:mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <img
                  src="/8f28b76859c1479d839d270409be3586.jpg"
                  alt="Callister Logo"
                  className="w-20 h-20 sm:w-28 sm:h-28 object-cover rounded-2xl shadow-2xl transform hover:scale-110 hover:rotate-3 transition-all duration-500 animate-float"
                />
              </div>
              
              {/* Team Info - Fade in */}
              <div className="mb-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <p className="text-blue-300 font-medium text-lg sm:text-xl mb-2">Callister Team</p>
                <p className="text-gray-300 text-sm sm:text-lg">AI-Powered FRC Assistant</p>
              </div>
              
              {/* Main Title - Slide in + Gradient Animation */}
              <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold mb-8 sm:mb-10 bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent animate-fade-in-up animate-gradient" style={{ animationDelay: '0.6s', backgroundSize: '200% auto' }}>
                Callister FRC AI Assistant
              </h1>
              
              {/* Description - Fade in */}
              <p className="text-xl sm:text-3xl text-gray-200 mb-10 sm:mb-14 leading-relaxed max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
                Robot tasarımından stratejiye, mekanikten simülasyona kadar FRC'nin her alanında 
                uzman desteği alın. 🤖 Yapay zeka ile güçlendirilmiş akıllı asistanınız. 🚀
              </p>
              
              {/* CTA Button - Fade in + Pulse */}
              <div className="flex flex-col sm:flex-row gap-6 justify-center animate-fade-in-up" style={{ animationDelay: '1s' }}>
                <Link
                  href="/chat"
                  className="group relative inline-flex items-center justify-center space-x-3 bg-gradient-to-r from-blue-500/40 to-purple-500/40 backdrop-blur-sm text-white px-10 sm:px-14 py-5 sm:py-6 rounded-2xl font-bold text-xl sm:text-2xl hover:from-blue-500/60 hover:to-purple-500/60 transition-all duration-500 shadow-2xl hover:shadow-blue-500/50 transform hover:scale-105 border-2 border-white/30 overflow-hidden"
                >
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                  <Play className="w-6 h-6 sm:w-7 sm:h-7 animate-pulse" />
                  <span className="relative">AI Asistanı ile Sohbet Et</span>
                </Link>
              </div>
              
              {/* Stats - Fade in */}
              <div className="grid grid-cols-3 gap-6 sm:gap-8 mt-16 sm:mt-20 animate-fade-in-up" style={{ animationDelay: '1.2s' }}>
                <div className="backdrop-blur-sm bg-white/10 rounded-2xl p-4 sm:p-6 border border-white/20 transform hover:scale-105 transition-all duration-300">
                  <div className="text-3xl sm:text-4xl font-bold text-blue-300 mb-2">24/7</div>
                  <div className="text-sm sm:text-base text-gray-300">Erişilebilir</div>
                </div>
                <div className="backdrop-blur-sm bg-white/10 rounded-2xl p-4 sm:p-6 border border-white/20 transform hover:scale-105 transition-all duration-300">
                  <div className="text-3xl sm:text-4xl font-bold text-purple-300 mb-2">∞</div>
                  <div className="text-sm sm:text-base text-gray-300">Sınırsız Soru</div>
                </div>
                <div className="backdrop-blur-sm bg-white/10 rounded-2xl p-4 sm:p-6 border border-white/20 transform hover:scale-105 transition-all duration-300">
                  <div className="text-3xl sm:text-4xl font-bold text-green-300 mb-2">🚀</div>
                  <div className="text-sm sm:text-base text-gray-300">Hızlı Yanıt</div>
                </div>
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

      {/* Why Choose Us Section */}
      <div className="py-20" style={{ background: 'linear-gradient(135deg, #3A006F 0%, #5A008F 50%, #8A00FF 100%)' }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Neden Callister AI?</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              FRC deneyimimiz ve AI teknolojimizle size en iyi desteği sunuyoruz
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Anında Yanıt</h3>
              <p className="text-gray-300">7/24 kesintisiz AI desteği ile sorularınıza anında yanıt alın</p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">FRC Uzmanlığı</h3>
              <p className="text-gray-300">Yıllarca FRC deneyimi olan uzmanlar tarafından eğitilmiş AI</p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Kişiselleştirilmiş</h3>
              <p className="text-gray-300">Takımınızın ihtiyaçlarına göre özelleştirilmiş öneriler</p>
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
            Powered by OpenRouter API • DeepSeek Model • Built with Next.js
          </p>
        </div>
      </div>
    </div>
  );
}
