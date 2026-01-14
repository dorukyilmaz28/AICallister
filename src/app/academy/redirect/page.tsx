"use client";

import { useEffect } from "react";
import { redirectToAcademy } from "@/lib/academy-api";
import Loading from "@/components/Loading";

/**
 * Mevcut FRC Academy sitesine yönlendirme sayfası
 * Kullanıcıları https://frcacademy.com sitesine yönlendirir
 */
export default function AcademyRedirectPage() {
  useEffect(() => {
    // Mevcut Academy sitesine yönlendir
    window.location.href = redirectToAcademy("/html/main.html");
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loading />
        <p className="mt-4 text-gray-600">FRC Academy'ye yönlendiriliyorsunuz...</p>
      </div>
    </div>
  );
}

