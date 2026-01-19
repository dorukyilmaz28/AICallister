# 🎨 Android İkonu Hızlı Kurulum

## ⚡ En Kolay Yöntem: Android Studio Image Asset Studio

### **Adımlar (2 dakika):**

1. **Android Studio'yu açın**
2. **Proje yapısında:**
   - `app` klasörüne **sağ tık**
   - `New` → `Image Asset` tıklayın

3. **Image Asset Studio penceresi:**
   - **Icon Type:** `Launcher Icons (Adaptive and Legacy)` ✅
   
4. **Foreground Layer:**
   - **Source Asset:** `Image` seçin
   - **Path:** `public/8f28b76859c1479d839d270409be3586.jpg` dosyasını seçin
   - **Scaling:** `Center` veya `Crop` (logo'ya göre)
   - **Shape:** `None` (logo'nun kendi şeklini korur)

5. **Background Layer:**
   - **Color:** Beyaz (#FFFFFF) veya şeffaf
   - VEYA logo'ya uygun bir renk seçin

6. **Legacy Icon:**
   - ✅ **Generate legacy icon** işaretli olsun

7. **Preview:**
   - Sağ tarafta önizleme görünür
   - İstediğiniz gibi görünüyorsa devam edin

8. **Next** → **Finish**

**✅ Bitti! Android Studio otomatik olarak:**
- Tüm boyutları oluşturdu (mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi)
- Round icon'ları oluşturdu
- Adaptive icon'ları güncelledi

---

## 🔄 Sonraki Adımlar

1. **Build → Clean Project**
2. **Build → Rebuild Project**
3. **Run → Run 'app'**

VEYA Terminal'de:
```bash
cd android
.\gradlew.bat clean assembleDebug
```

---

## ✅ Test

1. Uygulamayı telefona yükleyin
2. Ana ekranda **Callister logosu** görünmeli! 🎉

---

## 🎨 İpuçları

- **Logo merkeze hizalı olmalı** (kenarlarda boşluk bırakın)
- **Background rengi** logo'ya uygun seçin
- **Preview'da** nasıl göründüğünü kontrol edin

**Kolay gelsin!** 🚀
