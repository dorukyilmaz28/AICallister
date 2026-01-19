# API Endpoint Test Rehberi

## ✅ Vercel'de `/api/login` Endpoint'ini Test Etme

### 1. Tarayıcıdan Test

1. Tarayıcıda şu URL'yi açın:
   ```
   https://www.callisterai.com/api/login
   ```

2. **Beklenen Sonuç:**
   - Eğer GET isteği yaparsanız: `405 Method Not Allowed` (normal, çünkü sadece POST kabul ediyor)
   - Eğer POST isteği yaparsanız: JSON response (token veya error)

### 2. cURL ile Test

Terminal'de şunu çalıştırın:

```bash
curl -X POST https://www.callisterai.com/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

**Beklenen Sonuç:**
- ✅ `{"token":"...","user":{...}}` → Endpoint çalışıyor!
- ❌ `404 Not Found` → Endpoint deploy edilmemiş
- ❌ `500 Internal Server Error` → Backend hatası var

### 3. Postman/Insomnia ile Test

1. **Method:** POST
2. **URL:** `https://www.callisterai.com/api/login`
3. **Headers:**
   ```
   Content-Type: application/json
   ```
4. **Body (JSON):**
   ```json
   {
     "email": "test@test.com",
     "password": "test123"
   }
   ```

### 4. Android App'te Test

Android Studio'da yeni build yaptıktan sonra:

1. Uygulamayı açın
2. Login sayfasına gidin
3. Email ve şifre girin
4. **Kırmızı kutuda şunları kontrol edin:**
   - **API URL:** `https://www.callisterai.com/api/login` olmalı (local IP değil!)
   - **HTTP Status Code:** 200 (başarılı) veya 401/404/500 (hata)
   - **Raw Response:** JSON formatında olmalı (HTML değil!)

## 🔍 Sorun Giderme

### Problem: "API yanıtı geçersiz format"

**Olası Nedenler:**
1. ❌ Endpoint deploy edilmemiş → Vercel'de redeploy yapın
2. ❌ Backend HTML döndürüyor → Vercel loglarını kontrol edin
3. ❌ CORS hatası → Vercel'de CORS ayarlarını kontrol edin

### Problem: "404 Not Found"

**Çözüm:**
1. Vercel Dashboard → Deployments → Son deployment'ı kontrol edin
2. `/api/login` route'unun deploy edildiğinden emin olun
3. Gerekirse redeploy yapın

### Problem: "500 Internal Server Error"

**Çözüm:**
1. Vercel Dashboard → Deployments → Son deployment → Functions
2. Logları kontrol edin
3. Database bağlantısını kontrol edin (`DATABASE_URL` environment variable)

## 📝 Notlar

- ✅ `/api/login` endpoint'i `src/app/api/login/route.ts` dosyasında
- ✅ `export const dynamic = 'force-dynamic'` var (Vercel serverless function olarak çalışır)
- ✅ Capacitor config'de `server.url = 'https://www.callisterai.com'` ayarlı
- ⚠️ Android app eski build kullanıyorsa local IP'ye bağlanabilir → **YENİ BUILD YAPIN!**
