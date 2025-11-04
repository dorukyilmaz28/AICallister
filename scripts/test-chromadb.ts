// ChromaDB Test Script
// Kullanım: npx ts-node scripts/test-chromadb.ts

import { getFRCKnowledgeCount, searchFRCKnowledge, addFRCKnowledge, resetFRCCollection } from "../src/lib/chromadb";
import { frcKnowledgeBase } from "../src/lib/frc-knowledge-base";

async function testChromaDB() {
  console.log("🧪 ChromaDB Test Başlatılıyor...\n");

  try {
    // 1. Mevcut durumu kontrol et
    console.log("1️⃣ Mevcut doküman sayısı kontrol ediliyor...");
    const initialCount = await getFRCKnowledgeCount();
    console.log(`   ✅ Mevcut doküman sayısı: ${initialCount}\n`);

    // 2. Eğer boşsa, verileri yükle
    if (initialCount === 0) {
      console.log("2️⃣ Veritabanı boş, veriler yükleniyor...");
      const success = await addFRCKnowledge(frcKnowledgeBase);
      
      if (success) {
        console.log(`   ✅ ${frcKnowledgeBase.length} doküman eklendi\n`);
      } else {
        console.log("   ❌ Dokümanlar eklenemedi\n");
        console.log("   💡 OPENAI_API_KEY veya OPENROUTER_API_KEY kontrol edin");
        return;
      }
    }

    // 3. Doküman sayısını tekrar kontrol et
    const finalCount = await getFRCKnowledgeCount();
    console.log(`3️⃣ Toplam doküman sayısı: ${finalCount}\n`);

    // 4. Test aramaları yap
    console.log("4️⃣ Test Aramaları:\n");

    const testQueries = [
      "swerve drive nasıl programlanır?",
      "NEO motor SparkMAX kullanımı",
      "PID tuning nasıl yapılır?",
      "Team 254 hangi takım?",
      "autonomous PathPlanner"
    ];

    for (const query of testQueries) {
      console.log(`   🔍 Arama: "${query}"`);
      const results = await searchFRCKnowledge(query, 2);
      
      if (results && results.documents.length > 0) {
        console.log(`   ✅ ${results.documents.length} sonuç bulundu`);
        results.documents.forEach((doc, index) => {
          const metadata = results.metadatas[index];
          const distance = results.distances[index];
          const relevance = distance !== null && distance !== undefined 
            ? ((1 - distance) * 100).toFixed(1) 
            : "N/A";
          
          console.log(`      - ${metadata?.topic || "N/A"} (İlgililik: %${relevance})`);
        });
      } else {
        console.log(`   ❌ Sonuç bulunamadı`);
      }
      console.log();
    }

    console.log("✨ Test tamamlandı!\n");
    console.log("📊 Özet:");
    console.log(`   - Toplam Doküman: ${finalCount}`);
    console.log(`   - Kategoriler: ${[...new Set(frcKnowledgeBase.map(d => d.metadata.category))].join(", ")}`);
    console.log(`   - ChromaDB Durumu: ✅ Aktif`);

  } catch (error) {
    console.error("❌ Test hatası:", error);
    console.log("\n💡 Troubleshooting:");
    console.log("   1. ChromaDB server çalışıyor mu? (docker run -p 8000:8000 chromadb/chroma)");
    console.log("   2. .env dosyasında CHROMA_URL var mı?");
    console.log("   3. OPENAI_API_KEY veya OPENROUTER_API_KEY var mı?");
  }
}

// Reset fonksiyonu (opsiyonel)
async function resetAndTest() {
  console.log("🔄 Veritabanı sıfırlanıyor...\n");
  await resetFRCCollection();
  console.log("✅ Sıfırlama tamamlandı\n");
  await testChromaDB();
}

// Script çalıştırma
const args = process.argv.slice(2);
if (args.includes("--reset")) {
  resetAndTest();
} else {
  testChromaDB();
}

