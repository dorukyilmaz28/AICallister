# ⚠️ ÖNEMLİ: Backend Kontrolü

## 🔍 Sorun

"Token oluşturulamadı" hatası alıyorsunuz. Bu, **backend'in çalışmadığı** anlamına gelir.

## ✅ Kontrol Edilmesi Gerekenler

### **1. Backend Çalışıyor mu?**

Tarayıcıda şu URL'i açın:
```
https://callisterai.com/api/auth/login
```

**Beklenen:**
- `{"error":"Email ve şifre gereklidir."}` (POST body olmadan)
- VEYA başka bir JSON yanıtı

**Eğer:**
- 404 Not Found → Backend çalışmıyor
- 500 Internal Server Error → Backend hatası var
- Timeout → Backend erişilemiyor

### **2. Vercel'de Backend Deploy Edilmiş mi?**

Vercel Dashboard'da kontrol edin:
- API route'lar deploy edilmiş mi?
- `/api/auth/login` endpoint'i var mı?

### **3. Environment Variables**

Vercel'de şu environment variable'lar var mı?
- `NEXTAUTH_SECRET`
- `DATABASE_URL`
- `GEMINI_API_KEY`

---

## 🚀 Çözüm

### **Eğer Backend Çalışmıyorsa:**

1. **Vercel'de Deploy Edin:**
   ```bash
   git push origin main
   ```
   Vercel otomatik deploy edecek.

2. **VEYA Local Backend Çalıştırın:**
   ```bash
   npm run dev
   ```
   Sonra API URL'ini localhost yapın (test için).

---

## 📋 Test

Chrome DevTools Console'da:
```javascript
// API URL'yi kontrol et
console.log('API URL:', 'https://callisterai.com/api/auth/login');

// Backend'e test isteği at
fetch('https://callisterai.com/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'test@test.com', password: 'test' })
})
.then(r => r.json())
.then(d => console.log('Response:', d))
.catch(e => console.error('Error:', e));
```

**Eğer hata alırsanız → Backend çalışmıyor!**

---

## ✅ Backend Çalışıyorsa

O zaman sorun response formatında. Chrome DevTools Console'daki log'ları paylaşın:
- `[API] Native response full object:`
- `[API] Response data:`

**Birlikte çözelim!** 🚀
