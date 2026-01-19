# 📱 Android Studio'yu Açma

## Manuel Açma (Önerilen)

### **Yöntem 1: Android Studio'dan Açma**

1. **Android Studio'yu açın** (masaüstünden veya başlat menüsünden)
2. **"Open"** veya **"Open an Existing Project"** seçin
3. Şu klasörü seçin:
   ```
   C:\Users\utkuy\Desktop\AICallister-main\android
   ```
4. **OK** tıklayın

### **Yöntem 2: Windows Explorer'dan**

1. Windows Explorer'ı açın
2. Şu klasöre gidin:
   ```
   C:\Users\utkuy\Desktop\AICallister-main\android
   ```
3. Klasöre **sağ tıklayın**
4. **"Open Folder as Android Studio Project"** seçin (eğer görünüyorsa)
   - VEYA Android Studio'yu açıp "Open" seçin

### **Yöntem 3: Komut Satırından**

Android Studio'nun yolu doğru mu kontrol edelim ve açalım.

---

## 📋 Android Studio Açıldığında Ne Göreceksiniz

1. **Gradle Sync başlayacak** (ilk kez 5-10 dakika sürebilir)
2. Sol panelde proje dosyalarını göreceksiniz
3. Alt köşede progress bar göreceksiniz
4. Sync tamamlandığında **"Gradle sync finished"** mesajı çıkacak

---

## ⚠️ Önemli: Gradle Sync

Android Studio açıldığında:
- **Otomatik Gradle sync başlar**
- İlk kez uzun sürebilir (dependencies indiriliyor)
- **Sabırlı olun ve bekleyin**
- Sync bitmeden hiçbir şey yapmayın

---

## 🔍 Kontrol

Android Studio açıldığında sol panelde şunları görmelisiniz:
```
android/
├── app/
├── build.gradle
├── settings.gradle
└── ...
```

**Görmüyorsanız:**
- Doğru klasörü açtığınızdan emin olun (`android/` klasörü)
- Android Studio'nun tamamen açılmasını bekleyin
