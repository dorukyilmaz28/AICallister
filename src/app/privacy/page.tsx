"use client";

import Link from "next/link";
import { Shield, ArrowLeft, Calendar } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function PrivacyPolicy() {
  const { language, t } = useLanguage();

  const content = {
    tr: {
      title: "Gizlilik Politikası",
      lastUpdated: "Son Güncelleme: 23 Ocak 2026",
      intro: "Callister FRC AI olarak, kullanıcılarımızın gizliliğini korumayı taahhüt ediyoruz. Bu gizlilik politikası, uygulamamızı kullandığınızda topladığımız bilgileri, bu bilgileri nasıl kullandığımızı ve paylaştığımızı açıklar.",
      sections: {
        dataCollection: {
          title: "1. Toplanan Veriler",
          content: [
            "Hesap bilgileri: E-posta adresi, kullanıcı adı ve şifre (şifreler şifrelenmiş olarak saklanır)",
            "Profil bilgileri: İsim, takım bilgileri ve profil fotoğrafı",
            "Kullanım verileri: Sohbet geçmişi, kod snippet'leri, takım üyeliği ve uygulama içi etkileşimler",
            "Cihaz bilgileri: Cihaz türü, işletim sistemi ve uygulama sürümü",
            "Teknik veriler: IP adresi, tarayıcı türü ve kullanım istatistikleri"
          ]
        },
        dataUsage: {
          title: "2. Verilerin Kullanımı",
          content: [
            "Hizmetlerimizi sağlamak ve geliştirmek",
            "Kullanıcı hesaplarını yönetmek ve kimlik doğrulama yapmak",
            "AI sohbet özelliklerini çalıştırmak ve kişiselleştirmek",
            "Kod snippet'lerini ve takım özelliklerini yönetmek",
            "Güvenlik ve dolandırıcılık önleme",
            "Yasal yükümlülükleri yerine getirmek",
            "Kullanıcı deneyimini iyileştirmek için analitik"
          ]
        },
        dataSharing: {
          title: "3. Veri Paylaşımı",
          content: [
            "Üçüncü taraf hizmet sağlayıcılar: AI modelleri (OpenAI, Google Gemini) ve bulut altyapısı (Vercel) gibi hizmet sağlayıcılarımızla sınırlı veri paylaşımı yapıyoruz.",
            "Yasal gereklilikler: Yasal bir zorunluluk olduğunda veya haklarımızı korumak için verileri paylaşabiliriz.",
            "İş transferleri: Şirket birleşmesi, satın alma veya varlık satışı durumunda veriler aktarılabilir.",
            "Kullanıcı onayı: Açık onayınızla verileri paylaşabiliriz."
          ]
        },
        dataSecurity: {
          title: "4. Veri Güvenliği",
          content: [
            "Şifreler bcrypt ile şifrelenmiş olarak saklanır",
            "HTTPS üzerinden güvenli veri iletimi",
            "Düzenli güvenlik güncellemeleri ve izleme",
            "Erişim kontrolleri ve yetkilendirme mekanizmaları",
            "Veritabanı yedekleme ve felaket kurtarma planları"
          ]
        },
        userRights: {
          title: "5. Kullanıcı Hakları",
          content: [
            "Verilerinize erişim hakkı",
            "Verilerinizi düzeltme hakkı",
            "Verilerinizi silme hakkı",
            "Veri işlemeye itiraz etme hakkı",
            "Veri taşınabilirliği hakkı",
            "Bu hakları kullanmak için profil sayfanızdan veya bizimle iletişime geçerek talepte bulunabilirsiniz."
          ]
        },
        cookies: {
          title: "6. Çerezler ve Takip Teknolojileri",
          content: [
            "Oturum yönetimi için gerekli çerezler kullanıyoruz",
            "Kimlik doğrulama ve güvenlik için çerezler",
            "Kullanıcı tercihlerini saklamak için yerel depolama",
            "Analitik için Vercel Analytics kullanıyoruz (kişisel olmayan veriler)"
          ]
        },
        children: {
          title: "7. Çocukların Gizliliği",
          content: [
            "Uygulamamız 13 yaş ve üzeri kullanıcılar içindir.",
            "13 yaşından küçük çocuklardan bilerek veri toplamıyoruz.",
            "13 yaşından küçük bir çocuğun verilerini topladığımızı fark edersek, derhal sileriz."
          ]
        },
        changes: {
          title: "8. Politika Değişiklikleri",
          content: [
            "Bu gizlilik politikasını zaman zaman güncelleyebiliriz.",
            "Önemli değişiklikler için kullanıcıları e-posta veya uygulama içi bildirimlerle bilgilendireceğiz.",
            "Güncellemeler bu sayfada yayınlanacaktır."
          ]
        },
        contactInfo: {
          title: "9. İletişim",
          content: [
            "Gizlilik politikamız hakkında sorularınız varsa, lütfen bizimle iletişime geçin.",
            "Web: https://www.callisterai.com"
          ]
        },
        accountDeletion: {
          title: "10. Hesap Silme",
          content: [
            "Hesabınızı silmek istiyorsanız, lütfen hesap silme sayfamızı ziyaret edin:",
            "Hesap Silme: https://www.callisterai.com/delete-account",
            "Hesap silme talebiniz 30 gün içinde işleme alınacak ve tüm verileriniz kalıcı olarak silinecektir."
          ]
        }
      }
    },
    en: {
      title: "Privacy Policy",
      lastUpdated: "Last Updated: January 23, 2026",
      intro: "At Callister FRC AI, we are committed to protecting our users' privacy. This privacy policy explains what information we collect when you use our application, how we use it, and how we share it.",
      sections: {
        dataCollection: {
          title: "1. Data We Collect",
          content: [
            "Account information: Email address, username, and password (passwords are stored encrypted)",
            "Profile information: Name, team information, and profile photo",
            "Usage data: Chat history, code snippets, team membership, and in-app interactions",
            "Device information: Device type, operating system, and app version",
            "Technical data: IP address, browser type, and usage statistics"
          ]
        },
        dataUsage: {
          title: "2. How We Use Your Data",
          content: [
            "To provide and improve our services",
            "To manage user accounts and authenticate users",
            "To operate and personalize AI chat features",
            "To manage code snippets and team features",
            "For security and fraud prevention",
            "To comply with legal obligations",
            "For analytics to improve user experience"
          ]
        },
        dataSharing: {
          title: "3. Data Sharing",
          content: [
            "Third-party service providers: We share limited data with our service providers such as AI models (OpenAI, Google Gemini) and cloud infrastructure (Vercel).",
            "Legal requirements: We may share data when legally required or to protect our rights.",
            "Business transfers: Data may be transferred in case of merger, acquisition, or asset sale.",
            "User consent: We may share data with your explicit consent."
          ]
        },
        dataSecurity: {
          title: "4. Data Security",
          content: [
            "Passwords are stored encrypted using bcrypt",
            "Secure data transmission over HTTPS",
            "Regular security updates and monitoring",
            "Access controls and authorization mechanisms",
            "Database backups and disaster recovery plans"
          ]
        },
        userRights: {
          title: "5. Your Rights",
          content: [
            "Right to access your data",
            "Right to correct your data",
            "Right to delete your data",
            "Right to object to data processing",
            "Right to data portability",
            "You can exercise these rights through your profile page or by contacting us."
          ]
        },
        cookies: {
          title: "6. Cookies and Tracking Technologies",
          content: [
            "We use necessary cookies for session management",
            "Cookies for authentication and security",
            "Local storage to save user preferences",
            "We use Vercel Analytics for analytics (non-personal data)"
          ]
        },
        children: {
          title: "7. Children's Privacy",
          content: [
            "Our application is intended for users aged 13 and over.",
            "We do not knowingly collect data from children under 13.",
            "If we discover that we have collected data from a child under 13, we will delete it immediately."
          ]
        },
        changes: {
          title: "8. Policy Changes",
          content: [
            "We may update this privacy policy from time to time.",
            "We will notify users of significant changes via email or in-app notifications.",
            "Updates will be posted on this page."
          ]
        },
        contactInfo: {
          title: "9. Contact",
          content: [
            "If you have questions about our privacy policy, please contact us.",
            "Web: https://www.callisterai.com"
          ]
        },
        accountDeletion: {
          title: "10. Account Deletion",
          content: [
            "If you wish to delete your account, please visit our account deletion page:",
            "Account Deletion: https://www.callisterai.com/delete-account",
            "Your account deletion request will be processed within 30 days and all your data will be permanently deleted."
          ]
        }
      }
    }
  };

  const currentContent = content[language];

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
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-4xl">
        {/* Title Section */}
        <div className="mb-12">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              {currentContent.title}
            </h1>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <Calendar className="w-4 h-4" />
            <span>{currentContent.lastUpdated}</span>
          </div>
        </div>

        {/* Introduction */}
        <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {currentContent.intro}
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {Object.entries(currentContent.sections).map(([key, section]) => (
            <section
              key={key}
              className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 lg:p-8 border border-gray-200 dark:border-gray-700"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {section.title}
              </h2>
              <ul className="space-y-3">
                {section.content.map((item, index) => (
                  <li
                    key={index}
                    className="flex items-start space-x-3 text-gray-700 dark:text-gray-300"
                  >
                    <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                    <span className="flex-1">{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
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
    </div>
  );
}
