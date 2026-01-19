# ✅ Android Test - Şu Ana Kadar Yapılanlar

## ✅ Tamamlanan İşlemler

1. ✅ **Android Studio kuruldu**
2. ✅ **Next.js build başarılı** - `out/` klasörü oluşturuldu
3. ✅ **Capacitor sync yapıldı** - Android projesine dosyalar kopyalandı
4. ✅ **Android Studio açıldı** - Proje hazır

---

## 📱 Şimdi Android Studio'da Yapılacaklar

### **ADIM 1: Gradle Sync Bekle (İlk Kez 5-10 dakika)**

Android Studio açıldığında:
- Otomatik olarak **Gradle sync** başlayacak
- Alt köşede progress bar göreceksiniz
- İlk kez uzun sürebilir (bağımlılıklar indiriliyor)
- **"Gradle sync finished"** mesajını bekleyin

---

### **ADIM 2: Network Security Config Ekle (ÖNEMLİ!)**

HTTP backend kullandığımız için (192.168.1.7:3001), Android 9+ için gerekli:

**A) Dosya Oluştur:**
1. Android Studio'da sol panelde:
   - `android/app/src/main/res/` klasörüne sağ tıklayın
   - **New > Directory**
   - İsim: `xml` (yoksa)

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

### **ADIM 3: Test Et**

#### **Emulator ile:**
1. Android Studio'da üstteki **Device Manager** ikonuna tıklayın
2. **Create Device** butonuna tıklayın
3. Bir cihaz seçin (örn: Pixel 5)
4. System Image seçin (API 33 veya üzeri - Download edilecek)
5. **Finish** tıklayın
6. Üstteki dropdown'dan emulator'ü seçin
7. **Run** butonuna tıklayın (▶️) veya `Shift+F10`

#### **Gerçek Telefon ile:**
1. Telefonunuzda **Settings > About Phone > Build Number**'a **7 kez** tıklayın
2. **Settings > Developer Options > USB Debugging** açın
3. Telefonu USB ile bilgisayara bağlayın
4. İzin isteyecek: **Allow USB debugging** ✓
5. Android Studio'da üstteki dropdown'dan telefonunuzu seçin
6. **Run** butonuna tıklayın

---

### **ADIM 4: Uygulama Açıldığında Test**

1. Uygulama açıldığında **Sign up** sayfasına gidin
2. Yeni kullanıcı oluşturmayı deneyin
3. Backend'e bağlanıyor mu kontrol edin
4. Hata varsa **Logcat** penceresine bakın:
   - Android Studio > **View > Tool Windows > Logcat**

---

## ✅ Checklist

- [ ] Gradle sync tamamlandı
- [ ] Network Security Config eklendi
- [ ] AndroidManifest.xml güncellendi
- [ ] Emulator oluşturuldu veya telefon bağlandı
- [ ] Run butonuna tıklandı
- [ ] Uygulama açıldı
- [ ] Test edildi

---

## 🐛 Sorun Giderme

### **Gradle sync failed:**
- **File > Invalidate Caches / Restart**
- **File > Sync Project with Gradle Files**

### **Network hataları:**
- Network Security Config eklendi mi?
- Backend çalışıyor mu? (`http://localhost:3001/health`)
- Telefon ve bilgisayar aynı WiFi'de mi?

### **Build hataları:**
- **Build > Clean Project**
- **Build > Rebuild Project**

---

## 🎉 Başarı!

Uygulama açıldığında:
- ✅ Android uygulamanız çalışıyor
- ✅ Backend'e bağlanabiliyor
- ✅ Test edilebilir

**Sonraki adım:** Uygulamayı test edin ve Google Play için release build oluşturun!
