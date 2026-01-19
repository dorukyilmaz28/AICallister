# 📱 Android Test - Özet Adımlar

## 🎯 Kısa Özet

```
1. Android Studio Kur ✅ (Yapılacak)
2. Build & Sync 📦 (npm run android:test)
3. Android Studio'da Aç 🚀
4. Network Config Ekle ⚙️ (HTTP için)
5. Run ▶️ (Test!)
```

---

## 📝 Komutlar

### İlk Kurulum Sonrası:
```bash
npm run android:test
```

### Her Değişiklikten Sonra:
```bash
npm run build:static
npx cap sync
# Android Studio'da Run'a tıklayın
```

---

## ⚙️ Önemli Ayar (İlk Kez)

**Network Security Config:**
1. `android/app/src/main/res/xml/network_security_config.xml` oluştur
2. `android/app/src/main/AndroidManifest.xml` içine ekle:
   ```xml
   android:networkSecurityConfig="@xml/network_security_config"
   ```

---

## ✅ Test Checklist

- [ ] Backend çalışıyor (`http://localhost:3001`)
- [ ] Build yapıldı (`npm run build:static`)
- [ ] Sync yapıldı (`npx cap sync`)
- [ ] Network Config eklendi
- [ ] Run'a tıklandı
- [ ] Uygulama açıldı! 🎉

---

## 🐛 Sorun mu Var?

**Build hatası:** `cd android && ./gradlew clean`
**Network hatası:** Network Security Config eklendi mi?
**API hatası:** Backend çalışıyor mu? IP doğru mu?

---

**Detaylı rehber:** `SONRAKI_ADIMLAR_DETAYLI.md`
