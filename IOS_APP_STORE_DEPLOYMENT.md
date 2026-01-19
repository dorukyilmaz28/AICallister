# 🍎 iOS App Store'a Uygulama Yükleme Rehberi

## 💰 Maliyet

### **Apple Developer Program:**
- **Yıllık: $99 USD** (yaklaşık ₺3,000 - ₺3,500 TL, döviz kuru değişkendir)
- Her yıl yenilenmesi gerekir
- Tek seferlik değil, yıllık ücretlidir

### **Karşılaştırma:**
- **Android (Google Play):** Tek seferlik $25 USD
- **iOS (App Store):** Yıllık $99 USD

---

## 📋 Önkoşullar

### 1. **Apple Developer Hesabı**
- [Apple Developer Portal](https://developer.apple.com/programs/) kaydı
- Yıllık $99 ödeme
- Onay süreci 24-48 saat sürebilir

### 2. **Mac Gereksinimi (ÖNEMLİ!)**
- **macOS** işletim sistemli bir Mac bilgisayar **GEREKLİ**
- iOS uygulaması build etmek için Xcode gerekiyor
- Xcode sadece macOS'ta çalışır
- Windows'ta iOS build yapılamaz (yasal olarak)

### 3. **Gerekli Yazılımlar:**
- **Xcode** (App Store'dan ücretsiz)
- **Xcode Command Line Tools**
- **CocoaPods** (package manager)

---

## 🔧 iOS Projesi Hazırlama

### **Adım 1: Capacitor iOS Platform Ekle**

```bash
cd C:\Users\utkuy\Desktop\AICallister-main

# iOS platform ekle
npx cap add ios

# Sync yap
npm run build:static
npx cap sync ios
```

**NOT:** Bu komutlar Windows'ta çalışmaz! macOS'ta yapılmalı.

### **Adım 2: Xcode ile Aç**

```bash
# macOS'ta:
npx cap open ios
```

Bu komut Xcode'u açacak ve iOS projesini yükleyecek.

---

## 🔑 Provisioning & Code Signing

### **Apple Developer Portal'da:**

1. **Certificates oluştur:**
   - Development Certificate
   - Distribution Certificate (App Store için)

2. **App ID oluştur:**
   - Bundle Identifier: `com.callister.frcai`
   - Capabilities: Push Notifications (gerekirse)

3. **Provisioning Profiles:**
   - Development Profile
   - App Store Distribution Profile

### **Xcode'da Yapılandırma:**

1. **Signing & Capabilities sekmesi:**
   - Team seçin (Apple Developer hesabınız)
   - Automatically manage signing: ✅ işaretleyin
   - Bundle Identifier: `com.callister.frcai`

2. **Capabilities ekle:**
   - Push Notifications (bildirimler için)

---

## 📱 Release Build Oluşturma

### **Yöntem 1: Xcode (Önerilen)**

1. **Xcode'da:**
   - Product > Scheme > Edit Scheme
   - Build Configuration: **Release** seçin

2. **Archive oluştur:**
   - Product > Archive
   - Archive tamamlanınca Organizer açılacak

3. **App Store'a yükle:**
   - **Distribute App** butonuna tıklayın
   - **App Store Connect** seçin
   - **Upload** seçin
   - Sonraki adımları takip edin

### **Yöntem 2: Komut Satırı (CI/CD için)**

```bash
# macOS Terminal'de:
cd ios/App

xcodebuild archive \
  -workspace App.xcworkspace \
  -scheme App \
  -archivePath build/App.xcarchive \
  -configuration Release

xcodebuild -exportArchive \
  -archivePath build/App.xcarchive \
  -exportPath build/export \
  -exportOptionsPlist ExportOptions.plist
```

---

## 🍎 App Store Connect

### **Adım 1: Uygulama Oluştur**

1. [App Store Connect](https://appstoreconnect.apple.com) açın
2. **My Apps** > **+** > **New App**
3. Bilgileri doldurun:
   - **Platform:** iOS
   - **Name:** Callister FRC AI
   - **Primary Language:** Turkish (veya English)
   - **Bundle ID:** com.callister.frcai
   - **SKU:** callister-frc-ai-001
   - **User Access:** Full Access

### **Adım 2: App Store Listing**

**Gerekli Bilgiler:**
- **App Name** (30 karakter max)
- **Subtitle** (30 karakter max)
- **Description** (4000 karakter max)
- **Keywords** (100 karakter max, virgülle ayrılmış)
- **Support URL**
- **Marketing URL** (opsiyonel)
- **Privacy Policy URL** (ZORUNLU!)
- **App Icon** (1024x1024 PNG, şeffaf olmamalı)
- **Screenshots:**
  - iPhone: En az 6.5" ve 5.5" ekran boyutları için
  - iPad: Opsiyonel ama önerilir

**Örnek App Store Listing:**

```
Name:
Callister FRC AI

Subtitle:
FRC Robot Yarışması Asistanı

Description:
Callister FRC AI, FIRST Robotics Competition (FRC) takımları için özel olarak tasarlanmış kapsamlı bir yapay zeka asistanı ve kod kütüphanesidir.

✨ Özellikler:
• WPILib kod örnekleri ve kütüphanesi
• Yapay zeka destekli soru-cevap sistemi
• Takım yönetimi ve sohbet özellikleri
• The Blue Alliance entegrasyonu
• Code snippets paylaşımı
• Takım üyeleri arası iletişim
• Push bildirimleri

🤖 Desteklenen Diller:
Java, C++, Python

📚 Kaynaklar:
• WPILib Documentation
• The Blue Alliance verileri
• FIRST resmi kaynakları

FRC takımları için vazgeçilmez bir araç!

Keywords:
FRC, robotics, FIRST, WPILib, Java, C++, Python, robot programming, The Blue Alliance
```

### **Adım 3: Build Yükleme**

1. **Xcode Organizer'dan:**
   - Archive oluşturduktan sonra
   - **Distribute App** > **App Store Connect** > **Upload**

2. **Veya App Store Connect'ten:**
   - **TestFlight** ile önce test edebilirsiniz
   - Production'a geçmeden önce beta test önerilir

### **Adım 4: App Review İçin Hazırlık**

**Gerekli Bilgiler:**
- **Privacy Policy URL** (ZORUNLU!)
- **Contact Information**
- **App Review Notes** (gerekirse)
- **Demo Account** (eğer login gerektiriyorsa)

**App Review Süreci:**
- İlk inceleme: **1-3 gün**
- Bazen daha uzun sürebilir
- Apple ekibinden geri dönüş olabilir

---

## 🔐 iOS Specific Konfigürasyonlar

### **Info.plist Ayarları**

`ios/App/App/Info.plist` dosyasında:

```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/>
</dict>

<!-- Push Notifications için -->
<key>UIBackgroundModes</key>
<array>
    <string>remote-notification</string>
</array>
```

### **Capacitor Config**

`capacitor.config.ts` dosyasında:

```typescript
const config: CapacitorConfig = {
  appId: 'com.callister.frcai',
  appName: 'Callister FRC AI',
  webDir: 'out',
  ios: {
    scheme: 'https',
    // Push notifications için
    plugins: {
      PushNotifications: {
        presentationOptions: ['badge', 'sound', 'alert'],
      },
    },
  },
  // ...
};
```

---

## ✅ Checklist

### **Teknik Hazırlık:**
- [ ] macOS bilgisayar erişimi
- [ ] Xcode kuruldu
- [ ] Apple Developer hesabı ($99/yıl)
- [ ] Capacitor iOS platform eklendi
- [ ] Provisioning profiles oluşturuldu
- [ ] Code signing yapılandırıldı
- [ ] Archive başarılı
- [ ] App Store Connect'e yüklendi

### **App Store Listing:**
- [ ] App name yazıldı
- [ ] Subtitle yazıldı
- [ ] Description yazıldı (Türkçe + İngilizce önerilir)
- [ ] Keywords eklendi
- [ ] App icon (1024x1024)
- [ ] Screenshots (iPhone için)
- [ ] Privacy Policy URL eklendi
- [ ] Support URL eklendi

### **Review Hazırlığı:**
- [ ] TestFlight'ta test edildi
- [ ] Demo account hazırlandı (gerekirse)
- [ ] App Review Notes yazıldı (gerekirse)
- [ ] Gerekli izinler açıklandı

---

## 💡 iOS vs Android Farkları

| Özellik | Android | iOS |
|---------|---------|-----|
| **Maliyet** | $25 (tek seferlik) | $99/yıl |
| **Build Platform** | Windows/Mac/Linux | Sadece macOS |
| **Onay Süresi** | 1-7 gün | 1-3 gün (genelde) |
| **Review** | Daha esnek | Daha sıkı |
| **Hız** | Daha hızlı yayın | Biraz daha yavaş |
| **Test** | Internal/Closed Beta | TestFlight |

---

## 🐛 Yaygın Sorunlar

### **"No signing certificate found":**
- Apple Developer Portal'dan certificate oluşturun
- Xcode'da Team seçin
- Automatically manage signing'i açın

### **"Provisioning profile doesn't match":**
- Xcode > Preferences > Accounts
- Download Manual Profiles
- Veya Xcode'a güvenin (auto manage)

### **"Push Notifications not working":**
- Capabilities'de Push Notifications ekleyin
- Apple Developer Portal'da App ID'ye Push Notifications capability ekleyin
- Yeni provisioning profile oluşturun

---

## 📚 Kaynaklar

- [Apple Developer Portal](https://developer.apple.com/)
- [App Store Connect](https://appstoreconnect.apple.com)
- [Xcode](https://developer.apple.com/xcode/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [TestFlight](https://developer.apple.com/testflight/)

---

## ⚠️ Önemli Notlar

1. **Mac Gereksinimi:**
   - iOS build için macOS **ZORUNLU**
   - Windows'ta yapılamaz
   - Alternatif: Mac'in Cloud servisleri (MacStadium, AWS Mac instances)

2. **Yıllık Ücret:**
   - $99/yıl devam eder
   - Ödenmezse uygulama mağazadan kaldırılır
   - Güncelleme yapamazsınız

3. **Review Süreci:**
   - iOS'ta daha sıkı kurallar var
   - İlk yayında daha uzun sürebilir
   - Reddedilirse nedenleri açıklanır, düzeltip tekrar yükleyebilirsiniz

---

**iOS geliştirme için Mac şart! 🍎**
