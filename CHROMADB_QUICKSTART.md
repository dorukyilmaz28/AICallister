# 🚀 ChromaDB Hızlı Başlangıç (5 Dakika)

ChromaDB'yi 5 dakikada kurun ve test edin!

---

## ⚡ 1. ChromaDB Server'ı Başlatın

### Seçenek A: Docker (En Kolay) ⭐
```bash
docker run -p 8000:8000 chromadb/chroma
```

### Seçenek B: Python
```bash
pip install chromadb
chroma run --host 0.0.0.0 --port 8000
```

**Not:** Terminali açık bırakın, server çalışıyor olmalı!

---

## 🔑 2. API Key Ekleyin

`.env` dosyanızı açın ve ekleyin:

```bash
# ChromaDB için gerekli
OPENAI_API_KEY="sk-xxxxxxxxxxxxxxxx"  # OpenAI API key
CHROMA_URL="http://localhost:8000"
```

**OpenAI API key nereden alınır?**
1. https://platform.openai.com/api-keys
2. "Create new secret key" butonuna tıklayın
3. Key'i kopyalayın ve .env'ye yapıştırın

---

## 🎯 3. Veritabanını Doldurun

### Yöntem A: Admin Panel ile (Kolay)

1. Projeyi çalıştırın:
```bash
npm run dev
```

2. Admin olarak giriş yapın

3. Tarayıcınızda şu URL'i açın:
```
http://localhost:3000/api/admin/init-chromadb
```

4. POST isteği gönderin:
```bash
curl -X POST http://localhost:3000/api/admin/init-chromadb \
  -H "Content-Type: application/json"
```

### Yöntem B: Test Script ile (Hızlı)

```bash
npx ts-node scripts/test-chromadb.ts
```

**Çıktı şöyle olmalı:**
```
🧪 ChromaDB Test Başlatılıyor...

1️⃣ Mevcut doküman sayısı kontrol ediliyor...
   ✅ Mevcut doküman sayısı: 0

2️⃣ Veritabanı boş, veriler yükleniyor...
   ✅ 15 doküman eklendi

3️⃣ Toplam doküman sayısı: 15

4️⃣ Test Aramaları:
   🔍 Arama: "swerve drive nasıl programlanır?"
   ✅ 2 sonuç bulundu
      - swerve (İlgililik: %92.3)
      - differential-drive (İlgililik: %67.8)

✨ Test tamamlandı!
```

---

## ✅ 4. Test Edin!

Chat sayfasına gidin ve şunları deneyin:

### Test Soruları:

1. **"swerve drive nasıl programlanır?"**
   - ChromaDB swerve kinematics dokümanını bulmalı

2. **"NEO motorunu SparkMAX ile kullanma"**
   - SparkMAX motor controller bilgilerini getirmeli

3. **"PID tuning nasıl yapılır?"**
   - PID control dokümanını bulmalı

4. **"Team 254 kimdir?"**
   - Team 254 bilgilerini göstermeli

5. **"PathPlanner autonomous"**
   - PathPlanner dokümanını bulmalı

### Başarılı ChromaDB Göstergeleri:

Console'da (F12) şu logları göreceksiniz:
```
[ChromaDB] Semantik arama başlatılıyor: swerve drive...
[ChromaDB] 3 alakalı bilgi bulundu
```

AI cevabında şu bilgileri göreceksiniz:
- Kod örnekleri
- Detaylı açıklamalar
- İlgili linkler
- Spesifik FRC bilgileri

---

## 🐛 Sorun Giderme

### "Connection refused" Hatası
**Sebep:** ChromaDB server çalışmıyor

**Çözüm:**
```bash
# Terminalde çalıştırın
docker run -p 8000:8000 chromadb/chroma
```

---

### "Embedding function oluşturulamadı"
**Sebep:** OpenAI API key yok

**Çözüm:**
1. `.env` dosyasını açın
2. `OPENAI_API_KEY="sk-xxx"` ekleyin
3. Server'ı yeniden başlatın (`npm run dev`)

---

### "ChromaDB collection bulunamadı"
**Sebep:** Veritabanı boş

**Çözüm:**
```bash
# Test script çalıştırın
npx ts-node scripts/test-chromadb.ts
```

---

### "No documents found"
**Sebep:** Aramaya uygun doküman yok (nadiren olur)

**Çözüm:**
- Farklı sorular deneyin
- Veritabanını reset edin: `npx ts-node scripts/test-chromadb.ts --reset`

---

## 📊 Durumu Kontrol Et

Herhangi bir zamanda durumu kontrol edebilirsiniz:

```bash
curl http://localhost:3000/api/admin/init-chromadb
```

Yanıt:
```json
{
  "status": "initialized",
  "documentCount": 15,
  "message": "ChromaDB aktif - 15 doküman yüklü"
}
```

---

## 🎉 Başarılı!

Eğer test soruları başarılıysa, ChromaDB çalışıyor demektir! 🚀

Artık AI'nız:
- ✅ Anlamı kavrayarak arama yapıyor
- ✅ İlgili FRC bilgilerini buluyor
- ✅ Daha akıllı cevaplar veriyor
- ✅ Kod örnekleri sunuyor

---

## 🔄 Veritabanını Sıfırla (Gerekirse)

Yeni dokümanlar eklediyseniz veya sorun varsa:

```bash
npx ts-node scripts/test-chromadb.ts --reset
```

veya

```bash
curl -X POST http://localhost:3000/api/admin/init-chromadb \
  -H "Content-Type: application/json" \
  -d '{"reset": true}'
```

---

## 📚 Daha Fazla Bilgi

- **Detaylı Dokümantasyon:** [CHROMADB_SETUP.md](CHROMADB_SETUP.md)
- **Yeni Bilgi Ekleme:** `src/lib/frc-knowledge-base.ts`
- **ChromaDB Ayarları:** `src/lib/chromadb.ts`

---

**Sorular?** Chief Delphi veya projenizin GitHub'ında issue açın!

Happy coding! 🤖⚡

