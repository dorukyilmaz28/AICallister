# ✅ Test Adımları - Backend Bağlantısı Başarılı!

## 🎉 Harika! Backend'e Bağlanabiliyorsunuz!

"Status ok" mesajı backend'in çalıştığını ve network bağlantısının olduğunu gösteriyor ✅

---

## 📱 Şimdi Uygulamayı Test Edin

### **ADIM 1: Uygulamayı Açın**

Android Studio'da:
1. **Run** butonuna tıklayın (▶️)
2. Telefonunuzu seçin
3. Uygulama telefonunuzda yüklenecek ve açılacak

---

### **ADIM 2: Sign Up Test Edin**

1. Uygulama açıldığında **Sign up** sayfasına gidin
2. Yeni bir kullanıcı oluşturmayı deneyin:
   - İsim
   - Email
   - Password
   - Team Number (örn: 1234)
3. **Sign up** butonuna tıklayın

**Başarılı olursa:**
- ✅ Kullanıcı oluşturuldu
- ✅ Sign in sayfasına yönlendirileceksiniz

**Hata olursa:**
- ❌ Hata mesajını kontrol edin
- ❌ Android Studio > Logcat'te hataları kontrol edin

---

### **ADIM 3: Sign In Test Edin**

1. **Sign in** sayfasında:
   - Email (az önce oluşturduğunuz email)
   - Password
2. **Sign in** butonuna tıklayın

**Başarılı olursa:**
- ✅ Giriş yapıldı
- ✅ Teams sayfasına yönlendirileceksiniz

**Hata olursa:**
- ❌ "Failed to fetch" hatası alıyorsanız backend URL'ini kontrol edin
- ❌ Logcat'te hataları kontrol edin

---

### **ADIM 4: Diğer Özellikleri Test Edin**

Giriş yaptıktan sonra:
1. **Chat** sayfasını açın - Chat çalışıyor mu?
2. **Teams** sayfasını açın - Takımlar görünüyor mu?
3. **Code Snippets** sayfasını açın - Code snippet'ler görünüyor mu?
4. **Profile** sayfasını açın - Profil bilgileri görünüyor mu?

---

## 🔍 Logcat Kontrolü

Hata olursa Android Studio'da:
1. **View > Tool Windows > Logcat** açın
2. Filter'da **"Error"** seçin
3. Hata mesajlarını kontrol edin

**Yaygın hatalar:**
- `NetworkError` - Backend'e bağlanamıyor
- `401 Unauthorized` - Token geçersiz
- `404 Not Found` - API endpoint bulunamadı
- `CORS error` - CORS hatası (backend'de çözülmüş olmalı)

---

## ✅ Başarı Kontrolü

Tüm testler başarılı olursa:
- ✅ Backend'e bağlanabiliyor
- ✅ Kullanıcı oluşturulabiliyor
- ✅ Giriş yapılabiliyor
- ✅ API çağrıları çalışıyor
- ✅ Uygulama tam olarak çalışıyor! 🎉

---

## 🐛 Sorun mu Var?

### **Problem: "Failed to fetch" hatası hala alıyorum**

**Çözüm 1:** Backend URL'ini kontrol edin
- `.env` dosyasında `NEXT_PUBLIC_API_URL=http://192.168.1.7:3001` olmalı
- IP adresi doğru mu? (`ipconfig | findstr IPv4`)

**Çözüm 2:** Build yenilenmedi
- Build'i yeniden yapın: `npm run build:static && npx cap sync`
- Android Studio'da rebuild yapın

**Çözüm 3:** Backend çalışmıyor
- Backend'i başlatın: `cd backend && npm run dev`
- `http://localhost:3001/health` kontrol edin

### **Problem: Backend'e bağlanamıyorum**

**Çözüm 1:** Telefon ve bilgisayar aynı WiFi'de mi?
- İkisini de aynı WiFi ağına bağlayın

**Çözüm 2:** Firewall engelliyor
- Windows Firewall ayarlarından port 3001'i açın
- Veya firewall'u geçici olarak kapatın (test için)

**Çözüm 3:** IP adresi değişmiş
- IP adresinizi kontrol edin: `ipconfig | findstr IPv4`
- `.env` dosyasını güncelleyin
- Build'i yeniden yapın

---

## 🎯 Test Sonuçları

Test sonuçlarını paylaşın:
- ✅ Başarılı mı?
- ❌ Hata mı var?
- 🔍 Hangi hatalar var?

**Sonuçları paylaşın, birlikte çözelim!**
