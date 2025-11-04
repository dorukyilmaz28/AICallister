import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { addFRCKnowledge, getFRCKnowledgeCount, resetFRCCollection } from "@/lib/chromadb";
import { frcKnowledgeBase } from "@/lib/frc-knowledge-base";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Admin kontrolü (isteğe bağlı - güvenlik için)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Oturum açmanız gerekiyor." },
        { status: 401 }
      );
    }

    if (session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Sadece admin bu işlemi yapabilir." },
        { status: 403 }
      );
    }

    const { reset } = await req.json().catch(() => ({ reset: false }));

    // Mevcut doküman sayısını kontrol et
    const currentCount = await getFRCKnowledgeCount();
    
    if (currentCount > 0 && !reset) {
      return NextResponse.json({
        message: "ChromaDB zaten dolu. Sıfırlamak için reset: true gönderin.",
        currentDocumentCount: currentCount
      });
    }

    // Reset istenirse collection'ı sıfırla
    if (reset) {
      console.log("[ChromaDB Init] Collection sıfırlanıyor...");
      await resetFRCCollection();
    }

    // FRC bilgilerini ekle
    console.log("[ChromaDB Init] Bilgiler ekleniyor...");
    const success = await addFRCKnowledge(frcKnowledgeBase);

    if (!success) {
      return NextResponse.json(
        { error: "ChromaDB'ye veri eklenemedi. Lütfen OPENAI_API_KEY veya OPENROUTER_API_KEY'i kontrol edin." },
        { status: 500 }
      );
    }

    const finalCount = await getFRCKnowledgeCount();

    return NextResponse.json({
      message: "ChromaDB başarıyla başlatıldı!",
      documentsAdded: frcKnowledgeBase.length,
      totalDocuments: finalCount,
      categories: [...new Set(frcKnowledgeBase.map(d => d.metadata.category))],
      topics: [...new Set(frcKnowledgeBase.map(d => d.metadata.topic))]
    });

  } catch (error: any) {
    console.error("[ChromaDB Init] Error:", error);
    return NextResponse.json(
      { 
        error: "ChromaDB başlatma hatası.",
        details: error?.message || "Bilinmeyen hata"
      },
      { status: 500 }
    );
  }
}

// GET endpoint - mevcut durumu kontrol et
export async function GET(req: NextRequest) {
  try {
    const count = await getFRCKnowledgeCount();
    
    return NextResponse.json({
      status: count > 0 ? "initialized" : "empty",
      documentCount: count,
      message: count > 0 
        ? `ChromaDB aktif - ${count} doküman yüklü` 
        : "ChromaDB boş - POST isteği ile başlatın"
    });
  } catch (error: any) {
    return NextResponse.json({
      status: "error",
      error: error?.message || "Bilinmeyen hata"
    }, { status: 500 });
  }
}

