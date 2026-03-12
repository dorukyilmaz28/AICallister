"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { X, Smartphone, Share2 } from "lucide-react";

const STORAGE_KEY = "callister_a2hs_dismissed_v1";

export function AddToHomeScreenHint() {
  const { language } = useLanguage();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const dismissed = window.localStorage.getItem(STORAGE_KEY);
      if (dismissed === "1") return;

      const ua = window.navigator.userAgent || "";
      const isIOS = /iphone|ipad|ipod/i.test(ua);

      const isStandalone =
        // iOS Safari
        (window.navigator as any).standalone === true ||
        // Other browsers / PWA check
        window.matchMedia?.("(display-mode: standalone)").matches;

      if (isIOS && !isStandalone) {
        setShow(true);
      }
    } catch {
      // Sessizce geç
    }
  }, []);

  const handleClose = () => {
    setShow(false);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(STORAGE_KEY, "1");
      } catch {
        // ignore
      }
    }
  };

  if (!show) return null;

  const isTr = language === "tr";

  const title = isTr ? "Ana ekrana ekle" : "Add to Home Screen";
  const line1 = isTr
    ? "Callister AI'yi uygulama gibi kullanmak için Ana Ekrana ekleyebilirsin."
    : "You can add Callister AI to your Home Screen and use it like an app.";
  const line2 = isTr
    ? "Safari'de paylaş ikonuna dokun, sonra \"Ana Ekrana Ekle\"yi seç."
    : "In Safari, tap the share icon, then choose \"Add to Home Screen\".";

  return (
    <div className="px-4 sm:px-6 lg:px-8 mt-6">
      <div className="max-w-3xl mx-auto">
        <div className="relative overflow-hidden rounded-2xl border border-blue-200 dark:border-blue-800 bg-blue-50/80 dark:bg-blue-900/30 px-4 py-4 sm:px-6 sm:py-5">
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-3 right-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-100/70 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/60 dark:text-blue-200 dark:hover:bg-blue-800/80"
            aria-label="Kapat"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-start space-x-3 sm:space-x-4">
            <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
              <Smartphone className="h-5 w-5" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-sm sm:text-base font-semibold text-blue-900 dark:text-blue-50">
                {title}
              </h2>
              <p className="text-xs sm:text-sm text-blue-900/80 dark:text-blue-100/90">
                {line1}
              </p>
              <div className="flex items-start space-x-2 text-xs sm:text-sm text-blue-900/80 dark:text-blue-100/90">
                <Share2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>{line2}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

