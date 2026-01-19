# 🔧 Android Giriş Sorunu Çözümü

## 🐛 Sorun: "Giriş yapılıyor" yazısında takılı kalıyor

Bu sorun genellikle **API bağlantı hatası** nedeniyle oluşur. Android uygulaması API'ye bağlanamıyor.

---

## ✅ Çözüm 1: API URL Kontrolü

Android'de API URL'si `https://callisterai.com` olmalı, `localhost` değil!

### **Kontrol:**
1. Telefonda uygulamayı açın
2. Chrome'da **chrome://inspect** açın (USB ile bağlıysa)
3. VEYA Logcat'te API hatalarını kontrol edin

### **Logcat'te Aranacak:**
```
E/API Request Error: Failed to fetch
E/API Request Error: Network request failed
E/CapacitorHttp: Request failed
```

---

## ✅ Çözüm 2: Network Security Config

Android 9+ için network security config doğru olmalı.

**Kontrol:**
- `android/app/src/main/res/xml/network_security_config.xml` dosyası var mı?
- `AndroidManifest.xml`'de `networkSecurityConfig` tanımlı mı?

---

## ✅ Çözüm 3: Console Log'ları Ekle

API çağrılarında daha fazla log ekleyelim:

**Yapılacak:**
- `src/lib/api.ts` dosyasına detaylı log'lar eklenecek
- Hata mesajları daha açıklayıcı olacak

---

## 🔍 Debug Adımları

### **1. Telefonda Chrome DevTools:**
1. USB ile telefonu bağlayın
2. Chrome'da `chrome://inspect` açın
3. Uygulamanızı seçin → **Inspect**
4. **Console** sekmesine gidin
5. Giriş yapmayı deneyin
6. Console'da hata mesajlarını görün

### **2. Logcat'te API Hataları:**
```
adb logcat | grep -i "api\|http\|error\|capacitor"
```

### **3. Network İsteklerini İzle:**
Chrome DevTools → Network sekmesinde:
- API isteklerini görebilirsiniz
- Hangi URL'ye istek gittiğini görebilirsiniz
- Hata kodlarını görebilirsiniz

---

## 🚀 Hızlı Test

Telefonda uygulamayı açın ve şunları kontrol edin:

1. **Console'da (Chrome DevTools):**
   - `API_BASE_URL` değeri ne?
   - API isteği hangi URL'ye gidiyor?

2. **Network sekmesinde:**
   - `/api/auth/login` isteği var mı?
   - Status code nedir? (200, 404, 500, vb.)

---

## 📋 Beklenen Davranış

**Başarılı Giriş:**
- API isteği `https://callisterai.com/api/auth/login` adresine gider
- Status: 200 OK
- Token localStorage'a kaydedilir
- `/teams` sayfasına yönlendirilir

**Başarısız Giriş:**
- API isteği başarısız olur
- Hata mesajı gösterilir
- `isLoading` false olur

---

## 🔧 Geçici Çözüm (Test İçin)

Eğer API çalışmıyorsa, test için:

1. Backend'iniz çalışıyor mu kontrol edin
2. `https://callisterai.com/api/auth/login` endpoint'i çalışıyor mu?
3. CORS ayarları doğru mu?

---

## 📞 Hata Mesajını Paylaşın

Lütfen şunları paylaşın:
1. **Chrome DevTools Console** çıktısı
2. **Network** sekmesindeki API isteği detayları
3. **Logcat** çıktısı (API/HTTP ile ilgili)

**Birlikte çözelim!** 🚀
