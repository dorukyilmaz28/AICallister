"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { Bot, Users, ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";
import Loading from "@/components/Loading";

function CreateTeamForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, isLoading } = useAuthGuard({ requireAuth: true });
  
  const [formData, setFormData] = useState({
    name: "",
    teamNumber: "",
    description: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // URL'den takım numarasını al
    const teamNumber = searchParams.get('teamNumber');
    if (teamNumber) {
      setFormData(prev => ({
        ...prev,
        teamNumber: teamNumber
      }));
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/teams/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/teams/admin");
        }, 2000);
      } else {
        setError(data.error || "Takım oluşturulurken bir hata oluştu.");
      }
    } catch (error) {
      setError("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">
              Takım Başarıyla Oluşturuldu!
            </h1>
            <p className="text-white/70 mb-6">
              Artık takım yöneticisisiniz ve takımınızı yönetebilirsiniz.
            </p>
            <div className="text-white/50 text-sm">
              Takım yönetim paneline yönlendiriliyorsunuz...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
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
              Yeni Takım Oluştur
            </h1>
            <p className="text-white/70">
              FRC takımınızı oluşturun ve yönetici olun
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
                Takım Adı
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-white/50 focus:border-transparent"
                  placeholder="Callister Robotics"
                />
              </div>
            </div>

            <div>
              <label htmlFor="teamNumber" className="block text-sm font-medium text-white/80 mb-2">
                FRC Takım Numarası
              </label>
              <div className="relative">
                <Bot className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                <input
                  id="teamNumber"
                  name="teamNumber"
                  type="text"
                  value={formData.teamNumber}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-white/50 focus:border-transparent"
                  placeholder="9024"
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-white/80 mb-2">
                Takım Açıklaması (Opsiyonel)
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-white/50 focus:border-transparent resize-none"
                placeholder="Takımınız hakkında kısa bir açıklama..."
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-white/20 hover:bg-white/30 border border-white/30 rounded-lg text-white font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Takım Oluşturuluyor..." : "Takım Oluştur"}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-white/70 hover:text-white/80 font-medium underline flex items-center justify-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Ana Sayfaya Dön
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CreateTeam() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading />
      </div>
    }>
      <CreateTeamForm />
    </Suspense>
  );
}
