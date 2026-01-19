# 🔧 Android Uygulama Debug Adımları

## ✅ Yapılan Güncellemeler

### 1. **callisterai.com Config Güncellendi** ✅
- `src/lib/api.ts`: Production URL `https://callisterai.com` olarak ayarlandı
- `capacitor.config.ts`: Production server URL eklendi
- `env.example`: `NEXT_PUBLIC_API_URL` eklendi

### 2. **MainActivity'ye Log Eklendi** ✅
- Error handling ve debug log'lar eklendi
- Crash durumunda logcat'te detaylı hata görünecek

---

## 🚀 Android Studio'da Yapılacaklar (Sırayla!)

### **ADIM 1: Clean Project**
```
Build → Clean Project
```
⏱️ 1-2 dakika sürer

### **ADIM 2: Invalidate Caches**
```
File → Invalidate Caches / Restart
→ "Invalidate and Restart" seçin
```
⏱️ Android Studio restart olacak (~30 saniye)

### **ADIM 3: Gradle Sync**
Android Studio restart olduktan sonra:
```
File → Sync Project with Gradle Files
```
⏱️ 1-2 dakika sürer

### **ADIM 4: Rebuild Project**
```
Build → Rebuild Project
```
⏱️ 2-5 dakika sürer (ilk seferde daha uzun)

### **ADIM 5: Uygulamayı Cihazdan Kaldır**
- Emulator/cihazda: **Settings → Apps → Callister FRC AI → Uninstall**
- VEYA Android Studio'da: **Run → Uninstall 'app'**

### **ADIM 6: Logcat'i Hazırla**
1. **Logcat** penceresini açın (alt kısımda)
2. **Filtre ekleyin:**
   - Package Name: `com.callister.frcai`
   - VEYA Tag: `MainActivity|AndroidRuntime|Capacitor|FATAL|ERROR`
3. **Log Level:** Verbose veya Debug seçin
4. **Clear** butonuna tıklayın (logcat'i temizle)

### **ADIM 7: Uygulamayı Çalıştır**
```
Run → Run 'app'
```

### **ADIM 8: Logcat'i İzle**
Uygulama açılırken logcat'te şunları görmelisiniz:

**✅ Başarılı Başlatma:**
```
D/MainActivity: MainActivity onCreate called
D/Capacitor: Loading Capacitor...
D/Capacitor: Capacitor initialized
D/Capacitor: Loading app at file:///android_asset/public/index.html
```

**❌ Hata Varsa:**
```
E/MainActivity: FATAL ERROR in MainActivity onCreate
E/AndroidRuntime: FATAL EXCEPTION: main
```

---

## 📋 Logcat Çıktısını Paylaşma

Eğer uygulama hala açılmıyorsa:

1. **Logcat'i temizleyin** (Clear)
2. **Filtreyi uygulayın** (Package: com.callister.frcai)
3. **Uygulamayı çalıştırın**
4. **İlk 50-100 satır log'u kopyalayın**

**Özellikle şunları arıyorum:**
- `FATAL EXCEPTION` ile başlayan satırlar
- `MainActivity` ile ilgili tüm satırlar
- `AndroidRuntime` ile ilgili satırlar
- `WebView` veya `Capacitor` ile ilgili hatalar
- `Cannot load URL` gibi mesajlar

---

## 🐛 Yaygın Sorunlar ve Çözümleri

### **Sorun 1: "Terminating the app" - Build Hatası**
**Çözüm:**
- Clean → Rebuild yapın
- Gradle sync yapın
- Kotlin sürüm çakışması varsa `KOTLIN_VERSION_FIX.md` dosyasına bakın

### **Sorun 2: WebView Yüklenemiyor**
**Logcat'te görülen:**
```
E/WebView: Error loading URL
E/Capacitor: Failed to load index.html
```

**Çözüm:**
- `out/index.html` dosyası var mı kontrol edin
- `npx cap sync android` çalıştırın
- `android/app/src/main/assets/public/index.html` dosyası var mı kontrol edin

### **Sorun 3: Network Security Config Hatası**
**Logcat'te görülen:**
```
E/NetworkSecurityConfig: No Network Security Config specified
```

**Çözüm:**
- `android/app/src/main/res/xml/network_security_config.xml` dosyası var mı kontrol edin
- AndroidManifest.xml'de `networkSecurityConfig` tanımlı mı kontrol edin

### **Sorun 4: Capacitor Bridge Hatası**
**Logcat'te görülen:**
```
E/Capacitor: Failed to initialize bridge
```

**Çözüm:**
- `capacitor.config.ts` dosyasında `webDir: 'out'` doğru mu kontrol edin
- `npx cap sync android` tekrar çalıştırın

---

## ✅ Başarı Kontrolü

Uygulama başarıyla açıldığında:
- ✅ Ana sayfa görünür
- ✅ Logcat'te `Capacitor initialized` mesajı görünür
- ✅ "Terminating the app" mesajı görünmez

---

## 📞 Hala Sorun mu Var?

Lütfen şunları paylaşın:
1. **Logcat çıktısı** (FATAL/ERROR seviyesi, ilk 50-100 satır)
2. **Build log** (Build → Rebuild Project sonrası)
3. **Gradle sync log** (File → Sync Project with Gradle Files sonrası)
4. **Android Studio sürümü** (Help → About)
5. **Gradle sürümü** (android/gradle/wrapper/gradle-wrapper.properties)

**Birlikte çözelim!** 🚀
