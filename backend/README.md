# Callister FRC AI - Backend API

Bu klasör, Callister FRC AI uygulaması için ayrı bir Express.js backend API sunucusudur.

## 🎯 Neden Ayrı Backend?

Next.js static export ile API routes çalışmaz. Bu yüzden API'leri ayrı bir backend sunucusuna taşıyoruz.

## 📁 Klasör Yapısı

```
backend/
├── src/
│   ├── server.ts          # Ana Express server
│   ├── middleware/        # Auth, error handling middleware
│   ├── routes/            # API route'ları
│   │   ├── auth.ts        # ✅ Authentication (tamamlandı)
│   │   ├── chat.ts        # ⚠️  Chat (placeholder)
│   │   ├── conversations.ts # ✅ Conversations (tamamlandı)
│   │   ├── code-snippets.ts # ⚠️  Code snippets (kısmen)
│   │   ├── teams.ts       # ⚠️  Teams (placeholder)
│   │   ├── academy.ts     # ⚠️  Academy (placeholder)
│   │   ├── dashboard.ts   # ⚠️  Dashboard (placeholder)
│   │   ├── users.ts       # ⚠️  Users (placeholder)
│   │   ├── tba.ts         # ⚠️  TBA (placeholder)
│   │   └── admin.ts       # ⚠️  Admin (placeholder)
│   └── lib/
│       ├── database.ts    # Prisma database functions
│       └── jwt.ts         # JWT token helpers
├── prisma/                # Prisma schema ve migrations
├── package.json
├── tsconfig.json
├── env.example
└── README.md
```

## 🚀 Hızlı Başlangıç

1. **Bağımlılıkları kurun:**
```bash
cd backend
npm install
```

2. **Environment variables ayarlayın:**
```bash
cp env.example .env
# .env dosyasını düzenleyin
```

3. **Prisma setup:**
```bash
npx prisma generate
npx prisma migrate deploy
```

4. **Server'ı başlatın:**
```bash
npm run dev
```

Server `http://localhost:3001` adresinde çalışacaktır.

## 📡 API Endpoints

### Authentication ✅ (Tamamlandı)

- `POST /api/auth/login` - Kullanıcı girişi
- `POST /api/auth/register` - Yeni kullanıcı kaydı
- `POST /api/auth/verify-team` - Takım numarası doğrulama

### Conversations ✅ (Tamamlandı)

- `GET /api/conversations` - Kullanıcının konuşmalarını listele
- `GET /api/conversations/:id` - Konuşma detayı
- `DELETE /api/conversations/:id` - Konuşma sil

### Code Snippets ⚠️ (Kısmen)

- `GET /api/code-snippets` - Snippet'leri listele

### Diğer Endpoints ⚠️ (Placeholder)

Diğer endpoint'ler henüz implement edilmedi. Next.js API route'larından kopyalanacak.

## 🔐 Authentication

Backend JWT (JSON Web Token) kullanır. Client'tan token header'a eklenmelidir:

```
Authorization: Bearer <token>
```

## 📝 Next.js Client Entegrasyonu

Client tarafında `src/lib/api.ts` dosyası oluşturuldu. Bu dosya API request'lerini yönetir.

**Kullanım:**

```typescript
import { api, authApi } from '@/lib/api';

// Login
const { token, user } = await authApi.login(email, password);

// API call
const conversations = await api.get('/api/conversations');
const newConv = await api.post('/api/conversations', { title: 'Yeni' });
```

**Environment Variable:**

`.env.local` dosyasına ekleyin:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Production'da backend URL'inizi ekleyin:

```env
NEXT_PUBLIC_API_URL=https://your-backend-api.com
```

## 🚧 Yapılacaklar

### Öncelikli

1. ✅ Backend yapısı oluşturuldu
2. ✅ Authentication route'u tamamlandı
3. ✅ Conversations route'u tamamlandı
4. ⚠️ Chat route'u implementasyonu (AI entegrasyonu)
5. ⚠️ Diğer route'ların implementasyonu

### Route Implementasyonu

Her route için:

1. Next.js API route dosyasını (`src/app/api/.../route.ts`) okuyun
2. Backend route'una (`backend/src/routes/...`) kopyalayın
3. Express syntax'a çevirin
4. `authenticateToken` middleware'i ekleyin (gerekirse)
5. Test edin

### Örnek: Chat Route

`src/app/api/chat/route.ts` dosyasını okuyup `backend/src/routes/chat.ts` dosyasına implement edin.

## 🔧 Development

**Development modu (hot reload):**
```bash
npm run dev
```

**Production build:**
```bash
npm run build
npm start
```

## 📚 Kaynaklar

- [BACKEND_SETUP.md](./BACKEND_SETUP.md) - Detaylı kurulum kılavuzu
- [Express.js Docs](https://expressjs.com/)
- [Prisma Docs](https://www.prisma.io/docs)
