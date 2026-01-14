// ChromaDB is disabled in serverless environment (Vercel)
// The required packages (@chroma-core/default-embed) contain native binaries
// that are not compatible with Vercel's serverless functions.
//
// AI still works great with:
// - TBA API (live team data)
// - WPILib RAG (keyword-based documentation)
// - GLM-4.5-Air (powerful AI model)

// Type definitions (for compatibility)
type ChromaClient = any;
type CloudClient = any;
type Collection = any;

// Disabled client singleton
let chromaClient: ChromaClient | CloudClient | null = null;
let frcCollection: Collection | null = null;

// ChromaDB client'ı başlat (DISABLED for serverless)
export async function initChromaDB() {
  console.log("[ChromaDB] Disabled in serverless environment");
  return null;
}

// FRC collection'ını al veya oluştur (DISABLED)
export async function getFRCCollection() {
  return null;
}

// FRC bilgilerini ekle (DISABLED)
export async function addFRCKnowledge(documents: {
  id: string;
  content: string;
  metadata: Record<string, any>;
}[]) {
  return false;
}

// Semantik arama yap (DISABLED)
export async function searchFRCKnowledge(
  query: string,
  nResults: number = 3,
  filters?: {
    category?: string;
    topic?: string;
    difficulty?: string;
    language?: string;
    year?: number;
  }
) {
  return null;
}

// Kategori bazlı arama (DISABLED)
export async function searchByCategory(category: string, nResults: number = 5) {
  return null;
}

// Zorluk seviyesine göre arama (DISABLED)
export async function searchByDifficulty(difficulty: string, nResults: number = 5) {
  return null;
}

// Yıla göre arama (DISABLED)
export async function searchByYear(year: number, nResults: number = 5) {
  return null;
}

// Collection'ı sıfırla (DISABLED)
export async function resetFRCCollection() {
  return false;
}

// Collection'daki doküman sayısını al (DISABLED)
export async function getFRCKnowledgeCount() {
  return 0;
}

