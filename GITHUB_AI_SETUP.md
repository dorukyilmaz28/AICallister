# GitHub AI Model Inference Setup

GitHub'ın kendi AI model inference servisini kullanarak ücretsiz veya düşük maliyetli AI erişimi sağlayabilirsiniz.

## 🎯 GitHub AI Avantajları

- ✅ **Ücretsiz Tier**: Rate limit'lerle ücretsiz kullanım
- ✅ **Düşük Maliyet**: Paid usage'da token başına düşük fiyat
- ✅ **Kolay Kurulum**: Sadece GitHub token gerekiyor
- ✅ **Azure Entegrasyonu**: Azure Metered Billing desteği
- ✅ **Çoklu Model**: GPT-5-mini, GPT-4o-mini ve daha fazlası

## 🔑 GitHub Token Oluşturma

### 1. GitHub Token Oluşturun

1. [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens)
2. **"Generate new token"** → **"Generate new token (classic)"**
3. Token adı: `CallisterAI`
4. Expiration: İstediğiniz süre (veya no expiration)
5. Scopes: En azından `read:packages` (veya `repo` scope)
6. **"Generate token"** butonuna tıklayın
7. Token'ı kopyalayın (bir daha gösterilmeyecek!)

### 2. Fine-Grained Token (Önerilen)

1. [GitHub Settings → Developer settings → Personal access tokens → Fine-grained tokens](https://github.com/settings/tokens?type=beta)
2. **"Generate new token"**
3. Token name: `CallisterAI`
4. Expiration: İstediğiniz süre
5. Repository access: **"All repositories"** veya belirli repo
6. Permissions → **"Read access to packages"**
7. **"Generate token"**

## 🔧 Environment Variables

### Local Development

**PowerShell:**
```powershell
$Env:GITHUB_TOKEN="your-github-token-here"
$Env:GITHUB_MODEL="openai/gpt-5-mini"
```

**Bash:**
```bash
export GITHUB_TOKEN="your-github-token-here"
export GITHUB_MODEL="openai/gpt-5-mini"
```

**Windows CMD:**
```cmd
set GITHUB_TOKEN=your-github-token-here
set GITHUB_MODEL=openai/gpt-5-mini
```

**Veya `.env` dosyası:**
```env
GITHUB_TOKEN=your-github-token-here
GITHUB_MODEL=openai/gpt-5-mini
```

### Vercel Production

1. Vercel Dashboard → Project Settings → Environment Variables
2. Aşağıdaki değişkenleri ekleyin:

```env
GITHUB_TOKEN=your-github-token-here
GITHUB_MODEL=openai/gpt-5-mini
```

3. **Redeploy** edin

## 📋 Mevcut Modeller

GitHub AI şu modelleri destekler:

- `openai/gpt-5-mini` - En yeni, hızlı ve ucuz
- `openai/gpt-4o-mini` - GPT-4o'nun mini versiyonu
- `openai/gpt-4o` - En iyi performans
- Ve daha fazlası...

Güncel liste için: [GitHub Models](https://github.com/models)

## 💰 Fiyatlandırma

### Ücretsiz Tier

- Rate limit'lerle sınırlı
- Günlük/haftalık limitler
- Test ve küçük projeler için yeterli

### Paid Usage

- Token başına düşük maliyet
- Rate limit yok
- Production için uygun

**Billing Setup:**
1. [GitHub Settings → Billing](https://github.com/settings/billing)
2. Azure Metered Billing ekleyin (BYOK)
3. Veya GitHub'ın kendi billing sistemini kullanın

## 🚀 Kullanım

### Otomatik Seçim

Kod otomatik olarak şu sırayı takip eder:

1. **GitHub AI** (eğer `GITHUB_TOKEN` varsa) ✅ Öncelikli
2. **LiteLLM** (eğer GitHub token yoksa, fallback)

### Model Değiştirme

`.env` dosyasında veya Vercel environment variables'da:

```env
# GitHub AI model değiştirme
GITHUB_MODEL="openai/gpt-4o-mini"

# Veya GitHub AI'yi devre dışı bırakıp LiteLLM kullan
# GITHUB_TOKEN=""  # Boş bırakın
LITELLM_MODEL="gpt-3.5-turbo"
```

## 🔒 Güvenlik

### Token Güvenliği

- ✅ Token'ı asla commit etmeyin
- ✅ `.env` dosyasını `.gitignore`'a ekleyin
- ✅ Vercel'de environment variables kullanın
- ✅ Token'ı düzenli olarak rotate edin

### Token Permissions

- Minimum: `read:packages`
- Güvenlik için fine-grained token kullanın
- Sadece gerekli repository'lere erişim verin

## 🧪 Test

### Local Test

```bash
# .env dosyasına token ekleyin
echo 'GITHUB_TOKEN=your-token' >> .env
echo 'GITHUB_MODEL=openai/gpt-5-mini' >> .env

# Uygulamayı başlatın
npm run dev

# Chat sayfasına gidin ve test edin
```

### Production Test

1. Vercel'de environment variables ekleyin
2. Redeploy edin
3. Chat sayfasını test edin
4. Console loglarını kontrol edin

## 📊 Monitoring

### Rate Limits

GitHub AI rate limit'lerini kontrol etmek için:

- API response headers'da rate limit bilgisi var
- Console loglarında görünecek
- Rate limit aşılırsa 429 hatası alırsınız

### Usage Tracking

- GitHub Settings → Billing → Usage
- Azure Metered Billing dashboard (eğer kullanıyorsanız)

## ❓ Sorun Giderme

### "401 Unauthorized" Hatası

- Token'ın geçerli olduğunu kontrol edin
- Token'ın doğru scope'lara sahip olduğunu kontrol edin
- Token'ın expire olmadığını kontrol edin

### "429 Rate Limit" Hatası

- Ücretsiz tier limit'ine ulaştınız
- Birkaç dakika bekleyin
- Veya paid usage'a geçin

### "Model not found" Hatası

- `GITHUB_MODEL` adının doğru olduğunu kontrol edin
- Güncel model listesini kontrol edin: https://github.com/models

## 🔄 GitHub AI'dan LiteLLM'e Geçiş

GitHub AI'yı devre dışı bırakıp LiteLLM kullanmak için:

```env
# GitHub AI'yı devre dışı bırak
# GITHUB_TOKEN=""  # Boş bırakın veya silin

# LiteLLM kullan
LITELLM_API_URL="https://your-litellm-instance.com"
LITELLM_API_KEY="your-key"
LITELLM_MODEL="gpt-3.5-turbo"
```

## 📚 Daha Fazla Bilgi

- [GitHub AI Documentation](https://docs.github.com/en/copilot/github-ai-model-inference)
- [GitHub Models](https://github.com/models)
- [GitHub Token Creation](https://github.com/settings/tokens)
- [Azure Metered Billing](https://docs.github.com/en/copilot/github-ai-model-inference/using-azure-metered-billing)

## 🎯 Önerilen Setup

**Development:**
- GitHub AI (ücretsiz tier yeterli)

**Production:**
- GitHub AI (paid usage) - En kolay ve uygun fiyatlı
- Veya LiteLLM (daha fazla model seçeneği)





