# 🔍 "Terminating the App" Debug Adımları

## ✅ Yapılan Kontroller

1. ✅ `out/index.html` dosyası var
2. ✅ Capacitor sync yapıldı
3. ✅ Android assets klasöründe dosyalar mevcut

## 🚀 Android Studio'da Yapılacaklar (Sırayla)

### **1. Clean Project**
```
Build → Clean Project
```

### **2. Invalidate Caches**
```
File → Invalidate Caches / Restart
→ "Invalidate and Restart" seçin
```

### **3. Gradle Sync**
Android Studio restart olduktan sonra:
```
File → Sync Project with Gradle Files
```

### **4. Rebuild Project**
```
Build → Rebuild Project
```

### **5. Uygulamayı Cihazdan Kaldır**
- Emulator/cihazda uygulamayı **tamamen kaldırın** (uninstall)
- Settings → Apps → Callister FRC AI → Uninstall

### **6. Yeniden Yükle ve Çalıştır**
```
Run → Run 'app'
```

---

## 📋 Logcat Kontrolü

Uygulama çalıştırılırken **Logcat** penceresini açın ve şunları arayın:

### **Filtre Ayarları:**
```
Tag: *MainActivity* OR *AndroidRuntime* OR *FATAL*
Level: Error, Fatal, Warn
```

### **Aranacak Hatalar:**
1. `FATAL EXCEPTION`
2. `AndroidRuntime`
3. `WebView`
4. `Capacitor`
5. `Bridge`
6. `Cannot load URL`

---

## 🐛 Yaygın Sorunlar ve Çözümleri

### **Sorun 1: WebView Yüklenemiyor**
**Logcat'te görülen:**
```
WebView: Error loading URL
```

**Çözüm:**
- `android/app/src/main/res/xml/network_security_config.xml` dosyası var mı kontrol edin
- AndroidManifest.xml'de `networkSecurityConfig` tanımlı mı kontrol edin

### **Sorun 2: Capacitor Bridge Hatası**
**Logcat'te görülen:**
```
Capacitor: Failed to initialize bridge
```

**Çözüm:**
- `capacitor.config.ts` dosyasında `webDir: 'out'` doğru mu kontrol edin
- Capacitor sync tekrar yapın: `npx cap sync android`

### **Sorun 3: Asset Dosyaları Eksik**
**Logcat'te görülen:**
```
AssetManager: failed to open asset
```

**Çözüm:**
- `out` klasöründe build yapılmış mı: `npm run build:static`
- Capacitor sync: `npx cap sync android`

### **Sorun 4: JavaScript Hatası**
**Logcat'te görülen:**
```
chromium: Console: Uncaught ReferenceError
```

**Çözüm:**
- `out/index.html` dosyasını tarayıcıda açıp test edin
- JavaScript hataları varsa düzeltin

---

## 📞 Logcat Çıktısını Paylaşın

Eğer hala sorun devam ediyorsa, lütfen şunları paylaşın:

1. **Logcat çıktısı** (FATAL/ERROR seviyesi, uygulama açıldığı anda)
2. **Build log** (Build → Rebuild Project sonrası)
3. **Gradle sync log** (File → Sync Project with Gradle Files sonrası)

**Logcat'i temizleyin, uygulamayı çalıştırın, ve ilk 10-20 satırı kopyalayın!**

---

## ✅ Hızlı Test

Uygulama açıldıktan sonra logcat'te şunu görmelisiniz:
```
D/Capacitor: Loading Capacitor...
D/Capacitor: Capacitor initialized
D/Capacitor: Loading app at file:///...
```

Eğer bunlar görünmüyorsa, WebView veya Bridge başlatma sorunu var demektir.
