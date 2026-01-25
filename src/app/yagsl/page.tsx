"use client";

import Link from "next/link";
import { BookOpen, ArrowLeft, ExternalLink, Settings, FileCode, Zap } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const YAGSL_URL = "https://callister.gitbook.io/yagsl-turkish";

export default function YAGSLPage() {
  const { language, t } = useLanguage();

  const content = {
    tr: {
      title: "YAGSL Türkçe",
      subtitle: "Yet Another Swerve Document — Türkçe çeviri",
      intro: "YAGSL, FRC takımları için geliştirilmiş bir swerve sürüş kütüphanesidir. Farklı swerve modüllerini DifferentialDrive kadar kolay kullanılır hale getirir. Bu sayfa, Callister tarafından hazırlanan Türkçe dokümantasyonun giriş noktasıdır.",
      cta: "Dokümantasyona Git",
      ctaSub: "Kurulum, konfigürasyon, PID ayarları ve daha fazlası",
      highlights: {
        overview: "Genel bakış, swerve drive temelleri ve YAGSL felsefesi",
        config: "Robot tanıma, konfigürasyon, dependency kurulumu, kod kurulumu",
        tune: "When to invert, PID/pidf ayarlama, 8 adım rehberi",
        tools: "FRC Web Components ile analiz ve hata ayıklama",
      },
      broncbotz: "BroncBotz mentorları ve topluluk tarafından geliştirilmiş; tüm FRC takımları için ücretsiz.",
    },
    en: {
      title: "YAGSL Turkish",
      subtitle: "Yet Another Swerve Document — Turkish translation",
      intro: "YAGSL is a swerve drive library for FRC teams. It makes different swerve modules as easy to use as DifferentialDrive. This page is the entry point for the Turkish documentation prepared by Callister.",
      cta: "Open Documentation",
      ctaSub: "Setup, configuration, PID tuning, and more",
      highlights: {
        overview: "Overview, swerve drive basics, and YAGSL philosophy",
        config: "Getting to know your robot, configuration, dependency & code setup",
        tune: "When to invert, PID/pidf tuning, the 8-step guide",
        tools: "Analysis and debugging with FRC Web Components",
      },
      broncbotz: "Developed by BroncBotz mentors and the community; free for all FRC teams.",
    },
  };

  const c = content[language];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <img
                src="/8f28b76859c1479d839d270409be3586.jpg"
                alt="Callister Logo"
                className="w-10 h-10 object-cover rounded-xl"
              />
              <Link href="/" className="text-lg font-bold text-gray-900 dark:text-white">
                Callister AI
              </Link>
            </div>
            <Link
              href="/"
              className="flex items-center space-x-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t("common.home")}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-3xl">
        <div className="flex items-center space-x-3 mb-4">
          <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {c.title}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{c.subtitle}</p>
          </div>
        </div>

        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
          {c.intro}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
          {c.broncbotz}
        </p>

        {/* CTA */}
        <a
          href={YAGSL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 w-full sm:w-auto bg-gray-900 hover:bg-gray-800 text-white px-6 py-4 rounded-xl font-semibold transition-colors"
        >
          <ExternalLink className="w-5 h-5" />
          {c.cta}
        </a>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {c.ctaSub}
        </p>

        {/* Highlights */}
        <div className="mt-12 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {language === "tr" ? "İçerik özeti" : "Contents"}
          </h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
              <Zap className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <span>{c.highlights.overview}</span>
            </li>
            <li className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
              <Settings className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <span>{c.highlights.config}</span>
            </li>
            <li className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
              <FileCode className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
              <span>{c.highlights.tune}</span>
            </li>
            <li className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
              <BookOpen className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
              <span>{c.highlights.tools}</span>
            </li>
          </ul>
        </div>

        <div className="mt-10 pt-8 border-t border-gray-200 dark:border-gray-800">
          <a
            href={YAGSL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
          >
            callister.gitbook.io/yagsl-turkish
          </a>
        </div>
      </main>
    </div>
  );
}
