# PostgreSQL Database Setup for Vercel

## Hızlı Kurulum

### 1. Database Ekleme (Değişik Yol)

Vercel dashboard'dan farklı yerlerde "Storage" bulunabilir:

**Yöntem 1: Proje Sayfasından**
1. Vercel.com'a gidin
2. Projenizi seçin
3. Üst menüde **"Data"** veya **"Databases"** butonuna tıklayın
4. **"Connect Database"** butonuna tıklayın
5. **"PostgreSQL"** seçin

**Yöntem 2: Doğrudan URL**
- Bu link'i kullanın: https://vercel.com/[your-project-name]/storage
- Veya: https://vercel.com/dashboard -> Projeniz -> Storage

**Yöntem 3: Vercel CLI**
```bash
vercel storage create --type postgresql
```

### 2. Environment Variables Ayarlama

Database oluşturulduktan sonra, Vercel otomatik olarak `DATABASE_URL` environment variable'ını ekleyecektir.

Kontrol etmek için:
1. Proje Settings → Environment Variables
2. `DATABASE_URL` var mı kontrol edin

### 3. Sonraki Adımlar

Database eklendikten sonra:
1. Prisma schema'yı PostgreSQL'e çevireceğiz
2. Migration'ları çalıştıracağız
3. Uygulamayı test edeceğiz

## Alternatif: Supabase Kullanımı

Eğer Vercel'de database eklemek sorun çıkarıyorsa, Supabase kullanabilirsiniz:

1. https://supabase.com → Hesap oluşturun
2. New Project → PostgreSQL database oluşturun
3. Settings → Database → Connection string'i alın
4. Vercel Environment Variables'a ekleyin

## Yardımcı Linkler

- Vercel Documentation: https://vercel.com/docs/storage
- Supabase Documentation: https://supabase.com/docs

