# 📋 Logcat Filtreleme Rehberi

## 🎯 Doğru Logcat Filtresi

Android Studio Logcat'te şu filtreleri kullanın:

### **Yöntem 1: Package Name ile Filtreleme**
```
Package Name: com.callister.frcai
```

### **Yöntem 2: Tag ile Filtreleme**
```
Tag: MainActivity|AndroidRuntime|Capacitor|FATAL|ERROR
```

### **Yöntem 3: Regex Filtreleme**
```
^(.*com\.callister\.frcai.*|.*MainActivity.*|.*AndroidRuntime.*|.*FATAL.*|.*Capacitor.*)$
```

---

## 📱 Uygulamayı Çalıştırmadan Önce

### **1. Logcat'i Temizleyin**
Logcat penceresinin üstündeki **🗑️ Clear** butonuna tıklayın.

### **2. Filtre Uygulayın**
Package name: `com.callister.frcai` seçin veya tag filtresi ekleyin.

### **3. Log Level'i Ayarlayın**
- **Verbose** veya **Debug** seçin (tüm logları görmek için)

---

## 🔍 Uygulamayı Çalıştırırken İzlenecek Loglar

### **✅ Normal Başlatma:**
```
D/Capacitor: Loading Capacitor...
D/Capacitor: Capacitor initialized
D/Capacitor: Loading app at file:///android_asset/public/index.html
D/SystemWebViewEngine: Loading page...
```

### **❌ Hata Varsa Görecekleriniz:**
```
E/AndroidRuntime: FATAL EXCEPTION: main
E/AndroidRuntime: Process: com.callister.frcai, PID: ...
E/AndroidRuntime: java.lang.RuntimeException: ...
```

---

## 📸 Logcat Çıktısını Paylaşma

Uygulamayı çalıştırdığınızda:

1. **Logcat'i temizleyin** (Clear butonu)
2. **Filtreyi uygulayın** (Package: com.callister.frcai)
3. **Uygulamayı çalıştırın** (Run butonu)
4. **İlk 30-50 satır log'u kopyalayın**

**Özellikle şunları arıyorum:**
- `FATAL EXCEPTION` ile başlayan satırlar
- `AndroidRuntime` ile ilgili satırlar
- `MainActivity` ile ilgili satırlar
- `WebView` veya `Capacitor` ile ilgili hatalar

---

## 🐛 Eğer Log Hiç Yoksa

Eğer logcat'te hiç log görünmüyorsa (boş), bu şu anlama gelir:

1. **Uygulama hiç başlatılmıyor** (crash install sırasında)
2. **Yanlış paket adı** filtreleme yapılmış
3. **Logcat ayarları yanlış**

**Çözüm:**
- Filtreyi kaldırın (No Filters)
- Tüm logları gösterin
- Uygulamayı çalıştırdığınızda görünen son 100 satırı paylaşın
