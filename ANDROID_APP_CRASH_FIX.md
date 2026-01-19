# 🚨 Android Uygulama "Terminating the App" Hatası Çözümü

## ❌ Sorun

Uygulama açılırken "Terminating the app" yazısında kalıyor ve kapanıyor.

## 🔍 Hata Nedenleri

1. **Build yapılmadan Capacitor sync yapılmış** ❌
2. **JavaScript hatası** (WebView'da)
3. **Network isteği başarısız** (localhost erişilemiyor)
4. **Asset dosyaları eksik** (index.html veya diğer dosyalar)

---

## ✅ Hızlı Çözüm (Sırayla Deneyin)

### **ADIM 1: Build ve Sync Yapın**

```bash
# 1. Proje kök dizininde
npm run build:static

# 2. Capacitor sync
npx cap sync android

# 3. Android Studio'da
# File > Sync Project with Gradle Files
```

### **ADIM 2: Android Studio'da Temizleme**

1. **Build > Clean Project**
2. **Build > Rebuild Project**
3. **File > Invalidate Caches / Restart** → **Invalidate and Restart**

### **ADIM 3: Logcat'te Hatayı Kontrol Edin**

Android Studio'da:
1. **View > Tool Windows > Logcat** açın
2. Filter'da **"Error"** veya **"FATAL"** seçin
3. Uygulamayı tekrar başlatın
4. **Hata mesajını kopyalayın** (Ctrl+C)

**Önemli:** Logcat'teki hata mesajı sorunun kaynağını gösterir!

---

## 🔍 Yaygın Hatalar ve Çözümleri

### **Hata 1: "Failed to load resource: net::ERR_FILE_NOT_FOUND"**

**Sebep:** Asset dosyaları Android'e kopyalanmamış

**Çözüm:**
```bash
npm run build:static
npx cap sync android
```

### **Hata 2: "Failed to fetch" veya Network Error**

**Sebep:** Uygulama API'ye bağlanamıyor

**Çözüm 1:** `capacitor.config.ts` kontrol edin:
```typescript
server: {
  // Development için IP adresi ekleyin
  url: 'http://192.168.1.XXX:3000',
  cleartext: true
}
```

**IP Adresinizi Bulun:**
```powershell
ipconfig | findstr IPv4
```

**Çözüm 2:** `network_security_config.xml` kontrol edin:
`android/app/src/main/res/xml/network_security_config.xml` dosyası:
```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="true">
        <trust-anchors>
            <certificates src="system" />
        </trust-anchors>
    </base-config>
</network-security-config>
```

### **Hata 3: "Uncaught TypeError" veya JavaScript Hatası**

**Sebep:** Kod hatası veya build sırasında sorun

**Çözüm:**
```bash
# 1. Node modules temizle
rm -rf node_modules
npm install

# 2. Build yap
npm run build:static

# 3. Sync yap
npx cap sync android

# 4. Android Studio'da rebuild
```

### **Hata 4: "ActivityNotFoundException" veya "MainActivity" Hatası**

**Sebep:** MainActivity bulunamıyor veya manifest hatası

**Çözüm:** `AndroidManifest.xml` kontrol edin:
```xml
<activity
    android:name=".MainActivity"
    android:exported="true"
    ...
/>
```

---

## 📋 Kontrol Listesi

Her adımı sırayla kontrol edin:

- [ ] `npm run build:static` başarılı mı?
- [ ] `npx cap sync android` başarılı mı?
- [ ] Android Studio'da **Sync Project with Gradle Files** yapıldı mı?
- [ ] **Clean Project** ve **Rebuild Project** yapıldı mı?
- [ ] Logcat'te hata mesajı var mı? (Hangi hata?)
- [ ] Emülatör/cihaz Android 5.0+ mı? (minSdkVersion kontrol)
- [ ] `capacitor.config.ts` içinde `server.url` doğru mu?
- [ ] `network_security_config.xml` dosyası var mı?

---

## 🛠️ Detaylı Debug Adımları

### **1. Build Çıktısını Kontrol Edin**

```bash
npm run build:static
```

**Başarılı olmalı:**
```
✓ Compiled successfully
```

**Hata varsa:** Hata mesajını çözün!

### **2. Capacitor Assets Kontrolü**

`android/app/src/main/assets/public/` klasöründe şunlar olmalı:
- `index.html` ✅
- `_next/` klasörü ✅
- Diğer asset dosyaları ✅

**Yoksa:**
```bash
npx cap sync android
```

### **3. Android Studio Build Log**

Android Studio'da:
1. **Build > Rebuild Project**
2. **View > Tool Windows > Build** açın
3. Hataları kontrol edin

### **4. Logcat İnceleme**

Android Studio > Logcat:
```
Filter: package:com.callister.frcai | level:error
```

**Hata örnekleri:**
```
E/AndroidRuntime: FATAL EXCEPTION: main
E/Capacitor: Error loading app
E/SystemWebView: Uncaught TypeError: ...
```

---

## 🎯 En Çok İşe Yarayan Çözüm

**Bu adımları sırayla deneyin:**

```bash
# 1. Proje kök dizininde
cd C:\Users\utkuy\Desktop\AICallister-main

# 2. Build yap
npm run build:static

# 3. Sync yap
npx cap sync android

# 4. Android Studio'da:
#    - File > Sync Project with Gradle Files
#    - Build > Clean Project
#    - Build > Rebuild Project
#    - Run (▶️)
```

**Hala çalışmıyorsa:**

1. **Logcat'teki hata mesajını paylaşın**
2. Android Studio'da **Run > Edit Configurations** kontrol edin
3. Emülatör/cihaz bağlantısını kontrol edin

---

## 📞 Hata Mesajını Paylaşın

Hala çözülmediyse, şu bilgileri paylaşın:

1. **Logcat hata mesajı** (tam hata)
2. `npm run build:static` çıktısı
3. `npx cap sync android` çıktısı
4. Android Studio Build log (hata varsa)

**Birlikte çözelim!** 🚀
