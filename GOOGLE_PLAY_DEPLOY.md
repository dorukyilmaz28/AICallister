# Google Play Store'a Yükleme Rehberi

## 1. Keystore Oluşturma

### Windows'ta keystore oluşturma:
```bash
cd android/app
keytool -genkey -v -keystore callister-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias callister-key
```

**ÖNEMLİ:** 
- Şifreleri güvenli bir yerde saklayın!
- Keystore dosyasını yedekleyin!
- Şifreleri kaybetmeyin (key kaybolursa uygulamayı güncelleyemezsiniz!)

### Keystore bilgileri:
- **Alias:** callister-key
- **Validity:** 10000 gün (~27 yıl)
- **Key algorithm:** RSA 2048 bit

## 2. keystore.properties Dosyası Oluşturma

`android/keystore.properties` dosyasını oluşturun:

```properties
storePassword=YOUR_STORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=callister-key
storeFile=../app/callister-release-key.jks
```

**ÖNEMLİ:** Bu dosyayı `.gitignore`'a ekleyin!

## 3. Release AAB Build

### Build komutu:
```bash
cd android
gradlew bundleRelease
```

### AAB dosyası konumu:
```
android/app/build/outputs/bundle/release/app-release.aab
```

## 4. Google Play Console'a Yükleme

1. [Google Play Console](https://play.google.com/console) giriş yapın
2. Yeni uygulama oluşturun veya mevcut uygulamayı seçin
3. "Production" veya "Internal testing" track'ini seçin
4. "Create new release" butonuna tıklayın
5. AAB dosyasını yükleyin (`app-release.aab`)
6. Release notes ekleyin
7. "Review release" butonuna tıklayın
8. Gerekli bilgileri doldurun (ekran görüntüleri, açıklama, vb.)
9. "Start rollout to Production" butonuna tıklayın

## 5. Gerekli Bilgiler

### Uygulama Bilgileri:
- **Package Name:** com.callister.frcai
- **Version Code:** 1
- **Version Name:** 1.0.0
- **Min SDK:** 22 (Android 5.1)
- **Target SDK:** 34 (Android 14)

### Gerekli İçerikler:
- ✅ Uygulama ikonu (512x512 PNG)
- ✅ En az 2 ekran görüntüsü (telefon)
- ✅ Uygulama açıklaması (TR ve EN)
- ✅ Kısa açıklama (80 karakter)
- ✅ Uzun açıklama (4000 karakter)
- ✅ Kategori seçimi
- ✅ İçerik derecelendirmesi
- ✅ Gizlilik politikası URL'si (opsiyonel ama önerilir)

## 6. İlk Yükleme Sonrası

1. Google Play Console'da inceleme süreci başlar (genellikle 1-3 gün)
2. İnceleme tamamlandıktan sonra uygulama yayınlanır
3. Güncellemeler için `versionCode`'u artırın (1 → 2 → 3...)

## 7. Güncelleme Yapma

1. `android/app/build.gradle` dosyasında `versionCode` ve `versionName` güncelleyin
2. Yeni AAB build yapın
3. Google Play Console'da yeni release oluşturun
4. AAB dosyasını yükleyin

## Notlar

- İlk yükleme için Google Play Console'da $25 tek seferlik kayıt ücreti ödemeniz gerekir
- Uygulama inceleme süreci 1-3 gün sürebilir
- Keystore dosyasını ve şifrelerini kesinlikle kaybetmeyin!
