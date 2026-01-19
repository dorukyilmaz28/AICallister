# 🚀 Android Test - Sonraki Adımlar (Detaylı Rehber)

## 📋 Genel Akış

```
1. Android Studio Kurulumu ✅ (Yapılacak)
   ↓
2. Next.js Build
   ↓
3. Capacitor Sync
   ↓
4. Android Studio'da Açma
   ↓
5. Network Security Config (HTTP için)
   ↓
6. Gradle Sync
   ↓
7. Test (Emulator veya Gerçek Cihaz)
   ↓
8. API Bağlantısı Test
   ↓
9. Uygulama Test
   ↓
10. APK/AAB Oluşturma (Google Play için)
```

---

## 🎯 ADIM ADIM DETAYLI REHBER

### **1️⃣ Android Studio Kurulumu**

✅ **Yapılacak:**
- [ ] https://developer.android.com/studio sitesinden indirin
- [ ] `.exe` dosyasını çalıştırın
- [ ] Standard kurulum seçin
- [ ] SDK'ların indirilmesini bekleyin (2-5 GB, 10-30 dakika)

---

### **2️⃣ Next.js Static Build**

**Komut:**
```bash
npm run build:static
```

**Ne Yapar:**
- Next.js uygulamasını static HTML/CSS/JS dosyalarına çevirir
- `out/` klasörüne tüm dosyaları yazar
- API routes hariç tüm sayfalar static olur

**Süre:** 1-2 dakika

**Kontrol:**
- `out/` klasörü oluştu mu?
- `out/index.html` var mı?
- `out/_next/static/` klasörü var mı?

---

### **3️⃣ Capacitor Sync**

**Komut:**
```bash
npx cap sync
```

**Ne Yapar:**
- `out/` klasöründeki dosyaları `android/app/src/main/assets/public/` klasörüne kopyalar
- Native bağımlılıkları günceller
- Android projesini günceller

**Süre:** 10-30 saniye

**Kontrol:**
- `android/app/src/main/assets/public/` klasöründe dosyalar var mı?

---

### **4️⃣ Android Studio'da Açma**

**Komut:**
```bash
npx cap open android
```

**VEYA Manuel:**
1. Android Studio'yu açın
2. **File > Open**
3. `C:\Users\utkuy\Desktop\AICallister-main\android` klasörünü seçin

**Ne Olur:**
- Android Studio projeyi açar
- Otomatik Gradle sync başlar (ilk kez 5-10 dakika sürebilir)

---

### **5️⃣ Network Security Config (HTTP için ÖNEMLİ!)**

**Neden Gerekli?**
- Android 9+ HTTP bağlantılarını varsayılan olarak engeller
- Backend'iniz `http://192.168.1.7:3001` gibi HTTP kullanıyorsa bu gerekli

**Adımlar:**

**A) Dosya Oluştur:**
1. Android Studio'da sol panelde:
   - `android/app/src/main/res/` klasörüne sağ tıklayın
   - **New > Directory**
   - İsim: `xml`
2. `xml` klasörüne sağ tıklayın:
   - **New > File**
   - İsim: `network_security_config.xml`
3. İçeriği yapıştırın:

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

**B) AndroidManifest.xml'e Ekle:**
1. `android/app/src/main/AndroidManifest.xml` dosyasını açın
2. `<application>` tag'ini bulun
3. İçine ekleyin:

```xml
<application
    android:networkSecurityConfig="@xml/network_security_config"
    android:label="Callister FRC AI"
    ...>
```

---

### **6️⃣ Gradle Sync**

**Ne Olur:**
- Android Studio otomatik sync yapar
- İlk kez 5-10 dakika sürebilir (bağımlılıklar indirilir)
- Alt köşede progress bar görürsünüz

**Manuel Sync:**
- Üstteki sync butonuna tıklayın
- VEYA **File > Sync Project with Gradle Files**

**Kontrol:**
- Sync başarılı mı? (alt köşede "Gradle sync finished" yazar)
- Build hataları var mı? (Alt kısımda "Build" sekmesine bakın)

---

### **7️⃣ Test - Emulator veya Gerçek Cihaz**

#### **Seçenek A: Emulator ile Test**

**Emulator Oluşturma:**
1. Android Studio'da üstteki **Device Manager** ikonuna tıklayın
2. **Create Device** butonuna tıklayın
3. Cihaz seçin (örn: Pixel 5)
4. System Image seçin (API 33 veya üzeri - Download edilecek)
5. **Finish** tıklayın

**Test:**
1. Üstteki cihaz dropdown'ından emulator'ü seçin
2. **Run** butonuna tıklayın (▶️) veya `Shift+F10`
3. Emulator açılacak ve uygulama yüklenecek (2-3 dakika)

#### **Seçenek B: Gerçek Cihaz ile Test**

**Hazırlık:**
1. Telefonunuzda **Settings > About Phone > Build Number**'a **7 kez** tıklayın
2. **Settings > Developer Options > USB Debugging** açın
3. Telefonu USB ile bilgisayara bağlayın
4. İzin isteyecek: **Allow USB debugging** ✓

**Test:**
1. Android Studio'da üstteki cihaz dropdown'ından telefonunuzu seçin
2. **Run** butonuna tıklayın
3. Uygulama telefonunuzda yüklenecek

---

### **8️⃣ API Bağlantısı Test**

**Kontrol:**
1. Backend çalışıyor mu?
   ```bash
   # Terminal'de
   curl http://localhost:3001/health
   ```

2. Uygulama açıldığında:
   - Sign up sayfasına gidin
   - Yeni kullanıcı oluşturmayı deneyin
   - Backend'e bağlanıyor mu kontrol edin

**Hata Varsa:**
- Logcat'e bakın (Android Studio > View > Tool Windows > Logcat)
- Network hataları var mı?
- CORS hatası var mı?

---

### **9️⃣ Uygulama Test**

**Test Senaryoları:**
- [ ] Sign up çalışıyor mu?
- [ ] Sign in çalışıyor mu?
- [ ] API çağrıları yapılıyor mu?
- [ ] Token localStorage'a kaydediliyor mu?
- [ ] Sayfalar arası geçiş çalışıyor mu?
- [ ] Dark mode çalışıyor mu?

---

### **🔟 APK/AAB Oluşturma (Google Play için)**

**Test APK:**
1. Android Studio'da: **Build > Build Bundle(s) / APK(s) > Build APK(s)**
2. Build tamamlandığında:
   - **locate** linkine tıklayın
   - VEYA `android/app/build/outputs/apk/debug/` klasörüne gidin
3. APK dosyası orada olacak

**Release APK/AAB (Google Play için):**
1. **Build > Generate Signed Bundle / APK**
2. **Android App Bundle** seçin (önerilen)
3. Keystore oluşturun (ilk kez)
4. Signing bilgilerini girin
5. Build tamamlandığında AAB dosyası hazır

---

## 🔄 Her Değişiklikten Sonra

**Kod değiştirdiğinizde:**

```bash
# 1. Build
npm run build:static

# 2. Sync
npx cap sync

# 3. Android Studio'da Run
# (Android Studio zaten açıksa sadece Run'a tıklayın)
```

**VEYA Tek Komut:**
```bash
npm run android:test
```

---

## 📊 Timeline (Tahmini Süreler)

| Adım | Süre | Notlar |
|------|------|--------|
| Android Studio Kurulum | 10-30 dk | İlk kez SDK indiriliyor |
| Next.js Build | 1-2 dk | Her değişiklikten sonra |
| Capacitor Sync | 10-30 sn | Her değişiklikten sonra |
| Gradle Sync (İlk) | 5-10 dk | Sadece ilk kez |
| Gradle Sync (Sonraki) | 30 sn - 2 dk | Her açılışta |
| Emulator Açılışı | 1-2 dk | İlk kez |
| Uygulama Yükleme | 30 sn - 2 dk | Her testte |

**Toplam İlk Kurulum:** ~20-45 dakika
**Sonraki Test:** ~2-5 dakika

---

## 🎯 Hızlı Başlangıç (Android Studio Kurulduktan Sonra)

```bash
# 1. Build ve Sync
npm run android:test

# 2. Android Studio'da:
# - Network Security Config ekleyin (ilk kez)
# - Gradle sync bekleyin (ilk kez)
# - Run butonuna tıklayın
```

---

## 💡 İpuçları

1. **İlk Kurulum:** Sabırlı olun, SDK indirme uzun sürebilir
2. **Build:** Her değişiklikten sonra build yapın
3. **Logcat:** Hataları görmek için Logcat penceresini açık tutun
4. **Network:** Local network için telefon ve bilgisayar aynı WiFi'de olmalı
5. **Hot Reload:** Capacitor'da hot reload yok, her seferinde build yapmanız gerekir

---

## 🐛 Yaygın Sorunlar ve Çözümler

**Problem: Gradle sync failed**
- **Çözüm:** File > Invalidate Caches / Restart

**Problem: Network hataları**
- **Çözüm:** Network Security Config eklendi mi kontrol edin

**Problem: API çağrıları çalışmıyor**
- **Çözüm:** Backend çalışıyor mu? IP adresi doğru mu?

**Problem: Build hataları**
- **Çözüm:** `cd android && ./gradlew clean && cd .. && npx cap sync`

---

## ✅ Checklist

### İlk Kurulum:
- [ ] Android Studio kuruldu
- [ ] Next.js build yapıldı
- [ ] Capacitor sync yapıldı
- [ ] Android Studio'da açıldı
- [ ] Network Security Config eklendi
- [ ] Gradle sync tamamlandı
- [ ] Emulator/Telefon hazır
- [ ] İlk test başarılı

### Her Test:
- [ ] Backend çalışıyor
- [ ] Build yapıldı
- [ ] Sync yapıldı
- [ ] Android Studio'da Run'a tıklandı

---

## 🎉 Başarı!

Tüm adımlar tamamlandığında:
- ✅ Android uygulamanız çalışıyor
- ✅ Backend'e bağlanıyor
- ✅ Tüm özellikler test edilebilir
- ✅ Google Play'e yüklemeye hazır!

**Sonraki adım:** Release build oluşturup Google Play Console'a yükleyin!
