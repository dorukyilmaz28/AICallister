# 📱 Android Test - Adım Adım Rehber

## ✅ Şu Ana Kadar Yapılanlar

1. ✅ Backend yapısı oluşturuldu
2. ✅ .env dosyası oluşturuldu
3. ✅ Capacitor paketleri kuruldu
4. ✅ Android platform eklendi

## 🚀 Şimdi Yapılacaklar (Adım Adım)

### **ADIM 1: .env Dosyasını Kontrol Et**

`.env` dosyasında şu satırın doğru olduğundan emin olun:

```env
NEXT_PUBLIC_API_URL=http://192.168.1.7:3001
```

**Önemli:** 
- Eğer **local network** kullanacaksanız: `http://192.168.1.7:3001` (bilgisayarınızın IP'si)
- Eğer **production backend** kullanacaksanız: `https://your-backend-url.com`

---

### **ADIM 2: Backend'i Başlat (Eğer Çalışmıyorsa)**

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

Backend `http://localhost:3001` adresinde çalışacak.

**Kontrol:**
- Tarayıcıda `http://localhost:3001/health` açın
- `{"status":"ok"}` görüyorsanız ✅

---

### **ADIM 3: Next.js Static Build**

**Terminal 2 - Root klasör:**
```bash
npm run build:static
```

Bu komut:
- `out/` klasörüne static dosyaları oluşturur
- 1-2 dakika sürebilir

**Kontrol:**
- `out/` klasörü oluştu mu?
- `out/index.html` dosyası var mı?

---

### **ADIM 4: Capacitor Sync**

```bash
npx cap sync
```

Bu komut:
- `out/` klasöründeki dosyaları Android projesine kopyalar
- Native bağımlılıkları günceller

**Kontrol:**
- `android/app/src/main/assets/public/` klasörüne dosyalar kopyalandı mı?

---

### **ADIM 5: Android Studio'yu Aç**

```bash
npx cap open android
```

**VEYA** manuel:
- Android Studio'yu açın
- `Open an Existing Project`
- `android/` klasörünü seçin

---

### **ADIM 6: Network Security Config Ekle (ÖNEMLİ!)**

HTTP backend kullanıyorsanız (local network IP), Android 9+ için gerekli:

**A) Dosya Oluştur:**
1. Android Studio'da: `android/app/src/main/res/xml/` klasörünü oluşturun (yoksa)
2. `network_security_config.xml` dosyası oluşturun
3. İçeriği:

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
`android/app/src/main/AndroidManifest.xml` dosyasını açın ve `<application>` tag'ine ekleyin:

```xml
<application
    android:networkSecurityConfig="@xml/network_security_config"
    ...>
```

---

### **ADIM 7: Gradle Sync**

Android Studio'da:
1. **File > Sync Project with Gradle Files** (veya üstteki sync butonu)
2. Sync bitene kadar bekleyin (1-2 dakika)

---

### **ADIM 8: Test Et**

#### **Emulator ile:**
1. Üstteki emulator dropdown'dan bir emulator seçin (veya oluşturun)
2. **Run** butonuna tıklayın (▶️) veya `Shift+F10`

#### **Gerçek Telefon ile:**
1. Telefonunuzda **Developer Options** açın:
   - Settings > About Phone > Build Number'a **7 kez** tıklayın
2. **USB Debugging** açın:
   - Settings > Developer Options > USB Debugging
3. Telefonu USB ile bilgisayara bağlayın
4. Android Studio'da Run butonuna tıklayın
5. Telefonunuzu seçin

---

## 🔍 Sorun Giderme

### **Problem: Build hatası**
```bash
cd android
./gradlew clean
cd ..
npx cap sync
```

### **Problem: API çağrıları çalışmıyor**
1. Backend çalışıyor mu? (`http://localhost:3001/health`)
2. `.env` dosyasında `NEXT_PUBLIC_API_URL` doğru mu?
3. Network Security Config eklendi mi?
4. Telefon ve bilgisayar **aynı WiFi**'de mi? (local network için)

### **Problem: Uygulama açılmıyor**
- Android Studio'da: **Build > Clean Project**
- Sonra: **Build > Rebuild Project**

---

## ✅ Test Checklist

- [ ] `.env` dosyasında `NEXT_PUBLIC_API_URL` doğru
- [ ] Backend çalışıyor (`http://localhost:3001/health`)
- [ ] `npm run build:static` başarılı
- [ ] `npx cap sync` başarılı
- [ ] Android Studio açıldı
- [ ] Network Security Config eklendi
- [ ] Gradle sync tamamlandı
- [ ] Emulator/Telefon hazır
- [ ] Run butonuna tıklandı

---

## 🎯 Hızlı Komut (Tümünü Birden)

```bash
npm run android:test
```

Bu komut:
- Build yapar
- Sync yapar
- Android Studio'yu açar

---

## 📝 Sonraki Adım

Uygulama açıldığında:
1. Sign up sayfasına gidin
2. Yeni kullanıcı oluşturun
3. Backend'e bağlanıp bağlanmadığını test edin

**Sorun varsa:** `ANDROID_TEST_GUIDE.md` dosyasına bakın (detaylı rehber)
