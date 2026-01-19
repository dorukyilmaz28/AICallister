# 📱 Android Studio Kurulum Rehberi

## 🎯 Android Studio Nereye İnecek?

Android Studio resmi sitesinden indirilir ve bilgisayarınıza kurulur.

## 📥 İndirme Adımları

### 1. Android Studio İndirme

**Resmi Site:**
```
https://developer.android.com/studio
```

VEYA direkt indirme linki:
```
https://redirector.gvt1.com/edgedl/android/studio/install/2023.3.1.24/android-studio-2023.3.1.24-windows.exe
```

### 2. Kurulum

**Windows için:**
1. İndirilen `.exe` dosyasını çalıştırın
2. Kurulum sihirbazını takip edin
3. Varsayılan ayarları kabul edin (veya özelleştirin)
4. **Önemli:** Android SDK kurulumunu seçin (varsayılan olarak seçilidir)

**Kurulum Konumu (Varsayılan):**
```
C:\Program Files\Android\Android Studio
```

**SDK Konumu (Varsayılan):**
```
C:\Users\[KullanıcıAdınız]\AppData\Local\Android\Sdk
```

### 3. İlk Açılış

1. Android Studio'yu ilk açtığınızda **Setup Wizard** gelecek
2. **Standard** kurulum seçin (önerilen)
3. SDK'ları indirecek (2-5 GB, biraz zaman alabilir)
4. Kurulum tamamlanana kadar bekleyin

**Gerekli SDK Bileşenleri:**
- ✅ Android SDK Platform 33 veya üzeri
- ✅ Android SDK Build-Tools
- ✅ Android Emulator (test için)
- ✅ Intel x86 Emulator Accelerator (HAXM) veya Hypervisor

## 🔍 Kurulum Kontrolü

Kurulum başarılı mı kontrol edin:

```powershell
# Android Studio yolu
& "C:\Program Files\Android\Android Studio\bin\studio64.exe" --version

# SDK yolu kontrol
$env:ANDROID_HOME
```

VEYA Android Studio'da:
- **File > Settings > Appearance & Behavior > System Settings > Android SDK**
- SDK Location'ı görüntüleyin

## ⚙️ Gerekli Ayarlar

### 1. Environment Variables (Opsiyonel ama Önerilir)

**Windows:**
1. `Win + R` → `sysdm.cpl` → Enter
2. **Advanced** tab → **Environment Variables**
3. **System Variables** bölümüne ekleyin:

```
ANDROID_HOME = C:\Users\[KullanıcıAdınız]\AppData\Local\Android\Sdk
```

**Path** değişkenine ekleyin:
```
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\tools
%ANDROID_HOME%\tools\bin
```

### 2. PowerShell'de Kontrol

```powershell
# Android Studio var mı?
Test-Path "C:\Program Files\Android\Android Studio\bin\studio64.exe"

# SDK var mı?
$sdkPath = "$env:LOCALAPPDATA\Android\Sdk"
Test-Path $sdkPath
```

## 🚀 İlk Projeyi Açma

Android Studio kurulduktan sonra:

### 1. Capacitor Projesini Açma

**Terminal'den:**
```bash
npx cap open android
```

**VEYA Manuel:**
1. Android Studio'yu açın
2. **File > Open**
3. Projenizin `android/` klasörünü seçin
   - Örnek: `C:\Users\utkuy\Desktop\AICallister-main\android`
4. **OK** tıklayın

### 2. Gradle Sync

Android Studio açıldığında:
- Otomatik olarak Gradle sync başlayacak
- İlk kez biraz zaman alabilir (dependencies indirilecek)
- Alt köşede progress bar göreceksiniz
- Tamamlanana kadar bekleyin (5-10 dakika ilk kez)

## 📋 Minimum Gereksinimler

### Sistem Gereksinimleri:
- **RAM:** En az 8GB (16GB önerilir)
- **Disk:** En az 8GB boş alan (SDK'lar dahil)
- **İşletim Sistemi:** Windows 10/11
- **Java:** Android Studio kendi JDK'sını getirir

### Önerilen:
- **RAM:** 16GB+
- **Disk:** SSD (daha hızlı build için)
- **İşlemci:** Modern multi-core CPU

## 🐛 Yaygın Sorunlar

### Problem: "SDK not found"
**Çözüm:**
- Android Studio'da: **File > Settings > Android SDK**
- SDK Location'ı kontrol edin
- SDK Platform ve Build-Tools kurulu mu kontrol edin

### Problem: "Gradle sync failed"
**Çözüm:**
- **File > Invalidate Caches / Restart**
- **Build > Clean Project**
- **File > Sync Project with Gradle Files**

### Problem: Emulator açılmıyor
**Çözüm:**
- **Tools > Device Manager**
- Yeni emulator oluşturun
- Intel HAXM veya Hypervisor kurulu mu kontrol edin

## ✅ Kurulum Checklist

- [ ] Android Studio indirildi
- [ ] Android Studio kuruldu
- [ ] İlk açılışta Setup Wizard tamamlandı
- [ ] SDK Platform 33+ kurulu
- [ ] Android SDK Build-Tools kurulu
- [ ] Android Emulator kurulu
- [ ] Java JDK kurulu (Android Studio ile gelir)
- [ ] İlk proje açıldı (test için)

## 🎯 Sonraki Adım

Android Studio kurulduktan sonra:

1. ✅ Android Studio'yu açın
2. ✅ `npx cap open android` komutunu çalıştırın
3. ✅ Gradle sync'i bekleyin
4. ✅ Run butonuna tıklayın!

**Detaylı test rehberi:** `ANDROID_ADIMLAR.md` dosyasına bakın
