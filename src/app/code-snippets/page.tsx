"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Code2, Plus, Search, Heart, Eye, 
  Copy, Check, Home, ChevronRight, Sparkles, Languages
} from "lucide-react";
import 'highlight.js/styles/github.css';
import Loading from "@/components/Loading";
import { useLanguage } from "@/contexts/LanguageContext";

interface CodeSnippet {
  id: string;
  title: string;
  description: string | null;
  code: string;
  language: string;
  category: string;
  tags: string[];
  viewCount: number;
  favoriteCount: number;
  isFavorite: boolean;
  createdAt: string;
  user: {
    name: string | null;
  };
}

const categories = [
  { value: "motor", label: "Motor Kontrol", color: "from-blue-500 to-blue-600" },
  { value: "sensor", label: "Sensor", color: "from-green-500 to-green-600" },
  { value: "autonomous", label: "Autonomous", color: "from-purple-500 to-purple-600" },
  { value: "vision", label: "Vision", color: "from-orange-500 to-orange-600" },
  { value: "pneumatics", label: "Pneumatics", color: "from-pink-500 to-pink-600" },
  { value: "other", label: "Diğer", color: "from-gray-500 to-gray-600" }
];

const languages = [
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "python", label: "Python" },
  { value: "javascript", label: "JavaScript" },
];

export default function CodeSnippetsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const [snippets, setSnippets] = useState<CodeSnippet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (session) {
      fetchSnippets();
    }
  }, [session, status, router, selectedCategory, selectedLanguage, searchQuery]);

  const fetchSnippets = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.append("category", selectedCategory);
      if (selectedLanguage) params.append("language", selectedLanguage);
      if (searchQuery) params.append("search", searchQuery);

      const response = await fetch(`/api/code-snippets?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setSnippets(data.snippets || []);
      }
    } catch (error) {
      console.error("Error fetching snippets:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFavorite = async (snippetId: string) => {
    if (!session) return;

    try {
      const response = await fetch(`/api/code-snippets/${snippetId}/favorite`, {
        method: "POST"
      });

      if (response.ok) {
        setSnippets(prev => prev.map(snippet => 
          snippet.id === snippetId 
            ? { 
                ...snippet, 
                isFavorite: !snippet.isFavorite,
                favoriteCount: snippet.isFavorite 
                  ? snippet.favoriteCount - 1 
                  : snippet.favoriteCount + 1
              }
            : snippet
        ));
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const handleCopyCode = async (code: string, snippetId: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedId(snippetId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-3 group">
              <img
                src="/8f28b76859c1479d839d270409be3586.jpg"
                alt="Callister Logo"
                className="w-12 h-12 lg:w-16 lg:h-16 object-cover rounded-xl transition-transform group-hover:scale-105"
              />
              <div>
                <h1 className="text-base lg:text-lg font-bold text-gray-900">
                  Code Snippets
                </h1>
                <p className="text-xs text-gray-500 hidden sm:block">
                  WPILib Kod Kütüphanesi
                </p>
              </div>
            </Link>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setLanguage(language === "tr" ? "en" : "tr")}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors"
                title={language === "tr" ? "Switch to English" : "Türkçe'ye Geç"}
              >
                <Languages className="w-4 h-4" />
                <span className="hidden sm:inline text-sm font-medium">{language.toUpperCase()}</span>
              </button>
              <Link
                href="/"
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
              >
                <Home className="w-4 h-4" />
              </Link>
              <Link
                href="/code-snippets/new"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 rounded-lg text-white text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Yeni Snippet</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 lg:py-16 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white rounded-full mb-6 shadow-sm">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">WPILib Code Library</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Kod Snippet Kütüphanesi
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              FRC robotlarınız için hazır kod örnekleri
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Snippet ara..."
                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold text-gray-700">Filtrele:</span>
            
            {/* Category Pills */}
            <button
              onClick={() => setSelectedCategory("")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedCategory === ""
                  ? "bg-gray-900 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Tümü
            </button>
            
            {categories.map(cat => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value === selectedCategory ? "" : cat.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedCategory === cat.value
                    ? `bg-gradient-to-r ${cat.color} text-white shadow-md`
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {cat.label}
              </button>
            ))}

            {/* Language Filter */}
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-700 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="">Tüm Diller</option>
              {languages.map(lang => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Snippets Grid */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {snippets.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Code2 className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Henüz snippet bulunmuyor</h3>
              <p className="text-gray-600 mb-8">İlk kod örneğini siz oluşturun!</p>
              <Link
                href="/code-snippets/new"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gray-900 hover:bg-gray-800 rounded-lg text-white font-semibold transition-colors shadow-lg"
              >
                <Plus className="w-5 h-5" />
                <span>İlk Snippet'i Oluştur</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {snippets.map((snippet, index) => (
                <div
                  key={snippet.id}
                  className="group bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  style={{ 
                    animation: `fadeIn 0.5s ease-out ${index * 0.1}s both`
                  }}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {snippet.title}
                      </h3>
                      {snippet.description && (
                        <p className="text-sm text-gray-600 mb-3">{snippet.description}</p>
                      )}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-3 py-1 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg text-blue-700 text-xs font-semibold">
                          {snippet.category}
                        </span>
                        <span className="px-3 py-1 bg-gray-100 rounded-lg text-gray-700 text-xs font-medium">
                          {snippet.language}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Code Preview */}
                  <div className="bg-gray-50 rounded-xl p-4 mb-4 max-h-48 overflow-hidden relative group/code">
                    <pre className="text-sm text-gray-800 font-mono overflow-x-auto">
                      <code>{snippet.code.substring(0, 300)}{snippet.code.length > 300 ? '...' : ''}</code>
                    </pre>
                    <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-gray-50 to-transparent"></div>
                  </div>

                  {/* Actions & Stats */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {snippet.viewCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className={`w-4 h-4 ${snippet.isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                        {snippet.favoriteCount}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleFavorite(snippet.id)}
                        className={`p-2 rounded-lg transition-all duration-200 ${
                          snippet.isFavorite
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        title={snippet.isFavorite ? "Favorilerden çıkar" : "Favorilere ekle"}
                      >
                        <Heart className={`w-4 h-4 ${snippet.isFavorite ? 'fill-current' : ''}`} />
                      </button>

                      <button
                        onClick={() => handleCopyCode(snippet.code, snippet.id)}
                        className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors"
                        title="Kodu kopyala"
                      >
                        {copiedId === snippet.id ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>

                      <Link
                        href={`/code-snippets/${snippet.id}`}
                        className="inline-flex items-center space-x-1 px-4 py-2 bg-gray-900 hover:bg-gray-800 rounded-lg text-white text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        <span>Detay</span>
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
