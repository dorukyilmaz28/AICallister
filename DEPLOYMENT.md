# Callister FRC AI - Deployment Guide

## Environment Variables Required

Create a `.env` file in your project root with the following variables:

```env
# Database (PostgreSQL)
DATABASE_URL="postgresql://username:password@localhost:5432/callister_frc_ai"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# OpenRouter API
# OpenRouter API
OPENROUTER_API_KEY="your-openrouter-api-key-here"
```

## Vercel Deployment

### 1. Database Setup
- Create a PostgreSQL database on Vercel Postgres or any PostgreSQL provider
- Copy the connection string to `DATABASE_URL`

### 2. Environment Variables in Vercel
Add these environment variables in your Vercel dashboard:

- `DATABASE_URL`: Your PostgreSQL connection string
- `NEXTAUTH_SECRET`: Generate a secure secret (use `openssl rand -base64 32`)
- `NEXTAUTH_URL`: Your Vercel app URL (e.g., `https://your-app.vercel.app`)
- `OPENROUTER_API_KEY`: `your-openrouter-api-key-here`

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
