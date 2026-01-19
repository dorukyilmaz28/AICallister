# 🔴 DEBUG RAPORU - API REDIRECT SORUNU

## 1️⃣ API ROUTE KONTROLÜ

### ✅ Dosya Yapısı:
```
src/app/api/login/route.ts ✅ VAR
```

### ✅ Route.ts İçeriği:
```typescript
export async function POST(req: NextRequest) {
  // ✅ POST handler var
  // ✅ NextResponse.json kullanıyor
  // ✅ Response header'ları eklendi (Content-Type, Cache-Control)
}
```

**SONUÇ:** API route **DOĞRU** tanımlanmış.

---

## 2️⃣ MIDDLEWARE DURUMU

### 🔴 TEST AMAÇLI: MIDDLEWARE TAMAMEN KAPALI

```typescript
export function middleware(request: NextRequest) {
  // TAMAMEN KAPALI - Her şeyi direkt geçir
  return NextResponse.next();
}
```

**NOT:** Bu geçici bir test. Eğer hala 308 geliyorsa → middleware kesinlikle suçlu değil.

---

## 3️⃣ DEBUG LOG'LAR EKLENDİ

### API Request'te:
```typescript
console.log('[API DEBUG] ========== FETCH URL DEBUG ==========');
console.log('[API DEBUG] Fetch URL:', url);
console.log('[API DEBUG] Base URL:', baseUrl);
console.log('[API DEBUG] Original endpoint:', endpoint);
console.log('[API DEBUG] Final endpoint:', finalEndpoint);
console.log('[API DEBUG] Full URL constructed:', url);
console.log('[API DEBUG] URL starts with http?', url.startsWith('http'));
console.log('[API DEBUG] URL includes /api/?', url.includes('/api/'));
```

### Login Fonksiyonunda:
```typescript
// Capacitor için:
console.log('[API DEBUG] ========== LOGIN URL DEBUG ==========');
console.log('[API DEBUG] Base URL:', baseUrl);
console.log('[API DEBUG] Login URL:', loginUrl);
console.log('[API DEBUG] URL starts with http?', loginUrl.startsWith('http'));
console.log('[API DEBUG] URL includes /api/login/?', loginUrl.includes('/api/login/'));

// Web için:
console.log('[API DEBUG] ========== WEB LOGIN URL DEBUG ==========');
console.log('[API DEBUG] Web Base URL:', webBaseUrl);
console.log('[API DEBUG] Web Login URL:', webLoginUrl);
```

---

## 4️⃣ CURL TESTİ (YAPILMASI GEREKEN)

### Test Komutu:
```bash
curl -i -X POST https://www.callisterai.com/api/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### Beklenen Yanıt:
```
HTTP/2 200
Content-Type: application/json
Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate

{"error":"Email veya şifre hatalı."}
```

### ❌ Eğer Görürsen:
```
HTTP/2 308
Location: /api/login/
Content-Type: text/html

Redirecting...
```

→ Bu **%100 Vercel route collision** demek.

---

## 5️⃣ YAPILAN DEĞİŞİKLİKLER

### ✅ API Route Response Headers:
```typescript
headers: {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
}
```

### ✅ Middleware Kapatıldı (Test):
- Tüm request'ler direkt geçiyor
- Hiçbir redirect yok

### ✅ Debug Log'lar Eklendi:
- URL construction log'lanıyor
- Base URL log'lanıyor
- Final URL log'lanıyor

---

## 6️⃣ ŞİMDİ YAPILMASI GEREKENLER

1. **Android'de test et** → Log'larda şunu görmelisin:
   ```
   [API DEBUG] Fetch URL: https://www.callisterai.com/api/login/
   ```

2. **Eğer farklı bir URL görürsen** → O URL'i bana gönder

3. **Curl testi yap** → Sonucu bana gönder

4. **Log çıktısını gönder** → Özellikle:
   - `[API DEBUG] Fetch URL:`
   - `[API DEBUG] Login URL:`
   - Response status code
   - Response content-type

---

## 7️⃣ OLASI SEBEPLER (ÖNCELİK SIRASI)

1. **URL Yanlış Oluşturuluyor** (En Olası)
   - `/api/login/` yerine `/auth/signin` çağrılıyor olabilir
   - Base URL yanlış olabilir

2. **Vercel Route Collision**
   - `/api/login/` route'u page route'a düşüyor olabilir
   - `trailingSlash: true` sorun çıkarıyor olabilir

3. **Next.js Config Sorunu**
   - `next.config.js` redirect'leri tetikliyor olabilir

---

## 8️⃣ SONRAKI ADIMLAR

1. ✅ Debug log'lar eklendi
2. ✅ Middleware kapatıldı (test)
3. ✅ API route response headers eklendi
4. ⏳ Android'de test edilmeli
5. ⏳ Curl testi yapılmalı
6. ⏳ Log çıktıları toplanmalı

---

**NOT:** Bu rapor, debug sürecinin başlangıcı. Log çıktıları ve curl sonuçları geldikten sonra kesin çözüm uygulanacak.
