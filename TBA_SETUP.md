# The Blue Alliance (TBA) API Kurulumu

## 🔑 TBA API Key Nasıl Alınır?

### 1. The Blue Alliance Hesabı Oluştur
1. https://www.thebluealliance.com/ adresine git
2. Sağ üstten **Sign In** tıkla
3. **Create Account** ile yeni hesap oluştur

### 2. API Key Al
1. Giriş yaptıktan sonra: https://www.thebluealliance.com/account
2. Sayfayı aşağı kaydır **"Read API Keys"** bölümünü bul
3. **"Add New Key"** butonuna tıkla
4. Açıklama gir (örnek: "Callister AI")
5. API Key'ini kopyala (örnek: `abcdef1234567890...`)

### 3. Vercel'de Environment Variable Ekle

#### Vercel Dashboard'da:
1. Projenize git: https://vercel.com/dashboard
2. **Settings** → **Environment Variables**
3. Yeni variable ekle:
   - **Name:** `TBA_API_KEY`
   - **Value:** Kopyaladığınız API key
   - **Environment:** Production, Preview, Development (hepsini seç)
4. **Save**

#### Local Development (.env.local):
```bash
TBA_API_KEY=your_api_key_here
```

### 4. Redeploy (Vercel)
1. **Deployments** sekmesine git
2. En son deployment'ın yanındaki **"..."** menüsüne tıkla
3. **"Redeploy"** seç

---

## ✅ Test Etme

API key'i ekledikten sonra şunu dene:

**Kullanıcı:** "254 numaralı takım nedir?"

**Beklenen Sonuç:** AI, The Blue Alliance'dan gerçek zamanlı bilgi çekerek cevap verecek:
- Takım ismi
- Şehir/Ülke  
- Rookie yılı
- Website vb.

---

## 🚀 RAG Sistemi Nasıl Çalışıyor?

```
1. Kullanıcı sorusu: "254 numaralı takım nasıl?"
   ↓
2. AI takım numarasını tespit eder: [254]
   ↓
3. TBA API'den bilgi çeker:
   - Takım ismi: "The Cheesy Poofs"
   - Şehir: San Jose, CA, USA
   - Rookie: 1999
   ↓
4. AI bu gerçek bilgilerle cevap verir
```

**Avantajlar:**
- ✅ Güncel ve doğru bilgi
- ✅ Gerçek TBA verileri
- ✅ Halüsinasyon yok
- ✅ Ücretsiz (TBA API free)

---

## 📝 Notlar

- TBA API rate limit: **60 request/dakika** (yeterli olacak)
- API key ücretsiz ve süresiz
- Sadece okuma izni (read-only)

