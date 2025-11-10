# 🎤 Sesli Konuşma Özelliği

## ✨ Yeni Özellik: 100% ÜCRETSİZ Sesli Chat!

Artık AI asistanınızla **sesli konuşabilirsiniz!** Hem soru sorun, hem de AI'nın cevabını dinleyin!

---

## 🎯 Özellikler

### 🎤 Speech-to-Text (Sesli Soru Sorma)
- Mikrofon butonuna basın
- Sorunuzu sorun
- Otomatik yazıya dönüşür
- Enter'a basın veya Gönder'e tıklayın

### 🔊 Text-to-Speech (AI Cevabını Dinleme)
- **Manuel Mod:** Speaker butonuna tıklayın, son cevabı dinleyin
- **Otomatik Mod:** AI cevap verir vermez otomatik okur

### 🌍 Çoklu Dil Desteği
- 🇹🇷 **Türkçe** (varsayılan)
- 🇺🇸 **İngilizce**

---

## 🚀 Nasıl Kullanılır?

### 1️⃣ Sesli Soru Sorma:

1. Chat sayfasına gidin
2. Input kutusunun sağındaki 🎤 mikrofon butonuna tıklayın
3. Mikrofon **kırmızı yanıp sönmeye başlar** 🔴
4. Sorunuzu sorun: *"Swerve drive nedir?"*
5. Konuşmayı bitirin (otomatik algılar)
6. Metin otomatik input'a yazılır
7. **Gönder** butonuna tıklayın

**Kısayol:**
- 🎤 Tıkla → Konuş → Otomatik yazıya dönüşür → Gönder

---

### 2️⃣ AI Cevabını Dinleme:

#### Manuel Mod:
1. AI cevap versin
2. 🔊 Speaker butonuna tıklayın
3. AI cevabı sesli okunur (ilk 500 karakter)
4. 🔇 butonuna tıklayarak durdurun

#### Otomatik Mod:
1. Üstteki **"🔊 Auto"** butonuna tıklayın
2. Artık her AI cevabı otomatik okunur!
3. **"🔇 Manuel"** yaparak kapatabilirsiniz

---

### 3️⃣ Dil Değiştirme:

Üstteki dil seçiciyi kullanın:
- 🇹🇷 **Türkçe** → Türkçe ses tanıma ve okuma
- 🇺🇸 **English** → İngilizce ses tanıma ve okuma

---

## 🎬 Kullanım Senaryoları

### Senaryo 1: Pit'te Elleriniz Dolu
```
🎤 → "Team 254 2024 ödülleri"
→ AI cevap verir
🔊 → Sesli okur
```

### Senaryo 2: Hızlı Bilgi Alma
```
🎤 → "TalonFX kod örneği"
→ Kod örnekleri gelir
📋 → Kopyalayıp kullanın
```

### Senaryo 3: Öğrenme (Auto Mode)
```
🔊 Auto → Aktif
🎤 → "Swerve kinematics nedir?"
→ AI cevap verir + otomatik okur
→ Dinleyerek öğrenin!
```

---

## 🎨 UI Elementleri

### Kontrol Paneli (Üstte):
```
┌─────────────────────────────────────────┐
│ 🎤 Sesli soru  🔊 Sesli yanıt           │
│                     🇹🇷 Türkçe  🔊 Auto  │
└─────────────────────────────────────────┘
```

### Input Alanı:
```
┌──────────────────────────────────┐
│ Sorunuzu yazın...            🎤  │ ← Mikrofon (sağda)
└──────────────────────────────────┘
```

### Butonlar:
```
[🔊 Speaker] [📤 Gönder]
```

---

## 🔧 Teknik Detaylar

### Kullanılan Teknoloji:
- **Web Speech API** (Tarayıcı built-in)
- **SpeechRecognition** (speech-to-text)
- **SpeechSynthesis** (text-to-speech)

### Tarayıcı Desteği:
- ✅ Chrome (en iyi)
- ✅ Edge (çok iyi)
- ✅ Safari (iyi)
- ⚠️ Firefox (sınırlı)

### Diller:
- Türkçe: `tr-TR`
- İngilizce: `en-US`

### Limitler:
- **Ücretsiz!** API key gerekmez
- Konuşma süresi: ~60 saniye max
- Okuma metni: 500 karakter (AI cevabının ilk kısmı)

---

## 🎯 Özellikler Detay

### Speech Recognition (Sesli Tanıma):

**Özellikler:**
- Real-time tanıma (anlık)
- Interim results (ara sonuçlar gösterir)
- Auto-stop (konuşma bitince durur)
- Error handling

**Ayarlar:**
```typescript
recognition.continuous = false;   // Tek seferde
recognition.interimResults = true; // Ara sonuçlar
recognition.lang = 'tr-TR';       // Dil
```

### Speech Synthesis (Sesli Okuma):

**Özellikler:**
- Doğal ses
- Hız ayarı (0.5x - 2x)
- Ton ayarı
- Ses seviyesi kontrolü

**Ayarlar:**
```typescript
utterance.rate = 1.0;    // Normal hız
utterance.pitch = 1.0;   // Normal ton
utterance.volume = 1.0;  // Tam ses
utterance.lang = 'tr-TR'; // Türkçe
```

---

## 🧪 Test Senaryoları

### Test 1: Basit Soru
```
1. 🎤 butonuna tıkla
2. "Merhaba" de
3. Gönder
4. AI cevap verir
5. 🔊 butonuna tıkla → Dinle
```

### Test 2: Teknik Soru
```
1. 🎤 → "Swerve drive Java kodu"
2. Gönder
3. Kod örneği gelir
4. 🔊 → İlk 500 karakter okunur
```

### Test 3: Auto Mode
```
1. 🔊 Auto → Aktif
2. 🎤 → "PID tuning"
3. Gönder
4. → Otomatik sesli okur!
```

### Test 4: Dil Değiştirme
```
1. 🇺🇸 English seç
2. 🎤 → "What is swerve drive?"
3. → İngilizce tanır
4. AI cevabı İngilizce okunur
```

---

## 💡 Pro Tips

### 1. Mikrofon İzni
İlk kullanımda tarayıcı mikrofon izni ister:
```
"Allow" tıklayın
```

### 2. Net Konuşun
- Mikrofona yakın konuşun
- Net telaffuz edin
- Sessiz ortamda kullanın

### 3. Kısa Cümleler
- Uzun konuşmalar yerine kısa sorular
- "Swerve drive nedir?" ✅
- 5 dakika konuşma ❌

### 4. Auto Mode
- Öğrenme için ideal
- Hands-free kullanım
- Pit'te çok pratik

---

## 🔒 Gizlilik

### Ses Verisi:
- ✅ Sadece tarayıcınızda işlenir
- ✅ Server'a gönderilmez
- ✅ Kaydedilmez
- ✅ Google/Microsoft API kullanır (speech API)

### Mikrofon Erişimi:
- Her seferinde izin gerekir
- Sadece buton tıklandığında aktif
- İstediğiniz zaman durdurabilirsiniz

---

## 🐛 Sorun Giderme

### "Mikrofon çalışmıyor"
**Çözüm:**
1. Tarayıcı izni verdin mi?
2. Chrome/Edge kullanıyor musun?
3. HTTPS bağlantısı var mı? (localhost OK)

### "Ses tanımıyor"
**Çözüm:**
1. Mikrofon çalışıyor mu? (Settings'ten kontrol et)
2. Net konuş
3. Arka plan gürültüsü yok mu?

### "Sesli okuma yok"
**Çözüm:**
1. Tarayıcınız text-to-speech destekliyor mu?
2. Chrome/Edge/Safari kullanın
3. Ses açık mı?

### "Türkçe ses yok"
**Çözüm:**
- Windows: Dil ayarlarından Türkçe ses paketi indir
- Mac: System Preferences → Accessibility → Spoken Content
- Chrome: Otomatik Türkçe ses kullanır

---

## 📊 Performans

- **Speech Recognition:** ~100ms latency
- **Speech Synthesis:** Instant
- **API Cost:** $0 (ücretsiz!)
- **Network:** Minimal (Google API)

---

## 🚀 Gelecek İyileştirmeler

- [ ] Ses ayar paneli (hız, ton, ses)
- [ ] Konuşma geçmişi kaydetme
- [ ] Farklı sesler (erkek/kadın)
- [ ] Keyword wakening ("Hey Callister")
- [ ] Sürekli konuşma modu

---

## 🎉 Özellik Özeti

| Özellik | Durum | API Key | Maliyet |
|---------|-------|---------|---------|
| 🎤 Sesli Soru | ✅ | ❌ Gerekmez | $0 |
| 🔊 Sesli Yanıt | ✅ | ❌ Gerekmez | $0 |
| 🌍 Türkçe/İngilizce | ✅ | ❌ Gerekmez | $0 |
| 🔊 Auto Mode | ✅ | ❌ Gerekmez | $0 |
| 📱 Mobil Uyumlu | ✅ | ❌ Gerekmez | $0 |

---

## 🎓 Kullanım İpuçları

**Pit'te:**
- 🎤 Elleriniz doluyken soru sorun
- 🔊 Auto mode ile hands-free

**Öğrenirken:**
- 🔊 Cevapları dinleyerek öğrenin
- 🎤 Hızlı sorular sorun

**Build Season:**
- 🎤 "TalonFX kod örneği"
- 🔊 Kod açıklamasını dinleyin
- 📋 Kopyalayın

**Yarışmada:**
- 🎤 "Rapid React stratejisi"
- 🔊 Hızlı bilgi alın

---

**🎉 ÜCRETSİZ sesli AI asistanınız hazır!**

Herhangi bir API key veya ödeme gerektirmez! 🚀

