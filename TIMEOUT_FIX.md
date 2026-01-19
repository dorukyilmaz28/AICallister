# ⏱️ Request Timeout Sorunu Düzeltildi

## 🐛 Sorun
Giriş yaparken "Request timeout" hatası alınıyordu.

## ✅ Yapılan Düzeltmeler

### 1. **Timeout Süresi Artırıldı**
- **Önceki:** 30 saniye
- **Yeni:** 60 saniye
- Yavaş internet bağlantıları için daha uygun

### 2. **Daha İyi Hata Mesajları**
- Network hataları için açıklayıcı mesajlar
- Timeout hataları için kullanıcı dostu mesajlar
- İnternet bağlantısı kontrolü önerisi

### 3. **Error Handling İyileştirildi**
- CapacitorHttp hataları daha iyi yakalanıyor
- Network hataları için özel mesajlar
- ECONNREFUSED gibi hatalar için açıklayıcı mesajlar

---

## 🔍 Olası Nedenler

### **1. İnternet Bağlantısı**
- WiFi veya mobil veri yavaş olabilir
- Bağlantı kesilmiş olabilir

### **2. Backend Çalışmıyor**
- `https://callisterai.com/api/auth/login` endpoint'i çalışmıyor olabilir
- Backend sunucusu down olabilir

### **3. API URL Yanlış**
- Android'de API URL'si yanlış olabilir
- Console log'larında kontrol edin

---

## 🚀 Şimdi Yapmanız Gerekenler

### **1. Yeni APK Oluşturun:**
```bash
cd android
.\gradlew.bat assembleDebug
```

### **2. Telefona Yükleyin:**
- Eski uygulamayı kaldırın
- Yeni APK'yı yükleyin

### **3. Test Edin:**
- Giriş yapmayı deneyin
- Chrome DevTools'da console log'larını kontrol edin

---

## 🔍 Debug İçin

### **Chrome DevTools:**
1. USB ile telefonu bağlayın
2. Chrome'da `chrome://inspect` açın
3. Uygulamanızı seçin → **Inspect**
4. **Console** sekmesinde şunları göreceksiniz:
   ```
   [API] Capacitor detected, using URL: https://callisterai.com
   [API] Making request to: https://callisterai.com/api/auth/login
   [API] Request Error: ...
   ```

### **Kontrol Edilecekler:**
1. **API URL doğru mu?**
   - Console'da `[API] Making request to:` satırını kontrol edin
   - URL `https://callisterai.com/api/auth/login` olmalı

2. **Backend çalışıyor mu?**
   - Tarayıcıda `https://callisterai.com/api/auth/login` adresini açın
   - VEYA Postman ile test edin

3. **İnternet bağlantısı var mı?**
   - Telefonda başka uygulamalar çalışıyor mu?
   - WiFi/mobil veri açık mı?

---

## 📋 Beklenen Davranış

**Başarılı Giriş:**
1. "Giriş yapılıyor" yazısı görünür
2. API isteği `https://callisterai.com/api/auth/login` adresine gider
3. 60 saniye içinde yanıt gelir
4. Token kaydedilir
5. `/teams` sayfasına yönlendirilir

**Timeout Hatası:**
1. "Giriş yapılıyor" yazısı görünür
2. 60 saniye sonra timeout olur
3. Hata mesajı gösterilir: "İstek zaman aşımına uğradı. Lütfen tekrar deneyin."
4. Form tekrar kullanılabilir olur

**Network Hatası:**
1. Hata mesajı gösterilir: "İnternet bağlantısı hatası. Lütfen bağlantınızı kontrol edin ve tekrar deneyin."

---

## 🔧 Ek Kontroller

### **Backend Kontrolü:**
```bash
# Backend çalışıyor mu?
curl https://callisterai.com/api/auth/login

# VEYA tarayıcıda açın:
https://callisterai.com/api/auth/login
```

### **API URL Kontrolü:**
Chrome DevTools Console'da:
```javascript
// API URL'yi kontrol edin
console.log('[API] Base URL:', getApiBaseUrl());
```

---

## 📞 Hala Sorun mu Var?

Eğer hala timeout hatası alıyorsanız:

1. **Chrome DevTools Console** çıktısını paylaşın
2. **Network** sekmesindeki API isteği detaylarını paylaşın
3. **Backend çalışıyor mu?** kontrol edin
4. **İnternet bağlantısı** hızını kontrol edin

**Birlikte çözelim!** 🚀
