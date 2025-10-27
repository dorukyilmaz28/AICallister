import Link from "next/link";
import { Bot, Target, Wrench, Cpu, ArrowRight, Play, Trophy, Zap, User, LogIn } from "lucide-react";

export default function Home() {
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
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #3A006F 0%, #5A008F 50%, #8A00FF 100%)' }}></div>
        <div className="relative container mx-auto px-4 py-12 sm:py-20">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            {/* Left Content */}
            <div className="text-white">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
                <img
                  src="/8f28b76859c1479d839d270409be3586.jpg"
                  alt="Callister Logo"
                  className="w-12 h-12 sm:w-20 sm:h-20 object-cover rounded-2xl"
                />
                <div className="h-8 sm:h-12 w-px bg-gradient-to-b from-blue-400 to-purple-400"></div>
                <div>
                  <p className="text-blue-300 font-medium text-sm sm:text-base">Callister Team</p>
                  <p className="text-gray-300 text-xs sm:text-sm">AI-Powered FRC Assistant</p>
                </div>
              </div>
              
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                Callister FRC AI Assistant
              </h1>
              
              <p className="text-base sm:text-xl text-gray-300 mb-6 sm:mb-8 leading-relaxed">
                Robot tasarımından stratejiye, mekanikten simülasyona kadar FRC'nin her alanında 
                uzman desteği alın. Yapay zeka ile güçlendirilmiş akıllı asistanınız.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/chat"
                  className="inline-flex items-center space-x-2 sm:space-x-3 bg-white/20 backdrop-blur-sm text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-semibold text-base sm:text-lg hover:bg-white/30 transition-all duration-300 shadow-2xl hover:shadow-white/25 transform hover:-translate-y-1 border border-white/30"
                >
                  <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>AI Asistanı ile Sohbet Et</span>
                </Link>
              </div>
            </div>
            
            {/* Right Content - FRC Images */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                {/* Image 1 */}
                <div className="space-y-4">
                  <div className="relative group">
                    <div className="aspect-square bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-2xl p-6 border border-white/10 backdrop-blur-sm">
                      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                        <Trophy className="w-16 h-16 text-white" />
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                      <p className="text-white text-sm font-medium">FRC Championship</p>
                    </div>
                  </div>
                  
                  <div className="relative group">
                    <div className="aspect-square bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-2xl p-6 border border-white/10 backdrop-blur-sm">
                      <div className="w-full h-full bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center">
                        <Wrench className="w-16 h-16 text-white" />
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                      <p className="text-white text-sm font-medium">Robot Workshop</p>
                    </div>
                  </div>
                </div>
                
                {/* Image 2 */}
                <div className="space-y-4 mt-8">
                  <div className="relative group">
                    <div className="aspect-square bg-gradient-to-br from-orange-500/20 to-red-600/20 rounded-2xl p-6 border border-white/10 backdrop-blur-sm">
                      <div className="w-full h-full bg-gradient-to-br from-orange-400 to-red-600 rounded-xl flex items-center justify-center">
                        <Target className="w-16 h-16 text-white" />
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                      <p className="text-white text-sm font-medium">Strategy Planning</p>
                    </div>
                  </div>
                  
                  <div className="relative group">
                    <div className="aspect-square bg-gradient-to-br from-purple-500/20 to-pink-600/20 rounded-2xl p-6 border border-white/10 backdrop-blur-sm">
                      <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-600 rounded-xl flex items-center justify-center">
                        <Cpu className="w-16 h-16 text-white" />
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                      <p className="text-white text-sm font-medium">Code & Simulation</p>
                    </div>
                  </div>
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
