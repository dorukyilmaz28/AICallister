# 📱 Android Studio'yu Açma - Adım Adım

## ✅ Android Projesi Hazır!

Android klasörü var ve yapı doğru görünüyor. Şimdi Android Studio'yu açalım.

---

## 🚀 Android Studio'yu Açma (3 Yol)

### **YÖNTEM 1: Android Studio'dan Açma (En Kolay)**

1. **Android Studio'yu başlatın**
   - Masaüstünden veya Başlat menüsünden açın

2. **Açıldığında:**
   - **"Open"** butonuna tıklayın
   - VEYA **"File > Open"** menüsünden

3. **Klasörü seçin:**
   ```
   C:\Users\utkuy\Desktop\AICallister-main\android
   ```
   - Windows Explorer'dan bu klasörü bulun
   - VEYA direkt yolu kopyalayıp yapıştırın

4. **"OK"** tıklayın

5. **Gradle sync başlayacak** - Bekleyin! (5-10 dakika ilk kez)

---

### **YÖNTEM 2: Windows Explorer'dan**

1. **Windows Explorer'ı açın**

2. **Şu klasöre gidin:**
   ```
   C:\Users\utkuy\Desktop\AICallister-main\android
   ```

3. **Android Studio'yu açın**

4. Android Studio'da **"File > Open"** seçin

5. Açılan pencerede zaten `android` klasöründesiniz, **"OK"** tıklayın

---

### **YÖNTEM 3: Direkt Klasörü Açma**

1. **Windows Explorer'da:**
   - `C:\Users\utkuy\Desktop\AICallister-main\android` klasörüne gidin

2. **Android Studio'yu açın**

3. Android Studio'da:
   - **File > Open**
   - Zaten doğru klasördesiniz, **"OK"** tıklayın

---

## 📋 Android Studio Açıldığında Ne Göreceksiniz

### **İlk Açılış:**

1. ✅ **Gradle sync başlayacak**
   - Alt köşede progress bar göreceksiniz
   - İlk kez 5-10 dakika sürebilir (bağımlılıklar indiriliyor)
   - **SABIRLI OLUN ve BEKLEYİN**

2. ✅ **Sol panelde proje yapısı:**
   ```
   android
   ├── app
   ├── build.gradle
   ├── settings.gradle
   └── ...
   ```

3. ✅ **Alt köşede:**
   - "Gradle sync in progress..." yazacak
   - Tamamlandığında "Gradle sync finished" yazacak

---

## ⚠️ ÖNEMLİ: Gradle Sync

**Sync bitene kadar hiçbir şey yapmayın!**

- Sync bitmeden build yapmayın
- Sync bitmeden run'a tıklamayın
- Sync bitmeden dosya düzenlemeyin

**Sync ne zaman biter?**
- Alt köşede "Gradle sync finished" yazacak
- VEYA "Gradle sync failed" yazacak (hata varsa)

---

## 🐛 Sorun mu Var?

### **Android Studio açılmıyor:**
- Android Studio kurulu mu kontrol edin
- Başlat menüsünden açmayı deneyin

### **Proje açılmıyor:**
- Doğru klasörü seçtiğinizden emin olun (`android/` klasörü)
- `settings.gradle` dosyası var mı kontrol edin

### **Gradle sync çok uzun sürüyor:**
- Normal! İlk kez uzun sürebilir (5-10 dakika)
- İnternet bağlantınızı kontrol edin
- Sabırlı olun

---

## ✅ Kontrol

Android Studio açıldığında:

- [ ] Sol panelde `android` projesi görünüyor mu?
- [ ] `app` klasörü görünüyor mu?
- [ ] `build.gradle` dosyası görünüyor mu?
- [ ] Alt köşede sync progress görünüyor mu?

**Hepsi ✅ ise:** Gradle sync'in bitmesini bekleyin!

---

## 🎯 Sonraki Adım

Gradle sync tamamlandığında:
1. **Network Security Config** ekleyin (HTTP için gerekli)
2. **Run** butonuna tıklayın
3. **Emulator** veya **telefon** seçin
4. Test edin!

**Detaylı rehber:** `ANDROID_TEST_ADIMLAR.md`
