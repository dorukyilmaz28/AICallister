# ⚠️ NextAuth.js GET Hatası Çözümü

## 🐛 Sorun

"This action with HTTP GET is not supported by NextAuth.js" hatası alınıyor.

## 🔍 Neden Oluyor?

1. **Static Export'ta API Route'lar Çalışmaz**
   - Next.js static export'ta `/api/*` route'ları çalışmaz
   - Bu yüzden backend'e (`https://callisterai.com`) istek atıyoruz

2. **Backend'de NextAuth Route'u Var**
   - `/api/auth/[...nextauth]` route'u NextAuth kullanıyor
   - Bu route'a GET isteği giderse hata verir

3. **Yanlış Endpoint'e İstek Gidiyor Olabilir**
   - `/api/auth/login` yerine `/api/auth/[...nextauth]` route'una gidiyor olabilir

## ✅ Çözüm

### **1. Backend Kontrolü**

Backend'inizde (`https://callisterai.com`) şu endpoint'ler olmalı:
- ✅ `/api/auth/login` (POST) - Custom login endpoint
- ✅ `/api/auth/register` (POST)
- ✅ `/api/auth/verify-team` (POST)

**NextAuth route'u (`/api/auth/[...nextauth]`) kullanılmıyor, sadece custom endpoint'ler kullanılıyor.**

### **2. Vercel'de Deploy Kontrolü**

Vercel Dashboard'da:
1. **Deployments** sekmesine gidin
2. Son deployment'ı kontrol edin
3. **Functions** sekmesinde API route'ları görün
4. `/api/auth/login` endpoint'i var mı kontrol edin

### **3. Test**

Tarayıcıda test edin:
```bash
# POST isteği (çalışmalı)
curl -X POST https://callisterai.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}'

# GET isteği (NextAuth hatası verebilir - normal)
curl https://callisterai.com/api/auth/[...nextauth]
```

---

## 🚀 Hızlı Çözüm

Eğer backend çalışmıyorsa:

1. **Vercel'de Deploy Edin:**
   ```bash
   git add .
   git commit -m "Fix API endpoints"
   git push origin main
   ```

2. **VEYA Local Backend Çalıştırın:**
   ```bash
   npm run dev
   ```
   Sonra API URL'ini `http://localhost:3000` yapın (test için).

---

## 📋 Kontrol Listesi

- [ ] Backend deploy edilmiş mi? (`https://callisterai.com`)
- [ ] `/api/auth/login` endpoint'i var mı?
- [ ] POST isteği doğru endpoint'e gidiyor mu?
- [ ] NextAuth route'una istek gitmiyor mu?

---

## 🔍 Debug

Chrome DevTools Console'da:
```javascript
// Hangi URL'ye istek gidiyor?
console.log('API URL:', 'https://callisterai.com/api/auth/login');

// Method kontrolü
console.log('Method:', 'POST');
```

**Eğer hala NextAuth hatası alıyorsanız → Backend'de endpoint yok veya yanlış route'a gidiyor!**

---

## ✅ Beklenen Davranış

- POST isteği `/api/auth/login` endpoint'ine gider
- NextAuth route'una istek gitmez
- Token ve user bilgisi döner

**Backend'i kontrol edin ve deploy edin!** 🚀
