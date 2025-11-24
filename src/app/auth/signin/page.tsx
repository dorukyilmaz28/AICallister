"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle, XCircle } from "lucide-react";

export default function SignIn() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resending, setResending] = useState(false);
  
  useEffect(() => {
    const verified = searchParams.get("verified");
    const verifiedEmail = searchParams.get("email");
    const errorParam = searchParams.get("error");
    
    if (verified === "true" && verifiedEmail) {
      setSuccess(`Email adresiniz başarıyla doğrulandı! Giriş yapabilirsiniz.`);
      setEmail(decodeURIComponent(verifiedEmail));
    }
    
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
    }
  }, [searchParams]);
  
  const handleResendVerification = async () => {
    if (!email) {
      setError("Lütfen email adresinizi girin.");
      return;
    }
    
    setResending(true);
    setError("");
    
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess(data.message);
      } else {
        setError(data.error || "Email gönderilemedi.");
      }
    } catch (error) {
      setError("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error === "CredentialsSignin" || result.error.includes("EMAIL_NOT_VERIFIED")) {
          setError("Email adresiniz doğrulanmamış. Lütfen email kutunuzu kontrol edin veya doğrulama email'ini tekrar gönderin.");
        } else {
          setError("Email veya şifre hatalı!");
        }
      } else if (result?.ok) {
        window.location.href = "/teams";
      } else {
        setError("Beklenmeyen bir hata oluştu.");
      }
    } catch (error) {
      setError("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md px-4">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center space-x-3 mb-8 group">
            <img
              src="/8f28b76859c1479d839d270409be3586.jpg"
              alt="Callister Logo"
              className="w-12 h-12 object-cover rounded-xl transition-transform group-hover:scale-105"
            />
            <span className="text-2xl font-bold text-gray-900">Callister AI</span>
          </Link>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
            Hoş Geldiniz
          </h1>
          <p className="text-lg text-gray-600">
            Hesabınıza giriş yapın
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}
          
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              <div className="flex items-start space-x-2">
                <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p>{error}</p>
                  {error.includes("doğrulanmamış") && (
                    <button
                      onClick={handleResendVerification}
                      disabled={resending}
                      className="mt-2 text-red-600 hover:text-red-800 underline text-xs font-medium disabled:opacity-50"
                    >
                      {resending ? "Gönderiliyor..." : "Doğrulama email'ini tekrar gönder"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="ornek@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-900 mb-2">
                Şifre
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-12 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-gray-900 hover:bg-gray-800 rounded-xl text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg"
            >
              <span>{isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}</span>
              {!isLoading && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 text-sm">
              Hesabınız yok mu?{" "}
              <Link
                href="/auth/signup"
                className="text-gray-900 hover:text-gray-700 font-semibold transition-colors"
              >
                Kayıt olun
              </Link>
            </p>
          </div>
        </div>

        {/* Bottom Link */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Ana sayfaya dön
          </Link>
        </div>
      </div>
    </div>
  );
}
