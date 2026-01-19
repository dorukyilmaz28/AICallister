# Android Debug Guide - Console Log'larını Görme

## Chrome DevTools ile Android WebView Debug

### 1. Chrome'da DevTools'u Açın

1. Chrome tarayıcısını açın
2. Adres çubuğuna yazın: `chrome://inspect`
3. "Devices" sekmesine tıklayın
4. Telefonunuz USB ile bağlıysa veya aynı WiFi'deyse görünecektir

### 2. WebView'i Bulun

- "WebView" yazan kısımda `com.callister.frcai` uygulamanızı bulun
- Yanındaki **"inspect"** linkine tıklayın

### 3. Console Sekmesinde Log'ları Görün

Console sekmesine tıklayın ve şu log'ları arayın:

```
[API] ========== RESPONSE START ==========
[API] URL: https://www.callisterai.com/api/login
[API] Status: 200
[API] Data type: string
[API] Raw text preview: ...
```

### 4. ⚠️ STATUS CODE NEREDE? (ÖNEMLİ!)

**HTTP Status Code (200, 404, 500, vb.) şu satırda görünecek:**

```
[API] Status: 200    ← BURADA! (Başarılı)
```

veya hata durumunda:

```
[API] Status: 404    ← BURADA! (Sayfa bulunamadı)
[API] Status: 500    ← BURADA! (Sunucu hatası)
[API] Status: 401    ← BURADA! (Yetkisiz erişim)
```

**Status code'u bulmak için:**
1. Console'da `[API] Status:` yazın ve arayın
2. Veya `Status:` yazıp filtreleyin
3. **HER API İSTEĞİNDEN SONRA** bu log görünecek

**Status Code Anlamları:**
- **200** = ✅ Başarılı (OK)
- **400** = ❌ Hatalı istek (Bad Request)
- **401** = ❌ Yetkisiz (Unauthorized - Token geçersiz)
- **404** = ❌ Sayfa bulunamadı (Not Found - API endpoint yok)
- **500** = ❌ Sunucu hatası (Internal Server Error)
- **502** = ❌ Kötü gateway (Bad Gateway)
- **503** = ❌ Servis kullanılamıyor (Service Unavailable)

### 5. Log Filtreleme

Console'da filtre kutusuna `[API]` yazın, sadece API log'larını göreceksiniz.

### 6. Eğer Log'lar Görünmüyorsa

1. **Console'u temizleyin** (Clear console butonuna tıklayın)
2. **Uygulamada login yapmayı deneyin**
3. **Console'u tekrar kontrol edin**

### 7. Alternatif: Android Studio Logcat

Eğer Chrome DevTools çalışmıyorsa:

1. Android Studio'yu açın
2. Alt kısımda "Logcat" sekmesine tıklayın
3. Filtre kutusuna `Capacitor/Console` yazın
4. Veya `com.callister.frcai` yazın
5. **Status code'u bulmak için:** Logcat'te `Status:` yazıp arayın

**Logcat'te Status Code Örneği:**
```
2026-01-19 11:08:38.018 7749-7749 Capacitor/Console com.callister.frcai I [API] ⚠️⚠️⚠️ STATUS CODE: 404 ⚠️⚠️⚠️
```

**Logcat Filtreleme:**
- `Status:` → Sadece status code log'larını gösterir
- `[API]` → Tüm API log'larını gösterir
- `STATUS CODE` → Sadece status code'ları gösterir (en iyi seçenek!)

### 8. Örnek Log Çıktısı

Başarılı bir login'de şöyle görünecek:

```
[API] ========== RESPONSE START ==========
[API] URL: https://www.callisterai.com/api/login
[API] Status: 200
[API] Data type: object
[API] Raw text preview: {"token":"eyJhbGc...","user":{...}}
[API] ✅ Using pre-parsed object
[API] ========== RESPONSE END ==========
```

Hata durumunda:

```
[API] ========== RESPONSE START ==========
[API] URL: https://www.callisterai.com/api/login
[API] Status: 404
[API] Data type: string
[API] Raw text preview: <!DOCTYPE html>...
[API] ❌❌❌ HTML DETECTED! ❌❌❌
```

### 9. Sorun Giderme

- **Log'lar görünmüyor mu?** → Telefonu yeniden bağlayın, Chrome'u yenileyin
- **WebView görünmüyor mu?** → Uygulamayı açık tutun, Chrome'da "inspect" butonuna tıklayın
- **Status code görünmüyor mu?** → Console'u temizleyip tekrar login deneyin
