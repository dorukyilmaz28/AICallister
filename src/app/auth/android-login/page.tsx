"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Smartphone } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { authApi } from "@/lib/api";
import { Capacitor } from "@capacitor/core";

export default function AndroidLogin() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Token varsa zaten giriş yapılmış, yönlendir
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        // Kullanıcı durumuna göre yönlendir
        if (user.status === 'pending') {
          router.push('/auth/pending-approval');
        } else if (user.status === 'approved') {
          router.push('/teams');
        } else {
          router.push('/');
        }
      } catch (e) {
        // JSON parse hatası, devam et
      }
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await authApi.login(email, password);
      
      // Başarılı giriş - kullanıcı durumuna göre yönlendir
      if (result.user) {
        if (result.user.status === 'pending') {
          router.push('/auth/pending-approval');
        } else if (result.user.status === 'approved') {
          router.push('/teams');
        } else {
          router.push('/');
        }
      } else {
        router.push('/');
      }
    } catch (error: any) {
      console.error('[AndroidLogin] Login error:', error);
      
      // Hata mesajını kullanıcı dostu hale getir
      let errorMessage = error.message || t("auth.signin.error");
      
      // HTTP status kodlarına göre özel mesajlar
      if (error.statusCode === 401) {
        errorMessage = language === "tr" 
          ? "Email veya şifre hatalı. Lütfen tekrar deneyin."
          : "Invalid email or password. Please try again.";
      } else if (error.statusCode === 400) {
        errorMessage = language === "tr"
          ? "Lütfen tüm alanları doldurun."
          : "Please fill in all fields.";
      } else if (error.statusCode === 500) {
        errorMessage = language === "tr"
          ? "Sunucu hatası. Lütfen daha sonra tekrar deneyin."
          : "Server error. Please try again later.";
      } else if (error.message?.includes('network') || error.message?.includes('timeout')) {
        errorMessage = language === "tr"
          ? "İnternet bağlantısı hatası. Lütfen bağlantınızı kontrol edin."
          : "Network error. Please check your connection.";
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const isAndroid = Capacitor.isNativePlatform();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo and Title - Android Optimized */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-lg">
            <Smartphone className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {language === "tr" ? "Android Giriş" : "Android Login"}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            {language === "tr" 
              ? "Hesabınıza giriş yapın" 
              : "Sign in to your account"}
          </p>
        </div>

        {/* Form Card - Mobile Optimized */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-200 dark:border-gray-800 shadow-xl">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input - Larger touch target for mobile */}
            <div>
              <label htmlFor="android-email" className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                {t("auth.signin.email")}
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
                <input
                  id="android-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  autoCapitalize="none"
                  className="w-full pl-14 pr-4 py-4 text-base bg-white dark:bg-gray-950 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder={t("auth.emailPlaceholder")}
                />
              </div>
            </div>

            {/* Password Input - Larger touch target */}
            <div>
              <label htmlFor="android-password" className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                {t("auth.signin.password")}
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
                <input
                  id="android-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full pl-14 pr-14 py-4 text-base bg-white dark:bg-gray-950 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder={t("auth.passwordPlaceholder")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                </button>
              </div>
            </div>

            {/* Submit Button - Large and prominent for mobile */}
            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl text-white font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 shadow-lg active:scale-95"
            >
              <span>{isLoading ? (language === "tr" ? "Giriş yapılıyor..." : "Signing in...") : t("auth.signin.submit")}</span>
              {!isLoading && <ArrowRight className="w-6 h-6" />}
            </button>
          </form>

          {/* Footer - Sign up link */}
          <div className="mt-8 text-center space-y-3">
            <p className="text-gray-600 dark:text-gray-300 text-base">
              {t("auth.signin.noAccount")}{" "}
              <button
                onClick={() => router.push('/auth/signup')}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition-colors"
              >
                {t("auth.signin.signupLink")}
              </button>
            </p>
            
            {/* Alternative login link */}
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {language === "tr" ? "Web versiyonu için " : "For web version, "}
              <button
                onClick={() => router.push('/auth/signin')}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                {language === "tr" ? "buraya tıklayın" : "click here"}
              </button>
            </p>
          </div>
        </div>

        {/* Platform Info */}
        {isAndroid && (
          <div className="mt-6 text-center">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg">
              <Smartphone className="w-4 h-4 text-green-600 dark:text-green-400" />
              <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                {language === "tr" 
                  ? "Android uygulaması tespit edildi" 
                  : "Android app detected"}
              </p>
            </div>
          </div>
        )}

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/')}
            className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            ← {t("auth.backToHome")}
          </button>
        </div>
      </div>
    </div>
  );
}
