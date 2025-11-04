import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getFRCKnowledgeCount, searchFRCKnowledge } from "@/lib/chromadb";

// ChromaDB istatistikleri ve monitoring
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Oturum açmanız gerekiyor." },
        { status: 401 }
      );
    }

    // Toplam doküman sayısı
    const totalDocuments = await getFRCKnowledgeCount();

    // Test aramaları yaparak performansı ölç
    const testQueries = [
      "swerve drive",
      "PID tuning",
      "autonomous PathPlanner"
    ];

    const searchPerformance: any[] = [];
    
    for (const query of testQueries) {
      const startTime = Date.now();
      const results = await searchFRCKnowledge(query, 3);
      const endTime = Date.now();
      
      searchPerformance.push({
        query,
        responseTime: `${endTime - startTime}ms`,
        resultsFound: results?.documents.length || 0,
        success: !!results
      });
    }

    // Ortalama arama süresi
    const avgResponseTime = searchPerformance.reduce((sum, item) => {
      return sum + parseInt(item.responseTime);
    }, 0) / searchPerformance.length;

    // Kategori dağılımı (hard-coded, production'da dinamik olmalı)
    const categoryDistribution = {
      "motor-controller": 2,
      "drive-system": 2,
      "autonomous": 1,
      "vision": 2,
      "control-theory": 1,
      "programming": 2,
      "game-strategy": 3,
      "teams": 2,
      "electrical": 1,
      "team-management": 1,
      "competition": 1
    };

    // Zorluk seviyesi dağılımı
    const difficultyDistribution = {
      "beginner": 4,
      "intermediate": 10,
      "advanced": 4,
      "reference": 2
    };

    // Sistem sağlığı
    const health = {
      chromadb: totalDocuments > 0 ? "healthy" : "empty",
      searchLatency: avgResponseTime < 500 ? "good" : avgResponseTime < 1000 ? "acceptable" : "slow",
      documentCoverage: totalDocuments >= 15 ? "good" : "needs-expansion"
    };

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      statistics: {
        totalDocuments,
        categoryDistribution,
        difficultyDistribution,
        avgSearchResponseTime: `${Math.round(avgResponseTime)}ms`
      },
      health,
      searchPerformance,
      recommendations: [
        totalDocuments < 20 && "Daha fazla doküman eklemeyi düşünün",
        avgResponseTime > 1000 && "ChromaDB performansını optimize edin",
        !health.chromadb.includes("healthy") && "ChromaDB'yi başlatın"
      ].filter(Boolean)
    });

  } catch (error: any) {
    console.error("[ChromaDB Stats] Error:", error);
    return NextResponse.json(
      { 
        error: "İstatistik alınamadı.",
        details: error?.message || "Bilinmeyen hata",
        status: "error"
      },
      { status: 500 }
    );
  }
}

