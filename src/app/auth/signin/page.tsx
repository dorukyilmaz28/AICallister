"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Languages } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { authApi } from "@/lib/api";

export default function SignIn() {
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [statusCode, setStatusCode] = useState<number | string | null>(null);
  const [rawResponse, setRawResponse] = useState<string>("");
  const [apiUrl, setApiUrl] = useState<string>("");

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
    setStatusCode(null);
    setRawResponse("");
    setApiUrl("");

    try {
      // API URL'ini al - getApiBaseUrl() fonksiyonunu kullanmak için import etmemiz gerekir
      // Şimdilik environment variable'dan alıyoruz, ama gerçek URL console'da log'lanacak
      const baseUrl = 'https://www.callisterai.com';
      const fullUrl = `${baseUrl}/api/login`;
      setApiUrl(fullUrl);
      
      console.log('[SignIn] Attempting login to:', fullUrl);
      
      const result = await authApi.login(email, password);
      
      // Başarılı giriş - yönlendirme
      window.location.href = "/teams";
    } catch (error: any) {
      console.error('[SignIn] Login error caught:', error);
      console.error('[SignIn] Error statusCode:', error.statusCode);
      console.error('[SignIn] Error rawResponse:', error.rawResponse);
      
      // Status kodunu al (error objesinden, mesajdan regex ile, veya string olarak)
      let code: number | string | null = null;
      
      if (error.statusCode) {
        // Direkt statusCode varsa kullan
        code = error.statusCode;
      } else if (error.message) {
        // Mesajdan regex ile çıkar
        const match = error.message.match(/\[HTTP (\d+)\]/);
        if (match) {
          code = parseInt(match[1], 10);
        } else {
          // String status code'ları da kontrol et (TIMEOUT, NETWORK_ERROR, vb.)
          const stringMatch = error.message.match(/\[HTTP ([\w_]+)\]/);
          if (stringMatch) {
            code = stringMatch[1];
          }
        }
      }
      
      setStatusCode(code);
      setError(error.message || t("auth.signin.error"));
      
      // Raw response'u al (eğer varsa)
      if (error.rawResponse) {
        setRawResponse(error.rawResponse);
      } else if (error.message) {
        setRawResponse(error.message);
      } else {
        setRawResponse('(Yanıt bilgisi yok)');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 transition-colors">
      <div className="w-full max-w-md px-4">
        {/* Language Toggle */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setLanguage(language === "tr" ? "en" : "tr")}
            className="flex items-center space-x-2 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            title={language === "tr" ? "Switch to English" : "Türkçe'ye Geç"}
          >
            <Languages className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{language.toUpperCase()}</span>
          </button>
        </div>

        {/* Logo and Title */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center space-x-3 mb-8 group">
            <img
              src="/8f28b76859c1479d839d270409be3586.jpg"
              alt="Callister Logo"
              className="w-12 h-12 object-cover rounded-xl transition-transform group-hover:scale-105"
            />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">Callister AI</span>
          </Link>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            {t("auth.signin.title")}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            {t("auth.signin.subtitle")}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800 shadow-sm">
          {/* Error Message */}
          {error && (
            <div className="mb-6 space-y-3">
              {/* API URL */}
              {apiUrl && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-xl">
                  <div className="text-xs font-semibold text-blue-800 dark:text-blue-200 mb-1">API URL:</div>
                  <div className="text-xs font-mono text-blue-900 dark:text-blue-100 break-all">{apiUrl}</div>
                </div>
              )}
              
              {/* HTTP Status Code - ÖNEMLİ! */}
              {statusCode && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 border-2 border-yellow-400 dark:border-yellow-600 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-yellow-800 dark:text-yellow-200">
                      ⚠️ HTTP Status Code:
                    </span>
                    <span className="text-lg font-bold text-yellow-900 dark:text-yellow-100 px-3 py-1 bg-yellow-200 dark:bg-yellow-800 rounded-lg">
                      {statusCode}
                    </span>
                  </div>
                </div>
              )}
              
              {/* Error Message */}
              <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl text-red-700 dark:text-red-300 text-sm">
                {error}
              </div>
              
              {/* Raw Response - DEBUG */}
              {rawResponse && (
                <div className="p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
                  <div className="text-xs font-semibold text-gray-800 dark:text-gray-200 mb-2">Backend'den Gelen Raw Response:</div>
                  <div className="text-xs font-mono text-gray-900 dark:text-gray-100 whitespace-pre-wrap break-all max-h-40 overflow-y-auto">
                    {rawResponse.length > 1000 ? rawResponse.substring(0, 1000) + '...' : rawResponse}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {t("auth.signin.email")}
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder={t("auth.emailPlaceholder")}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {t("auth.signin.password")}
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-12 py-3 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder={t("auth.passwordPlaceholder")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-gray-900 dark:bg-gray-800 hover:bg-gray-800 dark:hover:bg-gray-700 rounded-xl text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg"
            >
              <span>{isLoading ? t("auth.signin.loading") : t("auth.signin.submit")}</span>
              {!isLoading && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              {t("auth.signin.noAccount")}{" "}
              <Link
                href="/auth/signup"
                className="text-gray-900 dark:text-gray-100 hover:text-gray-700 dark:hover:text-gray-300 font-semibold transition-colors"
              >
                {t("auth.signin.signupLink")}
              </Link>
            </p>
          </div>
        </div>

        {/* Bottom Link */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            ← {t("auth.backToHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}
