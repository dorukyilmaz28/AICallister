# 🚀 Google Play'e Yükleme - Basit Adımlar

## ADIM 1: Keystore Oluştur (İLK KEZ - SADECE BİR KEZ)

### Windows'ta:
1. Terminal/PowerShell'i açın
2. Şu komutu çalıştırın:

```bash
cd android/app
keytool -genkey -v -keystore callister-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias callister-key
```

3. Size sorular soracak:
   - **Şifre (store password):** Güçlü bir şifre girin (ÖRNEK: Callister2024!Secure)
   - **Şifre tekrar:** Aynı şifreyi tekrar girin
   - **Adınız:** İsim girin (ÖRNEK: Callister Team)
   - **Organizasyon:** Organizasyon adı (ÖRNEK: Callister AI)
   - **Şehir:** Şehir adı
   - **Ülke:** TR (Türkiye için)

4. **Key password:** Store password ile aynı olabilir (Enter'a basın)

✅ Keystore oluşturuldu!

---

## ADIM 2: keystore.properties Dosyası Oluştur

1. `android` klasöründe `keystore.properties` adında yeni bir dosya oluşturun
2. İçine şunu yazın (şifrelerinizi değiştirin):

```properties
storePassword=Callister2024!Secure
keyPassword=Callister2024!Secure
keyAlias=callister-key
storeFile=../app/callister-release-key.jks
```

**ÖNEMLİ:** Şifreleri kendi şifrelerinizle değiştirin!

---

## ADIM 3: Release Build Yap

Terminal'de şu komutu çalıştırın:

```bash
cd android
gradlew bundleRelease
```

Bu işlem 5-10 dakika sürebilir.

✅ Build tamamlandığında AAB dosyası hazır olacak:
`android/app/build/outputs/bundle/release/app-release.aab`

---

## ADIM 4: Google Play Console'a Yükle

1. [Google Play Console](https://play.google.com/console) sitesine gidin
2. Giriş yapın (Google hesabınızla)
3. **İlk kez ise:** $25 kayıt ücreti ödemeniz gerekir
4. "Create app" (Uygulama Oluştur) butonuna tıklayın
5. Uygulama bilgilerini doldurun:
   - **App name:** Callister AI
   - **Default language:** Turkish (Türkçe)
   - **App or game:** App
   - **Free or paid:** Free
6. "Create app" butonuna tıklayın
7. Sol menüden "Production" veya "Internal testing" seçin
8. "Create new release" butonuna tıklayın
9. "Upload" butonuna tıklayın ve `app-release.aab` dosyasını seçin
10. Release notes ekleyin (ÖRNEK: "İlk sürüm yayınlandı")
11. "Save" butonuna tıklayın
12. "Review release" butonuna tıklayın
13. Gerekli bilgileri doldurun (ekran görüntüleri, açıklama, vb.)
14. "Start rollout to Production" butonuna tıklayın

✅ Uygulama incelemeye gönderildi! (1-3 gün sürebilir)

---

## 📝 Özet - Ne Yapmalısınız?

1. ✅ **Keystore oluştur** (ADIM 1) - ŞİMDİ YAP
2. ✅ **keystore.properties dosyası oluştur** (ADIM 2) - ŞİMDİ YAP
3. ✅ **Build yap** (ADIM 3) - Sonra yap
4. ✅ **Google Play Console'a yükle** (ADIM 4) - En son yap

---

## ⚠️ ÖNEMLİ UYARILAR

- 🔒 **Keystore şifrelerini kaydetmeyin!** (Güvenli bir yerde saklayın)
- 💾 **Keystore dosyasını yedekleyin!** (`callister-release-key.jks`)
- 🚫 **Keystore dosyasını GitHub'a yüklemeyin!** (Zaten .gitignore'da)

---

## 🆘 Sorun mu var?

- Build hatası alıyorsanız: `npm run cap:sync` çalıştırın
- Keystore hatası: Şifreleri kontrol edin
- Google Play hatası: AAB dosyasının doğru olduğundan emin olun
