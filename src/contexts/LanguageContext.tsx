"use client";

import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

type Language = "tr" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  tr: {
    // Common
    "common.home": "Ana Sayfa",
    "common.profile": "Profil",
    "common.chat": "Sohbet",
    "common.snippets": "Kod Snippets",
    "common.teams": "Takımlar",
    "common.discover": "Keşfet",
    "common.signin": "Giriş Yap",
    "common.signup": "Kayıt Ol",
    "common.signout": "Çıkış Yap",
    "common.loading": "Yükleniyor...",
    "common.save": "Kaydet",
    "common.cancel": "İptal",
    "common.delete": "Sil",
    "common.edit": "Düzenle",
    "common.search": "Ara",
    "common.clear": "Temizle",
    "common.dashboard": "Dashboard",
    "common.academy": "Academy",
    "common.admin": "Admin",
    
    // Home page
    "home.title": "Callister AI",
    "home.subtitle": "Robot geliştirmeyi hızlandıran, programlama görevlerini otomatikleştiren ve takımınızın yarışmaları kazanmasına yardımcı olan AI platformuyla tanışın.",
    "home.startChat": "Sohbet Başlat",
    "home.browseSnippets": "Snippet'leri Keşfet",
    "home.features.title": "Hız için tasarlandı. Büyümek için inşa edildi.",
    "home.features.subtitle": "FRC takımınızın zirvede yarışması için gereken tüm araçlar.",
    "home.stats.faster": "Daha Hızlı Geliştirme",
    "home.stats.availability": "AI Erişilebilirliği",
    "home.stats.focused": "FRC Odaklı",
    "home.feature1.title": "AI Destekli Sohbet",
    "home.feature1.description": "FRC sorularınıza anında cevaplar alın. AI'mız WPILib, robot mekaniği ve yarışma stratejilerini anlıyor.",
    "home.feature1.link": "Sohbet başlat",
    "home.feature2.title": "Kod Snippet'leri",
    "home.feature2.description": "Motorlar, sensörler, otonom modlar ve daha fazlası için hazır kullanıma uygun kod örnekleri kütüphanesine erişin.",
    "home.feature2.link": "Kütüphaneyi keşfet",
    "home.feature3.title": "Canlı TBA Verisi",
    "home.feature3.description": "The Blue Alliance API'den gerçek zamanlı takım istatistikleri, maç sonuçları ve sıralamalar.",
    "home.feature3.link": "Veriyi keşfet",
    "home.expertise.title": "Her FRC alanında uzman",
    "home.expertise.subtitle": "Mekanik tasarımdan yazılım geliştirmeye kadar, AI'mız FRC robotiğinin tüm yönlerini kapsar.",
    "home.expertise.general.title": "Genel FRC",
    "home.expertise.general.desc": "Robot tasarımı, yarışma kuralları ve oyun stratejisi.",
    "home.expertise.strategy.title": "Strateji",
    "home.expertise.strategy.desc": "Oyun analizi, maç planlaması ve ittifak koordinasyonu.",
    "home.expertise.mechanical.title": "Mekanik",
    "home.expertise.mechanical.desc": "Motor seçimi, güç aktarımı ve mekanizma tasarımı.",
    "home.expertise.programming.title": "Programlama",
    "home.expertise.programming.desc": "WPILib, simülasyon, otonom ve sensör entegrasyonu.",
    "home.technology.title": "En son teknoloji ile güçlendirildi",
    "home.technology.subtitle": "Endüstri lideri AI modelleri ve gerçek zamanlı FRC veri kaynakları üzerine inşa edildi.",
    "home.technology.openai.title": "OpenAI GPT",
    "home.technology.openai.desc": "Doğal konuşma ve kod üretimi için gelişmiş dil modelleri.",
    "home.technology.tba.title": "The Blue Alliance",
    "home.technology.tba.desc": "Gerçek zamanlı FRC takım verileri, maç sonuçları ve yarışma içgörüleri.",
    "home.technology.wpilib.title": "WPILib Dokümantasyonu",
    "home.technology.wpilib.desc": "Doğru programlama rehberliği için entegre resmi dokümantasyon.",
    "home.cta.title": "FRC yolculuğunuzu dönüştürmeye hazır mısınız?",
    "home.cta.subtitle": "Daha iyi robotlar inşa etmek, daha temiz kod yazmak ve daha fazla maç kazanmak için Callister AI kullanan takımlara katılın.",
    "home.cta.button": "Hemen Başla",
    "home.footer.copyright": "© 2025 Callister FRC AI. Tüm hakları saklıdır.",
    "home.footer.powered": "The Blue Alliance ve WPILib tarafından desteklenmektedir",
    "home.badge": "Gelişmiş AI ile Güçlendirildi",
    "home.signin": "Giriş Yap",
    "home.getStarted": "Başla",
    "home.pending": "Beklemede",
    
    // Chat
    "chat.title": "FRC AI Assistant",
    "chat.welcome": "Merhaba! FRC (FIRST Robotics Competition) AI asistanınızım. Bilgilerimi The Blue Alliance, WPILib Documentation ve FIRST resmi kaynaklarından alıyorum.\n\n**Size nasıl yardımcı olabilirim?**\n• Robot programlama (WPILib - Java/C++/Python)\n• Mekanik tasarım ve motor seçimi\n• Strateji ve oyun analizi\n• Simülasyon ve test\n• Yarışma kuralları ve FRC takımları\n\nSorularınızı sorabilirsiniz! 🚀",
    "chat.placeholder": "FRC hakkında sorunuzu yazın...",
    "chat.send": "Gönder",
    "chat.newChat": "Yeni Sohbet",
    
    // Snippets
    "snippets.title": "Kod Snippet Kütüphanesi",
    "snippets.subtitle": "FRC robotlarınız için hazır kod örnekleri",
    "snippets.new": "Yeni Snippet",
    "snippets.search": "Snippet ara...",
    "snippets.filter": "Filtrele:",
    "snippets.all": "Tümü",
    "snippets.category": "Kategori",
    "snippets.language": "Dil",
    "snippets.allLanguages": "Tüm Diller",
    "snippets.detail": "Detay",
    "snippets.copy": "Kopyala",
    "snippets.favorite": "Favorilere ekle",
    "snippets.views": "görüntülenme",
    "snippets.favorites": "favori",
    
    // Profile
    "profile.title": "Profil",
    "profile.conversations": "Konuşma",
    "profile.conversationHistory": "Konuşma Geçmişi",
    "profile.newConversation": "Yeni Sohbet",
    "profile.noConversations": "Henüz konuşmanız yok",
    "profile.startFirstChat": "AI asistanı ile ilk sohbetinizi başlatın!",
    
    // Auth
    "auth.signin.title": "Hoş Geldiniz",
    "auth.signin.subtitle": "Hesabınıza giriş yapın",
    "auth.signin.email": "Email",
    "auth.signin.password": "Şifre",
    "auth.signin.submit": "Giriş Yap",
    "auth.signin.noAccount": "Hesabınız yok mu?",
    "auth.signin.signupLink": "Kayıt olun",
    "auth.signup.title": "Hesap Oluşturun",
    "auth.signup.subtitle": "FRC AI asistanına katılın",
    "auth.signup.name": "Ad Soyad",
    "auth.signup.teamNumber": "FRC Takım Numarası",
    "auth.signup.passwordConfirm": "Şifre Tekrar",
    "auth.signup.submit": "Kayıt Ol",
    "auth.signup.hasAccount": "Zaten hesabınız var mı?",
    "auth.signup.signinLink": "Giriş yapın",
    
    // Admin
    "admin.panel": "Admin Paneli",
    "admin.teamManagement": "Takım Yönetimi",
    "admin.dashboard": "Admin Dashboard",
    "admin.approvedMembers": "Onaylı Üye",
    "admin.pending": "Bekleyen",
    "admin.pendingApproval": "Onay Bekleyenler",
    "admin.users": "kullanıcı",
    "admin.approve": "Onayla",
    "admin.reject": "Reddet",
    "admin.removeMember": "Üyeyi Çıkar",
    "admin.activeMembers": "aktif üye",
    "admin.teamNotFound": "Takım bilgileri bulunamadı.",
    "admin.backToTeam": "Takıma Dön",
    "admin.pendingRequests": "Bekleyen İstekler",
    "admin.approved": "Onaylanan",
    "admin.rejected": "Reddedilen",
    "admin.notifications": "Bildirimler",
    "admin.joinRequests": "Katılım İstekleri",
    "admin.noJoinNotifications": "Henüz katılım bildirimi yok",
    "admin.newMembersWillAppear": "Yeni üyeler kayıt olduğunda burada görünecek",
    "admin.noJoinRequests": "Henüz katılım isteği yok",
    "admin.requestsWillAppear": "Takım üyeleri katılım isteği gönderdiğinde burada görünecek",
    "admin.unknown": "Bilinmiyor",
    "admin.errorFetchingTeam": "Takım bilgileri alınırken bir hata oluştu.",
    "admin.errorProcessing": "İşlem sırasında bir hata oluştu.",
    "admin.errorFetchingRequests": "İstekler getirilirken hata oluştu.",
    "admin.errorFetchingNotifications": "Bildirimler getirilirken hata oluştu.",
    
    // Discover Teams
    "discover.title": "Takım Keşfet",
    "discover.subtitle": "FRC Takımları",
    "discover.hero.title": "Takım Keşfet",
    "discover.hero.subtitle": "FRC takımlarına katılın ve birlikte çalışın",
    "discover.search.placeholder": "Takım ara (isim, numara veya açıklama)...",
    "discover.noTeams": "Takım bulunamadı",
    "discover.noTeamsDesc": "Arama kriterlerinizi değiştirmeyi deneyin",
    "discover.member": "üye",
    "discover.members": "üye",
    "discover.isMember": "Üyesin",
    "discover.pending": "Beklemede",
    "discover.join": "Katıl",
    "discover.sending": "Gönderiliyor...",
    "discover.errorLoading": "Takımlar yüklenirken hata oluştu.",
    "discover.errorSending": "İstek gönderilirken hata oluştu.",
    "discover.joinSuccess": "Katılma isteğiniz gönderildi!",
    
    // Conversation Detail
    "conversation.title": "Konuşma Detayı",
    "conversation.backToProfile": "Profil",
    "conversation.delete": "Konuşmayı Sil",
    "conversation.deleting": "Siliniyor...",
    "conversation.newChat": "Yeni Sohbet",
    "conversation.messages": "Mesajlar",
    "conversation.noMessages": "Bu konuşmada mesaj bulunmuyor",
    "conversation.deleteConfirm": "Bu konuşmayı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.",
    "conversation.errorNotFound": "Konuşma bulunamadı.",
    "conversation.errorLoading": "Konuşma yüklenirken hata oluştu.",
    "conversation.errorDeleting": "Konuşma silinirken hata oluştu.",
    "conversation.context.general": "Genel FRC",
    "conversation.context.strategy": "Strateji",
    "conversation.context.mechanical": "Mekanik",
    "conversation.context.simulation": "Simülasyon",
    "conversation.messageCount": "mesaj",
    "conversation.you": "Sen",
  },
  en: {
    // Common
    "common.home": "Home",
    "common.profile": "Profile",
    "common.chat": "Chat",
    "common.snippets": "Code Snippets",
    "common.teams": "Teams",
    "common.discover": "Discover",
    "common.signin": "Sign In",
    "common.signup": "Sign Up",
    "common.signout": "Sign Out",
    "common.loading": "Loading...",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.search": "Search",
    "common.clear": "Clear",
    "common.dashboard": "Dashboard",
    "common.academy": "Academy",
    "common.admin": "Admin",
    
    // Home page
    "home.title": "Callister AI",
    "home.subtitle": "Meet the AI platform that accelerates robot development, automates programming tasks, and helps your team win competitions.",
    "home.startChat": "Start Chatting",
    "home.browseSnippets": "Browse Snippets",
    "home.features.title": "Designed to accelerate. Built to scale.",
    "home.features.subtitle": "Everything your FRC team needs to build, program, and compete at the highest level.",
    "home.stats.faster": "Faster Development",
    "home.stats.availability": "AI Availability",
    "home.stats.focused": "FRC Focused",
    "home.feature1.title": "AI-Powered Chat",
    "home.feature1.description": "Get instant answers to your FRC questions. Our AI understands WPILib, robot mechanics, and competition strategies.",
    "home.feature1.link": "Start chatting",
    "home.feature2.title": "Code Snippets",
    "home.feature2.description": "Access a library of ready-to-use code examples for motors, sensors, autonomous modes, and more.",
    "home.feature2.link": "Browse library",
    "home.feature3.title": "Live TBA Data",
    "home.feature3.description": "Real-time team statistics, match results, and rankings from The Blue Alliance API.",
    "home.feature3.link": "Explore data",
    "home.expertise.title": "Expert in every FRC domain",
    "home.expertise.subtitle": "From mechanical design to software development, our AI covers all aspects of FRC robotics.",
    "home.expertise.general.title": "General FRC",
    "home.expertise.general.desc": "Robot design, competition rules, and game strategy.",
    "home.expertise.strategy.title": "Strategy",
    "home.expertise.strategy.desc": "Game analysis, match planning, and alliance coordination.",
    "home.expertise.mechanical.title": "Mechanical",
    "home.expertise.mechanical.desc": "Motor selection, power transmission, and mechanism design.",
    "home.expertise.programming.title": "Programming",
    "home.expertise.programming.desc": "WPILib, simulation, autonomous, and sensor integration.",
    "home.technology.title": "Powered by cutting-edge technology",
    "home.technology.subtitle": "Built on industry-leading AI models and real-time FRC data sources.",
    "home.technology.openai.title": "OpenAI GPT",
    "home.technology.openai.desc": "Advanced language models for natural conversation and code generation.",
    "home.technology.tba.title": "The Blue Alliance",
    "home.technology.tba.desc": "Real-time FRC team data, match results, and competition insights.",
    "home.technology.wpilib.title": "WPILib Docs",
    "home.technology.wpilib.desc": "Integrated official documentation for accurate programming guidance.",
    "home.cta.title": "Ready to transform your FRC journey?",
    "home.cta.subtitle": "Join teams using Callister AI to build better robots, write cleaner code, and win more matches.",
    "home.cta.button": "Get Started Now",
    "home.footer.copyright": "© 2025 Callister FRC AI. All rights reserved.",
    "home.footer.powered": "Powered by The Blue Alliance & WPILib",
    "home.badge": "Powered by Advanced AI",
    "home.signin": "Sign In",
    "home.getStarted": "Get Started",
    "home.pending": "Pending",
    
    // Chat
    "chat.title": "FRC AI Assistant",
    "chat.welcome": "Hello! I'm your FRC (FIRST Robotics Competition) AI assistant. I get my knowledge from The Blue Alliance, WPILib Documentation, and official FIRST resources.\n\n**How can I help you?**\n• Robot programming (WPILib - Java/C++/Python)\n• Mechanical design and motor selection\n• Strategy and game analysis\n• Simulation and testing\n• Competition rules and FRC teams\n\nFeel free to ask me anything! 🚀",
    "chat.placeholder": "Ask your FRC question...",
    "chat.send": "Send",
    "chat.newChat": "New Chat",
    
    // Snippets
    "snippets.title": "Code Snippet Library",
    "snippets.subtitle": "Ready-to-use code examples for your FRC robots",
    "snippets.new": "New Snippet",
    "snippets.search": "Search snippets...",
    "snippets.filter": "Filter:",
    "snippets.all": "All",
    "snippets.category": "Category",
    "snippets.language": "Language",
    "snippets.allLanguages": "All Languages",
    "snippets.detail": "Detail",
    "snippets.copy": "Copy",
    "snippets.favorite": "Add to favorites",
    "snippets.views": "views",
    "snippets.favorites": "favorites",
    
    // Profile
    "profile.title": "Profile",
    "profile.conversations": "Conversation",
    "profile.conversationHistory": "Conversation History",
    "profile.newConversation": "New Chat",
    "profile.noConversations": "No conversations yet",
    "profile.startFirstChat": "Start your first chat with the AI assistant!",
    
    // Auth
    "auth.signin.title": "Welcome Back",
    "auth.signin.subtitle": "Sign in to your account",
    "auth.signin.email": "Email",
    "auth.signin.password": "Password",
    "auth.signin.submit": "Sign In",
    "auth.signin.noAccount": "Don't have an account?",
    "auth.signin.signupLink": "Sign up",
    "auth.signup.title": "Create Account",
    "auth.signup.subtitle": "Join the FRC AI assistant",
    "auth.signup.name": "Full Name",
    "auth.signup.teamNumber": "FRC Team Number",
    "auth.signup.passwordConfirm": "Confirm Password",
    "auth.signup.submit": "Sign Up",
    "auth.signup.hasAccount": "Already have an account?",
    "auth.signup.signinLink": "Sign in",
    
    // Admin
    "admin.panel": "Admin Panel",
    "admin.teamManagement": "Team Management",
    "admin.dashboard": "Admin Dashboard",
    "admin.approvedMembers": "Approved Member",
    "admin.pending": "Pending",
    "admin.pendingApproval": "Pending Approval",
    "admin.users": "users",
    "admin.approve": "Approve",
    "admin.reject": "Reject",
    "admin.removeMember": "Remove Member",
    "admin.activeMembers": "active members",
    "admin.teamNotFound": "Team information not found.",
    "admin.backToTeam": "Back to Team",
    "admin.pendingRequests": "Pending Requests",
    "admin.approved": "Approved",
    "admin.rejected": "Rejected",
    "admin.notifications": "Notifications",
    "admin.joinRequests": "Join Requests",
    "admin.noJoinNotifications": "No join notifications yet",
    "admin.newMembersWillAppear": "New members will appear here when they register",
    "admin.noJoinRequests": "No join requests yet",
    "admin.requestsWillAppear": "Join requests will appear here when team members send them",
    "admin.unknown": "Unknown",
    "admin.errorFetchingTeam": "An error occurred while fetching team information.",
    "admin.errorProcessing": "An error occurred during processing.",
    "admin.errorFetchingRequests": "An error occurred while fetching requests.",
    "admin.errorFetchingNotifications": "An error occurred while fetching notifications.",
    
    // Discover Teams
    "discover.title": "Discover Teams",
    "discover.subtitle": "FRC Teams",
    "discover.hero.title": "Discover Teams",
    "discover.hero.subtitle": "Join FRC teams and work together",
    "discover.search.placeholder": "Search team (name, number or description)...",
    "discover.noTeams": "No teams found",
    "discover.noTeamsDesc": "Try changing your search criteria",
    "discover.member": "member",
    "discover.members": "members",
    "discover.isMember": "You are a member",
    "discover.pending": "Pending",
    "discover.join": "Join",
    "discover.sending": "Sending...",
    "discover.errorLoading": "An error occurred while loading teams.",
    "discover.errorSending": "An error occurred while sending request.",
    "discover.joinSuccess": "Your join request has been sent!",
    
    // Conversation Detail
    "conversation.title": "Conversation Details",
    "conversation.backToProfile": "Profile",
    "conversation.delete": "Delete Conversation",
    "conversation.deleting": "Deleting...",
    "conversation.newChat": "New Chat",
    "conversation.messages": "Messages",
    "conversation.noMessages": "No messages in this conversation",
    "conversation.deleteConfirm": "Are you sure you want to delete this conversation? This action cannot be undone.",
    "conversation.errorNotFound": "Conversation not found.",
    "conversation.errorLoading": "An error occurred while loading conversation.",
    "conversation.errorDeleting": "An error occurred while deleting conversation.",
    "conversation.context.general": "General FRC",
    "conversation.context.strategy": "Strategy",
    "conversation.context.mechanical": "Mechanical",
    "conversation.context.simulation": "Simulation",
    "conversation.messageCount": "messages",
    "conversation.you": "You",
  }
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("tr");

  useEffect(() => {
    // Load language from localStorage
    const saved = localStorage.getItem("language") as Language;
    if (saved && (saved === "tr" || saved === "en")) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  const t = (key: string): string => {
    // @ts-expect-error - Dynamic key access is safe here
    const langTranslations = translations[language] as Record<string, string>;
    return langTranslations[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}

