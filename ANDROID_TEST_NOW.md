# 🚀 Android App Test - Hızlı Başlangıç

## ✅ Yapılanlar

1. ✅ Vercel build başarılı
2. ✅ Static export kaldırıldı
3. ✅ Tüm API route'lar `force-dynamic`
4. ✅ Capacitor Server Mode aktif
5. ✅ API URL zorunlu olarak `www.callisterai.com`
6. ✅ Capacitor sync tamamlandı

---

## 📱 APK Oluşturma

### Yöntem 1: Android Studio (Önerilen)

1. **Android Studio'yu açın**
2. **File → Open** → `android` klasörünü seçin
3. **Build → Build Bundle(s) / APK(s) → Build APK(s)**
4. APK oluşturulduktan sonra:
   - `android/app/build/outputs/apk/debug/app-debug.apk`
   - Bu dosyayı telefona yükleyin

### Yöntem 2: Terminal (Java gerekli)

```bash
cd android
.\gradlew.bat assembleDebug
```

APK: `android/app/build/outputs/apk/debug/app-debug.apk`

---

## 🧪 Test Adımları

### 1. APK'yı Telefona Yükleyin

**USB ile:**
```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

**Veya:**
- APK'yı telefona kopyalayın
- Dosya yöneticisinden açın
- "Bilinmeyen kaynaklardan yükleme" izni verin

### 2. Uygulamayı Açın

- App açıldığında `www.callisterai.com` yüklenmeli
- Login sayfası görünmeli

### 3. Login Test

1. Email ve şifre girin
2. "Giriş Yap" butonuna tıklayın
3. **Chrome DevTools Console'u açın:**
   - Telefonda: Chrome → `chrome://inspect`
   - USB debugging açık olmalı
   - `com.callister.frcai` seçin → "inspect"

### 4. Console Log'larını Kontrol Edin

**Beklenen log'lar:**
```
[API] Capacitor detected (native: true, server mode: true)
[API] Forcing production URL: https://www.callisterai.com
[API] Making request to: https://www.callisterai.com/api/login
[API] Base URL: https://www.callisterai.com
[API] Endpoint: /api/login
[API] Is Capacitor: true
```

**Başarılı login:**
```
[API] Login response received: { token: "...", user: {...} }
[SignIn] Login successful, token saved: Yes
```

---

## 🔍 Sorun Giderme

### "API yanıtı geçersiz" hatası

**Kontrol:**
1. Console'da API URL'i kontrol edin
2. `https://www.callisterai.com/api/login` olmalı
3. `http://192.168.1.7:3001` görürseniz → Eski build, yeni APK oluşturun

### "Failed to fetch" hatası

**Kontrol:**
1. İnternet bağlantısı var mı?
2. Vercel'de site çalışıyor mu? (`www.callisterai.com`)
3. API endpoint çalışıyor mu? (`www.callisterai.com/api/login`)

### "Mixed Content" hatası

**Çözüldü:** Artık her zaman HTTPS kullanılıyor

---

## ✅ Başarı Kriterleri

- [ ] App açılıyor
- [ ] Login sayfası görünüyor
- [ ] Console'da `https://www.callisterai.com` görünüyor
- [ ] Login başarılı
- [ ] Token kaydediliyor
- [ ] Dashboard'a yönlendiriliyor

---

## 📝 Notlar

- **Server Mode:** App `www.callisterai.com`'a bağlanıyor
- **API Route'lar:** Vercel serverless function olarak çalışıyor
- **Her zaman güncel:** Vercel'de deploy → App otomatik güncellenir

---

## 🎯 Sonraki Adımlar

1. ✅ APK oluştur
2. ✅ Telefona yükle
3. ✅ Test et
4. ✅ Console log'larını kontrol et
5. ✅ Login test et

Başarılar! 🚀
