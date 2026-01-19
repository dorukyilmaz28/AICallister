# 🚀 Vercel Deploy - Hızlı Başlangıç

## ⚠️ Problem
Backend HTML döndürüyor çünkü **static export'ta API route'lar çalışmıyor**. Vercel'de deploy ederek API route'ları serverless function olarak çalıştırmalıyız.

---

## 📋 Adım 1: Vercel'e Deploy Et

### Yöntem 1: Vercel CLI (Önerilen)

```bash
# Vercel CLI kurulumu (ilk kez)
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Yöntem 2: GitHub Integration (Otomatik)

1. **GitHub'a Push:**
   ```bash
   git add .
   git commit -m "Vercel deploy için hazır"
   git push origin main
   ```

2. **Vercel Dashboard:**
   - https://vercel.com/dashboard
   - "Add New Project"
   - GitHub repo'yu seç
   - "Deploy" butonuna tıkla

---

## 🔧 Adım 2: Environment Variables Ekle

Vercel Dashboard → Settings → Environment Variables:

### Zorunlu Variables:

```env
# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
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

### NEXTAUTH_SECRET Oluştur:

```bash
# Terminal'de çalıştır
openssl rand -base64 32
```

Çıktıyı `NEXTAUTH_SECRET` olarak ekleyin.

### Environment Scope:
Her variable için:
- ✅ **Production**
- ✅ **Preview**
- ✅ **Development**

---

## 🗄️ Adım 3: Database Setup

### Vercel Postgres (Önerilen):

1. Vercel Dashboard → Storage → Create Database
2. PostgreSQL seç
3. Connection string'i kopyala → `DATABASE_URL` olarak ekle

### Veya Harici PostgreSQL:

- Railway, Supabase, Neon, vb. kullanabilirsiniz
- Connection string'i `DATABASE_URL` olarak ekleyin

### Migration:

Deploy sonrası Vercel CLI ile:

```bash
vercel env pull .env.local
npx prisma migrate deploy
```

**Veya** Vercel Dashboard → Deployments → Son deployment → "Redeploy"

---

## ✅ Adım 4: Test Et

### 1. Backend Endpoint Test:

```bash
curl https://callisterai.com/api/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'
```

**Beklenen Yanıt:**
```json
{
  "error": "Email veya şifre hatalı."
}
```

**❌ HTML Dönerse:**
- Deploy başarısız olmuş
- Environment variables eksik
- API route'lar çalışmıyor

### 2. Android App'te Test:

1. `src/lib/api.ts` zaten `https://callisterai.com` kullanıyor
2. Yeni APK oluştur:
   ```bash
   npm run build:static
   npx cap sync android
   ```
3. Telefonda test et

---

## 🔍 Debug: HTML Response Kontrolü

`src/lib/api.ts` içinde HTML detection eklendi:

```typescript
// HTML kontrolü
if (typeof responseString === 'string' && 
    (responseString.trim().startsWith('<!DOCTYPE') || 
     responseString.trim().startsWith('<html'))) {
  console.error('[API] Backend HTML döndürüyor! Endpoint çalışmıyor.');
  throw new Error('Backend endpoint bulunamadı. Vercel\'de deploy edilmiş mi kontrol edin.');
}
```

Chrome DevTools Console'da bu hata görünürse → Vercel deploy kontrolü yapın.

---

## 📝 Checklist

- [ ] Vercel'e deploy edildi
- [ ] Environment variables eklendi
- [ ] Database bağlantısı çalışıyor
- [ ] `https://callisterai.com/api/auth/login` endpoint'i JSON döndürüyor
- [ ] Android app'te login çalışıyor

---

## 🆘 Sorun Giderme

### Problem: "Backend HTML döndürüyor"

**Çözüm:**
1. Vercel Dashboard → Deployments → Son deployment kontrol et
2. Build log'larını kontrol et (hata var mı?)
3. Environment variables eksik mi kontrol et
4. `vercel.json` doğru mu kontrol et

### Problem: "API route not found"

**Çözüm:**
1. `src/app/api/auth/login/route.ts` dosyası var mı?
2. `vercel.json` içinde `builds` doğru mu?
3. Next.js version uyumlu mu?

### Problem: "Database connection error"

**Çözüm:**
1. `DATABASE_URL` doğru mu?
2. Database erişilebilir mi? (IP whitelist kontrolü)
3. Prisma migration çalıştırıldı mı?

---

## 🎯 Sonraki Adımlar

1. ✅ Vercel deploy
2. ✅ Environment variables
3. ✅ Database migration
4. ✅ Endpoint test
5. ✅ Android app rebuild
6. ✅ Telefonda test
