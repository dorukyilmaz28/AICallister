# Backend API Kurulum Kılavuzu

Bu backend, Callister FRC AI uygulaması için ayrı bir Express.js API sunucusudur. Next.js static export ile uyumlu çalışacak şekilde tasarlanmıştır.

## 📋 Gereksinimler

- Node.js 18+
- PostgreSQL veritabanı (veya mevcut Prisma setup)
- npm veya yarn

## 🚀 Kurulum

### 1. Bağımlılıkları Kurun

```bash
cd backend
npm install
```

### 2. Environment Variables Ayarlayın

`.env.example` dosyasını kopyalayın:

```bash
cp env.example .env
```

`.env` dosyasını düzenleyin ve gerekli değerleri girin:

```env
PORT=3001
JWT_SECRET=your-very-secret-key-here
DATABASE_URL="postgresql://username:password@localhost:5432/callisterai"
# ... diğer değişkenler
```

### 3. Prisma Setup

Backend klasöründe Prisma'yı yapılandırın:

```bash
npx prisma generate
npx prisma migrate deploy
```

### 4. Server'ı Başlatın

Development modunda:
```bash
npm run dev
```

Production modunda:
```bash
npm run build
npm start
```

Server `http://localhost:3001` adresinde çalışacaktır.

## 📡 API Endpoints

### Authentication

- `POST /api/auth/login` - Kullanıcı girişi (JWT token döner)
- `POST /api/auth/register` - Yeni kullanıcı kaydı
- `POST /api/auth/verify-team` - Takım numarası doğrulama

### Diğer Endpoints (Route'lar oluşturulacak)

- `/api/chat` - AI chat endpoint'i
- `/api/conversations` - Konuşma yönetimi
- `/api/code-snippets` - Kod snippet'leri
- `/api/teams` - Takım yönetimi
- `/api/academy` - Academy kursları
- `/api/dashboard` - Dashboard istatistikleri
- `/api/users` - Kullanıcı bilgileri
- `/api/tba` - The Blue Alliance API proxy
- `/api/admin` - Admin işlemleri

## 🔐 Authentication

Backend JWT (JSON Web Token) kullanır. Client tarafında token'ı header'a ekleyin:

```javascript
fetch('http://localhost:3001/api/...', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
```

## 🔄 Next.js Client Entegrasyonu

Client tarafında (`src/lib/api.ts` oluşturulacak):

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token'); // veya cookie'den al
  
  return fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  });
}
```

## 📝 Route'ları Tamamlama

Şu anda sadece `auth.ts` route'u tamamlandı. Diğer route'ları şu şekilde oluşturun:

1. `backend/src/routes/` klasöründe yeni route dosyası oluşturun
2. Express Router kullanın
3. `authenticateToken` middleware'i kullanın (gerekli endpoint'lerde)
4. `server.ts` dosyasına route'u ekleyin

Örnek:

```typescript
// backend/src/routes/conversations.ts
import { Router, Request, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { conversationDb } from '../lib/database';

const router = Router();

// Tüm route'larda authentication gerekli
router.use(authenticateToken);

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const conversations = await conversationDb.findByUserId(req.user!.id);
    res.json({ conversations });
  } catch (error) {
    res.status(500).json({ error: 'Hata oluştu' });
  }
});

export { router as conversationsRouter };
```

## 🚧 Yapılacaklar

- [x] Temel backend yapısı
- [x] Authentication route'u
- [x] JWT token sistemi
- [ ] Chat route'u (AI entegrasyonu)
- [ ] Conversations route'u
- [ ] Code snippets route'u
- [ ] Teams route'u
- [ ] Academy route'u
- [ ] Dashboard route'u
- [ ] Users route'u
- [ ] TBA route'u
- [ ] Admin route'u
- [ ] Client-side API helper
- [ ] Environment variables güncelleme

## 🔧 Sorun Giderme

### Port Already in Use

Farklı bir port kullanın:
```env
PORT=3002
```

### Database Connection Error

`DATABASE_URL`'in doğru olduğundan emin olun:
```bash
npx prisma db pull  # Database'i kontrol et
```

### JWT Secret Error

`.env` dosyasında `JWT_SECRET` tanımlı olduğundan emin olun.

## 📚 Kaynaklar

- [Express.js Docs](https://expressjs.com/)
- [JWT](https://jwt.io/)
- [Prisma Docs](https://www.prisma.io/docs)
