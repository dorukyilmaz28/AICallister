# 🎨 Android Uygulama İkonu - Callister Logo

## 📋 Gereksinimler

Android uygulama ikonu için Callister logosunu (`8f28b76859c1479d839d270409be3586.jpg`) kullanacağız.

**Gerekli Boyutlar:**
- **mdpi**: 48x48 px
- **hdpi**: 72x72 px
- **xhdpi**: 96x96 px
- **xxhdpi**: 144x144 px
- **xxxhdpi**: 192x192 px

**Round Icon (Yuvarlak):**
- Aynı boyutlar, yuvarlak format

---

## 🚀 Yöntem 1: Android Studio Image Asset Studio (Önerilen)

### **Adımlar:**

1. **Android Studio'yu açın**
2. **Projeyi açın** (`android` klasörü)
3. **Sağ tık** → `app` → `New` → `Image Asset`
4. **Icon Type:** `Launcher Icons (Adaptive and Legacy)` seçin
5. **Foreground Layer:**
   - **Source Asset:** `Image` seçin
   - **Path:** `public/8f28b76859c1479d839d270409be3586.jpg` dosyasını seçin
   - **Scaling:** `Center` veya `Crop` (logo'ya göre ayarlayın)
6. **Background Layer:**
   - **Color:** Beyaz veya şeffaf (logo'ya göre)
7. **Legacy Icon:**
   - ✅ **Generate** işaretli olsun
8. **Next** → **Finish**

**✅ Android Studio otomatik olarak tüm boyutları oluşturacak!**

---

## 🚀 Yöntem 2: Online Tool Kullanma

### **Adımlar:**

1. **https://icon.kitchen/** veya **https://www.appicon.co/** sitesine gidin
2. **Logo dosyasını yükleyin:** `public/8f28b76859c1479d839d270409be3586.jpg`
3. **Android** seçin
4. **İndirin** ve zip dosyasını açın
5. **Dosyaları kopyalayın:**
   - `mipmap-mdpi/ic_launcher.png` → `android/app/src/main/res/mipmap-mdpi/`
   - `mipmap-hdpi/ic_launcher.png` → `android/app/src/main/res/mipmap-hdpi/`
   - `mipmap-xhdpi/ic_launcher.png` → `android/app/src/main/res/mipmap-xhdpi/`
   - `mipmap-xxhdpi/ic_launcher.png` → `android/app/src/main/res/mipmap-xxhdpi/`
   - `mipmap-xxxhdpi/ic_launcher.png` → `android/app/src/main/res/mipmap-xxxhdpi/`
   - Aynı şekilde `ic_launcher_round.png` dosyalarını da kopyalayın

---

## 🚀 Yöntem 3: Manuel (Basit Logo İçin)

Eğer logo zaten kare veya yuvarlaksa, basit bir script ile oluşturabiliriz.

**Not:** Bu yöntem için ImageMagick veya benzeri bir tool gerekiyor.

---

## 📋 Kontrol Listesi

Icon'ları değiştirdikten sonra:

- [ ] `mipmap-mdpi/ic_launcher.png` güncellendi
- [ ] `mipmap-hdpi/ic_launcher.png` güncellendi
- [ ] `mipmap-xhdpi/ic_launcher.png` güncellendi
- [ ] `mipmap-xxhdpi/ic_launcher.png` güncellendi
- [ ] `mipmap-xxxhdpi/ic_launcher.png` güncellendi
- [ ] `mipmap-*/ic_launcher_round.png` dosyaları güncellendi
- [ ] `mipmap-anydpi-v26/ic_launcher.xml` kontrol edildi (Android 8.0+)
- [ ] Uygulama rebuild edildi
- [ ] Telefonda test edildi

---

## 🔧 Android Studio'da Rebuild

Icon'ları değiştirdikten sonra:

1. **Build → Clean Project**
2. **Build → Rebuild Project**
3. **Run → Run 'app'**

VEYA

```bash
cd android
.\gradlew.bat clean
.\gradlew.bat assembleDebug
```

---

## ✅ Test

1. Uygulamayı telefona yükleyin
2. Ana ekranda **Callister logosu** görünmeli
3. Uygulama listesinde **Callister logosu** görünmeli

---

## 🎨 İpuçları

- **Adaptive Icon (Android 8.0+):** Logo merkeze hizalı olmalı, kenarlarda boşluk bırakın
- **Round Icon:** Yuvarlak cihazlar için önemli
- **Foreground/Background:** Logo şeffaf değilse, background ekleyin
- **Padding:** Logo kenarlardan biraz içeride olmalı (güvenli alan)

---

## 📞 Yardım

Sorun olursa:
1. Android Studio Image Asset Studio kullanın (en kolay)
2. Online tool kullanın (hızlı)
3. Logo dosyasının formatını kontrol edin (JPG/PNG)

**Kolay gelsin!** 🚀
