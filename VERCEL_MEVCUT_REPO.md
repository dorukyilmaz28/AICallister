# 🚀 Mevcut Repo'yu Vercel'e Bağlama

## ✅ Mevcut Durum

- **GitHub Repo:** `https://github.com/dorukyilmaz28/AICallister`
- **Vercel Domain:** `callisterai.com` (muhtemelen zaten var)

---

## 🎯 İki Senaryo

### Senaryo 1: Vercel'de Zaten Proje Var

Eğer `callisterai.com` zaten Vercel'de deploy edilmişse:

1. **Vercel Dashboard'a gidin:**
   - https://vercel.com/dashboard
   - `callisterai.com` projesini bulun

2. **GitHub Repo'yu Güncelleyin:**
   - Settings → Git → "Disconnect" (eski repo varsa)
   - "Connect Git Repository" → `dorukyilmaz28/AICallister` seçin

3. **Environment Variables Kontrol:**
   - Settings → Environment Variables
   - Tüm gerekli variables var mı kontrol edin

4. **Redeploy:**
   - Deployments → Son deployment → "Redeploy"

---

### Senaryo 2: Vercel'de Proje Yok (Yeni Bağlama)

1. **Vercel Dashboard:**
   - https://vercel.com/dashboard
   - "Add New" → "Project"

2. **GitHub Repo Seç:**
   - "Import Git Repository"
   - `dorukyilmaz28/AICallister` seçin
   - "Import" butonuna tıklayın

3. **Build Settings:**
   - Vercel otomatik tespit edecek:
     - Framework: Next.js
     - Build Command: `npm run build`
     - Output Directory: `.next`
   - **ÖNEMLİ:** "Override" yapmayın, otomatik ayarları kullanın

4. **Environment Variables Ekle:**
   - "Environment Variables" sekmesine gidin
   - Aşağıdaki variables'ları ekleyin:

```env
# NextAuth
NEXTAUTH_SECRET="openssl rand -base64 32 ile oluşturun"
NEXTAUTH_URL="https://callisterai.com"

# API Base URL
NEXT_PUBLIC_API_URL="https://callisterai.com"

# Database (PostgreSQL)
DATABASE_URL="postgresql://..."

# AI API Keys
GEMINI_API_KEY="your-gemini-key"
GEMINI_MODEL="gemini-2.5-flash"

# The Blue Alliance
TBA_API_KEY="your-tba-key"
```

5. **Domain Ayarla:**
   - Settings → Domains
   - `callisterai.com` ekleyin
   - DNS ayarlarını yapın (Vercel size talimat verecek)

6. **Deploy:**
   - "Deploy" butonuna tıklayın

---

## 🔍 Mevcut Vercel Projesini Kontrol Etme

Vercel CLI ile:

```bash
# Vercel CLI kurulumu (yoksa)
npm i -g vercel

# Login
vercel login

# Mevcut projeleri listele
vercel ls

# Proje detaylarını gör
vercel inspect
```

**Veya** Vercel Dashboard'dan:
- https://vercel.com/dashboard
- Tüm projelerinizi görebilirsiniz

---

## ⚠️ Önemli Notlar

### 1. Static Export vs Serverless

**Şu anki durum:**
- `npm run build:static` → Static export (API route'lar çalışmaz)
- Android app için static export gerekli

**Vercel'de:**
- `npm run build` → Serverless functions (API route'lar çalışır)
- Web sitesi için serverless gerekli

**Çözüm:**
- Vercel'de normal `build` kullanın (API route'lar çalışır)
- Android için local'de `build:static` kullanın

### 2. Build Script Farkı

**Vercel'de:**
```json
"build": "prisma generate && prisma migrate deploy && next build"
```

**Local Android için:**
```json
"build:static": "node scripts/rename-api-folder.js && ..."
```

Vercel otomatik olarak `build` script'ini kullanacak.

---

## 📋 Checklist

- [ ] Vercel Dashboard'da proje var mı kontrol ettim
- [ ] GitHub repo bağlandı
- [ ] Environment variables eklendi
- [ ] Domain ayarlandı (`callisterai.com`)
- [ ] Deploy başarılı
- [ ] `https://callisterai.com/api/auth/login` endpoint test edildi

---

## 🧪 Test

Deploy sonrası:

```bash
# API endpoint test
curl https://callisterai.com/api/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}'
```

**Beklenen:** JSON response (HTML değil)

---

## 🆘 Sorun Giderme

### "Project not found"
- Vercel Dashboard'da proje yoksa → Senaryo 2'yi takip edin

### "Domain already in use"
- Başka bir Vercel projesinde kullanılıyor olabilir
- O projeden domain'i kaldırın veya farklı bir domain kullanın

### "Build failed"
- Environment variables eksik olabilir
- Build log'larını kontrol edin
- `DATABASE_URL` doğru mu kontrol edin

---

## 🎯 Sonraki Adımlar

1. ✅ Vercel'de proje var mı kontrol et
2. ✅ GitHub repo'yu bağla
3. ✅ Environment variables ekle
4. ✅ Deploy et
5. ✅ API endpoint'leri test et
6. ✅ Android app'i güncelle
