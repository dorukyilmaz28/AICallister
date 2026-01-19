# 📱 Telefonda Test Etme Rehberi

## 🎯 Telefon Hazırlama

### **ADIM 1: Developer Options Açın**

1. Telefonunuzda **Settings** (Ayarlar) açın
2. **About Phone** (Telefon Hakkında) > **Software Information** (Yazılım Bilgisi) bölümüne gidin
3. **Build Number** (Yapı Numarası) bulun
4. **Build Number'a 7 kez** arka arkaya tıklayın
5. "You are now a developer!" mesajını göreceksiniz ✅

---

### **ADIM 2: USB Debugging Açın**

1. **Settings** (Ayarlar) açın
2. **Developer Options** (Geliştirici Seçenekleri) bölümüne gidin
   - Eğer görmüyorsanız: Settings > System > Developer Options
   - VEYA Settings > About Phone > Developer Options (bazı telefonlarda)
3. **USB Debugging** (USB Hata Ayıklama) seçeneğini **açın** (ON)
4. İzin isteyecek: **"Allow USB Debugging?"** → **OK/Allow** tıklayın

---

### **ADIM 3: Telefonu Bilgisayara Bağlayın**

1. USB kablosunu kullanarak telefonunuzu bilgisayara bağlayın
2. Telefonunuzda bir popup çıkacak:
   - **"Allow USB Debugging?"**
   - **"Always allow from this computer"** kutusunu işaretleyin (opsiyonel ama önerilir)
   - **OK/Allow** tıklayın

---

### **ADIM 4: Android Studio'da Telefonunuzu Seçin**

1. Android Studio'da üstteki **device dropdown**'ına bakın
   - Şu anda muhtemelen "No devices" veya emulator seçeneği görüyorsunuz
2. Telefon bağlandığında telefonunuzun model adı görünecek
3. Telefonunuzu seçin

**Kontrol:**
- Alt köşede "Connected device" göreceksiniz
- VEYA `adb devices` komutuyla kontrol edebilirsiniz

---

### **ADIM 5: Run Butonuna Tıklayın**

1. Android Studio'da üstteki **Run** butonuna tıklayın (▶️)
   - VEYA `Shift+F10`
2. Telefonunuzu seçin (dropdown'dan)
3. **OK** tıklayın
4. Build başlayacak ve uygulama telefonunuzda yüklenecek! 🎉

---

## ⚠️ ÖNEMLİ: Network Ayarları

### **Local Network (HTTP Backend)**

Telefonunuz ve bilgisayarınız **aynı WiFi ağında** olmalı!

1. **Bilgisayarınızın IP adresini öğrenin:**
   - Windows: `ipconfig` komutunu çalıştırın
   - "IPv4 Address" satırını bulun (örn: 192.168.1.7)

2. **Backend URL'ini güncelleyin:**
   - `.env` dosyasında:
   ```env
   NEXT_PUBLIC_API_URL=http://192.168.1.7:3001
   ```
   - Bu IP adresi bilgisayarınızın IP'si olmalı

3. **Backend'i başlatın:**
   ```bash
   cd backend
   npm run dev
   ```

4. **Build yapın:**
   ```bash
   npm run build:static
   npx cap sync
   ```

5. Android Studio'da **Run** butonuna tıklayın

---

## 🔍 Kontrol

### **Telefon Bağlı mı?**

Android Studio'da terminal açın ve şu komutu çalıştırın:
```bash
adb devices
```

Çıktı şöyle olmalı:
```
List of devices attached
XXXXXXXX    device
```

"device" yazıyorsa telefon bağlı ✅

"unauthorized" yazıyorsa telefonunuzdaki izin popup'ını onaylayın.

---

## 🐛 Sorun Giderme

### **Problem: Telefon görünmüyor**

**Çözüm 1:** USB Debugging açık mı kontrol edin
- Settings > Developer Options > USB Debugging ✓

**Çözüm 2:** USB kablosunu değiştirin
- Veri aktarımı yapan kablo olmalı (sadece şarj kablosu değil)

**Çözüm 3:** USB modunu kontrol edin
- Bildirim panelinde "USB" bildirimi olmalı
- "File Transfer" veya "MTP" modunda olmalı

**Çözüm 4:** ADB driver kurulumu (gerekirse)
- Bazı telefonlarda (Samsung, Xiaomi vb.) özel driver gerekebilir

### **Problem: API çağrıları çalışmıyor**

**Çözüm 1:** Aynı WiFi ağında mı?
- Telefon ve bilgisayar aynı WiFi'ye bağlı olmalı

**Çözüm 2:** Backend çalışıyor mu?
- `http://localhost:3001/health` kontrol edin
- Backend'i bilgisayarınızda başlatın

**Çözüm 3:** IP adresi doğru mu?
- `.env` dosyasındaki IP adresi bilgisayarınızın IP'si mi?
- `ipconfig` ile kontrol edin

**Çözüm 4:** Firewall
- Windows Firewall backend port'unu (3001) engelliyor olabilir
- Firewall ayarlarından izin verin

### **Problem: Uygulama yüklenmiyor**

**Çözüm 1:** Bilinmeyen kaynaklar
- Settings > Security > Unknown Sources (Bilinmeyen Kaynaklar) açın

**Çözüm 2:** USB Debugging izni
- Telefonunuzdaki izin popup'ını onaylayın

---

## ✅ Checklist

### Telefon Hazırlama:
- [ ] Developer Options açıldı (Build Number'a 7 kez tıklandı)
- [ ] USB Debugging açık
- [ ] Telefon USB ile bağlandı
- [ ] İzin popup'ı onaylandı
- [ ] Android Studio'da telefon görünüyor

### Backend ve Network:
- [ ] Backend çalışıyor (`http://localhost:3001`)
- [ ] `.env` dosyasında doğru IP adresi var
- [ ] Telefon ve bilgisayar aynı WiFi'de
- [ ] Build yapıldı (`npm run build:static`)
- [ ] Capacitor sync yapıldı (`npx cap sync`)

### Test:
- [ ] Run butonuna tıklandı
- [ ] Telefon seçildi
- [ ] Uygulama yüklendi
- [ ] Uygulama açıldı
- [ ] Test edildi

---

## 🎯 Hızlı Komutlar

**IP adresini öğrenmek için:**
```bash
ipconfig | findstr IPv4
```

**Telefon bağlı mı kontrol:**
```bash
adb devices
```

**Backend'i başlat:**
```bash
cd backend
npm run dev
```

---

## 💡 İpuçları

1. **İlk bağlantı:** Telefonunuzda izin popup'ını onaylayın ve "Always allow" işaretleyin
2. **WiFi:** Telefon ve bilgisayar aynı WiFi ağında olmalı (local network için)
3. **Backend:** Test sırasında backend'in çalışıyor olması gerekir
4. **Hot Reload:** Capacitor'da hot reload yok, her değişiklikten sonra build yapmanız gerekir

---

## 🎉 Başarı!

Tüm adımlar tamamlandığında:
- ✅ Uygulama telefonunuzda yüklenecek
- ✅ Backend'e bağlanabilecek
- ✅ Tüm özellikleri test edebileceksiniz

**Test ederken sorun olursa haber verin!**
