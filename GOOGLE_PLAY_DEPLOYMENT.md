# 📱 Google Play Store'a Uygulama Yükleme Rehberi

## 📋 Önkoşullar

### 1. **Google Play Console Hesabı**
- [Google Play Console](https://play.google.com/console) hesabı oluşturun
- **Tek seferlik 25$ ücret** ödemeniz gerekiyor
- Bu ücret bir kere ödenir ve sonsuza kadar geçerlidir

### 2. **Release Key Oluşturma (ÖNEMLİ!)**

Release key oluşturmadan **ASLA** release build yapmayın. Key kaybolursa uygulamayı güncelleyemezsiniz!

#### **A) Key Oluşturma:**

```bash
# Android Studio Terminal'de veya CMD'de:
cd android/app

keytool -genkeypair -v -storetype PKCS12 -keystore callister-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias callister-key
```

**Sorular:**
- Password: Güçlü bir şifre seçin (NOT EDİN!)
- İsim, organizasyon, şehir, ülke bilgileri girin
- **Key password**: Store password ile aynı olabilir veya farklı (NOT EDİN!)

**ÖNEMLİ:** 
- `callister-release-key.jks` dosyasını **GÜVENLİ** bir yere yedekleyin
- Şifreleri **GÜVENLİ** bir yerde saklayın
- Bu dosya kaybolursa uygulamanızı güncelleyemezsiniz!

#### **B) Key Yapılandırması:**

`android/keystore.properties` dosyası oluşturun:

```properties
storePassword=YOUR_STORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=callister-key
storeFile=../app/callister-release-key.jks
```

#### **C) build.gradle'a Ekle:**

`android/app/build.gradle` dosyasına ekleyin:

```gradle
// Key bilgilerini yükle
def keystorePropertiesFile = rootProject.file("keystore.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    // ... mevcut ayarlar ...

    signingConfigs {
        release {
            if (keystorePropertiesFile.exists()) {
                keyAlias keystoreProperties['keyAlias']
                keyPassword keystoreProperties['keyPassword']
                storeFile file(keystoreProperties['storeFile'])
                storePassword keystoreProperties['storePassword']
            }
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

---

## 🔨 Release Build Oluşturma

### **Yöntem 1: Android Studio (Önerilen)**

1. **Android Studio'da:**
   - **Build > Generate Signed Bundle / APK**
   - **Android App Bundle** seçin (Google Play önerir)
   - **Next** tıklayın

2. **Key bilgilerini girin:**
   - Keystore path: `android/app/callister-release-key.jks`
   - Passwords ve alias'ı girin
   - **Next**

3. **Build Variant:**
   - **release** seçin
   - **Create** tıklayın

4. **Oluşturulan dosya:**
   - `android/app/release/app-release.aab` dosyası oluşacak

### **Yöntem 2: Komut Satırı**

```bash
cd android
./gradlew bundleRelease

# Oluşturulan dosya:
# android/app/build/outputs/bundle/release/app-release.aab
```

**Windows için:**
```bash
cd android
gradlew.bat bundleRelease
```

---

## 📦 Google Play Console'a Yükleme

### **Adım 1: Uygulama Oluştur**

1. [Google Play Console](https://play.google.com/console) açın
2. **Tüm uygulamalar** > **Uygulama oluştur**
3. **Uygulama adı:** Callister FRC AI
4. **Varsayılan dil:** Türkçe (veya İngilizce)
5. **Uygulama türü:** Uygulama
6. **Ücretsiz mi, ücretli mi?** Ücretsiz
7. **Oluştur** tıklayın

### **Adım 2: Store Listing**

**Gerekli Bilgiler:**
- **Kısa açıklama** (80 karakter max)
- **Uzun açıklama** (4000 karakter max)
- **Uygulama ikonu** (512x512 PNG, şeffaf olmayan)
- **Özellik grafiği** (1024x500 PNG)
- **Telefon ekran görüntüleri** (en az 2, en fazla 8)
  - En az 1 tanesi: 320dp - 3840dp genişlik
  - Örnek: 1080x1920 (Full HD telefon)
- **Kategori:** Eğitim veya Üretkenlik
- **İçerik derecelendirmesi:** Anket doldurun
- **Privacy Policy URL:** (zorunlu!)

**Örnek Store Listing:**

```
Kısa Açıklama:
FRC robot yarışması için yapay zeka asistanı ve kod kütüphanesi

Uzun Açıklama:
Callister FRC AI, FIRST Robotics Competition (FRC) takımları için özel olarak tasarlanmış kapsamlı bir yapay zeka asistanı ve kod kütüphanesidir.

✨ Özellikler:
• WPILib kod örnekleri ve kütüphanesi
• Yapay zeka destekli soru-cevap sistemi
• Takım yönetimi ve sohbet özellikleri
• The Blue Alliance entegrasyonu
• Code snippets paylaşımı
• Takım üyeleri arası iletişim

🤖 Desteklenen Diller:
Java, C++, Python

📚 Kaynaklar:
• WPILib Documentation
• The Blue Alliance verileri
• FIRST resmi kaynakları

FRC takımları için vazgeçilmez bir araç!
```

### **Adım 3: İçerik Derecelendirmesi**

1. **Formu doldurun:** 
   - Şiddet, cinsellik, uyuşturucu içeriği soruları
   - FRC uygulaması olduğu için çoğu "Hayır" olacak

2. **Privacy Policy:**
   - **ZORUNLU!** Bir privacy policy sayfası oluşturun
   - Örnek: GitHub Pages, Vercel, Netlify üzerinde
   - URL'i ekleyin

### **Adım 4: Production/Testing Track'e Yükleme**

1. **Sol menüden:**
   - **Production** veya **Internal testing** seçin
   - **Yeni sürüm oluştur** tıklayın

2. **AAB Dosyasını Yükleyin:**
   - **App bundles** bölümüne `.aab` dosyasını sürükleyin
   - Google Play otomatik olarak imzalayacak

3. **Sürüm Notları:**
   ```
   İlk sürüm - v1.0.0
   • FRC AI asistanı
   • Kod snippet kütüphanesi
   • Takım yönetimi
   • Bildirim sistemi
   ```

4. **Gözden Geçir ve Yayınla**

---

## 📝 Privacy Policy Oluşturma

**Basit Privacy Policy örneği:**

GitHub Pages veya Vercel'de bir sayfa oluşturun:

```markdown
# Privacy Policy - Callister FRC AI

## Veri Toplama
Uygulamamız aşağıdaki verileri toplar:
- Email adresi (hesap oluşturma için)
- Kullanıcı adı
- Takım bilgileri
- Sohbet mesajları (sadece uygulama içinde)

## Veri Kullanımı
- Hesap yönetimi
- Takım iletişimi
- Yapay zeka destekli sohbet

## Veri Saklama
Veriler güvenli sunucularda saklanır.

## İletişim
Sorularınız için: [email adresiniz]
```

**Ücretsiz Hosting:**
- GitHub Pages
- Vercel
- Netlify

---

## ✅ Checklist

### **Teknik Hazırlık:**
- [ ] Release key oluşturuldu ve yedeklendi
- [ ] `keystore.properties` dosyası oluşturuldu
- [ ] `build.gradle` yapılandırıldı
- [ ] Release build başarılı (`app-release.aab`)
- [ ] Uygulama test edildi

### **Store Listing:**
- [ ] Uygulama ikonu (512x512)
- [ ] Özellik grafiği (1024x500)
- [ ] En az 2 telefon ekran görüntüsü
- [ ] Kısa açıklama yazıldı
- [ ] Uzun açıklama yazıldı
- [ ] Kategori seçildi
- [ ] İçerik derecelendirmesi tamamlandı
- [ ] Privacy Policy URL eklendi

### **Google Play Console:**
- [ ] Developer hesabı oluşturuldu (25$ ödendi)
- [ ] Uygulama oluşturuldu
- [ ] Store listing dolduruldu
- [ ] AAB dosyası yüklendi
- [ ] Yayınlandı

---

## 🚀 İlk Yayın Sonrası

### **Süre:**
- İlk yayın **1-7 gün** sürebilir (Google incelemesi)
- Sonraki güncellemeler genelde **1-3 gün**

### **Güncelleme Yapma:**

1. Version code ve version name artırın:
   ```gradle
   // android/app/build.gradle
   defaultConfig {
       versionCode 2  // Her yeni versiyonda +1
       versionName "1.0.1"  // Kullanıcıya gösterilen versiyon
   }
   ```

2. Yeni release build oluşturun
3. Google Play Console'da yeni sürüm yükleyin

---

## 💡 İpuçları

1. **İlk kez Internal Testing ile başlayın:**
   - Beta test için
   - Daha hızlı onay

2. **Screenshots için:**
   - Android Studio > Tools > Layout Inspector
   - Veya gerçek telefonla çekin
   - Farklı ekran boyutları için

3. **App Icon:**
   - 512x512 PNG
   - Şeffaf olmamalı
   - Köşeler yuvarlatılmamalı (Google yapar)

4. **Version Code:**
   - Her yayında mutlaka artırın
   - Google Play sadece daha yüksek version code kabul eder

---

## 🐛 Sorun Giderme

### **"Upload failed" Hatası:**
- AAB dosyası imzalı mı kontrol edin
- Version code önceki sürümden yüksek mi?

### **"Your app needs to be approved" Bekleme:**
- Normal süreç, bekleyin
- Google ekibinden email gelirse yanıtlayın

### **"Privacy Policy missing":**
- Privacy Policy URL ekleyin
- Public erişilebilir olmalı

---

## 📚 Kaynaklar

- [Google Play Console](https://play.google.com/console)
- [Android App Bundle Rehberi](https://developer.android.com/guide/app-bundle)
- [Play Console Yardım](https://support.google.com/googleplay/android-developer)

---

**İyi şanslar! 🚀**
