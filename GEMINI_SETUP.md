# 🔷 Google Gemini AI Setup

## ✨ Google Gemini 1.5 Flash Eklendi!

Artık **2 AI modeli** arasında seçim yapabilirsiniz:
- 🔷 **Gemini 1.5 Flash** (Google - Önerilen!)
- 🟣 **GLM-4.5-Air** (Zhipu AI)

---

## 🎯 Gemini API Key Ekleme

### 1️⃣ API Key'iniz Hazır:

```
AIzaSyDSLVtQ6hWztA4K2gxjdkF_Je-MxwQDBjM
```

**✅ Bu key'i Vercel'e ekleyin!**

---

### 2️⃣ Vercel Environment Variables:

Vercel Dashboard → Settings → Environment Variables:

```bash
GEMINI_API_KEY=AIzaSyDSLVtQ6hWztA4K2gxjdkF_Je-MxwQDBjM
```

**Her environment için ekleyin:**
- ✅ Production
- ✅ Preview
- ✅ Development

**Save** butonuna tıklayın.

---

### 3️⃣ Redeploy:

Vercel otomatik deploy edecek (yeni push zaten yaptık).

**Veya manuel:**
- Vercel Dashboard → Deployments → Latest → "..." → Redeploy

---

## 🚀 Kullanım

### AI Model Seçimi:

Chat sayfasının üstünde:

```
┌──────────────┐
│ 🔷 Gemini    │ ← Aktif (mavi)
│ 🟣 GLM       │ ← Pasif (gri)
└──────────────┘
```

**Gemini seçili olduğunda:**
- Google Gemini 1.5 Flash kullanılır
- Daha hızlı yanıtlar
- Daha akıllı cevaplar
- Türkçe desteği mükemmel

**GLM seçili olduğunda:**
- OpenRouter GLM-4.5-Air kullanılır
- Alternatif model
- Farklı cevap tarzı

---

## 📊 Gemini vs GLM Karşılaştırma:

| Özellik | Gemini 1.5 Flash | GLM-4.5-Air |
|---------|------------------|-------------|
| Provider | Google | Zhipu AI (OpenRouter) |
| Hız | ⚡⚡⚡ Çok hızlı | ⚡⚡ Hızlı |
| Türkçe | ⭐⭐⭐⭐⭐ Mükemmel | ⭐⭐⭐⭐ İyi |
| Kod Üretme | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Context | 1M tokens | 128K tokens |
| Free Tier | 15 req/min | 10 req/min |
| Maliyet | $0 | $0 |

**🏆 Gemini Kazandı!** (daha hızlı, daha akıllı, daha iyi Türkçe)

---

## 🧪 Test Edin:

Deploy tamamlandıktan sonra:

### Test 1: Gemini ile (varsayılan):
```
Chat → 🔷 Gemini seçili olduğundan emin olun
Soru: "2025 Reefscape stratejisi nedir?"
→ Hızlı ve detaylı cevap!
```

### Test 2: GLM ile:
```
Chat → 🟣 GLM butonuna tıklayın
Aynı soruyu sorun
→ Farklı perspektif göreceksiniz
```

### Test 3: Model Karşılaştırma:
```
1. 🔷 Gemini: "Swerve drive Java kodu"
2. 🟣 GLM: "Swerve drive Java kodu"
→ İkisinin de cevabını karşılaştırın
```

### Test 4: Sesli + Gemini:
```
1. 🔷 Gemini seçili
2. 🎤 Mikrofon: "TalonFX nasıl kullanılır?"
3. 🔊 Auto mode aktif
→ Gemini cevap verir + sesli okur!
```

---

## 💡 Hangi Modeli Kullanmalıyım?

### 🔷 Gemini Kullan (Önerilen):
- ✅ Hızlı yanıt istiyorsanız
- ✅ Türkçe mükemmel olsun
- ✅ Kod üretimi önemli
- ✅ Uzun context gerekiyorsa (1M tokens!)

### 🟣 GLM Kullan:
- ✅ Alternatif perspektif istiyorsanız
- ✅ Farklı AI tarzı denemek
- ✅ OpenRouter ekosistemi

**Genel Kullanım:** 🔷 **Gemini öneriyoruz!**

---

## 🔑 API Key'ler:

### Mevcut:
```bash
✅ GEMINI_API_KEY=AIzaSyDSLVtQ6hWztA4K2gxjdkF_Je-MxwQDBjM
✅ TBA_API_KEY (varsa)
❓ OPENROUTER_API_KEY (opsiyonel - GLM için)
```

### Sadece Gemini İçin Yeterli:
```bash
# Minimum çalışma için:
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="https://your-app.vercel.app"
GEMINI_API_KEY="AIzaSyDSLVtQ6hWztA4K2gxjdkF_Je-MxwQDBjM"

# Opsiyonel (gelişmiş özellikler):
TBA_API_KEY="..." # Takım bilgileri için
OPENROUTER_API_KEY="..." # GLM modeli için
```

---

## 📈 Gemini Özellikleri:

### Avantajlar:
- ✅ **Multimodal:** Metin, resim, video
- ✅ **Uzun context:** 1M token
- ✅ **Hızlı:** ~1-2 saniye yanıt
- ✅ **Akıllı:** GPT-4 seviyesi
- ✅ **Ücretsiz tier:** 15 req/min

### Free Tier Limitler:
- **Requests:** 15/dakika, 1500/gün
- **Tokens:** 1M input/gün, 100K output/gün
- **Modeller:** Gemini 1.5 Flash, Gemini 1.5 Pro

**FRC AI için ideal!** ✅

---

## 🎨 UI Değişiklikleri:

### Header'da Model Seçici:

```
┌─────────────────────────┐
│ 🔷 Gemini  🟣 GLM       │
│   (aktif)    (pasif)    │
└─────────────────────────┘
```

**Mavi:** Gemini aktif  
**Mor:** GLM aktif

### Hover Effect:
- Pasif buton üzerine gel → Beyazımsı
- Tıkla → Model değişir, yeni renk

---

## 🐛 Troubleshooting:

### "GEMINI_API_KEY bulunamadı"
**Çözüm:** Vercel environment variables ekleyin

### "Gemini API error"
**Çözüm:** 
1. API key geçerli mi?
2. Rate limit aşıldı mı? (15/min)
3. Google AI Studio'da key aktif mi?

### "Model yavaş"
**Çözüm:** 
- Gemini 1.5 Flash zaten en hızlısı
- Network sorun olabilir
- Free tier limit'e yaklaşmış olabilir

---

## 🚀 Deploy Durumu:

**Commit:** `548bdd6`  
**Push:** GitHub'a gönderildi  
**Vercel:** Build başlatılıyor  

**Beklenen build süresi:** ~40 saniye

---

## 📱 Deploy Sonrası:

### 1. Vercel'e GEMINI_API_KEY Ekleyin:

```
Settings → Environment Variables
↓
Name: GEMINI_API_KEY
Value: AIzaSyDSLVtQ6hWztA4K2gxjdkF_Je-MxwQDBjM
Environments: Production, Preview, Development
```

### 2. Test Edin:

```
https://www.callisterai.com

🔷 Gemini seçili → Soru sor → Hızlı cevap!
```

### 3. Sesli Test:

```
🎤 → "Merhaba Gemini!"
🔊 → Cevabı dinle
```

---

## 🎉 Özet:

| Özellik | Durum |
|---------|-------|
| ✅ Gemini SDK | Yüklendi |
| ✅ Gemini Endpoint | Oluşturuldu |
| ✅ Provider Switcher | UI'da aktif |
| ✅ TBA Integration | Gemini'de var |
| ✅ Sesli Destek | Uyumlu |
| ⏳ Vercel Deploy | İşleniyor |

**Şimdi yapmanız gereken:**
1. Vercel'e `GEMINI_API_KEY` ekleyin
2. Build tamamlanmasını bekleyin (~2 dk)
3. Test edin!

**🔷 Gemini çok daha iyi olacak!** 🚀

