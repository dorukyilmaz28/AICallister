# Model Test Rehberi

Farklı AI modellerini test etmek ve karşılaştırmak için bu rehberi kullanın.

## 🎯 Şu An Aktif Model

**Dengeli Seçenek**: `gpt-3.5-turbo`
- ✅ Hızlı yanıt süresi
- ✅ İyi performans
- ✅ Uygun fiyat
- ✅ Türkçe desteği

## 📋 Test Edilecek Modeller (Sırayla)

### Faz 1: Dengeli Modeller (Şu An)
1. ✅ **gpt-3.5-turbo** (Aktif)
   - Hız: ⚡⚡⚡⚡⚡
   - Kalite: ⭐⭐⭐⭐
   - Fiyat: 💰💰

2. **claude-3-sonnet**
   - Hız: ⚡⚡⚡⚡
   - Kalite: ⭐⭐⭐⭐⭐
   - Fiyat: 💰💰💰
   - Türkçe: Çok iyi

3. **gemini-1.5-flash**
   - Hız: ⚡⚡⚡⚡⚡
   - Kalite: ⭐⭐⭐⭐
   - Fiyat: 💰 (Ücretsiz tier)

### Faz 2: Premium Modeller
4. **gpt-4**
   - Hız: ⚡⚡⚡
   - Kalite: ⭐⭐⭐⭐⭐
   - Fiyat: 💰💰💰💰

5. **claude-3-opus**
   - Hız: ⚡⚡
   - Kalite: ⭐⭐⭐⭐⭐
   - Fiyat: 💰💰💰💰💰

6. **gpt-4o**
   - Hız: ⚡⚡⚡⚡
   - Kalite: ⭐⭐⭐⭐⭐
   - Fiyat: 💰💰💰💰

### Faz 3: Hızlı Modeller
7. **claude-3-haiku**
   - Hız: ⚡⚡⚡⚡⚡
   - Kalite: ⭐⭐⭐
   - Fiyat: 💰

8. **gemini-1.5-pro**
   - Hız: ⚡⚡⚡
   - Kalite: ⭐⭐⭐⭐
   - Fiyat: 💰💰

### Faz 4: Ücretsiz/Açık Kaynak
9. **zhipuai/glm-4**
   - Hız: ⚡⚡⚡
   - Kalite: ⭐⭐⭐
   - Fiyat: 💰 (Ücretsiz)

10. **ollama/llama2** (Local)
    - Hız: ⚡⚡⚡ (yerel hızına bağlı)
    - Kalite: ⭐⭐⭐
    - Fiyat: 💰 (Tamamen ücretsiz)

## 🔄 Model Değiştirme

### Yöntem 1: Environment Variable (Önerilen)

`.env` dosyasında `LITELLM_MODEL` değerini değiştirin:

```env
# Örnek: Claude-3 Sonnet'e geçiş
LITELLM_MODEL="claude-3-sonnet"
```

Sonra uygulamayı yeniden başlatın.

### Yöntem 2: Vercel Environment Variables

1. Vercel Dashboard → Project Settings → Environment Variables
2. `LITELLM_MODEL` değerini güncelleyin
3. Redeploy edin

## 📊 Test Kriterleri

Her modeli test ederken şunları kontrol edin:

1. **Yanıt Hızı**: Ne kadar hızlı cevap veriyor?
2. **Türkçe Kalitesi**: Türkçe sorulara ne kadar iyi cevap veriyor?
3. **FRC Bilgisi**: FRC konularında ne kadar doğru?
4. **Kod Örnekleri**: Kod örnekleri doğru ve kullanışlı mı?
5. **Maliyet**: Kullanım maliyeti ne kadar?

## 📝 Test Senaryoları

Her model için şu soruları test edin:

1. **Basit Soru**: "FRC nedir?"
2. **Teknik Soru**: "WPILib'de motor nasıl kontrol edilir?"
3. **Türkçe Soru**: "FRC takımı nasıl kurulur?"
4. **Kod İsteği**: "Java'da DifferentialDrive örneği ver"
5. **Strateji Sorusu**: "2024 Crescendo oyununda en iyi strateji nedir?"

## 🎯 Önerilen Test Sırası

1. ✅ **gpt-3.5-turbo** (Şu an aktif - Dengeli)
2. **claude-3-sonnet** (Türkçe için en iyi)
3. **gemini-1.5-flash** (Hızlı ve ücretsiz)
4. **gpt-4** (En iyi performans)
5. **claude-3-opus** (Premium seçenek)
6. **zhipuai/glm-4** (Ücretsiz alternatif)

## 💡 Model Önerileri

### En İyi Genel Performans
- **1. Seçenek**: `gpt-4o` (Hızlı + Kaliteli)
- **2. Seçenek**: `claude-3-5-sonnet` (En kaliteli)
- **3. Seçenek**: `gpt-3.5-turbo` (Dengeli)

### En İyi Türkçe
- **1. Seçenek**: `claude-3-5-sonnet`
- **2. Seçenek**: `gpt-4o`
- **3. Seçenek**: `gpt-3.5-turbo`

### En Hızlı
- **1. Seçenek**: `claude-3-haiku`
- **2. Seçenek**: `gemini-1.5-flash`
- **3. Seçenek**: `gpt-3.5-turbo`

### En Ucuz/Ücretsiz
- **1. Seçenek**: `zhipuai/glm-4` (Ücretsiz)
- **2. Seçenek**: `ollama/llama2` (Tamamen ücretsiz, local)
- **3. Seçenek**: `gemini-1.5-flash` (Ücretsiz tier)

## 🔧 Hızlı Model Değiştirme Script

Test için hızlı model değiştirme:

```bash
# .env dosyasını güncelle
echo 'LITELLM_MODEL="claude-3-sonnet"' >> .env

# Veya direkt düzenle
nano .env
```

## 📈 Sonuçları Kaydetme

Her model testinden sonra notlar alın:

- Hız: ⚡⚡⚡⚡⚡ (1-5)
- Kalite: ⭐⭐⭐⭐⭐ (1-5)
- Türkçe: ✅/❌
- Fiyat: 💰💰💰💰💰 (1-5)
- Genel Değerlendirme: ...

## 🎯 Şu An İçin

**Aktif Model**: `gpt-3.5-turbo`
- Dengeli performans
- Hızlı yanıt
- Uygun fiyat
- İyi Türkçe desteği

Sonraki test: `claude-3-sonnet` (Türkçe için en iyi)

