// Chief Delphi Forum Scraper (Proof of Concept)
// Bu script Chief Delphi forumundan FRC bilgilerini çeker ve ChromaDB'ye ekler

/*
NOT: Chief Delphi scraping için:
1. Rate limiting önemli (DoS prevention)
2. robots.txt'e uyun
3. API varsa önce onu kullanın
4. İzin almadan büyük scale scraping yapmayın

Chief Delphi API: https://www.chiefdelphi.com/api-docs
*/

// Kullanım: npx ts-node scripts/scrape-chiefdelphi.ts

interface ChiefDelphiPost {
  id: number;
  title: string;
  content: string;
  author: string;
  created_at: string;
  category: string;
  tags: string[];
  replies: number;
  likes: number;
}

// Chief Delphi API endpoint'leri (örnek)
const CD_API_BASE = "https://www.chiefdelphi.com";
const CD_API_KEY = process.env.CHIEFDELPHI_API_KEY; // API key gerekli

async function fetchPopularThreads(category: string, limit: number = 10): Promise<ChiefDelphiPost[]> {
  try {
    console.log(`\n📥 Fetching ${category} threads from Chief Delphi...`);
    
    // API call (gerçek API endpoint'i kullanın)
    // const response = await fetch(`${CD_API_BASE}/api/v1/topics/${category}?limit=${limit}`, {
    //   headers: {
    //     'Api-Key': CD_API_KEY,
    //     'Api-Username': 'your-username'
    //   }
    // });
    
    // Mock data (gerçek API için yukarıdaki kodu uncomment edin)
    const mockPosts: ChiefDelphiPost[] = [
      {
        id: 123456,
        title: "Best Practices for Swerve Drive in 2025",
        content: `Discussing the latest swerve drive implementations...
        
Key points:
- Use SDS modules for reliability
- Optimize PID tuning with feedforward
- PathPlanner integration is crucial
- Field-oriented control is standard
        
Code examples and discussion...`,
        author: "SwerveMaster",
        created_at: "2025-01-15",
        category: "technical",
        tags: ["swerve", "drive", "programming"],
        replies: 45,
        likes: 123
      },
      {
        id: 123457,
        title: "2025 Reefscape Strategy Discussion",
        content: `Early season strategy analysis for Reefscape...
        
Meta predictions:
- Processor scoring will dominate
- Fast cycles (<7s) crucial
- Deep cage climbs standard
- Defense viable but risky
        
Alliance selection considerations...`,
        author: "StrategyGuru",
        created_at: "2025-01-10",
        category: "strategy",
        tags: ["reefscape", "2025", "strategy"],
        replies: 78,
        likes: 234
      }
    ];
    
    console.log(`✅ Fetched ${mockPosts.length} threads`);
    return mockPosts;
    
  } catch (error) {
    console.error("❌ Error fetching threads:", error);
    return [];
  }
}

function convertToKnowledgeBase(posts: ChiefDelphiPost[]) {
  return posts.map(post => ({
    id: `chiefdelphi-${post.id}`,
    content: `Chief Delphi Thread: ${post.title}

Author: ${post.author}
Date: ${post.created_at}
Replies: ${post.replies} | Likes: ${post.likes}

${post.content}

Tags: ${post.tags.join(", ")}
Source: ${CD_API_BASE}/t/${post.id}`,
    metadata: {
      category: "chief-delphi",
      topic: post.category,
      source: "chiefdelphi",
      author: post.author,
      date: post.created_at,
      replies: post.replies,
      likes: post.likes,
      tags: post.tags,
      difficulty: "intermediate"
    }
  }));
}

async function scrapeChiefDelphi() {
  console.log("🔍 Chief Delphi Scraper Starting...\n");
  
  if (!CD_API_KEY) {
    console.log("⚠️  CHIEFDELPHI_API_KEY bulunamadı!");
    console.log("💡 .env dosyasına CHIEFDELPHI_API_KEY ekleyin");
    console.log("📚 API docs: https://www.chiefdelphi.com/api-docs\n");
    console.log("🧪 Mock data ile devam ediliyor...\n");
  }
  
  // Kategoriler
  const categories = [
    "technical",
    "strategy",
    "programming",
    "mechanical"
  ];
  
  let allPosts: ChiefDelphiPost[] = [];
  
  // Her kategoriden popüler thread'leri çek
  for (const category of categories) {
    const posts = await fetchPopularThreads(category, 5);
    allPosts = [...allPosts, ...posts];
    
    // Rate limiting (DoS prevention)
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Knowledg base formatına çevir
  const knowledgeBase = convertToKnowledgeBase(allPosts);
  
  console.log("\n📊 Summary:");
  console.log(`   Total threads: ${knowledgeBase.length}`);
  console.log(`   Categories: ${categories.join(", ")}`);
  
  // ChromaDB'ye eklemek için
  console.log("\n💾 To add to ChromaDB:");
  console.log("   1. Import addFRCKnowledge from @/lib/chromadb");
  console.log("   2. Call: await addFRCKnowledge(knowledgeBase)");
  
  // JSON olarak kaydet
  const fs = require('fs');
  fs.writeFileSync(
    'data/chiefdelphi-knowledge.json',
    JSON.stringify(knowledgeBase, null, 2)
  );
  
  console.log("\n✅ Data saved to: data/chiefdelphi-knowledge.json");
  console.log("\n🎯 Next Steps:");
  console.log("   1. Review the extracted data");
  console.log("   2. Add to ChromaDB via admin endpoint");
  console.log("   3. Test with chat queries");
  
  return knowledgeBase;
}

// Alternatif: RSS Feed kullanarak
async function scrapeViaRSS() {
  console.log("\n📡 Alternative: RSS Feed Scraping");
  console.log("Chief Delphi RSS: https://www.chiefdelphi.com/latest.rss");
  console.log("Use RSS parser: npm install rss-parser");
  
  // RSS parser örneği
  // const Parser = require('rss-parser');
  // const parser = new Parser();
  // const feed = await parser.parseURL('https://www.chiefdelphi.com/latest.rss');
  // feed.items.forEach(item => { ... });
}

// Best Practices
console.log(`
╔════════════════════════════════════════════════════════════╗
║          Chief Delphi Scraping Best Practices             ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  ✅ DO:                                                    ║
║    - Check robots.txt                                     ║
║    - Use official API if available                        ║
║    - Implement rate limiting (1 req/sec)                  ║
║    - Cache results                                        ║
║    - Respect community guidelines                         ║
║                                                            ║
║  ❌ DON'T:                                                 ║
║    - Scrape without permission at scale                   ║
║    - Overload servers                                     ║
║    - Ignore rate limits                                   ║
║    - Scrape personal data                                 ║
║    - Violate Terms of Service                             ║
║                                                            ║
║  📚 Resources:                                             ║
║    - API Docs: https://www.chiefdelphi.com/api-docs       ║
║    - robots.txt: https://www.chiefdelphi.com/robots.txt   ║
║    - TOS: https://www.chiefdelphi.com/tos                 ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
`);

// Script çalıştırma
const args = process.argv.slice(2);

if (args.includes("--help") || args.includes("-h")) {
  console.log(`
Usage: npx ts-node scripts/scrape-chiefdelphi.ts [options]

Options:
  --rss       Use RSS feed instead of API
  --help, -h  Show this help message

Environment Variables:
  CHIEFDELPHI_API_KEY   Your Chief Delphi API key

Examples:
  npx ts-node scripts/scrape-chiefdelphi.ts
  npx ts-node scripts/scrape-chiefdelphi.ts --rss
  `);
  process.exit(0);
}

if (args.includes("--rss")) {
  scrapeViaRSS();
} else {
  scrapeChiefDelphi();
}

