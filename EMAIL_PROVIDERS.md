# Email Doğrulama Servisi Alternatifleri

## 1. Resend (Şu anda kullanılan - Önerilen)
**Paket:** `npm install resend`

**Kurulum:**
```env
RESEND_API_KEY="re_your-api-key"
RESEND_FROM_EMAIL="CallisterAI <noreply@yourdomain.com>"
```

**Avantajlar:**
- Modern ve developer-friendly
- Next.js ile mükemmel uyum
- Free tier: 100 email/gün
- Domain verify gerekiyor (güvenli)

**Kullanım:** `src/lib/email.ts` dosyasında zaten kurulu

---

## 2. Nodemailer + Gmail SMTP (Ücretsiz ve Hızlı)
**Paket:** `npm install nodemailer @types/nodemailer`

**Kurulum:**

1. Gmail'de App Password oluştur:
   - Google Account → Security → 2-Step Verification → App Passwords
   - "Mail" ve "Other" seçip bir ad ver
   - Oluşan 16 haneli şifreyi kopyala

2. `.env` dosyasına ekle:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-digit-app-password
SMTP_FROM="CallisterAI <your-email@gmail.com>"
```

3. `src/lib/email.ts` dosyasını `src/lib/email-nodemailer.ts` ile değiştir

**Avantajlar:**
- Tamamen ücretsiz (Gmail hesabı ile)
- Hızlı kurulum
- Herhangi bir SMTP sunucusu kullanabilir

**Dezavantajlar:**
- Günlük limit: ~500 email (Gmail)
- Spam klasörüne düşme riski
- Gmail App Password gerekiyor

---

## 3. SendGrid
**Paket:** `npm install @sendgrid/mail`

**Kurulum:**
```env
SENDGRID_API_KEY="SG.your-api-key"
SENDGRID_FROM_EMAIL="noreply@yourdomain.com"
```

**Kod:**
```typescript
import sgMail from '@sendgrid/mail';
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

const msg = {
  to: email,
  from: process.env.SENDGRID_FROM_EMAIL!,
  subject: 'CallisterAI - Email Doğrulama',
  html: `...`,
};

await sgMail.send(msg);
```

**Avantajlar:**
- Güçlü ve yaygın kullanılan
- Free tier: 100 email/gün
- İyi analytics

---

## 4. Brevo (Sendinblue)
**Paket:** `npm install @getbrevo/brevo`

**Kurulum:**
```env
BREVO_API_KEY="your-api-key"
BREVO_FROM_EMAIL="noreply@yourdomain.com"
```

**Kod:**
```typescript
import * as brevo from '@getbrevo/brevo';

const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY!);

await apiInstance.sendTransacEmail({
  to: [{ email }],
  sender: { email: process.env.BREVO_FROM_EMAIL! },
  subject: 'CallisterAI - Email Doğrulama',
  htmlContent: `...`,
});
```

**Avantajlar:**
- Free tier: 300 email/gün
- Transactional + Marketing email
- SMTP desteği de var

---

## 5. AWS SES
**Paket:** `npm install @aws-sdk/client-ses`

**Kurulum:**
- AWS hesabı gerekir
- SES'te domain verify et
- IAM credentials oluştur

```env
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_REGION="us-east-1"
AWS_SES_FROM_EMAIL="noreply@yourdomain.com"
```

**Avantajlar:**
- Çok ucuz: $0.10 per 1,000 emails
- İlk 62,000 email/ay ücretsiz (EC2 üzerinden)
- Ölçeklenebilir

**Dezavantajlar:**
- Kurulum karmaşık
- Sandbox mode (başlangıçta)
- AWS hesabı gerekir

---

## Öneri Karşılaştırması

| Servis | Free Tier | Kurulum | Önerilen Kullanım |
|--------|-----------|---------|-------------------|
| **Resend** | 100/gün | Kolay | ✅ **Şu anda kullanılan - En iyi seçim** |
| **Nodemailer + Gmail** | ~500/gün | Çok kolay | Küçük projeler, test için |
| **SendGrid** | 100/gün | Orta | Eski projeler, kurumsal |
| **Brevo** | 300/gün | Kolay | Daha fazla free tier istiyorsanız |
| **AWS SES** | 62k/ay | Zor | Büyük ölçekli projeler |

---

## Hangi Servisi Seçmeli?

- **Resend** → Modern, Next.js ile uyumlu, iyi dokümantasyon (şu anda kullanılan)
- **Gmail SMTP** → Hızlı test için, ücretsiz, basit
- **Brevo** → Daha fazla free tier istiyorsanız (300/gün)
- **AWS SES** → Çok ucuz, büyük ölçek için

