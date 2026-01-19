# 🚀 Sonraki Adımlar - Backend Entegrasyonu

## ✅ Tamamlanan İşlemler

1. ✅ Backend yapısı oluşturuldu (`backend/` klasörü)
2. ✅ Authentication route'ları tamamlandı
3. ✅ Client-side API helper oluşturuldu (`src/lib/api.ts`)
4. ✅ Sign in/Sign up sayfaları backend'e bağlandı
5. ✅ Basit auth hook oluşturuldu (`src/hooks/useAuth.ts`)
6. ✅ Environment variable template oluşturuldu

## 📋 Şimdi Yapmanız Gerekenler

### 1. Environment Variables Ayarlayın

**Frontend için (.env.local):**
```bash
cp .env.local.example .env.local
```

`.env.local` dosyasını düzenleyin:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Backend için:**
```bash
cd backend
cp env.example .env
```

`.env` dosyasını düzenleyin (en azından):
```env
PORT=3001
JWT_SECRET=your-very-secret-key-change-this
DATABASE_URL="postgresql://username:password@localhost:5432/callisterai"
GEMINI_API_KEY="your-key"
TBA_API_KEY="your-key"
```

### 2. Backend Bağımlılıklarını Kurun

```bash
cd backend
npm install
```

### 3. Prisma Setup (Backend)

```bash
cd backend
npx prisma generate
# Eğer database varsa:
npx prisma migrate deploy
# Eğer yeni database ise:
npx prisma migrate dev
```

### 4. Backend'i Başlatın

```bash
cd backend
npm run dev
```

Backend `http://localhost:3001` adresinde çalışacak.

### 5. Frontend'i Test Edin

Başka bir terminal'de:
```bash
# Root klasörde
npm run dev
```

Frontend `http://localhost:3000` adresinde çalışacak.

**Test:**
1. `/auth/signup` sayfasına gidin
2. Yeni kullanıcı kaydedin
3. `/auth/signin` sayfasına gidin
4. Giriş yapın

## ⚠️ Dikkat: Eksik Kısımlar

### Session Management
- Şu anda `useAuth` hook'u basit bir localStorage tabanlı sistem kullanıyor
- NextAuth yerine kullanmak için tüm `useSession` kullanımlarını güncellemeniz gerekiyor
- Önerilen: Önce test edin, sonra diğer sayfalarda `useSession` yerine `useAuth` kullanın

### Diğer API Route'lar
- Chat route'u henüz implement edilmedi (öncelikli!)
- Teams, Academy, Dashboard route'ları placeholder
- Bu route'ları implement ettikçe client tarafında `fetch('/api/...')` çağrılarını `api.get/post(...)` ile değiştirin

## 🔄 Migration Checklist

### Öncelikli (Şimdi yapılabilir)
- [x] Environment variables ayarlama
- [x] Backend kurulumu
- [x] Sign in/Sign up test
- [ ] Chat route implementasyonu
- [ ] Conversations fetch çağrılarını güncelleme

### Sonraki Adımlar
- [ ] `useSession` kullanımlarını `useAuth` ile değiştirme
- [ ] Diğer API route'larını implement etme
- [ ] Client tarafında tüm fetch çağrılarını güncelleme
- [ ] Error handling'i iyileştirme
- [ ] Token refresh mekanizması (opsiyonel)

## 📚 Önemli Dosyalar

- `backend/src/server.ts` - Backend ana dosyası
- `backend/src/routes/auth.ts` - Authentication route'ları
- `src/lib/api.ts` - Client-side API helper
- `src/hooks/useAuth.ts` - Authentication hook
- `src/app/auth/signin/page.tsx` - Sign in sayfası (güncellendi)
- `src/app/auth/signup/page.tsx` - Sign up sayfası (güncellendi)

## 🐛 Sorun Giderme

### Backend başlamıyor
- `JWT_SECRET` environment variable'ının ayarlandığından emin olun
- Port 3001'in boş olduğundan emin olun
- `npm install` yaptığınızdan emin olun

### Frontend'den backend'e bağlanamıyor
- `NEXT_PUBLIC_API_URL` doğru mu kontrol edin
- Backend'in çalıştığından emin olun (`http://localhost:3001/health`)
- CORS hatası alıyorsanız `backend/src/server.ts`'de CORS ayarlarını kontrol edin

### Token sorunları
- Token localStorage'da kayıtlı mı kontrol edin (Browser DevTools > Application > Local Storage)
- Token geçersizse logout yapıp tekrar login olun

## 🎯 Sonraki Adım

**En önemli:** Chat route'unu implement edin çünkü bu uygulamanın ana özelliği!

`src/app/api/chat/route.ts` dosyasını okuyup `backend/src/routes/chat.ts` dosyasına kopyalayın ve Express formatına çevirin.
