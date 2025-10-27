"use client";

import { useState } from "react";
import Link from "next/link";
import { Bot, Mail, Lock, Eye, EyeOff, User, Users } from "lucide-react";

export default function SignUp() {
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

  const verifyTeamNumber = async (teamNum: string) => {
    if (!teamNum || teamNum.length < 3) {
      setTeamVerification(null);
      return;
    }

    try {
      const response = await fetch("/api/auth/verify-team", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ teamNumber: teamNum }),
      });

      const data = await response.json();
      setTeamVerification(data);
    } catch (error) {
      setTeamVerification({ isValid: false, error: "Bağlantı hatası" });
    }
  };

  const handleTeamNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTeamNumber(value);
    
    // Debounce the verification
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
      setError("Şifreler eşleşmiyor!");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Şifre en az 6 karakter olmalıdır!");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          teamNumber,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        window.location.href = "/auth/signin?message=Kayıt başarılı! Giriş yapabilirsiniz.";
      } else {
        setError(data.error || "Kayıt sırasında bir hata oluştu.");
      }
    } catch (error) {
      setError("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3A006F 0%, #5A008F 50%, #8A00FF 100%)' }}>
      <div className="max-w-md w-full mx-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <img
                src="/8f28b76859c1479d839d270409be3586.jpg"
                alt="Callister Logo"
                className="w-16 h-16 object-cover rounded-xl"
              />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Callister FRC AI
            </h1>
            <p className="text-white/70">
              Yeni hesap oluşturun
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-white/80 mb-2">
                Ad Soyad
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-white/50 focus:border-transparent"
                  placeholder="Adınız Soyadınız"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-white/50 focus:border-transparent"
                  placeholder="ornek@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="teamNumber" className="block text-sm font-medium text-white/80 mb-2">
                FRC Takım Numarası
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                <input
                  id="teamNumber"
                  type="text"
                  value={teamNumber}
                  onChange={handleTeamNumberChange}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-white/50 focus:border-transparent"
                  placeholder="9024"
                />
              </div>
              {teamVerification && (
                <div className={`mt-2 text-sm ${
                  teamVerification.isValid 
                    ? 'text-green-300' 
                    : 'text-red-300'
                }`}>
                  {teamVerification.isValid 
                    ? `✅ ${teamVerification.teamName}` 
                    : `❌ ${teamVerification.error}`
                  }
                </div>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-2">
                Şifre
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-12 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-white/50 focus:border-transparent"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white/70"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/80 mb-2">
                Şifre Tekrar
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-12 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-white/50 focus:border-transparent"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white/70"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-white/20 hover:bg-white/30 border border-white/30 rounded-lg text-white font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Kayıt oluşturuluyor..." : "Kayıt Ol"}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-white/70 text-sm">
              Zaten hesabınız var mı?{" "}
              <Link
                href="/auth/signin"
                className="text-white hover:text-white/80 font-medium underline"
              >
                Giriş yapın
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
