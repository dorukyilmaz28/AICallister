"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Code2, Heart, Copy, Check, Home, ArrowLeft } from "lucide-react";
import 'highlight.js/styles/github-dark.css';

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
  user: {
    name: string | null;
  };
}

export default function SharedCodeSnippetPage() {
  const params = useParams();
  const token = params.token as string;

  const [snippet, setSnippet] = useState<CodeSnippet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (token) {
      fetchSharedSnippet();
    }
  }, [token]);

  const fetchSharedSnippet = async () => {
    try {
      const response = await fetch(`/api/code-snippets/share/${token}`);
      if (response.ok) {
        const data = await response.json();
        setSnippet(data.snippet);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Snippet bulunamadı.");
      }
    } catch (error) {
      console.error("Error fetching shared snippet:", error);
      setError("Snippet yüklenirken hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = async () => {
    if (snippet) {
      await navigator.clipboard.writeText(snippet.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
            href="/"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 border border-white/30 rounded-lg text-white transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Ana Sayfa</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #3A006F 0%, #5A008F 50%, #8A00FF 100%)' }}>
      {/* Header */}
      <div className="border-b border-white/20 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link
              href="/"
              className="flex items-center space-x-1 text-white/70 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Ana Sayfa</span>
            </Link>
          </div>
          <div className="flex items-center space-x-2">
            <Link
              href="/"
              className="p-2 bg-white/20 hover:bg-white/30 border border-white/30 rounded-lg text-white transition-colors"
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
            <h1 className="text-3xl font-bold text-white mb-2">{snippet.title}</h1>
            {snippet.description && (
              <p className="text-white/70 mb-4">{snippet.description}</p>
            )}
            <div className="flex items-center space-x-4 text-sm text-white/60 mb-4">
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
              <div className="flex items-center space-x-2 mb-4">
                {snippet.tags.map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded text-blue-300 text-xs">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            <button
              onClick={handleCopyCode}
              className="p-2 bg-white/10 text-white/70 hover:bg-white/20 rounded-lg transition-colors"
              title="Kodu kopyala"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
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

