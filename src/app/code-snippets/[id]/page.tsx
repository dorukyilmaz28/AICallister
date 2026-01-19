"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Code2, Heart, Copy, Check, Edit, Trash2, Home, ArrowLeft, Eye } from "lucide-react";
import 'highlight.js/styles/github.css';
import Loading from "@/components/Loading";

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
  user: {
    id: string;
    name: string | null;
  };
}

export default function CodeSnippetDetailPage() {
  const router = useRouter();
  const params = useParams();
  const snippetId = params.id as string;
  
  // Token-based auth
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const [snippet, setSnippet] = useState<CodeSnippet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (snippetId) {
      fetchSnippet();
    }
  }, [snippetId]);

  const fetchSnippet = async () => {
    try {
      const { api } = await import('@/lib/api');
      const data = await api.get(`/api/code-snippets/${snippetId}/`);
      setSnippet(data.snippet);
    } catch (error: any) {
      console.error("Error fetching snippet:", error);
      setError(error?.message || error?.error || "Snippet yüklenirken hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!snippet) return;

    try {
      const { api } = await import('@/lib/api');
      await api.post(`/api/code-snippets/${snippetId}/favorite/`, {});
      setSnippet(prev => prev ? {
        ...prev,
        isFavorite: !prev.isFavorite,
        favoriteCount: prev.isFavorite ? prev.favoriteCount - 1 : prev.favoriteCount + 1
      } : null);
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const handleCopyCode = async () => {
    if (snippet) {
      await navigator.clipboard.writeText(snippet.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDelete = async () => {
    if (!snippet) return;
    
    const confirmed = window.confirm("Bu snippet'i silmek istediğinizden emin misiniz?");
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const { api } = await import('@/lib/api');
      await api.delete(`/api/code-snippets/${snippetId}/`);
      router.push("/code-snippets");
    } catch (error: any) {
      console.error("Error deleting snippet:", error);
      setError(error?.message || error?.error || "Snippet silinirken hata oluştu.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 transition-colors">
        <Loading />
      </div>
    );
  }

  if (error || !snippet) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 transition-colors">
        <div className="text-center">
          <div className="text-gray-900 dark:text-white text-xl mb-4">{error || "Snippet bulunamadı"}</div>
          <Link
            href="/code-snippets"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 rounded-lg text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Geri Dön</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-100 dark:border-gray-800 transition-colors">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/code-snippets"
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium hidden sm:inline">Geri Dön</span>
              </Link>
              <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>
              <img
                src="/8f28b76859c1479d839d270409be3586.jpg"
                alt="Callister Logo"
                className="w-8 h-8 object-cover rounded-xl"
              />
              <h1 className="text-base lg:text-lg font-bold text-gray-900 dark:text-white">
                Snippet Detayı
              </h1>
            </div>
            <Link href="/" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
              <Home className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="max-w-5xl mx-auto">
          {/* Snippet Info Card */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 lg:p-8 mb-6 border border-gray-200 dark:border-gray-800 shadow-sm">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {snippet.title}
            </h2>
            
            {snippet.description && (
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">{snippet.description}</p>
            )}

            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 border border-blue-200 dark:border-blue-700 rounded-lg text-blue-700 dark:text-blue-300 text-sm font-semibold">
                {snippet.category}
              </span>
              <span className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-700 dark:text-gray-200 text-sm font-medium">
                {snippet.language}
              </span>
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300 ml-auto">
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {snippet.viewCount} görüntüleme
                </span>
                <span className="flex items-center gap-1">
                  <Heart className={`w-4 h-4 ${snippet.isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                  {snippet.favoriteCount} favori
                </span>
              </div>
            </div>

            {snippet.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {snippet.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-lg text-xs font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleToggleFavorite}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  snippet.isFavorite
                    ? 'bg-red-50 dark:bg-red-900/30 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-700'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                }`}
              >
                <Heart className={`w-4 h-4 ${snippet.isFavorite ? 'fill-current' : ''}`} />
                <span>{snippet.isFavorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}</span>
              </button>

              <button
                onClick={handleCopyCode}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-200 font-medium transition-all"
              >
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Kopyalandı!' : 'Kodu Kopyala'}</span>
              </button>

              {(snippet as any).isDeletable && user?.id === snippet.user.id && (
                <>
                  <Link
                    href={`/code-snippets/${snippet.id}/edit`}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-700 rounded-lg text-blue-700 dark:text-blue-300 font-medium transition-all"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Düzenle</span>
                  </Link>

                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/60 border border-red-200 dark:border-red-700 rounded-lg text-red-600 font-medium transition-all disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{isDeleting ? 'Siliniyor...' : 'Sil'}</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Code Display */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 lg:p-8 border border-gray-200 dark:border-gray-800 shadow-sm">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Kod</h3>
            <div className="bg-gray-50 dark:bg-gray-950 rounded-xl p-6 overflow-x-auto">
              <pre className="text-sm text-gray-900 dark:text-gray-100">
                <code className={`language-${snippet.language}`}>{snippet.code}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
