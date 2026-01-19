# Backend Migration Rehberi

Bu dosya, Next.js API routes'larını ayrı backend'e nasıl taşıyacağınızı açıklar.

## ✅ Tamamlanan İşlemler

1. ✅ Backend klasör yapısı oluşturuldu
2. ✅ Express.js server kuruldu
3. ✅ JWT authentication sistemi eklendi
4. ✅ Authentication route'u tamamlandı (`/api/auth/*`)
5. ✅ Conversations route'u tamamlandı (`/api/conversations/*`)
6. ✅ Client-side API helper oluşturuldu (`src/lib/api.ts`)
7. ✅ Database dosyası backend'e kopyalandı
8. ✅ Prisma schema backend'e kopyalandı

## 📋 Yapılacaklar

### 1. Environment Variables

**Frontend (`src/.env.local` veya root `.env.local`):**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Backend (`backend/.env`):**
```env
PORT=3001
JWT_SECRET=your-secret-key
DATABASE_URL="postgresql://..."
GEMINI_API_KEY="..."
TBA_API_KEY="..."
# ... diğer değişkenler
```

### 2. Client Tarafında Fetch Çağrılarını Güncelleme

**Eski yöntem (Next.js API route):**
```typescript
const response = await fetch('/api/conversations');
```

**Yeni yöntem (Backend API):**
```typescript
import { api } from '@/lib/api';
const response = await api.get('/api/conversations');
```

### 3. Authentication Güncelleme

**Eski (NextAuth):**
```typescript
import { signIn } from 'next-auth/react';
await signIn('credentials', { email, password });
```

**Yeni (JWT):**
```typescript
import { authApi } from '@/lib/api';
const { token, user } = await authApi.login(email, password);
// Token otomatik olarak localStorage'a kaydedilir
```

### 4. Session Kontrolü

**Eski (NextAuth):**
```typescript
import { useSession } from 'next-auth/react';
const { data: session } = useSession();
```

**Yeni (JWT):**
Token'ı `localStorage`'dan kontrol edebilirsiniz veya backend'den user bilgisini çekin:

```typescript
import { api } from '@/lib/api';
// User bilgisini almak için bir endpoint ekleyin (ör: /api/auth/me)
const user = await api.get('/api/auth/me');
```

### 5. Route'ları Migrate Etme

Her Next.js API route'unu backend'e taşırken:

1. **Route dosyasını okuyun:**
   - `src/app/api/[endpoint]/route.ts`

2. **Backend route'una çevirin:**
   - Express Router kullanın
   - `authenticateToken` middleware'i ekleyin (gerekirse)
   - `NextRequest/NextResponse` yerine `Request/Response` kullanın

3. **Test edin:**
   - Backend'i başlatın: `cd backend && npm run dev`
   - Frontend'den API çağrısı yapın

## 🔄 Migration Checklist

### Route'lar

- [x] `/api/auth/*` - ✅ Tamamlandı
- [x] `/api/conversations/*` - ✅ Tamamlandı
- [ ] `/api/chat` - ⚠️  Placeholder (öncelikli)
- [ ] `/api/code-snippets/*` - ⚠️  Kısmen
- [ ] `/api/teams/*` - ⚠️  Placeholder
- [ ] `/api/academy/*` - ⚠️  Placeholder
- [ ] `/api/dashboard/*` - ⚠️  Placeholder
- [ ] `/api/users/*` - ⚠️  Placeholder
- [ ] `/api/tba/*` - ⚠️  Placeholder
- [ ] `/api/admin/*` - ⚠️  Placeholder

### Client Tarafı

- [ ] Tüm `fetch('/api/...')` çağrılarını `api.get/post/...` ile değiştirin
- [ ] NextAuth kullanımlarını JWT ile değiştirin
- [ ] Session kontrolünü güncelleyin
- [ ] Error handling'i güncelleyin

### Testing

- [ ] Backend'i test edin
- [ ] Frontend-backend entegrasyonunu test edin
- [ ] Authentication flow'unu test edin
- [ ] Her endpoint'i test edin

## 🚀 Migration Adımları

### Adım 1: Backend'i Başlatın

```bash
cd backend
npm install
cp env.example .env
# .env dosyasını düzenleyin
npm run dev
```

### Adım 2: Frontend'i Güncelleyin

1. `.env.local` dosyasına `NEXT_PUBLIC_API_URL` ekleyin
2. `src/lib/api.ts` kullanarak API çağrılarını güncelleyin

### Adım 3: Authentication'ı Migrate Edin

1. Sign in sayfasında `authApi.login()` kullanın
2. Sign up sayfasında `authApi.register()` kullanın
3. Logout'ta `authApi.logout()` kullanın

### Adım 4: Route'ları Migrate Edin

Sırayla her route'u migrate edin:

1. Next.js route'unu okuyun
2. Backend route'una implement edin
3. Client tarafında kullanımı güncelleyin
4. Test edin

## 📚 Örnek Migration

### Örnek: Conversations Route

**Next.js (`src/app/api/conversations/route.ts`):**
```typescript
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  // ...
}
```

**Backend (`backend/src/routes/conversations.ts`):**
```typescript
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  // ...
});
```

**Client (`src/components/ConversationsList.tsx`):**
```typescript
// Eski
const response = await fetch('/api/conversations');

// Yeni
import { api } from '@/lib/api';
const { conversations } = await api.get('/api/conversations');
```

## 🎯 Sonraki Adımlar

1. ✅ Backend yapısı hazır
2. ⚠️  Chat route'unu implement edin (öncelikli - AI entegrasyonu)
3. ⚠️  Diğer route'ları implement edin
4. ⚠️  Client tarafında fetch çağrılarını güncelleyin
5. ⚠️  Test edin ve deploy edin

## 💡 İpuçları

- Her route'u ayrı ayrı migrate edin
- Her adımda test edin
- Git commit'lerini küçük tutun
- Backend ve frontend'i ayrı repo'lara taşıyabilirsiniz (önerilir)
