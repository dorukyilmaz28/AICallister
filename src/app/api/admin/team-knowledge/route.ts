import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { addFRCKnowledge } from "@/lib/chromadb";

// Takım özel bilgi ekleme endpoint'i
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Oturum açmanız gerekiyor." },
        { status: 401 }
      );
    }

    // Admin veya takım lideri kontrolü
    if (session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Sadece admin bu işlemi yapabilir." },
        { status: 403 }
      );
    }

    const { documents } = await req.json();

    if (!documents || !Array.isArray(documents)) {
      return NextResponse.json(
        { error: "Geçerli doküman array'i gerekli." },
        { status: 400 }
      );
    }

    // Doküman formatını validate et
    for (const doc of documents) {
      if (!doc.id || !doc.content || !doc.metadata) {
        return NextResponse.json(
          { error: "Her doküman id, content ve metadata içermeli." },
          { status: 400 }
        );
      }
    }

    // ChromaDB'ye ekle
    const success = await addFRCKnowledge(documents);

    if (!success) {
      return NextResponse.json(
        { error: "Dokümanlar eklenemedi. ChromaDB bağlantısını kontrol edin." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Takım bilgileri başarıyla eklendi!",
      addedCount: documents.length,
      documents: documents.map(d => ({ id: d.id, category: d.metadata.category }))
    });

  } catch (error: any) {
    console.error("[Team Knowledge] Error:", error);
    return NextResponse.json(
      { 
        error: "Bilgi ekleme hatası.",
        details: error?.message || "Bilinmeyen hata"
      },
      { status: 500 }
    );
  }
}

// Örnek doküman formatını döndür (GET)
export async function GET(req: NextRequest) {
  const exampleDocument = {
    id: "team-9999-strategy",
    content: `Takım 9999 2025 Reefscape Stratejisi:
Takımımızın güçlü yanları:
- Hızlı processor cycling (<6 saniye)
- Güvenilir deep cage climb
- Autonomous 4-piece routine

Zayıf yanlarımız:
- Reef scoring tutarsız
- Defense zayıf

Önceliklerimiz:
1. Processor accuracy artırma
2. Climbing consistency
3. Auto optimization`,
    metadata: {
      category: "team-specific",
      topic: "team-9999-strategy",
      teamNumber: 9999,
      year: 2025,
      difficulty: "intermediate",
      author: "Team Captain"
    }
  };

  return NextResponse.json({
    message: "Takım bilgisi ekleme örneği",
    format: {
      id: "string (unique)",
      content: "string (detaylı bilgi)",
      metadata: {
        category: "string (team-specific, team-code, team-strategy)",
        topic: "string (unique topic name)",
        teamNumber: "number (optional)",
        year: "number (optional)",
        difficulty: "string (beginner/intermediate/advanced)",
        author: "string (optional)"
      }
    },
    example: exampleDocument,
    usage: {
      method: "POST",
      endpoint: "/api/admin/team-knowledge",
      body: {
        documents: [exampleDocument]
      }
    }
  });
}

