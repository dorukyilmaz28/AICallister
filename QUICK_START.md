# 🚀 Hızlı Başlangıç - Backend Entegrasyonu

## Özet

✅ **Tamamlanan:**
- Backend yapısı oluşturuldu
- Authentication route'ları hazır
- Sign in/Sign up sayfaları backend'e bağlandı
- Client-side API helper hazır

## ⚡ Hemen Yapılacaklar (5 dakika)

### 1. Environment Variables

**Frontend:**
```bash
# Root klasörde
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > .env.local
```

**Backend:**
```bash
cd backend
cp env.example .env
# .env dosyasını düzenleyin - en azından JWT_SECRET ve DATABASE_URL
```

### 2. Backend Kurulumu

```bash
cd backend
npm install
npx prisma generate
npm run dev
```

Backend `http://localhost:3001` adresinde çalışacak.

### 3. Frontend Test

```bash
# Yeni terminal - root klasörde
npm run dev
```

`http://localhost:3000/auth/signup` sayfasına gidip test edin!

## 📝 Önemli Notlar

1. **Backend çalışmalı** - Frontend'den önce backend'i başlatın
2. **Database bağlantısı** - `DATABASE_URL` doğru olmalı
3. **JWT Secret** - Production'da mutlaka değiştirin!

## 🎯 Sonraki Adım

Chat route'unu implement edin (`backend/src/routes/chat.ts`) - Bu uygulamanın ana özelliği!

Tüm detaylar için `NEXT_STEPS.md` dosyasına bakın.
