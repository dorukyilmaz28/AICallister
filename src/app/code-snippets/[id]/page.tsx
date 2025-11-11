"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Code2, Heart, Share2, Copy, Check, Edit, Trash2, Home, ArrowLeft } from "lucide-react";
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

export default function CodeSnippetDetailPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const snippetId = params.id as string;

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
      const response = await fetch(`/api/code-snippets/${snippetId}`);
      if (response.ok) {
        const data = await response.json();
        setSnippet(data.snippet);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Snippet bulunamadı.");
      }
    } catch (error) {
      console.error("Error fetching snippet:", error);
      setError("Snippet yüklenirken hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!session || !snippet) return;

    try {
      const response = await fetch(`/api/code-snippets/${snippetId}/favorite`, {
        method: "POST"
      });

      if (response.ok) {
        setSnippet(prev => prev ? {
          ...prev,
          isFavorite: !prev.isFavorite,
          favoriteCount: prev.isFavorite ? prev.favoriteCount - 1 : prev.favoriteCount + 1
        } : null);
      }
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

  const handleCopyShareLink = async () => {
    if (snippet?.shareToken) {
      const shareUrl = `${window.location.origin}/code-snippets/share/${snippet.shareToken}`;
      await navigator.clipboard.writeText(shareUrl);
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
      const response = await fetch(`/api/code-snippets/${snippetId}`, {
        method: "DELETE"
      });

      if (response.ok) {
        router.push("/code-snippets");
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Snippet silinirken hata oluştu.");
      }
    } catch (error) {
      console.error("Error deleting snippet:", error);
      alert("Snippet silinirken hata oluştu.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3A006F 0%, #5A008F 50%, #8A00FF 100%)' }}>
        <div className="text-white text-xl">Yükleniyor...</div>
      </div>
    );
  }

  if (error || !snippet) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3A006F 0%, #5A008F 50%, #8A00FF 100%)' }}>
        <div className="text-center">
          <div className="text-white text-xl mb-4">{error || "Snippet bulunamadı."}</div>
          <Link
            href="/code-snippets"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 border border-white/30 rounded-lg text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Geri Dön</span>
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = session?.user?.id === snippet.user.id;

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #3A006F 0%, #5A008F 50%, #8A00FF 100%)' }}>
      {/* Header */}
      <div className="border-b border-white/20 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link
              href="/code-snippets"
              className="flex items-center space-x-1 text-white/70 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Geri Dön</span>
            </Link>
          </div>
          <div className="flex items-center space-x-2">
            <Link
              href="/"
              className="p-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-white transition-colors"
            >
              <Home className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Snippet Info */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/20">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-white mb-2">{snippet.title}</h1>
                {snippet.description && (
                  <p className="text-white/70 mb-4">{snippet.description}</p>
                )}
                <div className="flex items-center space-x-4 text-sm text-white/60">
                  <span className="px-3 py-1 bg-white/20 rounded">{snippet.category}</span>
                  <span className="px-3 py-1 bg-white/20 rounded">{snippet.language}</span>
                  <span className="flex items-center space-x-1">
                    <Code2 className="w-4 h-4" />
                    <span>{snippet.viewCount} görüntüleme</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Heart className="w-4 h-4" />
                    <span>{snippet.favoriteCount} favori</span>
                  </span>
                </div>
                {snippet.tags.length > 0 && (
                  <div className="flex items-center space-x-2 mt-4">
                    {snippet.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded text-blue-300 text-xs">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 mt-4">
              {session && (
                <button
                  onClick={handleToggleFavorite}
                  className={`p-2 rounded-lg transition-colors ${
                    snippet.isFavorite
                      ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${snippet.isFavorite ? 'fill-current' : ''}`} />
                </button>
              )}
              {snippet.shareToken && (
                <button
                  onClick={handleCopyShareLink}
                  className="p-2 bg-white/10 text-white/70 hover:bg-white/20 rounded-lg transition-colors"
                  title="Paylaşım linkini kopyala"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                </button>
              )}
              <button
                onClick={handleCopyCode}
                className="p-2 bg-white/10 text-white/70 hover:bg-white/20 rounded-lg transition-colors"
                title="Kodu kopyala"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
              {isOwner && (
                <>
                  <Link
                    href={`/code-snippets/${snippetId}/edit`}
                    className="p-2 bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 rounded-lg transition-colors"
                    title="Düzenle"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="p-2 bg-red-500/20 text-red-300 hover:bg-red-500/30 rounded-lg transition-colors disabled:opacity-50"
                    title="Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Code */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4">Kod</h2>
            <div className="bg-black/30 rounded-lg p-4 overflow-auto">
              <pre className="text-sm">
                <code className={`language-${snippet.language}`}>{snippet.code}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

