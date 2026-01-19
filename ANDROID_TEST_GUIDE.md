# 📱 Android Uygulama Test Rehberi

Bu rehber, Callister FRC AI uygulamasını Android'de nasıl test edeceğinizi adım adım açıklar.

## ⚠️ ÖNEMLİ: Backend URL Yapılandırması

Android uygulaması çalışırken API çağrıları backend'e gitmeli. İki seçenek var:

### Seçenek 1: Local Network (Aynı WiFi)
- Telefon ve bilgisayar aynı WiFi ağında olmalı
- Bilgisayarınızın IP adresini bulun (örn: `192.168.1.100`)
- Backend URL'i: `http://192.168.1.100:3001`

### Seçenek 2: Production Backend (Önerilen)
- Backend'i deploy edin (Railway, Render, Vercel, vb.)
- Production URL'i kullanın: `https://your-backend-api.com`

## 🚀 Adım Adım Test

### 1. Backend URL'ini Ayarlayın

**Development için (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://192.168.1.100:3001
# veya
NEXT_PUBLIC_API_URL=https://your-backend-api.com
```

**Not:** IP adresinizi bulmak için:
- Windows: `ipconfig` komutunu çalıştırın (IPv4 Address)
- Mac/Linux: `ifconfig` veya `ip addr`

### 2. Next.js Static Build

```bash
# Root klasörde
npm run build:static
```

Bu komut `out/` klasörüne static dosyaları oluşturur.

### 3. Capacitor Sync

```bash
npx cap sync
```

Bu komut:
- `out/` klasöründeki dosyaları Android projesine kopyalar
- Native bağımlılıkları günceller

### 4. Android Studio'da Açın

```bash
npx cap open android
```

Veya manuel olarak:
- Android Studio'yu açın
- `Open an Existing Project` seçin
- `android/` klasörünü seçin

### 5. Android Studio'da Yapılandırma

#### A) Network Security Config (HTTP için)

Android 9+ HTTP bağlantılarını engeller. Backend'iniz HTTP kullanıyorsa:

**`android/app/src/main/res/xml/network_security_config.xml`** oluşturun:

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

**`android/app/src/main/AndroidManifest.xml`** içine ekleyin:

```xml
<application
    android:networkSecurityConfig="@xml/network_security_config"
    ...>
```

#### B) API URL'i Build-Time'da Ayarlama (Opsiyonel)

API URL'ini environment variable'dan almak için:

**`android/app/build.gradle`** dosyasına ekleyin:

```gradle
android {
    defaultConfig {
        // ...
        buildConfigField "String", "API_BASE_URL", "\"${project.findProperty('API_BASE_URL') ?: 'http://192.168.1.100:3001'}\""
    }
}
```

**Veya Capacitor Config'de:**

`capacitor.config.ts` dosyasını güncelleyin:

```typescript
const config: CapacitorConfig = {
  // ...
  server: {
    // Development için local network IP
    url: 'http://192.168.1.100:3001',
    cleartext: true // HTTP için gerekli
  }
};
```

### 6. Test Etme

#### Emulator ile:
1. Android Studio'da bir emulator oluşturun/başlatın
2. Run butonuna tıklayın (▶️) veya `Shift+F10`

#### Gerçek Cihaz ile:
1. Telefonunuzda Developer Options açın:
   - Settings > About Phone > Build Number'a 7 kez tıklayın
2. USB Debugging açın:
   - Settings > Developer Options > USB Debugging
3. Telefonu USB ile bağlayın
4. Android Studio'da Run butonuna tıklayın

### 7. Backend'i Başlatın

Test ederken backend'in çalışıyor olması gerekir:

```bash
cd backend
npm run dev
```

**Local Network için:**
Backend'in tüm network interface'lerinden erişilebilir olması için:

Backend `server.ts` dosyasını güncelleyin (opsiyonel):

```typescript
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Backend server running on http://0.0.0.0:${PORT}`);
});
```

### 8. Debugging

#### Logları İnceleme:

**Chrome DevTools ile:**
```bash
npx cap run android
# Ardından Chrome'da: chrome://inspect
```

**Android Studio Logcat:**
- View > Tool Windows > Logcat
- Uygulama loglarını görebilirsiniz

#### Network İsteklerini Kontrol:

Backend loglarına bakın:
- Terminal'de backend çalışıyor mu?
- API istekleri geliyor mu?
- CORS hatası var mı?

## 🔧 Sorun Giderme

### Problem: API çağrıları çalışmıyor

**Çözüm 1:** Backend URL'ini kontrol edin
- `.env.local` dosyasında `NEXT_PUBLIC_API_URL` doğru mu?
- Build'i yeniden yapın: `npm run build:static && npx cap sync`

**Çözüm 2:** Network Security Config
- HTTP kullanıyorsanız `network_security_config.xml` dosyasını ekleyin

**Çözüm 3:** CORS
- Backend'de CORS ayarlarını kontrol edin
- Android uygulamasının origin'ini CORS'a ekleyin

### Problem: Build hatası

**Çözüm:**
```bash
cd android
./gradlew clean
cd ..
npx cap sync
```

### Problem: Uygulama açılmıyor

**Çözüm:**
- Android Studio'da Clean Project: Build > Clean Project
- Rebuild: Build > Rebuild Project

## 📝 Quick Test Checklist

- [ ] Backend çalışıyor (`http://localhost:3001/health`)
- [ ] `.env.local` dosyasında `NEXT_PUBLIC_API_URL` doğru
- [ ] Static build yapıldı (`npm run build:static`)
- [ ] Capacitor sync yapıldı (`npx cap sync`)
- [ ] Network Security Config eklendi (HTTP için)
- [ ] Android Studio'da açıldı
- [ ] Emulator veya gerçek cihaz hazır
- [ ] Run butonuna tıklandı

## 🎯 Production Build İçin

Production'da:

1. Backend'i deploy edin (Railway, Render, vb.)
2. `.env.local` dosyasını güncelleyin:
   ```env
   NEXT_PUBLIC_API_URL=https://your-backend-api.com
   ```
3. Build ve sync:
   ```bash
   npm run build:static
   npx cap sync
   ```
4. Release APK/AAB oluşturun (Android Studio > Build > Generate Signed Bundle)

## 💡 İpuçları

- **Development:** Local network kullanın (hızlı test için)
- **Production:** HTTPS backend kullanın (güvenlik için)
- **Testing:** Her değişiklikten sonra `npm run build:static && npx cap sync` yapın
- **Debugging:** Chrome DevTools kullanın (en kolay yöntem)

## 📚 Ek Kaynaklar

- [Capacitor Android Docs](https://capacitorjs.com/docs/android)
- [Android Network Security](https://developer.android.com/training/articles/security-config)
- [CAPACITOR_ANDROID_SETUP.md](./CAPACITOR_ANDROID_SETUP.md) - Detaylı kurulum
