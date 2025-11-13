"use client";

import Link from "next/link";
import { Bot, Target, Wrench, Cpu, ArrowRight, Play, Trophy, Zap, User, LogIn, Shield, Users, Settings, MessageSquare, Code, Sparkles, ChevronRight, Languages } from "lucide-react";
import { useSession } from "next-auth/react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Home() {
  const { session, isAuthenticated } = useAuthGuard({ requireAuth: false });
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Minimal and Clean */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <div className="flex items-center space-x-3">
              <img
                src="/8f28b76859c1479d839d270409be3586.jpg"
                alt="Callister Logo"
                className="w-8 h-8 lg:w-10 lg:h-10 object-cover rounded-xl"
              />
              <h1 className="text-lg lg:text-xl font-bold text-gray-900">
                Callister AI
              </h1>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/chat" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                {t("common.chat")}
              </Link>
              <Link href="/code-snippets" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                {t("common.snippets")}
              </Link>
              {session?.user.role === "admin" && (
                <Link href="/teams/admin" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                  Admin
                </Link>
              )}
            </nav>

            <div className="flex items-center space-x-3">
              {/* Language Switcher */}
              <button
                onClick={() => setLanguage(language === "tr" ? "en" : "tr")}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                title={language === "tr" ? "Switch to English" : "Türkçe'ye Geç"}
              >
                <Languages className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">{language.toUpperCase()}</span>
              </button>
              {isAuthenticated ? (
                <>
                  {session?.user.status === "pending" && (
                    <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-xs font-medium">
                      <Shield className="w-3 h-3" />
                      <span>Pending</span>
                    </div>
                  )}
                  <Link
                    href="/profile"
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 rounded-lg text-white text-sm font-medium transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">{session?.user.name}</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/signin"
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="px-4 py-2 bg-gray-900 hover:bg-gray-800 rounded-lg text-white text-sm font-medium transition-colors"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-24 lg:pt-32 lg:pb-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-50 to-blue-50 rounded-full mb-8">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">Powered by Advanced AI</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 tracking-tight leading-[1.1]">
              {t("home.title").split("FRC AI assistance")[0]}
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                {language === "tr" ? "FRC AI asistanlığında" : "FRC AI assistance"}
              </span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              {t("home.subtitle")}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/chat"
                className="group inline-flex items-center justify-center space-x-3 bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <span>{t("home.startChat")}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/code-snippets"
                className="inline-flex items-center justify-center space-x-3 bg-white hover:bg-gray-50 text-gray-900 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 border-2 border-gray-200 hover:border-gray-300"
              >
                <Code className="w-5 h-5" />
                <span>{t("home.browseSnippets")}</span>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-20 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-4xl lg:text-5xl font-bold text-gray-900 mb-2">10x</div>
                <div className="text-sm lg:text-base text-gray-600">Faster Development</div>
              </div>
              <div className="text-center border-x border-gray-200">
                <div className="text-4xl lg:text-5xl font-bold text-gray-900 mb-2">24/7</div>
                <div className="text-sm lg:text-base text-gray-600">AI Availability</div>
              </div>
              <div className="text-center">
                <div className="text-4xl lg:text-5xl font-bold text-gray-900 mb-2">100%</div>
                <div className="text-sm lg:text-base text-gray-600">FRC Focused</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 lg:py-32 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 lg:mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Designed to accelerate. Built to scale.
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything your FRC team needs to build, program, and compete at the highest level.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group bg-white rounded-2xl p-8 lg:p-10 hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <MessageSquare className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">AI-Powered Chat</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Get instant answers to your FRC questions. Our AI understands WPILib, robot mechanics, and competition strategies.
              </p>
              <Link href="/chat" className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold group">
                <span>Start chatting</span>
                <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Feature 2 */}
            <div className="group bg-white rounded-2xl p-8 lg:p-10 hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Code className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Code Snippets</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Access a library of ready-to-use code examples for motors, sensors, autonomous modes, and more.
              </p>
              <Link href="/code-snippets" className="inline-flex items-center text-purple-600 hover:text-purple-700 font-semibold group">
                <span>Browse library</span>
                <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Feature 3 */}
            <div className="group bg-white rounded-2xl p-8 lg:p-10 hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Trophy className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Live TBA Data</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Real-time team statistics, match results, and rankings from The Blue Alliance API.
              </p>
              <Link href="/chat" className="inline-flex items-center text-green-600 hover:text-green-700 font-semibold group">
                <span>Explore data</span>
                <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Expertise Areas */}
      <section className="py-24 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 lg:mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Expert in every FRC domain
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From mechanical design to software development, our AI covers all aspects of FRC robotics.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 border border-blue-200">
              <Bot className="w-10 h-10 text-blue-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">General FRC</h3>
              <p className="text-gray-700">Robot design, competition rules, and game strategy.</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 border border-green-200">
              <Target className="w-10 h-10 text-green-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Strategy</h3>
              <p className="text-gray-700">Game analysis, match planning, and alliance coordination.</p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-8 border border-orange-200">
              <Wrench className="w-10 h-10 text-orange-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Mechanical</h3>
              <p className="text-gray-700">Motor selection, power transmission, and mechanism design.</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8 border border-purple-200">
              <Cpu className="w-10 h-10 text-purple-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Programming</h3>
              <p className="text-gray-700">WPILib, simulation, autonomous, and sensor integration.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="py-24 lg:py-32 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 lg:mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Powered by cutting-edge technology
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built on industry-leading AI models and real-time FRC data sources.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-200">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">OpenAI GPT</h3>
              <p className="text-gray-600">Advanced language models for natural conversation and code generation.</p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-200">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">The Blue Alliance</h3>
              <p className="text-gray-600">Real-time FRC team data, match results, and competition insights.</p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-200">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Wrench className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">WPILib Docs</h3>
              <p className="text-gray-600">Integrated official documentation for accurate programming guidance.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              Ready to transform your FRC journey?
            </h2>
            <p className="text-xl lg:text-2xl text-gray-600 mb-12 leading-relaxed">
              Join teams using Callister AI to build better robots, write cleaner code, and win more matches.
            </p>
            <Link
              href="/chat"
              className="inline-flex items-center space-x-3 bg-gray-900 hover:bg-gray-800 text-white px-10 py-5 rounded-xl font-bold text-lg transition-all duration-200 shadow-xl hover:shadow-2xl"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <img
                src="/8f28b76859c1479d839d270409be3586.jpg"
                alt="Callister Logo"
                className="w-8 h-8 object-cover rounded-xl"
              />
              <span className="text-lg font-bold text-gray-900">Callister AI</span>
            </div>
            <div className="text-sm text-gray-600">
              © 2025 Callister FRC AI. All rights reserved.
            </div>
          </div>
          <div className="mt-4 text-center text-xs text-gray-500">
            Powered by OpenAI, The Blue Alliance & WPILib
          </div>
        </div>
      </footer>
    </div>
  );
}
