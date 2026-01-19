# 🔌 Port Açıklaması: Neden 3001?

## 📋 Port Kullanımı

### **Port 3000:**
- **Next.js Frontend** için (web sitesi)
- Development'ta: `npm run dev` → `http://localhost:3000`
- Production'da: Vercel veya başka hosting

### **Port 3001:**
- **Backend API** için (Express.js server)
- Development'ta: `cd backend && npm run dev` → `http://localhost:3001`
- Production'da: Ayrı bir sunucu (VPS, Railway, vb.)

---

## 🤔 Neden 3001, 3000 Değil?

### **Sebep 1: İki Server Aynı Anda Çalışmalı**

Eğer backend'i de 3000 portunda çalıştırırsak:
- ❌ Port conflict (çakışma) olur
- ❌ İki server aynı anda çalışamaz
- ❌ Biri diğerini kapatır

### **Sebep 2: Ayrı Serverlar = Daha İyi Yapı**

✅ **Avantajlar:**
- Frontend ve backend bağımsız çalışır
- Ayrı ayrı deploy edilebilir
- Farklı teknolojiler kullanılabilir
- Ölçeklenebilir (backend'i ölçekleyebilirsiniz)

---

## 🔧 Port'u Değiştirebilir miyim?

**Evet!** Ama dikkatli olun:

### **Backend Port'unu 3000 Yapmak:**

**1. Backend port'unu değiştir:**
`backend/src/server.ts`:
```typescript
const PORT = process.env.PORT || 3000; // 3001 → 3000
```

**2. Environment variable ekle:**
`.env` veya `backend/.env`:
```env
PORT=3000
```

**3. Frontend Next.js'i farklı portta çalıştır:**
```bash
npm run dev -- -p 3002  # Next.js artık 3002'de çalışacak
```

**4. Tüm referansları güncelle:**
- `.env` → `NEXT_PUBLIC_API_URL=http://localhost:3000`
- Backend CORS ayarları
- Android app'te API URL

---

## 💡 Öneri

**Şu anki durum (3001) en iyi:**
- ✅ Standart (Next.js = 3000, Backend = 3001)
- ✅ Karışıklık yok
- ✅ Herkes böyle yapıyor

**Değiştirmeye gerek yok!** Mevcut yapı doğru.

---

## 📝 Özet

| Server | Port | Ne İçin? |
|--------|------|----------|
| Next.js Frontend | 3000 | Web arayüzü |
| Express Backend | 3001 | API endpoints |

**Neden 3001?** → Port çakışmasını önlemek için!

**Değiştirmeli miyim?** → Hayır, şu anki durum ideal!
