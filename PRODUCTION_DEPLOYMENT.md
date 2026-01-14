# 🚀 Production Deployment Kılavuzu

ChromaDB sistemini Vercel ve Chroma Cloud ile production'a çıkarın!

---

## 📋 İçindekiler

1. [Chroma Cloud Setup](#1-chroma-cloud-setup)
2. [Vercel Deployment](#2-vercel-deployment)
3. [Environment Variables](#3-environment-variables)
4. [Database Initialization](#4-database-initialization)
5. [Monitoring](#5-monitoring)
6. [Troubleshooting](#6-troubleshooting)

---

## 1. 🔷 Chroma Cloud Setup

### Neden Chroma Cloud?
- ✅ Managed hosting (bakım yok)
- ✅ Auto-scaling
- ✅ 99.9% uptime
- ✅ Ücretsiz tier (1GB data, 1M queries/month)

### Adımlar:

#### 1.1 Hesap Oluşturma
1. https://www.trychroma.com/ adresine gidin
2. "Sign Up" butonuna tıklayın
3. Email ile kayıt olun

#### 1.2 Cluster Oluşturma
1. Dashboard'da "Create Cluster" tıklayın
2. Cluster adı: `callisterai-production`
3. Region seçin: `US East` (Vercel'e yakın)
4. Plan: `Free Tier` (başlangıç için)
5. "Create" butonuna tıklayın

#### 1.3 API Credentials Alma
1. Cluster detaylarına gidin
2. "API Keys" sekmesine tıklayın
3. "Generate New Key" butonuna tıklayın
4. Key'i kopyalayın ve güvenli yere kaydedin

#### 1.4 Connection URL
Cluster URL'iniz şu formatta olacak:
```
https://<cluster-id>.api.chroma.io
```

---

## 2. ⚡ Vercel Deployment

### 2.1 GitHub Repository Hazırlama

```bash
# Local'de test edin
npm run build

# Git'e push yapın
git add .
git commit -m "Add ChromaDB production setup"
git push origin main
```

### 2.2 Vercel'e Import

1. https://vercel.com/login adresine gidin
2. "Add New" → "Project" tıklayın
3. GitHub repository'nizi seçin
4. "Import" butonuna tıklayın

### 2.3 Build Configuration

Vercel otomatik tespit edecek, ama kontrol edin:

```
Build Command: npm run build
Output Directory: .next
Install Command: npm install
Development Command: npm run dev
```

---

## 3. 🔑 Environment Variables

Vercel Dashboard'da "Settings" → "Environment Variables":

### Gerekli Variables:

```bash
# NextAuth
NEXTAUTH_SECRET="production-secret-key-buraya-random-string-256-bit"
NEXTAUTH_URL="https://your-app.vercel.app"

# OpenRouter (AI Chat)
OPENROUTER_API_KEY="sk-or-v1-xxxxxxxxxxxxx"

# OpenAI (ChromaDB Embeddings)
OPENAI_API_KEY="sk-proj-xxxxxxxxxxxxx"

# Chroma Cloud
CHROMA_URL="https://your-cluster-id.api.chroma.io"
CHROMA_API_KEY="your-chroma-cloud-api-key"

# The Blue Alliance
TBA_API_KEY="your-tba-api-key"

# Database (Vercel Postgres - opsiyonel)
DATABASE_URL="postgresql://..."
```

### NEXTAUTH_SECRET Oluşturma:

```bash
# Terminal'de çalıştırın
openssl rand -base64 32
```

Çıktıyı `NEXTAUTH_SECRET` olarak ekleyin.

### Environment Scope:

Her variable için scope seçin:
- ✅ **Production** (mutlaka)
- ✅ **Preview** (branch preview'lar için)
- ✅ **Development** (local test için)

---

## 4. 🗄️ Database Initialization

### 4.1 Deployment Sonrası

Vercel deploy edildikten sonra:

1. Production URL'inizi açın: `https://your-app.vercel.app`
2. Admin olarak giriş yapın
3. ChromaDB'yi başlatın:

```bash
curl -X POST https://your-app.vercel.app/api/admin/init-chromadb \
  -H "Content-Type: application/json" \
  -H "Cookie: your-auth-cookie"
```

**Veya tarayıcıdan:**
```
https://your-app.vercel.app/api/admin/init-chromadb
```

### 4.2 Otomatik Initialization (Opsiyonel)

`src/lib/chromadb.ts` içine ekleyin:

```typescript
// Production'da ilk çalıştırmada otomatik initialize
if (process.env.NODE_ENV === 'production' && process.env.AUTO_INIT_CHROMADB === 'true') {
  // Auto-init logic
}
```

`.env` ekleyin:
```bash
AUTO_INIT_CHROMADB=true
```

---

## 5. 📊 Monitoring

### 5.1 Vercel Analytics

Vercel dashboard → "Analytics" sekmesi:
- Request count
- Response time
- Error rate
- Bandwidth usage

### 5.2 ChromaDB Stats Endpoint

Production'da monitoring için:

```bash
curl https://your-app.vercel.app/api/admin/chromadb-stats
```

Yanıt:
```json
{
  "status": "ok",
  "statistics": {
    "totalDocuments": 21,
    "avgSearchResponseTime": "245ms"
  },
  "health": {
    "chromadb": "healthy",
    "searchLatency": "good"
  }
}
```

### 5.3 Uptime Monitoring

**Önerilen Araçlar:**
- [UptimeRobot](https://uptimerobot.com/) (ücretsiz)
- [Pingdom](https://www.pingdom.com/)
- [Better Uptime](https://betteruptime.com/)

Endpoint: `https://your-app.vercel.app/api/admin/chromadb-stats`

### 5.4 Error Tracking

**Sentry Integration:**

```bash
npm install @sentry/nextjs
```

`sentry.client.config.js`:
```javascript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV
});
```

---

## 6. 🐛 Troubleshooting

### Issue: ChromaDB Connection Failed

**Semptomlar:**
```
[ChromaDB] Client başlatma hatası
```

**Çözüm:**
1. `CHROMA_URL` doğru mu kontrol edin
2. `CHROMA_API_KEY` geçerli mi kontrol edin
3. Chroma Cloud cluster çalışıyor mu kontrol edin

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://your-cluster.api.chroma.io/api/v1/heartbeat
```

### Issue: Embedding API Rate Limit

**Semptomlar:**
```
OpenAI API rate limit exceeded
```

**Çözüm:**
1. OpenAI dashboard'da rate limit'i kontrol edin
2. Tier upgrade yapın (Tier 1 → Tier 2)
3. Request batching ekleyin

### Issue: Slow Search Performance

**Semptomlar:**
```
avgSearchResponseTime: "2500ms"
```

**Çözüm:**
1. Chroma Cloud plan upgrade yapın
2. Collection index'lerini optimize edin
3. nResults sayısını azaltın (5 → 3)

### Issue: Build Failed on Vercel

**Semptomlar:**
```
Error: Cannot find module 'chromadb'
```

**Çözüm:**
1. `package.json` dependencies kontrol edin
2. `npm install` local'de çalıştırın
3. `package-lock.json` commit edin

---

## 🎯 Production Checklist

Deploy etmeden önce:

### Code:
- [ ] Tüm testler geçiyor
- [ ] Linter errors yok
- [ ] Build başarılı (`npm run build`)
- [ ] Environment variables doğru

### Security:
- [ ] NEXTAUTH_SECRET güçlü ve random
- [ ] API keys güvenli (hardcoded yok)
- [ ] CORS ayarları doğru
- [ ] Rate limiting aktif

### Performance:
- [ ] ChromaDB response time <500ms
- [ ] Image optimization aktif
- [ ] Code splitting çalışıyor
- [ ] Caching stratejisi var

### Monitoring:
- [ ] Uptime monitoring kuruldu
- [ ] Error tracking aktif
- [ ] Analytics çalışıyor
- [ ] Log aggregation var

---

## 📈 Scaling Strategy

### 100 Kullanıcı:
- ✅ Free tier yeterli
- ✅ Basic monitoring

### 1,000 Kullanıcı:
- 🔼 Chroma Cloud Pro plan ($49/month)
- 🔼 Vercel Pro plan ($20/month)
- 🔼 CDN aktif et

### 10,000+ Kullanıcı:
- 🔼 Chroma Cloud Business plan
- 🔼 Vercel Enterprise
- 🔼 Dedicated infrastructure
- 🔼 Load balancing

---

## 💰 Cost Estimation

### Minimal Setup (Başlangıç):
- Vercel: $0 (Hobby plan)
- Chroma Cloud: $0 (Free tier)
- OpenAI Embeddings: ~$5/month (1M tokens)
- **Total: ~$5/month**

### Production Setup (1K users):
- Vercel Pro: $20/month
- Chroma Cloud Pro: $49/month
- OpenAI Embeddings: ~$20/month
- **Total: ~$89/month**

### Enterprise Setup (10K+ users):
- Vercel Enterprise: $400+/month
- Chroma Cloud Business: $499/month
- OpenAI Embeddings: ~$200/month
- **Total: ~$1,099/month**

---

## 🔗 Useful Links

- **Chroma Cloud Docs:** https://docs.trychroma.com/cloud
- **Vercel Docs:** https://vercel.com/docs
- **Next.js Deployment:** https://nextjs.org/docs/deployment
- **OpenAI Rate Limits:** https://platform.openai.com/docs/guides/rate-limits

---

## 📞 Support

### Chroma Cloud:
- Email: support@trychroma.com
- Discord: https://discord.gg/MMeYNTmh3x

### Vercel:
- Support: https://vercel.com/support
- Community: https://github.com/vercel/next.js/discussions

---

## ✅ Post-Deployment

Deploy sonrası yapılacaklar:

1. **Test Edin:**
   ```bash
   # Health check
   curl https://your-app.vercel.app/api/admin/chromadb-stats
   
   # Search test
   # Chat sayfasında sorular sorun
   ```

2. **Monitoring Setup:**
   - Uptime robot ekleyin
   - Error alerts konfigüre edin
   - Performance metrics takip edin

3. **Documentation:**
   - Team'e deployment bilgileri verin
   - Admin credentials güvenli tutun
   - Backup stratejisi oluşturun

4. **Optimize:**
   - İlk hafta metrikleri izleyin
   - Bottleneck'leri tespit edin
   - Performance iyileştirmeleri yapın

---

**🎉 Tebrikler! Production'dasınız!**

Artık ChromaDB destekli AI asistanınız dünya çapında kullanıma hazır! 🚀

