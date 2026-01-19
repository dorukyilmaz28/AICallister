# 📱 Android Uygulamasını Telefona Yükleme Rehberi

## 🎯 Yöntem 1: USB ile Direkt Yükleme (En Kolay)

### **Gereksinimler:**
- USB kablosu
- Android telefon
- USB Debugging açık olmalı

### **Adımlar:**

#### **1. Telefonda USB Debugging Açın:**
1. **Settings → About Phone** (Ayarlar → Telefon Hakkında)
2. **Build Number** (Yapı Numarası) üzerine **7 kez** tıklayın
3. Geri dönün: **Settings → Developer Options** (Geliştirici Seçenekleri)
4. **USB Debugging** (USB Hata Ayıklama) açın
5. **USB Debugging (Security settings)** açın (varsa)

#### **2. Telefonu Bilgisayara Bağlayın:**
1. USB kablosu ile telefonu bilgisayara bağlayın
2. Telefonda **"Allow USB debugging?"** (USB hata ayıklamaya izin ver?) sorusuna **"Allow"** (İzin Ver) deyin
3. **"Always allow from this computer"** (Bu bilgisayardan her zaman izin ver) kutusunu işaretleyin

#### **3. Android Studio'da Yükleyin:**
1. Android Studio'yu açın
2. Projeyi açın
3. Üst menüden **Run → Run 'app'** tıklayın
4. **Connected Devices** (Bağlı Cihazlar) listesinde telefonunuzu seçin
5. **OK** tıklayın

**✅ Uygulama otomatik olarak yüklenecek ve açılacak!**

---

## 🎯 Yöntem 2: APK Dosyası Oluşturup Yükleme

### **Adımlar:**

#### **1. Debug APK Oluştur:**
Android Studio Terminal'de (veya PowerShell'de):

```bash
cd android
.\gradlew.bat assembleDebug
```

APK dosyası şurada oluşacak:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

#### **2. APK'yı Telefona Aktar:**
**Yöntem A: USB ile**
1. Telefonu USB ile bağlayın
2. **File Transfer** (Dosya Aktarımı) modunu seçin
3. `app-debug.apk` dosyasını telefonun **Download** klasörüne kopyalayın

**Yöntem B: Cloud/Email ile**
1. APK'yı Google Drive/Dropbox'a yükleyin
2. Telefonda indirin
3. VEYA email ile kendinize gönderin

#### **3. Telefonda Yükle:**
1. Telefonda **File Manager** (Dosya Yöneticisi) açın
2. `app-debug.apk` dosyasını bulun
3. Üzerine tıklayın
4. **"Install from unknown sources"** (Bilinmeyen kaynaklardan yükle) izni verin
5. **Install** (Yükle) tıklayın

**✅ Uygulama yüklenecek!**

---

## 🎯 Yöntem 3: Android Studio'dan APK Oluşturma (GUI)

### **Adımlar:**

1. Android Studio'da: **Build → Build Bundle(s) / APK(s) → Build APK(s)**
2. Build tamamlanınca: **locate** (konumunu bul) linkine tıklayın
3. `app-debug.apk` dosyasını bulun
4. Telefona aktarın (Yöntem 2'deki gibi)

---

## 🔧 Sorun Giderme

### **Sorun 1: "USB Debugging" görünmüyor**
**Çözüm:**
- Build Number'a 7 kez tıklayın (About Phone'da)
- Developer Options açılacak

### **Sorun 2: Telefon Android Studio'da görünmüyor**
**Çözüm:**
1. USB kablosunu değiştirin (data transfer desteklemeli)
2. USB modunu **File Transfer** yapın
3. Telefonda **"Allow USB debugging"** izni verin
4. `adb devices` komutu ile kontrol edin (Terminal'de)

### **Sorun 3: "Install from unknown sources" hatası**
**Çözüm:**
1. **Settings → Security → Unknown Sources** (Bilinmeyen Kaynaklar) açın
2. VEYA APK'yı açarken **"Settings"** butonuna tıklayın ve izin verin

### **Sorun 4: APK yüklenmiyor**
**Çözüm:**
1. Eski versiyonu kaldırın: **Settings → Apps → Callister FRC AI → Uninstall**
2. APK'yı tekrar yükleyin

---

## 📋 Hızlı Komutlar

### **Telefon Bağlı mı Kontrol Et:**
```bash
cd android
.\gradlew.bat tasks
```

VEYA Android Studio Terminal'de:
```bash
adb devices
```

Telefonunuz listede görünmeli:
```
List of devices attached
ABC123XYZ    device
```

### **APK Oluştur:**
```bash
cd android
.\gradlew.bat assembleDebug
```

### **APK'yı Direkt Telefona Yükle (USB ile):**
```bash
cd android
.\gradlew.bat installDebug
```

---

## ✅ Başarı Kontrolü

Uygulama başarıyla yüklendiğinde:
- ✅ Telefonda **Callister FRC AI** uygulaması görünür
- ✅ Uygulama açılır
- ✅ Ana sayfa yüklenir

---

## 🎯 Önerilen Yöntem

**En Kolay:** Yöntem 1 (USB ile direkt yükleme)
- Tek tıkla yüklenir
- Otomatik açılır
- Debug için en uygun

**En Pratik:** Yöntem 2 (APK oluşturup yükleme)
- İnternet bağlantısı gerekmez
- Başkalarına da gönderebilirsiniz
- USB gerekmez

---

## 📞 Yardım

Sorun olursa:
1. Hangi yöntemi denediğinizi belirtin
2. Hata mesajını paylaşın
3. Android sürümünüzü belirtin

**Kolay gelsin!** 🚀
