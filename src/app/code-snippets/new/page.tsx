"use client";

import { useState } from "react";
// Token-based auth (useSession removed)
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Code2, Save, X, Home, ArrowLeft } from "lucide-react";

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

export default function NewCodeSnippetPage() {
  // Token-based auth (useSession removed for static export)
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("java");
  const [category, setCategory] = useState("motor");
  const [tags, setTags] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !code) {
      alert("Başlık ve kod gereklidir.");
      return;
    }

    setIsSaving(true);
    try {
      const tagsArray = tags.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0);

      const { api } = await import('@/lib/api');
      const response = await api.post("/api/code-snippets/", {
        title,
        description: description || null,
        code,
        language,
        category,
        tags: tagsArray,
        isPublic
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/code-snippets/${data.snippet.id}`);
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Snippet oluşturulurken hata oluştu.");
      }
    } catch (error) {
      alert("Snippet oluşturulurken hata oluştu.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/code-snippets"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Geri Dön</span>
              </Link>
              <div className="h-6 w-px bg-gray-200"></div>
              <h1 className="text-base lg:text-lg font-bold text-gray-900">
                Yeni Snippet
              </h1>
            </div>
            <Link href="/" className="p-2 hover:bg-gray-100 rounded-lg">
              <Home className="w-5 h-5 text-gray-600" />
            </Link>
          </div>
        </div>
      </header>

      {/* Form */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-200 shadow-sm">
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Başlık *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Örn: Tank Drive Implementation"
              />
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-200 shadow-sm">
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Açıklama
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Snippet hakkında kısa açıklama..."
              />
            </div>

            {/* Category & Language */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-200 shadow-sm">
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Kategori *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-200 shadow-sm">
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Dil *
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {languages.map(lang => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-200 shadow-sm">
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Etiketler
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="tag1, tag2, tag3"
              />
              <p className="text-sm text-gray-500 mt-2">Virgülle ayırın</p>
            </div>

            {/* Code */}
            <div className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-200 shadow-sm">
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Kod *
              </label>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                rows={20}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Kodunuzu buraya yazın..."
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3">
              <Link
                href="/code-snippets"
                className="flex items-center space-x-2 px-6 py-3 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-semibold transition-all"
              >
                <X className="w-4 h-4" />
                <span>İptal</span>
              </Link>

              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center space-x-2 px-6 py-3 bg-gray-900 hover:bg-gray-800 rounded-xl text-white font-semibold transition-all disabled:opacity-50 shadow-lg"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? "Kaydediliyor..." : "Snippet Oluştur"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
