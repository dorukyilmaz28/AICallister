"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Clock, Users, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PendingApproval() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    if (session.user.status !== "pending") {
      router.push("/");
      return;
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3A006F 0%, #5A008F 50%, #8A00FF 100%)' }}>
        <div className="text-white text-xl">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3A006F 0%, #5A008F 50%, #8A00FF 100%)' }}>
      <div className="max-w-md w-full mx-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 text-center">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center">
                <Clock className="w-8 h-8 text-yellow-400" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Onay Bekleniyor
            </h1>
            <p className="text-white/70">
              Takım yöneticisinin onayını bekliyorsunuz
            </p>
          </div>

          {/* Content */}
          <div className="space-y-6">
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <div className="flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-blue-400 mr-2" />
                <span className="text-white font-medium">Takım Bilgileri</span>
              </div>
              <div className="text-white/70 text-sm space-y-2">
                <p><strong>Takım:</strong> #{session?.user.teamNumber}</p>
                <p><strong>Durum:</strong> Onay bekleniyor</p>
                <p><strong>Email:</strong> {session?.user.email}</p>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <p className="text-blue-200 text-sm">
                <strong>Bilgi:</strong> Takım yöneticisi onayınızı verdikten sonra 
                sistemin tüm özelliklerini kullanabileceksiniz. Bu süreç genellikle 
                birkaç saat içinde tamamlanır.
              </p>
            </div>

            <div className="flex flex-col space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-3 px-4 bg-white/20 hover:bg-white/30 border border-white/30 rounded-lg text-white font-medium transition-colors duration-200"
              >
                Durumu Yenile
              </button>
              
              <Link
                href="/auth/signin"
                className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white/80 font-medium transition-colors duration-200 flex items-center justify-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Çıkış Yap
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-white/50 text-xs">
              Sorunuz varsa takım yöneticinizle iletişime geçin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
