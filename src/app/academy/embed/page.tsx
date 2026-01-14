"use client";

import { redirectToAcademy } from "@/lib/academy-api";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

/**
 * Mevcut FRC Academy sitesini iframe ile göster
 */
export default function AcademyEmbedPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/academy"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Geri Dön</span>
            </Link>
            <a
              href={redirectToAcademy("/html/main.html")}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-purple-600 hover:text-purple-700 font-semibold"
            >
              Tam Ekranda Aç
            </a>
          </div>
        </div>
      </div>

      {/* Iframe Container */}
      <div className="w-full h-[calc(100vh-80px)]">
        <iframe
          src={redirectToAcademy("/html/main.html")}
          className="w-full h-full border-0"
          title="FRC Academy"
          allow="fullscreen"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        />
      </div>
    </div>
  );
}

