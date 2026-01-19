# Capacitor Android Kurulum Kılavuzu

Bu kılavuz, Callister FRC AI projesini Android uygulamasına dönüştürmek için adım adım talimatlar içerir.

## ⚠️ ÖNEMLİ NOT: API Routes Sorunu

Next.js static export ile API routes çalışmaz. Projenizde `/api/*` route'ları var. Bu sorunu çözmek için iki seçenek var:

### Seçenek 1: API'leri Ayrı Backend'e Taşımak (Önerilen)
- API'leri ayrı bir backend sunucusuna (Node.js/Express, Vercel Serverless, vb.) taşıyın
- Client-side'da API base URL'ini environment variable'dan alın
- Production'da API URL'ini production backend'inize yönlendirin

### Seçenek 2: Hybrid Yaklaşım
- Önemli API'leri client-side only yapın (örneğin, database işlemleri yerine localStorage kullanın)
- Sadece gerekli API'leri ayrı bir backend'e taşıyın

## 📋 Gereksinimler

1. **Node.js** (v18 veya üzeri) - Zaten kurulu ✅
2. **Android Studio** - Kurmanız gerekiyor
   - İndirme: https://developer.android.com/studio
   - Android SDK kurulumu
   - Android SDK Build-Tools
   - Java JDK 11 veya üzeri

## 🚀 Adım Adım Kurulum

### 1. Android Studio Kurulumu

1. Android Studio'yu indirin ve kurun
2. İlk açılışta SDK Manager'dan:
   - Android SDK (API 33 veya üzeri)
   - Android SDK Build-Tools
   - Android Emulator (test için)
   - Java JDK 11+

### 2. Environment Variables Ayarlama

`.env.local` dosyanızda API URL'ini ayarlayın (eğer ayrı backend kullanıyorsanız):

```env
NEXT_PUBLIC_API_URL=https://your-api-backend.com
```

### 3. Projeyi Build Etme

Static export için build yapın:

```bash
npm run build:static
```

Bu komut `out/` klasörüne static dosyaları oluşturur.

### 4. Capacitor Sync

Capacitor'a build edilmiş dosyaları senkronize edin:

```bash
npm run cap:sync
```

Bu komut:
- Web dosyalarını Android projesine kopyalar
- Native bağımlılıkları günceller

### 5. Android Studio'da Açma

Android projesini Android Studio'da açın:

```bash
npm run cap:open:android
```

Veya manuel olarak:
```bash
npx cap open android
```

### 6. Android Studio'da Yapılandırma

1. **Gradle Sync**: Android Studio açıldığında otomatik sync yapacak, tamamlanmasını bekleyin
2. **Min SDK Version**: `android/app/build.gradle` dosyasında minimum SDK sürümünü kontrol edin (21+ önerilir)
3. **Package Name**: `android/app/build.gradle` içinde `applicationId` doğru olduğundan emin olun (`com.callister.frcai`)

### 7. Test Etme (Emulator veya Gerçek Cihaz)

#### Emulator ile:
1. Android Studio'da bir emulator oluşturun veya var olan birini başlatın
2. Run butonuna tıklayın (▶️) veya `Shift+F10`

#### Gerçek Cihaz ile:
1. Telefonunuzda Developer Options'ı açın:
   - Settings > About Phone > Build Number'a 7 kez tıklayın
2. USB Debugging'i açın:
   - Settings > Developer Options > USB Debugging
3. Telefonu USB ile bilgisayara bağlayın
4. Android Studio'da Run butonuna tıklayın

### 8. APK Oluşturma (Test için)

1. Android Studio'da: **Build > Build Bundle(s) / APK(s) > Build APK(s)**
2. Build tamamlandıktan sonra: **Build > Analyze APK**
3. APK dosyası `android/app/build/outputs/apk/debug/` klasöründe olacak

### 9. Release Build (Google Play için)

Google Play'e yüklemek için signed release APK veya AAB (Android App Bundle) oluşturmanız gerekir:

#### Keystore Oluşturma (İlk defa):

```bash
cd android/app
keytool -genkey -v -keystore callister-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias callister
```

#### Signing Configuration

`android/app/build.gradle` dosyasına ekleyin:

```gradle
android {
    ...
    signingConfigs {
        release {
            if (project.hasProperty('MYAPP_RELEASE_STORE_FILE')) {
                storeFile file(MYAPP_RELEASE_STORE_FILE)
                storePassword MYAPP_RELEASE_STORE_PASSWORD
                keyAlias MYAPP_RELEASE_KEY_ALIAS
                keyPassword MYAPP_RELEASE_KEY_PASSWORD
            }
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

#### `android/gradle.properties` dosyasına ekleyin:

```properties
MYAPP_RELEASE_STORE_FILE=callister-release-key.jks
MYAPP_RELEASE_STORE_PASSWORD=your-keystore-password
MYAPP_RELEASE_KEY_ALIAS=callister
MYAPP_RELEASE_KEY_PASSWORD=your-key-password
```

⚠️ **GÜVENLİK**: `gradle.properties` dosyasını `.gitignore`'a ekleyin!

#### Release Build:

Android Studio'da: **Build > Generate Signed Bundle / APK**

## 🔄 Geliştirme Döngüsü

Her değişiklikten sonra:

1. **Değişiklikleri yapın** (kod, stil, vb.)
2. **Build edin**: `npm run build:static`
3. **Sync edin**: `npm run cap:sync`
4. **Android Studio'da test edin**: Run butonuna tıklayın

**Hızlı Komut** (hepsini birden):
```bash
npm run cap:build:android
```

## 📱 Google Play Console'a Yükleme

1. Google Play Console hesabı oluşturun: https://play.google.com/console
2. Yeni uygulama oluşturun
3. Store listing bilgilerini doldurun (açıklama, ekran görüntüleri, vb.)
4. Release > Production > Create new release
5. Signed AAB dosyanızı yükleyin
6. Privacy Policy URL'i ekleyin (zorunlu)
7. Content rating alın
8. Review için gönderin

## 🛠️ Sorun Giderme

### Build Hataları

**Hata**: "Could not find or load main class"
**Çözüm**: Java JDK 11+ kurulu olduğundan emin olun

**Hata**: "SDK location not found"
**Çözüm**: Android Studio'da SDK path'i ayarlayın veya `android/local.properties` dosyası oluşturun:
```properties
sdk.dir=C:\\Users\\YourUsername\\AppData\\Local\\Android\\Sdk
```

**Hata**: "Gradle sync failed"
**Çözüm**: 
- File > Invalidate Caches / Restart
- `android/gradle/wrapper/gradle-wrapper.properties` içinde Gradle sürümünü kontrol edin

### Runtime Hataları

**Uygulama açılmıyor**: 
- `npx cap sync` çalıştırın
- Android Studio'da Clean Project: Build > Clean Project

**API çağrıları çalışmıyor**:
- Static export ile API routes çalışmaz, ayrı backend gerekiyor
- `NEXT_PUBLIC_API_URL` environment variable'ını kontrol edin

## 📚 Ek Kaynaklar

- [Capacitor Android Docs](https://capacitorjs.com/docs/android)
- [Next.js Static Export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [Google Play Console](https://support.google.com/googleplay/android-developer)

## 🎯 Sonraki Adımlar

1. ✅ Android Studio kurulumu
2. ✅ İlk build ve test
3. ✅ API backend kurulumu (gerekirse)
4. ✅ Release build hazırlama
5. ✅ Google Play Console'a yükleme
