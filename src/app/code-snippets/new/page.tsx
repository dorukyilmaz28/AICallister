"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Code2, Save, X, Home } from "lucide-react";

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
  const { data: session } = useSession();
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

    if (!title || !code || !language || !category) {
      alert("Başlık, kod, dil ve kategori gereklidir.");
      return;
    }

    setIsSaving(true);
    try {
      const tagsArray = tags.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0);

      const response = await fetch("/api/code-snippets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title,
          description: description || null,
          code,
          language,
          category,
          tags: tagsArray,
          isPublic
        })
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/code-snippets/${data.snippet.id}`);
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Snippet oluşturulurken hata oluştu.");
      }
    } catch (error) {
      console.error("Error creating snippet:", error);
      alert("Snippet oluşturulurken hata oluştu.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #3A006F 0%, #5A008F 50%, #8A00FF 100%)' }}>
      {/* Header */}
      <div className="border-b border-white/20 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Code2 className="w-8 h-8 text-white" />
            <h1 className="text-xl font-bold text-white">Yeni Kod Snippet</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Link
              href="/code-snippets"
              className="p-2 bg-white/20 hover:bg-white/30 border border-white/30 rounded-lg text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </Link>
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
          <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="space-y-6">
              <div>
                <label className="block text-white text-sm mb-2">Başlık *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Örn: TalonFX Motor Kontrolü"
                  className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                  required
                />
              </div>

              <div>
                <label className="block text-white text-sm mb-2">Açıklama</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Snippet hakkında kısa açıklama..."
                  rows={3}
                  className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white text-sm mb-2">Kategori *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value} className="bg-gray-800">
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-white text-sm mb-2">Dil *</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                    required
                  >
                    {languages.map(lang => (
                      <option key={lang.value} value={lang.value} className="bg-gray-800">
                        {lang.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-white text-sm mb-2">Etiketler (virgülle ayırın)</label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Örn: motor, talon, wpilib"
                  className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
              </div>

              <div>
                <label className="block text-white text-sm mb-2">Kod *</label>
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Kodunuzu buraya yazın..."
                  rows={15}
                  className="w-full px-4 py-2 bg-black/30 border border-white/30 rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-white/50 resize-none"
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <label htmlFor="isPublic" className="text-white text-sm">
                  Public olarak paylaş (herkes görebilir)
                </label>
              </div>

              <div className="flex items-center justify-end space-x-4">
                <Link
                  href="/code-snippets"
                  className="px-6 py-2 bg-white/20 hover:bg-white/30 border border-white/30 rounded-lg text-white transition-colors"
                >
                  İptal
                </Link>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-white transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? "Kaydediliyor..." : "Kaydet"}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

