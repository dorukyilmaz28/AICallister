"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Code2, Plus, Search, Filter, Heart, Share2, Eye, 
  Copy, Check, Home, User, Bot, Trash2, Edit, Star
} from "lucide-react";
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';

interface CodeSnippet {
  id: string;
  title: string;
  description: string | null;
  code: string;
  language: string;
  category: string;
  tags: string[];
  isPublic: boolean;
  shareToken: string | null;
  viewCount: number;
  favoriteCount: number;
  isFavorite: boolean;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

const categories = [
  { value: "motor", label: "Motor Kontrol" },
  { value: "sensor", label: "Sensor" },
  { value: "autonomous", label: "Autonomous" },
  { value: "vision", label: "Vision" },
  { value: "pneumatics", label: "Pneumatics" },
  { value: "other", label: "Diğer" }
];

const languages = [
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "python", label: "Python" },
  { value: "javascript", label: "JavaScript" },
  { value: "other", label: "Diğer" }
];

export default function CodeSnippetsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
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

  const handleCopyShareLink = async (snippet: CodeSnippet) => {
    if (!snippet.shareToken) return;

    const shareUrl = `${window.location.origin}/code-snippets/share/${snippet.shareToken}`;
    await navigator.clipboard.writeText(shareUrl);
    setCopiedId(snippet.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyCode = async (code: string, snippetId: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedId(snippetId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3A006F 0%, #5A008F 50%, #8A00FF 100%)' }}>
        <div className="text-white text-xl">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #3A006F 0%, #5A008F 50%, #8A00FF 100%)' }}>
      {/* Header */}
      <div className="border-b border-white/20 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Code2 className="w-8 h-8 text-white" />
            <h1 className="text-xl font-bold text-white">Kod Snippet Kütüphanesi</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Link
              href="/"
              className="p-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-white transition-colors"
            >
              <Home className="w-4 h-4" />
            </Link>
            <Link
              href="/code-snippets/new"
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-white transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Snippet</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-white text-sm mb-2">Ara</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Snippet ara..."
                  className="w-full pl-10 pr-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
              </div>
            </div>
            <div>
              <label className="block text-white text-sm mb-2">Kategori</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                <option value="">Tümü</option>
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value} className="bg-gray-800">
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-white text-sm mb-2">Dil</label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                <option value="">Tümü</option>
                {languages.map(lang => (
                  <option key={lang.value} value={lang.value} className="bg-gray-800">
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Snippets Grid */}
        {snippets.length === 0 ? (
          <div className="text-center py-12">
            <Code2 className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <p className="text-white/70 text-lg mb-4">Henüz snippet bulunmuyor</p>
            <Link
              href="/code-snippets/new"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-white transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>İlk Snippet'i Oluştur</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {snippets.map((snippet) => (
              <div
                key={snippet.id}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">{snippet.title}</h3>
                    {snippet.description && (
                      <p className="text-white/70 text-sm mb-3">{snippet.description}</p>
                    )}
                    <div className="flex items-center space-x-4 text-xs text-white/60">
                      <span className="px-2 py-1 bg-white/20 rounded">{snippet.category}</span>
                      <span className="px-2 py-1 bg-white/20 rounded">{snippet.language}</span>
                      <span className="flex items-center space-x-1">
                        <Eye className="w-3 h-3" />
                        <span>{snippet.viewCount}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Heart className="w-3 h-3" />
                        <span>{snippet.favoriteCount}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Code Preview */}
                <div className="bg-black/30 rounded-lg p-4 mb-4 max-h-64 overflow-auto">
                  <pre className="text-sm">
                    <code className={`language-${snippet.language}`}>{snippet.code.substring(0, 500)}{snippet.code.length > 500 ? '...' : ''}</code>
                  </pre>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleFavorite(snippet.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        snippet.isFavorite
                          ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                          : 'bg-white/10 text-white/70 hover:bg-white/20'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${snippet.isFavorite ? 'fill-current' : ''}`} />
                    </button>
                    {snippet.shareToken && (
                      <button
                        onClick={() => handleCopyShareLink(snippet)}
                        className="p-2 bg-white/10 text-white/70 hover:bg-white/20 rounded-lg transition-colors"
                        title="Paylaşım linkini kopyala"
                      >
                        {copiedId === snippet.id ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Share2 className="w-4 h-4" />
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => handleCopyCode(snippet.code, snippet.id)}
                      className="p-2 bg-white/10 text-white/70 hover:bg-white/20 rounded-lg transition-colors"
                      title="Kodu kopyala"
                    >
                      {copiedId === snippet.id ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <Link
                    href={`/code-snippets/${snippet.id}`}
                    className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-white transition-colors text-sm"
                  >
                    Detay
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

