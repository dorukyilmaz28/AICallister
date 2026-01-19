# ⚡ Vercel'e Hızlı Başlangıç - Mevcut Repo

## 🎯 Durum
- **GitHub Repo:** `https://github.com/dorukyilmaz28/AICallister`
- **Domain:** `callisterai.com` (muhtemelen zaten Vercel'de)

---

## 📋 Adım Adım (5 Dakika)

### 1️⃣ Vercel Dashboard'a Git
https://vercel.com/dashboard

### 2️⃣ Proje Kontrolü
- `callisterai.com` projesi var mı?
  - **VARSA:** Settings → Git → Repo'yu kontrol et
  - **YOKSA:** "Add New" → "Project" → GitHub repo'yu seç

### 3️⃣ Environment Variables Ekle
Settings → Environment Variables → Aşağıdakileri ekle:

```env
NEXTAUTH_SECRET="openssl rand -base64 32 ile oluşturun"
NEXTAUTH_URL="https://callisterai.com"
NEXT_PUBLIC_API_URL="https://callisterai.com"
DATABASE_URL="postgresql://..."
GEMINI_API_KEY="..."
TBA_API_KEY="..."
```

### 4️⃣ Deploy
- Deployments → "Redeploy" (varsa)
- Veya "Deploy" butonuna tıkla (yeni projeyse)

### 5️⃣ Test
```bash
curl https://callisterai.com/api/auth/login -X POST -H "Content-Type: application/json" -d '{"email":"test","password":"test"}'
```

---

## 🔑 NEXTAUTH_SECRET Oluştur

PowerShell'de:
```powershell
# OpenSSL yoksa, online tool kullanın:
# https://generate-secret.vercel.app/32
```

Veya Node.js ile:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## ✅ Başarı Kontrolü

1. ✅ Vercel Dashboard'da proje görünüyor
2. ✅ Deploy başarılı (yeşil tick)
3. ✅ `callisterai.com` açılıyor
4. ✅ API endpoint JSON döndürüyor (HTML değil)

---

## 🆘 Sorun Varsa

**"Build failed"**
- Environment variables eksik
- `DATABASE_URL` yanlış
- Build log'larını kontrol et

**"Domain already in use"**
- Başka projede kullanılıyor
- O projeden kaldır veya farklı domain kullan

**"API route not found"**
- `vercel.json` doğru mu kontrol et
- Build log'larında hata var mı?

---

## 📱 Android App İçin

Deploy sonrası:
```bash
npm run build:static
npx cap sync android
```

Yeni APK oluştur ve test et.
