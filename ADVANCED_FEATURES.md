# 🚀 Gelişmiş ChromaDB Özellikleri

Projenize eklenen tüm advanced özellikler ve kullanım kılavuzu.

---

## 📊 Genel Bakış

### Yeni Özellikler:

1. ✅ **Genişletilmiş Bilgi Tabanı** (21 doküman)
2. ✅ **Akıllı Metadata Filtreleme**
3. ✅ **Dinamik Arama Sonuç Sayısı**
4. ✅ **Takım Özel Bilgi Ekleme**
5. ✅ **Monitoring & Analytics**
6. ✅ **Chroma Cloud Entegrasyonu**
7. ✅ **Chief Delphi Scraper** (POC)

---

## 1. 📚 Genişletilmiş Bilgi Tabanı

### Yeni Eklenen Dokümanlar:

#### 2025 Oyun (Reefscape):
- `frc-2025-reefscape`: 2025 Reefscape stratejileri
  - Game pieces (Algae, Coral)
  - Skorlama alanları
  - Auto/Teleop/Endgame stratejileri

#### İleri Programlama:
- `wpilib-advanced-controls`: State Space, Kalman Filter, LQR
- `frc-computer-vision-photonvision`: PhotonVision, AprilTag tracking

#### Elektrik & Mekanik:
- `frc-electrical-systems`: Power systems, CAN bus, troubleshooting
- `frc-build-season-guide`: 8 haftalık build season timeline

#### Yarışma:
- `frc-competition-day-guide`: Yarışma günü stratejileri, pit crew rolleri

**Toplam: 21 doküman** (15 → 21)

### Kullanım:

```bash
# Veritabanını güncelle
npm run chromadb:reset
```

---

## 2. 🎯 Akıllı Metadata Filtreleme

### Özellikler:

Sorulara göre otomatik filtreleme:

```typescript
// Zorluk seviyesi
"başlangıç için swerve" → difficulty: "beginner"
"ileri seviye PID" → difficulty: "advanced"

// Kategori
"strateji 2025" → category: "game-strategy"
"elektrik wiring" → category: "electrical"
"vision camera" → category: "vision"

// Dil
"python kod" → language: "python"
"java örnek" → language: "java"

// Yıl
"2025 oyun" → year: 2025
"2024 Crescendo" → year: 2024
```

### API Kullanımı:

```typescript
import { searchFRCKnowledge } from "@/lib/chromadb";

// Manuel filtreleme
const results = await searchFRCKnowledge(
  "swerve drive programlama",
  5,  // sonuç sayısı
  {
    category: "drive-system",
    difficulty: "intermediate",
    language: "java"
  }
);

// Kategori araması
import { searchByCategory } from "@/lib/chromadb";
const visionDocs = await searchByCategory("vision", 5);

// Zorluk araması
import { searchByDifficulty } from "@/lib/chromadb";
const beginnerDocs = await searchByDifficulty("beginner", 10);

// Yıl araması
import { searchByYear } from "@/lib/chromadb";
const docs2025 = await searchByYear(2025, 5);
```

---

## 3. 🔢 Dinamik Arama Sonuç Sayısı

### Otomatik Ayarlama:

AI sorulara göre otomatik sonuç sayısı belirler:

```
"PID nedir?" → 2 sonuç (basit soru)
"swerve programlama nasıl yapılır?" → 4 sonuç (kod sorusu)
"hangi motor controller'lar var?" → 5 sonuç (liste sorusu)
```

### Algoritma:

```typescript
// Programlama soruları: 4 sonuç
if (includes("kod", "program", "nasıl yap")) → 4

// Tanım soruları: 2 sonuç  
if (includes("nedir", "ne demek")) → 2

// Liste soruları: 5 sonuç
if (includes("hangi", "liste", "öneriler")) → 5
```

---

## 4. 👥 Takım Özel Bilgi Ekleme

### Endpoint:

**POST** `/api/admin/team-knowledge`

### Format:

```json
{
  "documents": [
    {
      "id": "team-9999-strategy",
      "content": "Takım 9999 2025 stratejisi...",
      "metadata": {
        "category": "team-specific",
        "topic": "team-9999-strategy",
        "teamNumber": 9999,
        "year": 2025,
        "difficulty": "intermediate",
        "author": "Team Captain"
      }
    }
  ]
}
```

### Kullanım:

```bash
# Örnek döküman formatını göster
curl http://localhost:3000/api/admin/team-knowledge

# Takım bilgisi ekle
curl -X POST http://localhost:3000/api/admin/team-knowledge \
  -H "Content-Type: application/json" \
  -d '{
    "documents": [...]
  }'
```

### Örnekler:

**Takım Stratejisi:**
```json
{
  "id": "team-254-2025-strategy",
  "content": "Team 254 2025 Reefscape robot stratejisi...",
  "metadata": {
    "category": "team-specific",
    "teamNumber": 254,
    "year": 2025
  }
}
```

**Robot Kodu:**
```json
{
  "id": "team-9999-swerve-code",
  "content": "public class SwerveDrive extends SubsystemBase {...}",
  "metadata": {
    "category": "team-code",
    "topic": "swerve-implementation",
    "language": "java",
    "teamNumber": 9999
  }
}
```

---

## 5. 📊 Monitoring & Analytics

### Stats Endpoint:

**GET** `/api/admin/chromadb-stats`

### Yanıt:

```json
{
  "status": "ok",
  "timestamp": "2025-11-04T12:00:00.000Z",
  "statistics": {
    "totalDocuments": 21,
    "categoryDistribution": {
      "motor-controller": 2,
      "drive-system": 2,
      "vision": 2,
      "game-strategy": 3
    },
    "difficultyDistribution": {
      "beginner": 4,
      "intermediate": 10,
      "advanced": 4
    },
    "avgSearchResponseTime": "245ms"
  },
  "health": {
    "chromadb": "healthy",
    "searchLatency": "good",
    "documentCoverage": "good"
  },
  "searchPerformance": [
    {
      "query": "swerve drive",
      "responseTime": "230ms",
      "resultsFound": 3,
      "success": true
    }
  ],
  "recommendations": []
}
```

### Monitoring Dashboard Örnegi:

```typescript
// Frontend'de kullanım
useEffect(() => {
  const checkHealth = async () => {
    const response = await fetch('/api/admin/chromadb-stats');
    const data = await response.json();
    
    if (data.health.chromadb !== 'healthy') {
      alert('ChromaDB down!');
    }
  };
  
  // Her 5 dakikada kontrol et
  const interval = setInterval(checkHealth, 5 * 60 * 1000);
  return () => clearInterval(interval);
}, []);
```

---

## 6. ☁️ Chroma Cloud Entegrasyonu

### Konfigürasyon:

`.env` dosyasına ekleyin:

```bash
# Chroma Cloud
CHROMA_URL="https://your-cluster.api.chroma.io"
CHROMA_API_KEY="your-api-key"

# OpenAI (embeddings için)
OPENAI_API_KEY="sk-proj-xxxxx"
```

### Otomatik Mod Seçimi:

```typescript
// Kod otomatik tespit eder:

// CHROMA_API_KEY varsa → Chroma Cloud
// CHROMA_API_KEY yoksa → Local mode (localhost:8000)
```

### Avantajlar:

- ✅ Managed hosting
- ✅ Auto-scaling
- ✅ 99.9% uptime
- ✅ Backup & recovery
- ✅ Monitoring dashboards

### Migration:

```bash
# 1. Local data export (opsiyonel)
npm run chromadb:export

# 2. Chroma Cloud credentials ekle
# .env → CHROMA_URL, CHROMA_API_KEY

# 3. Restart & initialize
npm run dev
curl -X POST http://localhost:3000/api/admin/init-chromadb
```

---

## 7. 🕷️ Chief Delphi Scraper

### Script:

```bash
npm run scrape:chiefdelphi
```

### Özellikler:

- Chief Delphi API entegrasyonu
- RSS feed desteği
- Rate limiting (1 req/sec)
- JSON export
- Best practices guide

### Kullanım:

```bash
# Mock data ile test
npm run scrape:chiefdelphi

# RSS mode
npm run scrape:chiefdelphi -- --rss

# Help
npm run scrape:chiefdelphi -- --help
```

### Output:

`data/chiefdelphi-knowledge.json`

```json
[
  {
    "id": "chiefdelphi-123456",
    "content": "Chief Delphi Thread: Best Practices for Swerve...",
    "metadata": {
      "category": "chief-delphi",
      "source": "chiefdelphi",
      "author": "SwerveMaster",
      "replies": 45,
      "likes": 123
    }
  }
]
```

### ChromaDB'ye Ekleme:

```bash
# 1. Scrape
npm run scrape:chiefdelphi

# 2. JSON'u review et
cat data/chiefdelphi-knowledge.json

# 3. Admin endpoint ile ekle
curl -X POST http://localhost:3000/api/admin/team-knowledge \
  -d @data/chiefdelphi-knowledge.json
```

---

## 🎯 Kullanım Örnekleri

### Örnek 1: Filtreleme ile Arama

```typescript
// Başlangıç seviyesi Java swerve kodu
const results = await searchFRCKnowledge(
  "swerve drive örneği",
  3,
  {
    difficulty: "beginner",
    language: "java",
    category: "drive-system"
  }
);
```

### Örnek 2: Takım Bilgisi Ekleme

```bash
curl -X POST http://localhost:3000/api/admin/team-knowledge \
  -H "Content-Type: application/json" \
  -d '{
    "documents": [{
      "id": "team-9999-auto",
      "content": "Takım 9999 4-piece auto routine...",
      "metadata": {
        "category": "team-specific",
        "teamNumber": 9999,
        "topic": "autonomous"
      }
    }]
  }'
```

### Örnek 3: Health Check

```typescript
// Sistem sağlığını kontrol et
const healthCheck = async () => {
  const res = await fetch('/api/admin/chromadb-stats');
  const data = await res.json();
  
  console.log('Documents:', data.statistics.totalDocuments);
  console.log('Health:', data.health);
  console.log('Avg Response:', data.statistics.avgSearchResponseTime);
  
  return data.health.chromadb === 'healthy';
};
```

---

## 📈 Performance Tips

### 1. Sonuç Sayısını Optimize Edin

```typescript
// Çok fazla sonuç = yavaş
await searchFRCKnowledge(query, 10);  // ❌

// Optimal
await searchFRCKnowledge(query, 3);   // ✅
```

### 2. Filtreleme Kullanın

```typescript
// Tüm dokümanları ara = yavaş
await searchFRCKnowledge("motor");    // ❌

// Kategoriye özgü = hızlı
await searchFRCKnowledge("motor", 3, { 
  category: "motor-controller" 
});  // ✅
```

### 3. Caching

```typescript
// Cache search results (5 dakika)
const cache = new Map();

async function cachedSearch(query) {
  if (cache.has(query)) {
    return cache.get(query);
  }
  
  const results = await searchFRCKnowledge(query);
  cache.set(query, results);
  
  setTimeout(() => cache.delete(query), 5 * 60 * 1000);
  
  return results;
}
```

---

## 🔒 Security

### API Key Güvenliği:

```bash
# ❌ YAPMAYIN
OPENAI_API_KEY=sk-xxxxx  # Commit etmeyin!

# ✅ YAPIN
# .env'de tutun
# .gitignore'a ekleyin
# Vercel secrets kullanın
```

### Rate Limiting:

```typescript
// Scraper için rate limit
await new Promise(resolve => setTimeout(resolve, 1000)); // 1s delay
```

### Admin Endpointleri:

```typescript
// Admin kontrolü
if (session.user.role !== "admin") {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
```

---

## 📚 Dokümantasyon

- **Hızlı Başlangıç:** [CHROMADB_QUICKSTART.md](CHROMADB_QUICKSTART.md)
- **Detaylı Setup:** [CHROMADB_SETUP.md](CHROMADB_SETUP.md)
- **Production:** [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md)
- **Advanced:** Bu dosya

---

## 🎓 Best Practices

1. ✅ **Doküman Kalitesi**
   - Açık ve detaylı bilgi
   - Kod örnekleri ekle
   - Kaynakları belirt

2. ✅ **Metadata**
   - Doğru kategori seç
   - Zorluk seviyesi belirt
   - Tags ekle

3. ✅ **Performance**
   - Sonuç sayısını optimize et
   - Filtreleme kullan
   - Caching uygula

4. ✅ **Monitoring**
   - Stats endpoint'i kontrol et
   - Error rates izle
   - Response times track'le

5. ✅ **Security**
   - API keys güvenli tut
   - Admin endpoints koruma altında
   - Rate limiting uygula

---

## 🚀 Gelecek Özellikler (Roadmap)

- [ ] Multi-modal search (image + text)
- [ ] Conversation history RAG
- [ ] Auto-updating from TBA
- [ ] Team-specific AI training
- [ ] Real-time collaboration
- [ ] Voice search support

---

## 💡 Katkıda Bulunun

Yeni dokümanlar, özellikler veya iyileştirmeler için:

1. `src/lib/frc-knowledge-base.ts` - Yeni dokümanlar ekleyin
2. Pull request açın
3. Community ile paylaşın!

---

**🎉 Advanced ChromaDB özellikleriyle AI'nız artık çok daha güçlü!**

