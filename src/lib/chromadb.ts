import { ChromaClient, CloudClient, Collection } from "chromadb";

// ChromaDB client singleton
let chromaClient: ChromaClient | CloudClient | null = null;
let frcCollection: Collection | null = null;

// ChromaDB client'ı başlat (Local veya Cloud)
export async function initChromaDB() {
  try {
    if (chromaClient) return chromaClient;

    const chromaApiKey = process.env.CHROMA_API_KEY;
    const chromaTenant = process.env.CHROMA_TENANT;
    const chromaDatabase = process.env.CHROMA_DATABASE;
    const chromaUrl = process.env.CHROMA_URL;

    // Chroma Cloud kullan (production)
    if (chromaApiKey && chromaTenant && chromaDatabase) {
      console.log("[ChromaDB] Chroma Cloud modu başlatılıyor...");
      
      chromaClient = new CloudClient({
        apiKey: chromaApiKey,
        tenant: chromaTenant,
        database: chromaDatabase
      });
      
      console.log("[ChromaDB] Chroma Cloud bağlantısı başarılı");
      return chromaClient;
    }
    
    // Local ChromaClient kullan (development)
    if (chromaUrl) {
      console.log("[ChromaDB] Local modu");
      chromaClient = new ChromaClient({
        path: chromaUrl
      });
      console.log("[ChromaDB] Local client başlatıldı:", chromaUrl);
      return chromaClient;
    }

    console.warn("[ChromaDB] Credentials bulunamadı");
    return null;
  } catch (error) {
    console.error("[ChromaDB] Client başlatma hatası:", error);
    return null;
  }
}

// FRC collection'ını al veya oluştur
export async function getFRCCollection() {
  try {
    if (frcCollection) return frcCollection;

    const client = await initChromaDB();
    if (!client) return null;

    // Chroma Cloud: getOrCreateCollection kullan (embedding otomatik)
    frcCollection = await client.getOrCreateCollection({
      name: "frc_knowledge",
      metadata: { description: "FRC robotics knowledge base" }
    });
    
    console.log("[ChromaDB] FRC collection hazır");
    return frcCollection;
  } catch (error) {
    console.error("[ChromaDB] Collection hatası:", error);
    return null;
  }
}

// FRC bilgilerini ekle
export async function addFRCKnowledge(documents: {
  id: string;
  content: string;
  metadata: Record<string, any>;
}[]) {
  try {
    const collection = await getFRCCollection();
    if (!collection) {
      console.warn("[ChromaDB] Collection bulunamadı, bilgiler eklenmedi");
      return false;
    }

    await collection.add({
      ids: documents.map(d => d.id),
      documents: documents.map(d => d.content),
      metadatas: documents.map(d => d.metadata)
    });

    console.log(`[ChromaDB] ${documents.length} doküman eklendi`);
    return true;
  } catch (error) {
    console.error("[ChromaDB] Doküman ekleme hatası:", error);
    return false;
  }
}

// Semantik arama yap (filtreleme desteğiyle)
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
  try {
    const collection = await getFRCCollection();
    if (!collection) {
      console.warn("[ChromaDB] Collection bulunamadı, arama yapılamadı");
      return null;
    }

    // Metadata filtreleme oluştur
    let whereFilter: Record<string, any> | undefined = undefined;
    
    if (filters) {
      const filterConditions: Record<string, any> = {};
      
      if (filters.category) filterConditions.category = filters.category;
      if (filters.topic) filterConditions.topic = filters.topic;
      if (filters.difficulty) filterConditions.difficulty = filters.difficulty;
      if (filters.language) filterConditions.language = filters.language;
      if (filters.year) filterConditions.year = filters.year;
      
      if (Object.keys(filterConditions).length > 0) {
        whereFilter = filterConditions;
      }
    }

    const results = await collection.query({
      queryTexts: [query],
      nResults,
      where: whereFilter
    });

    if (!results.documents || !results.documents[0] || results.documents[0].length === 0) {
      console.log("[ChromaDB] Sonuç bulunamadı");
      return null;
    }

    console.log(`[ChromaDB] ${results.documents[0].length} sonuç bulundu`);
    
    return {
      documents: results.documents[0],
      metadatas: results.metadatas?.[0] || [],
      distances: results.distances?.[0] || []
    };
  } catch (error) {
    console.error("[ChromaDB] Arama hatası:", error);
    return null;
  }
}

// Kategori bazlı arama
export async function searchByCategory(category: string, nResults: number = 5) {
  return searchFRCKnowledge("", nResults, { category });
}

// Zorluk seviyesine göre arama
export async function searchByDifficulty(difficulty: string, nResults: number = 5) {
  return searchFRCKnowledge("", nResults, { difficulty });
}

// Yıla göre arama (örn: 2025 oyunu)
export async function searchByYear(year: number, nResults: number = 5) {
  return searchFRCKnowledge("", nResults, { year });
}

// Collection'ı sıfırla (geliştirme için)
export async function resetFRCCollection() {
  try {
    const client = await initChromaDB();
    if (!client) return false;

    try {
      await client.deleteCollection({ name: "frc_knowledge" });
      console.log("[ChromaDB] Collection silindi");
    } catch (error) {
      console.log("[ChromaDB] Collection zaten yok");
    }

    frcCollection = null;
    await getFRCCollection();
    
    console.log("[ChromaDB] Collection sıfırlandı");
    return true;
  } catch (error) {
    console.error("[ChromaDB] Collection sıfırlama hatası:", error);
    return false;
  }
}

// Collection'daki doküman sayısını al
export async function getFRCKnowledgeCount() {
  try {
    const collection = await getFRCCollection();
    if (!collection) return 0;

    const count = await collection.count();
    return count;
  } catch (error) {
    console.error("[ChromaDB] Count hatası:", error);
    return 0;
  }
}

