"use client";

import { useState } from "react";
import Link from "next/link";
import { Bot, Target, Wrench, Cpu, ArrowRight, Play, Trophy, Zap, User, LogIn, Shield, Users, Settings, MessageSquare, Code, Sparkles, ChevronRight, Languages, Menu, X, BookOpen, ExternalLink } from "lucide-react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useLanguage } from "@/contexts/LanguageContext";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {
  const { session, isAuthenticated } = useAuthGuard({ requireAuth: false });
  const { language, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      {/* Header - Minimal and Clean */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <div className="flex items-center space-x-3">
              <img
                src="/8f28b76859c1479d839d270409be3586.jpg"
                alt="Callister Logo"
                className="w-12 h-12 lg:w-16 lg:h-16 object-cover rounded-xl"
              />
              <h1 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white">
                Callister AI
              </h1>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/chat" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                {t("common.chat")}
              </Link>
              <a
                href="https://frcacademy.com/html/main.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors inline-flex items-center gap-1"
              >
                {t("common.academy")}
                <ExternalLink className="h-3 w-3" />
              </a>
              <Link href="/code-snippets" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                {t("common.snippets")}
              </Link>
              <Link href="/teams" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                {t("common.teams")}
              </Link>
              {isAuthenticated && (
                <Link href="/dashboard" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                  {t("common.dashboard")}
                </Link>
              )}
              {session?.user && session.user.role === "admin" && (
                <Link href="/teams/admin" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                  {t("common.admin")}
                </Link>
              )}
            </nav>

            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Language Switcher */}
              <button
                onClick={() => setLanguage(language === "tr" ? "en" : "tr")}
                className="flex items-center space-x-2 px-2 sm:px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title={language === "tr" ? "Switch to English" : "Türkçe'ye Geç"}
              >
                <Languages className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span className="hidden sm:inline text-sm font-medium text-gray-700 dark:text-gray-300">{language.toUpperCase()}</span>
              </button>
              {/* Theme Toggle */}
              <ThemeToggle />
              {/* Mobile menu button - En sağda */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
              {isAuthenticated ? (
                <>
                  {session?.user?.status === "pending" && (
                    <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-xs font-medium">
                      <Shield className="w-3 h-3" />
                      <span>{t("home.pending")}</span>
                    </div>
                  )}
                  <Link
                    href="/profile"
                    className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-gray-900 hover:bg-gray-800 rounded-lg text-white text-sm font-medium transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">{session?.user?.name}</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/signin"
                    className="px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    <span className="hidden sm:inline">{t("home.signin")}</span>
                    <span className="sm:hidden">{t("home.signin")}</span>
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="px-3 sm:px-4 py-2 bg-gray-900 hover:bg-gray-800 rounded-lg text-white text-sm font-medium transition-colors"
                  >
                    {t("home.getStarted")}
                  </Link>
                </>
              )}
            </div>
          </div>
          
          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-100 dark:border-gray-800 py-4">
              <nav className="flex flex-col space-y-3">
                <Link
                  href="/chat"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  {t("common.chat")}
                </Link>
                <a
                  href="https://frcacademy.com/html/main.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors inline-flex items-center gap-1"
                >
                  {t("common.academy")}
                  <ExternalLink className="h-3 w-3" />
                </a>
                <Link
                  href="/code-snippets"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  {t("common.snippets")}
                </Link>
                <Link
                  href="/teams"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  {t("common.teams")}
                </Link>
                {isAuthenticated && (
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    {t("common.dashboard")}
                  </Link>
                )}
                {session?.user && session.user.role === "admin" && (
                  <Link
                    href="/teams/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    {t("common.admin")}
                  </Link>
                )}
                {/* Theme Toggle in Mobile Menu */}
                <div className="px-4 py-2">
                  <ThemeToggle />
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-24 lg:pt-32 lg:pb-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/30 dark:to-blue-900/30 rounded-full mb-8">
              <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("home.badge")}</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight leading-[1.1]">
              {t("home.title")}
            </h1>
            
            <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
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
                className="inline-flex items-center justify-center space-x-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              >
                <Code className="w-5 h-5" />
                <span>{t("home.browseSnippets")}</span>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-20 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-2">10x</div>
                <div className="text-sm lg:text-base text-gray-600 dark:text-gray-400">{t("home.stats.faster")}</div>
              </div>
              <div className="text-center border-x border-gray-200 dark:border-gray-800">
                <div className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-2">24/7</div>
                <div className="text-sm lg:text-base text-gray-600 dark:text-gray-400">{t("home.stats.availability")}</div>
              </div>
              <div className="text-center">
                <div className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-2">100%</div>
                <div className="text-sm lg:text-base text-gray-600 dark:text-gray-400">{t("home.stats.focused")}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 lg:py-32 bg-gray-50 dark:bg-gray-800/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 lg:mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              {t("home.features.title")}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {t("home.features.subtitle")}
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group bg-white dark:bg-gray-800 rounded-2xl p-8 lg:p-10 hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <MessageSquare className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t("home.feature1.title")}</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                {t("home.feature1.description")}
              </p>
              <Link href="/chat" className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold group">
                <span>{t("home.feature1.link")}</span>
                <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Feature 2 */}
            <div className="group bg-white dark:bg-gray-800 rounded-2xl p-8 lg:p-10 hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Code className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t("home.feature2.title")}</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                {t("home.feature2.description")}
              </p>
              <Link href="/code-snippets" className="inline-flex items-center text-purple-600 hover:text-purple-700 font-semibold group">
                <span>{t("home.feature2.link")}</span>
                <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Feature 3 */}
            <div className="group bg-white dark:bg-gray-800 rounded-2xl p-8 lg:p-10 hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Trophy className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t("home.feature3.title")}</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                {t("home.feature3.description")}
              </p>
              <Link href="/chat" className="inline-flex items-center text-green-600 hover:text-green-700 font-semibold group">
                <span>{t("home.feature3.link")}</span>
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
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              {t("home.expertise.title")}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {t("home.expertise.subtitle")}
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-900/20 rounded-2xl p-8 border border-blue-200 dark:border-blue-700">
              <Bot className="w-10 h-10 text-blue-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t("home.expertise.general.title")}</h3>
              <p className="text-gray-700 dark:text-gray-300">{t("home.expertise.general.desc")}</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-900/20 rounded-2xl p-8 border border-green-200 dark:border-green-700">
              <Target className="w-10 h-10 text-green-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t("home.expertise.strategy.title")}</h3>
              <p className="text-gray-700 dark:text-gray-300">{t("home.expertise.strategy.desc")}</p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-900/20 rounded-2xl p-8 border border-orange-200 dark:border-orange-700">
              <Wrench className="w-10 h-10 text-orange-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t("home.expertise.mechanical.title")}</h3>
              <p className="text-gray-700 dark:text-gray-300">{t("home.expertise.mechanical.desc")}</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-900/20 rounded-2xl p-8 border border-purple-200 dark:border-purple-700">
              <Cpu className="w-10 h-10 text-purple-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t("home.expertise.programming.title")}</h3>
              <p className="text-gray-700 dark:text-gray-300">{t("home.expertise.programming.desc")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="py-24 lg:py-32 bg-gray-50 dark:bg-gray-800/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 lg:mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              {t("home.technology.title")}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {t("home.technology.subtitle")}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center border border-gray-200 dark:border-gray-700">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t("home.technology.tba.title")}</h3>
              <p className="text-gray-600 dark:text-gray-300">{t("home.technology.tba.desc")}</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center border border-gray-200 dark:border-gray-700">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Wrench className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t("home.technology.wpilib.title")}</h3>
              <p className="text-gray-600 dark:text-gray-300">{t("home.technology.wpilib.desc")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              {t("home.cta.title")}
            </h2>
            <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 mb-12 leading-relaxed">
              {t("home.cta.subtitle")}
            </p>
            <Link
              href="/chat"
              className="inline-flex items-center space-x-3 bg-gray-900 hover:bg-gray-800 text-white px-10 py-5 rounded-xl font-bold text-lg transition-all duration-200 shadow-xl hover:shadow-2xl"
            >
              <span>{t("home.cta.button")}</span>
              <ArrowRight className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <img
                src="/8f28b76859c1479d839d270409be3586.jpg"
                alt="Callister Logo"
                className="w-8 h-8 object-cover rounded-xl"
              />
              <span className="text-lg font-bold text-gray-900 dark:text-white">Callister AI</span>
            </div>
            <div className="flex items-center space-x-4 flex-wrap justify-center gap-2">
              <Link
                href="/privacy"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                {language === "tr" ? "Gizlilik Politikası" : "Privacy Policy"}
              </Link>
              <span className="text-gray-400">|</span>
              <Link
                href="/delete-account"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                {language === "tr" ? "Hesap Silme" : "Delete Account"}
              </Link>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {t("home.footer.copyright")}
              </div>
            </div>
          </div>
          <div className="mt-4 text-center text-xs text-gray-500">
            {t("home.footer.powered")}
          </div>
        </div>
      </footer>
    </div>
  );
}
