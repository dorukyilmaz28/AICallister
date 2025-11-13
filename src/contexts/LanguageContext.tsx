"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

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
    
    // Home page
    "home.title": "The new standard in FRC AI assistance",
    "home.subtitle": "Meet the AI platform that accelerates robot development, automates programming tasks, and helps your team win competitions.",
    "home.startChat": "Start Chatting",
    "home.browseSnippets": "Browse Snippets",
    "home.features.title": "Designed to accelerate. Built to scale.",
    "home.features.subtitle": "Everything your FRC team needs to build, program, and compete at the highest level.",
    
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
    
    // Home page
    "home.title": "The new standard in FRC AI assistance",
    "home.subtitle": "Meet the AI platform that accelerates robot development, automates programming tasks, and helps your team win competitions.",
    "home.startChat": "Start Chatting",
    "home.browseSnippets": "Browse Snippets",
    "home.features.title": "Designed to accelerate. Built to scale.",
    "home.features.subtitle": "Everything your FRC team needs to build, program, and compete at the highest level.",
    
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
  }
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
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
    return translations[language][key as keyof typeof translations.tr] || key;
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

