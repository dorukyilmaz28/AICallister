# ⚡ Android Test - Hızlı Başlangıç

## 🎯 3 Adımda Test

### 1. Backend URL'ini Ayarlayın

**Local Network için (aynı WiFi):**

Bilgisayarınızın IP adresini bulun:
```powershell
# Windows PowerShell
ipconfig | Select-String "IPv4"
```

`.env.local` dosyasını güncelleyin:
```env
NEXT_PUBLIC_API_URL=http://192.168.1.XXX:3001
```

**Production Backend için:**
```env
NEXT_PUBLIC_API_URL=https://your-backend-api.com
```

### 2. Build ve Sync

```bash
npm run android:test
```

Bu komut:
- Static build yapar
- Capacitor sync yapar
- Android Studio'yu açar

### 3. Android Studio'da Run

1. Android Studio açıldığında Gradle sync'i bekleyin
2. Emulator seçin veya telefonu bağlayın
3. Run butonuna tıklayın (▶️)

## ⚠️ ÖNEMLİ: Network Security Config

HTTP backend kullanıyorsanız (localhost veya local IP), Android 9+ için:

1. **`android/app/src/main/res/xml/`** klasörünü oluşturun (yoksa)
2. **`network_security_config.xml`** dosyasını oluşturun
3. İçeriği `android-network-config-example.xml` dosyasından kopyalayın
4. **`android/app/src/main/AndroidManifest.xml`** dosyasını açın
5. `<application>` tag'ine ekleyin:
   ```xml
   <application
       android:networkSecurityConfig="@xml/network_security_config"
       ...>
   ```

## 🐛 Sorun mu var?

**API çağrıları çalışmıyor:**
- Backend çalışıyor mu? (`http://localhost:3001/health`)
- IP adresi doğru mu?
- Network Security Config eklendi mi?

**Build hatası:**
```bash
cd android
./gradlew clean
cd ..
npm run android:test
```

**Detaylı rehber:** `ANDROID_TEST_GUIDE.md` dosyasına bakın
