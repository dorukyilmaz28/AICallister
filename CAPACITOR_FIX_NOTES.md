# ⚠️ Capacitor ProGuard Hatası - Geçici Çözüm

## Sorun

Capacitor 8.0.1 sürümü hala eski ProGuard dosyasını kullanıyor:
- `proguard-android.txt` (artık desteklenmiyor)
- `proguard-android-optimize.txt` (yeni, destekleniyor)

## Geçici Çözüm

`node_modules/@capacitor/android/capacitor/build.gradle` dosyasında:
```gradle
proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
```
olarak güncellendi.

## ⚠️ ÖNEMLİ

**Bu geçici bir çözümdür!** `npm install` yapıldığında bu değişiklik kaybolacak.

## Kalıcı Çözüm (İleride)

1. **Capacitor'ı güncelleyin:**
   ```bash
   npm install @capacitor/android@latest @capacitor/cli@latest @capacitor/core@latest
   ```

2. **VEYA** Capacitor yeni sürümde düzeltirse, otomatik olarak gelecek.

## Şu An İçin

- ✅ Dosya düzeltildi
- ✅ Build çalışacak
- ⚠️ `npm install` yapmayın (değişiklik kaybolur)
- ⚠️ İleride Capacitor'ı güncelleyin

## Android Studio'da

1. **Gradle sync** yapın (üstteki sync butonu)
2. Sync tamamlandıktan sonra **Run** butonuna tıklayın
