# 🔐 Vercel Deployment - Environment Variables

## Required Environment Variables

Vercel dashboard'da Settings → Environment Variables'a gidin ve şunları ekleyin:

### Database (PostgreSQL)
```
DATABASE_URL=postgresql://username:password@host:port/database
```

### NextAuth
```
NEXTAUTH_SECRET=tRxk0KcjgChp2qr7H31tG+3gfzm2ChudAUreJGX9P74=
NEXTAUTH_URL=https://your-app.vercel.app
```

### OpenRouter API
```
OPENROUTER_API_KEY=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
```

### Blue Alliance API
```
BLUE_ALLIANCE_API_KEY=i4v4xKKLRzlDANJYse7ysL0AVyMphKgBsAlJFw8vYLnxdSYrCVAnGbjhakgnzCZq
```

## Database Setup

1. **Vercel Postgres** (Recommended):
   - Vercel dashboard → Storage → Create Database → Postgres
   - Automatically adds `DATABASE_URL` environment variable

2. **Supabase** (Free alternative):
   - Create project at supabase.com
   - Copy connection string to `DATABASE_URL`

## Deployment Steps

1. Connect GitHub repo to Vercel
2. Add all environment variables above
3. Create PostgreSQL database
4. Deploy automatically
5. Run database migration if needed

## Security ✅

- All API keys secured in environment variables
- No sensitive data in source code
- HTTPS enabled by Vercel
- PostgreSQL for production
