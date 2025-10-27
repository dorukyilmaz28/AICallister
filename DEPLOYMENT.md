# Callister FRC AI - Deployment Guide

## Environment Variables Required

Create a `.env.local` file in your project root with the following variables:

```env
# Database (PostgreSQL)
DATABASE_URL="postgresql://username:password@localhost:5432/callister_frc_ai"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# OpenRouter API
OPENROUTER_API_KEY="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"
```

## Vercel Deployment

### 1. Database Setup
- Create a PostgreSQL database on Vercel Postgres or any PostgreSQL provider
- Copy the connection string to `DATABASE_URL`

### 2. Environment Variables in Vercel
Add these environment variables in your Vercel dashboard:

- `DATABASE_URL`: Your PostgreSQL connection string
- `NEXTAUTH_SECRET`: Use this secure secret: `tRxk0KcjgChp2qr7H31tG+3gfzm2ChudAUreJGX9P74=`
- `NEXTAUTH_URL`: Your Vercel app URL (e.g., `https://your-app.vercel.app`)
- `OPENROUTER_API_KEY`: `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`

### 3. Database Migration
After setting up the database, run:
```bash
npx prisma migrate deploy
```

### 4. Security Notes
- Never commit API keys to version control
- Use environment variables for all sensitive data
- The hardcoded API key has been removed from the code

## Local Development

1. Copy `.env.example` to `.env.local`
2. Fill in your environment variables
3. Run `npm install`
4. Run `npx prisma migrate dev`
5. Run `npm run dev`

## Fixed Issues

✅ **API Key Security**: Removed hardcoded API key from source code
✅ **Authentication**: Added NEXTAUTH_SECRET for Vercel compatibility  
✅ **Database**: Changed from SQLite to PostgreSQL for Vercel deployment
✅ **Environment Variables**: Properly configured for production deployment
