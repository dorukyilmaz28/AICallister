"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Trash2, ArrowLeft, AlertTriangle, CheckCircle, Mail } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSession } from "next-auth/react";

export default function DeleteAccount() {
  const { language } = useLanguage();
  const sessionQuery = useSession();
  const session = sessionQuery?.data ?? null;
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [mounted, setMounted] = useState(false);

  // Client-side only rendering
  useEffect(() => {
    setMounted(true);
    if (session?.user?.email) {
      setEmail(session.user.email);
    }
  }, [session]);

  const content = {
    tr: {
      title: "Hesap Silme Talebi",
      subtitle: "Callister FRC AI",
      lastUpdated: "Son Güncelleme: 23 Ocak 2026",
      intro: "Callister FRC AI uygulamasından hesabınızı silmek istiyorsanız, aşağıdaki bilgileri okuyun ve hesap silme talebinizi gönderin.",
      steps: {
        title: "Hesap Silme Adımları",
        step1: "Aşağıdaki formu doldurun (e-posta adresiniz ve silme nedeniniz)",
        step2: "Hesap silme talebinizi gönderin",
        step3: "E-posta adresinize gönderilen onay linkine tıklayın",
        step4: "Hesabınız ve tüm verileriniz 30 gün içinde kalıcı olarak silinir"
      },
      dataTypes: {
        title: "Silinecek Veriler",
        deleted: [
          "Hesap bilgileri (e-posta, kullanıcı adı, şifre)",
          "Profil bilgileri (isim, takım bilgileri, profil fotoğrafı)",
          "Sohbet geçmişi ve konuşmalar",
          "Kod snippet'leri ve favorileriniz",
          "Takım üyelikleri ve takım sohbet mesajları",
          "Takım katılım istekleri",
          "Bildirimler ve tercihler",
          "Kurs ilerleme kayıtları ve sertifikalar"
        ],
        retained: {
          title: "Saklanan Veriler (Yasal Gereklilikler)",
          items: [
            "Yasal yükümlülükler nedeniyle bazı veriler sınırlı süre saklanabilir",
            "Mali kayıtlar: 7 yıl (vergi mevzuatı gereği)",
            "Güvenlik logları: 1 yıl (dolandırıcılık önleme)",
            "Anonimleştirilmiş kullanım istatistikleri: Kalıcı (kişisel bilgi içermez)"
          ]
        }
      },
      retention: {
        title: "Veri Saklama Süreleri",
        content: [
          "Hesap silme talebi sonrası verileriniz 30 gün içinde kalıcı olarak silinir",
          "Yasal gereklilikler nedeniyle saklanan veriler belirtilen süreler boyunca tutulur",
          "Anonimleştirilmiş veriler kişisel bilgi içermediği için kalıcı olarak saklanabilir"
        ]
      },
      form: {
        email: "E-posta Adresiniz",
        emailPlaceholder: "hesabınız@example.com",
        reason: "Hesap Silme Nedeni (İsteğe bağlı)",
        reasonPlaceholder: "Neden hesabınızı silmek istiyorsunuz?",
        submit: "Hesap Silme Talebini Gönder",
        submitting: "Gönderiliyor...",
        success: "Hesap silme talebiniz başarıyla gönderildi! E-posta adresinize onay linki gönderildi.",
        error: "Bir hata oluştu. Lütfen tekrar deneyin."
      },
      warning: {
        title: "Önemli Uyarı",
        content: [
          "Hesap silme işlemi geri alınamaz",
          "Tüm verileriniz kalıcı olarak silinecektir",
          "Takımlardan otomatik olarak çıkarılacaksınız",
          "Sohbet geçmişiniz ve kod snippet'leriniz silinecektir"
        ]
      },
      contact: {
        title: "Sorularınız mı var?",
        text: "Hesap silme işlemi hakkında sorularınız için:",
        website: "https://www.callisterai.com"
      }
    },
    en: {
      title: "Account Deletion Request",
      subtitle: "Callister FRC AI",
      lastUpdated: "Last Updated: January 23, 2026",
      intro: "If you wish to delete your account from the Callister FRC AI application, please read the information below and submit your account deletion request.",
      steps: {
        title: "Account Deletion Steps",
        step1: "Fill out the form below (your email address and reason for deletion)",
        step2: "Submit your account deletion request",
        step3: "Click the confirmation link sent to your email address",
        step4: "Your account and all your data will be permanently deleted within 30 days"
      },
      dataTypes: {
        title: "Data to be Deleted",
        deleted: [
          "Account information (email, username, password)",
          "Profile information (name, team information, profile photo)",
          "Chat history and conversations",
          "Code snippets and favorites",
          "Team memberships and team chat messages",
          "Team join requests",
          "Notifications and preferences",
          "Course progress records and certificates"
        ],
        retained: {
          title: "Retained Data (Legal Requirements)",
          items: [
            "Some data may be retained for limited periods due to legal obligations",
            "Financial records: 7 years (tax legislation requirement)",
            "Security logs: 1 year (fraud prevention)",
            "Anonymized usage statistics: Permanent (contains no personal information)"
          ]
        }
      },
      retention: {
        title: "Data Retention Periods",
        content: [
          "Your data will be permanently deleted within 30 days after account deletion request",
          "Data retained due to legal requirements will be kept for the specified periods",
          "Anonymized data may be retained permanently as it contains no personal information"
        ]
      },
      form: {
        email: "Your Email Address",
        emailPlaceholder: "your-account@example.com",
        reason: "Reason for Account Deletion (Optional)",
        reasonPlaceholder: "Why do you want to delete your account?",
        submit: "Submit Account Deletion Request",
        submitting: "Submitting...",
        success: "Your account deletion request has been submitted successfully! A confirmation link has been sent to your email address.",
        error: "An error occurred. Please try again."
      },
      warning: {
        title: "Important Warning",
        content: [
          "Account deletion cannot be undone",
          "All your data will be permanently deleted",
          "You will be automatically removed from teams",
          "Your chat history and code snippets will be deleted"
        ]
      },
      contact: {
        title: "Have Questions?",
        text: "For questions about account deletion:",
        website: "https://www.callisterai.com"
      }
    }
  };

  const currentContent = content[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");

    try {
      const response = await fetch("/api/account/delete-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email || (session?.user?.email || ""),
          reason: reason || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus("success");
        setEmail("");
        setReason("");
      } else {
        setSubmitStatus("error");
        setErrorMessage(data.error || currentContent.form.error);
      }
    } catch (error) {
      setSubmitStatus("error");
      setErrorMessage(currentContent.form.error);
    } finally {
      setIsSubmitting(false);
    }
  };

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
              <span>{language === "tr" ? "Ana Sayfa" : "Home"}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      {!mounted ? (
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-4xl">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400">Yükleniyor...</p>
            </div>
          </div>
        </main>
      ) : (
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-4xl">
        {/* Title Section */}
        <div className="mb-12">
          <div className="flex items-center space-x-3 mb-4">
            <Trash2 className="w-8 h-8 text-red-600 dark:text-red-400" />
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                {currentContent.title}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">
                {currentContent.subtitle}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <span>{currentContent.lastUpdated}</span>
          </div>
        </div>

        {/* Introduction */}
        <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {currentContent.intro}
          </p>
        </div>

        {/* Warning */}
        <div className="mb-8 p-6 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
                {currentContent.warning.title}
              </h3>
              <ul className="space-y-2">
                {currentContent.warning.content.map((item, index) => (
                  <li key={index} className="text-red-800 dark:text-red-200 flex items-start">
                    <span className="mr-2">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Steps */}
        <section className="mb-12 bg-gray-50 dark:bg-gray-800 rounded-xl p-6 lg:p-8 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {currentContent.steps.title}
          </h2>
          <ol className="space-y-3 list-decimal list-inside">
            <li className="text-gray-700 dark:text-gray-300">{currentContent.steps.step1}</li>
            <li className="text-gray-700 dark:text-gray-300">{currentContent.steps.step2}</li>
            <li className="text-gray-700 dark:text-gray-300">{currentContent.steps.step3}</li>
            <li className="text-gray-700 dark:text-gray-300">{currentContent.steps.step4}</li>
          </ol>
        </section>

        {/* Data Types */}
        <section className="mb-12 bg-gray-50 dark:bg-gray-800 rounded-xl p-6 lg:p-8 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {currentContent.dataTypes.title}
          </h2>
          <ul className="space-y-3 mb-6">
            {currentContent.dataTypes.deleted.map((item, index) => (
              <li key={index} className="flex items-start space-x-3 text-gray-700 dark:text-gray-300">
                <span className="text-red-600 dark:text-red-400 mt-1">•</span>
                <span className="flex-1">{item}</span>
              </li>
            ))}
          </ul>
          
          <div className="mt-6 pt-6 border-t border-gray-300 dark:border-gray-600">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              {currentContent.dataTypes.retained.title}
            </h3>
            <ul className="space-y-2">
              {currentContent.dataTypes.retained.items.map((item, index) => (
                <li key={index} className="text-gray-600 dark:text-gray-400 text-sm">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Retention Periods */}
        <section className="mb-12 bg-gray-50 dark:bg-gray-800 rounded-xl p-6 lg:p-8 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {currentContent.retention.title}
          </h2>
          <ul className="space-y-3">
            {currentContent.retention.content.map((item, index) => (
              <li key={index} className="flex items-start space-x-3 text-gray-700 dark:text-gray-300">
                <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                <span className="flex-1">{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Form */}
        <section className="mb-12 bg-white dark:bg-gray-800 rounded-xl p-6 lg:p-8 border-2 border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {currentContent.title}
          </h2>

          {submitStatus === "success" ? (
            <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 mt-1" />
                <div>
                  <p className="text-green-800 dark:text-green-200 font-medium">
                    {currentContent.form.success}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {currentContent.form.email}
                </label>
                <input
                  type="email"
                  id="email"
                  value={email || session?.user?.email || ""}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={currentContent.form.emailPlaceholder}
                  required
                  disabled={!!session?.user?.email}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {session?.user?.email && (
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {language === "tr" ? "Giriş yaptığınız hesap kullanılacak" : "Your logged-in account will be used"}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {currentContent.form.reason}
                </label>
                <textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={currentContent.form.reasonPlaceholder}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                />
              </div>

              {submitStatus === "error" && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-800 dark:text-red-200">{errorMessage}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    <span>{currentContent.form.submitting}</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-5 h-5" />
                    <span>{currentContent.form.submit}</span>
                  </>
                )}
              </button>
            </form>
          )}
        </section>

        {/* Contact */}
        <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
          <div className="flex items-start space-x-3">
            <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {currentContent.contact.title}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                {currentContent.contact.text}
              </p>
              <a
                href={currentContent.contact.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                {currentContent.contact.website}
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            {language === "tr"
              ? "© 2026 Callister FRC AI. Tüm hakları saklıdır."
              : "© 2026 Callister FRC AI. All rights reserved."}
          </p>
        </div>
      </main>
      )}
    </div>
  );
}
