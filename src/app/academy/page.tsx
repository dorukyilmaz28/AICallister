"use client";

import { redirectToAcademy } from "@/lib/academy-api";
import { ExternalLink, BookOpen, ArrowRight } from "lucide-react";
import Link from "next/link";

/**
 * FRC Academy Ana Sayfası
 * Mevcut Academy sitesine yönlendirme veya iframe ile gösterim
 */
export default function AcademyPage() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              FRC Academy
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              FRC dünyasına adım atan yeni takımlar için kapsamlı bir eğitim platformu. 
              Robotik, yazılım, mekanik ve tasarım konularında uzmanlaşmak isteyen tüm gençlere rehberlik ediyoruz.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <a
              href={redirectToAcademy("/html/main.html")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold text-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <ExternalLink className="h-6 w-6" />
              <span>FRC Academy'yi Yeni Sekmede Aç</span>
            </a>
            <Link
              href="/academy/embed"
              className="inline-flex items-center gap-3 px-8 py-4 bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-300 rounded-xl font-semibold text-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <BookOpen className="h-6 w-6" />
              <span>Burada Görüntüle</span>
            </Link>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                🎓 FRC Odaklı Eğitimler
              </h3>
              <p className="text-gray-600">
                Yazılım, mekanik, elektronik ve tasarım gibi temel alanlarda kapsamlı ve kolay anlaşılır eğitimlerle takım üyelerinizin bilgi ve becerilerini geliştirin.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                🚀 Yeniliklere Açık
              </h3>
              <p className="text-gray-600">
                Eğitimlerimizi ve sistemlerimizi sürekli geliştirmek için önerilerinize her zaman açığız. Sizin fikirleriniz, sunduğumuz hizmetleri daha da ileriye taşımamız için en büyük motivasyonumuzdur.
              </p>
            </div>
          </div>

          {/* Info Section */}
          <div className="bg-white rounded-xl p-8 shadow-md text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Ekibimiz Hakkında
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Callister ve Archers takımları olarak, genç mühendis ve yazılım geliştiricilerini desteklemek amacıyla yenilikçi bir eğitim web sitesi projesi üzerinde çalışıyoruz. 
              Bu proje, hem FRC (FIRST Robotics Competition) topluluğuna hem de teknoloji ve mühendislik alanında kendini geliştirmek isteyen öğrencilere rehberlik etmeyi hedefliyor. 🏹🚀
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


