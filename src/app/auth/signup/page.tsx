"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, User, Users, ArrowRight, CheckCircle, XCircle, Languages } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { authApi } from "@/lib/api";

export default function SignUp() {
  const { language, setLanguage, t } = useLanguage();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [teamNumber, setTeamNumber] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [teamVerification, setTeamVerification] = useState<{ isValid: boolean; teamName?: string; error?: string } | null>(null);
  const [showCreateTeam, setShowCreateTeam] = useState(false);

  const verifyTeamNumber = async (teamNum: string) => {
    if (!teamNum || teamNum.length < 3) {
      setTeamVerification(null);
      return;
    }

    try {
      const data = await authApi.verifyTeam(teamNum);
      setTeamVerification(data);
      
      if (!data.valid && !data.isValid && data.error && data.error.includes("bulunamadı")) {
        setShowCreateTeam(true);
      } else {
        setShowCreateTeam(false);
      }
    } catch (error: any) {
      setTeamVerification({ isValid: false, error: error.message || "Bağlantı hatası" });
      setShowCreateTeam(false);
    }
  };

  const handleTeamNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTeamNumber(value);
    
    setTimeout(() => {
      if (value === teamNumber) {
        verifyTeamNumber(value);
      }
    }, 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError(t("auth.signup.passwordMismatch"));
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError(t("auth.signup.passwordMinLength"));
      setIsLoading(false);
      return;
    }

    try {
      await authApi.register(name, email, password, teamNumber);
      // Başarılı kayıt
      window.location.href = `/auth/signin?message=${t("auth.signup.successMessage")}`;
    } catch (error: any) {
      setError(error.message || t("auth.signup.registerError"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 py-12 transition-colors">
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
            {t("auth.signup.title")}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            {t("auth.signup.subtitle")}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800 shadow-sm">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl text-red-700 dark:text-red-300 text-sm flex items-start space-x-2">
              <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {t("auth.signup.name")}
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder={t("auth.namePlaceholder")}
                />
              </div>
            </div>

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
              <label htmlFor="teamNumber" className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {t("auth.signup.teamNumber")}
              </label>
              <div className="relative">
                <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="teamNumber"
                  type="text"
                  value={teamNumber}
                  onChange={handleTeamNumberChange}
                  required
                  className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="9024"
                />
              </div>
              {teamVerification && (
                <div className={`mt-2 text-sm flex items-center space-x-1 ${
                  teamVerification.isValid 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {teamVerification.isValid ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>{teamVerification.teamName}</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" />
                      <span>{teamVerification.error}</span>
                    </>
                  )}
                </div>
              )}
              
              {showCreateTeam && (
                <div className="mt-3 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-xl">
                  <p className="text-blue-900 dark:text-blue-200 text-sm mb-2">
                    Bu takım numarası bulunamadı. Yeni takım oluşturmak ister misiniz?
                  </p>
                  <Link
                    href={`/teams/create?teamNumber=${teamNumber}`}
                    className="inline-flex items-center text-blue-600 dark:text-blue-300 hover:text-blue-700 dark:hover:text-blue-200 text-sm font-semibold"
                  >
                    <Users className="w-4 h-4 mr-1" />
                    Yeni Takım Oluştur
                  </Link>
                </div>
              )}
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

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {t("auth.signup.passwordConfirm")}
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-12 py-3 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder={t("auth.passwordPlaceholder")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-gray-900 dark:bg-gray-800 hover:bg-gray-800 dark:hover:bg-gray-700 rounded-xl text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg"
            >
              <span>{isLoading ? t("auth.signup.loading") : t("auth.signup.submit")}</span>
              {!isLoading && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              {t("auth.signup.hasAccount")}{" "}
              <Link
                href="/auth/signin"
                className="text-gray-900 dark:text-gray-100 hover:text-gray-700 dark:hover:text-gray-300 font-semibold transition-colors"
              >
                {t("auth.signup.signinLink")}
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
