# Vercel'de LiteLLM Kullanımı

Vercel serverless ortamında LiteLLM kullanmak için birkaç seçenek var.

## 🎯 Önerilen Yöntem: Ayrı LiteLLM Server

LiteLLM'i ayrı bir sunucuda çalıştırıp, Vercel'den ona bağlanın.

### Seçenek 1: Railway (Önerilen - Kolay)

1. **Railway'de LiteLLM Deploy:**
   - [Railway](https://railway.app) hesabı oluşturun
   - New Project → Deploy from GitHub
   - LiteLLM için bir repo oluşturun veya direkt deploy edin

2. **Railway Environment Variables:**
```env
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
LITELLM_MASTER_KEY=your-master-key
```

3. **Vercel Environment Variables:**
```env
LITELLM_API_URL=https://your-litellm.railway.app
LITELLM_API_KEY=your-master-key
LITELLM_MODEL=gpt-3.5-turbo
```

### Seçenek 2: Render (Ücretsiz Tier)

1. **Render'da LiteLLM Deploy:**
   - [Render](https://render.com) hesabı oluşturun
   - New Web Service
   - Docker image: `ghcr.io/berriai/litellm:main-latest`
   - Port: 4000

2. **Render Environment Variables:**
```env
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

3. **Vercel Environment Variables:**
```env
LITELLM_API_URL=https://your-litellm.onrender.com
LITELLM_API_KEY=your-master-key
LITELLM_MODEL=gpt-3.5-turbo
```

### Seçenek 3: Fly.io (Hızlı)

1. **Fly.io'da LiteLLM Deploy:**
```bash
fly launch --image ghcr.io/berriai/litellm:main-latest
fly secrets set OPENAI_API_KEY=sk-...
fly secrets set ANTHROPIC_API_KEY=sk-ant-...
```

2. **Vercel Environment Variables:**
```env
LITELLM_API_URL=https://your-litellm.fly.dev
LITELLM_API_KEY=your-master-key
LITELLM_MODEL=gpt-3.5-turbo
```

### Seçenek 4: Kendi Sunucunuz (VPS)

1. **Sunucuda LiteLLM Kur:**
```bash
pip install litellm
litellm --model gpt-3.5-turbo --port 4000
```

2. **Nginx Reverse Proxy (Opsiyonel):**
```nginx
server {
    listen 80;
    server_name your-litellm-domain.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

3. **Vercel Environment Variables:**
```env
LITELLM_API_URL=https://your-litellm-domain.com
LITELLM_API_KEY=your-master-key
LITELLM_MODEL=gpt-3.5-turbo
```

## 🔧 Vercel Environment Variables Ayarlama

### Adım 1: Vercel Dashboard'a Gidin
1. [Vercel Dashboard](https://vercel.com/dashboard)
2. Projenizi seçin
3. Settings → Environment Variables

### Adım 2: Environment Variables Ekleyin

**Production, Preview, Development için:**

```env
# LiteLLM Configuration
LITELLM_API_URL=https://your-litellm-instance.com
LITELLM_API_KEY=your-master-key-or-provider-key
LITELLM_MODEL=gpt-3.5-turbo

# Provider API Keys (LiteLLM server'da kullanılacak)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
ZHIPU_API_KEY=...
```

**Not**: Provider API key'leri LiteLLM server'da olmalı, Vercel'de değil (güvenlik için).

### Adım 3: Redeploy

Environment variables ekledikten sonra:
1. Deployments sekmesine gidin
2. Son deployment'ın yanındaki "..." menüsünden "Redeploy" seçin

## 🚀 Hızlı Başlangıç: Railway ile (5 Dakika)

### 1. Railway'de LiteLLM Deploy

**Yöntem A: Railway Template (En Kolay)**

1. [Railway LiteLLM Template](https://railway.app/template/litellm) kullanın
2. GitHub ile bağlayın
3. Environment variables ekleyin:
   - `OPENAI_API_KEY`
   - `ANTHROPIC_API_KEY` (opsiyonel)
   - `LITELLM_MASTER_KEY` (güvenlik için)

**Yöntem B: Manuel Deploy**

1. Railway'de New Project
2. New Service → GitHub Repo
3. Repo: `https://github.com/BerriAI/litellm`
4. Build Command: `pip install litellm`
5. Start Command: `litellm --model gpt-3.5-turbo --port $PORT`

### 2. Railway URL'ini Alın

Railway deployment tamamlandıktan sonra:
- Settings → Networking → Public Domain
- URL'i kopyalayın (örn: `https://your-litellm.up.railway.app`)

### 3. Vercel'de Ayarlayın

Vercel Dashboard → Environment Variables:

```env
LITELLM_API_URL=https://your-litellm.up.railway.app
LITELLM_API_KEY=your-master-key
LITELLM_MODEL=gpt-3.5-turbo
```

### 4. Redeploy

Vercel'de redeploy edin ve test edin!

## 🔒 Güvenlik

### LiteLLM Master Key

LiteLLM server'da master key ayarlayın:

```bash
# Railway/Render/Fly.io environment variable
LITELLM_MASTER_KEY=your-strong-random-key-here
```

Vercel'de de aynı key'i kullanın:
```env
LITELLM_API_KEY=your-strong-random-key-here
```

### API Key Güvenliği

- ✅ Provider API key'leri sadece LiteLLM server'da olmalı
- ✅ Vercel'de sadece LiteLLM URL ve master key olmalı
- ✅ Environment variables'ı asla commit etmeyin

## 🧪 Test

Deployment sonrası test:

1. Vercel deployment'ınızın URL'ine gidin
2. Chat sayfasını açın
3. Bir soru sorun
4. Console'da LiteLLM loglarını kontrol edin

## 📊 Monitoring

### LiteLLM Server Logları

Railway/Render/Fly.io dashboard'larından logları izleyebilirsiniz.

### Vercel Logları

Vercel Dashboard → Deployments → Son deployment → Functions sekmesinden logları görebilirsiniz.

## 💰 Maliyet

### LiteLLM Server Hosting

- **Railway**: $5/ay (Hobby plan) veya ücretsiz tier
- **Render**: Ücretsiz tier (sleep olabilir) veya $7/ay
- **Fly.io**: Ücretsiz tier (3 shared-cpu-1x) veya $1.94/ay
- **VPS**: $5-10/ay (DigitalOcean, Linode, vb.)

### AI Provider Maliyetleri

- **OpenAI GPT-3.5-turbo**: ~$0.0015/1K tokens (çok ucuz)
- **OpenAI GPT-4**: ~$0.03/1K tokens (pahalı)
- **Claude-3-sonnet**: ~$0.003/1K tokens
- **Gemini**: Ücretsiz tier mevcut

## 🎯 Önerilen Setup (Production)

1. **LiteLLM Server**: Railway (kolay, güvenilir)
2. **Model**: `gpt-3.5-turbo` (dengeli, ucuz)
3. **Fallback**: `claude-3-haiku` (hızlı, ucuz)
4. **Monitoring**: Railway logs + Vercel logs

## 🔄 Model Değiştirme (Vercel'de)

Vercel Dashboard → Environment Variables → `LITELLM_MODEL` değerini değiştirin:

```env
# Örnek: Claude-3 Sonnet'e geçiş
LITELLM_MODEL=claude-3-sonnet
```

Sonra redeploy edin.

## ❓ Sorun Giderme

### "Connection refused" Hatası

- LiteLLM server'ın çalıştığından emin olun
- URL'in doğru olduğunu kontrol edin
- Firewall ayarlarını kontrol edin

### "401 Unauthorized" Hatası

- `LITELLM_API_KEY`'in doğru olduğunu kontrol edin
- LiteLLM server'da master key ayarlandığından emin olun

### "Model not found" Hatası

- `LITELLM_MODEL` adının doğru olduğunu kontrol edin
- LiteLLM server'da o modelin yapılandırıldığından emin olun

## 📚 Daha Fazla Bilgi

- [LiteLLM Documentation](https://docs.litellm.ai/)
- [Railway Documentation](https://docs.railway.app/)
- [Render Documentation](https://render.com/docs)
- [Fly.io Documentation](https://fly.io/docs/)

