"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Clock, Users, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Loading from "@/components/Loading";

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm text-center">
          {/* Icon */}
          <div className="mb-8">
            <div className="w-20 h-20 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Clock className="w-10 h-10 text-yellow-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Onay Bekleniyor
            </h1>
            <p className="text-gray-600">
              Takım yöneticisinin onayını bekliyorsunuz
            </p>
          </div>

          {/* Content */}
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-center mb-4">
                <Users className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-gray-900 font-semibold">Takım Bilgileri</span>
              </div>
              <div className="text-gray-700 text-sm space-y-2">
                <p><strong>Takım:</strong> #{session?.user.teamNumber}</p>
                <p><strong>Durum:</strong> Onay bekleniyor</p>
                <p><strong>Email:</strong> {session?.user.email}</p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-blue-900 text-sm">
                <strong>Bilgi:</strong> Takım yöneticisi onayınızı verdikten sonra 
                sistemin tüm özelliklerini kullanabileceksiniz.
              </p>
            </div>

            <div className="flex flex-col space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-3 px-4 bg-gray-900 hover:bg-gray-800 rounded-xl text-white font-semibold transition-colors shadow-md"
              >
                Durumu Yenile
              </button>
              
              <Link
                href="/auth/signin"
                className="w-full py-3 px-4 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-medium transition-colors flex items-center justify-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Çıkış Yap
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-xs">
              Sorunuz varsa takım yöneticinizle iletişime geçin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
