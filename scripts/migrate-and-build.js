#!/usr/bin/env node

const { execSync } = require('child_process');

const directUrl = process.env.DATABASE_URL_DIRECT;
const regularUrl = process.env.DATABASE_URL;

if (!directUrl) {
  console.error('❌ Error: DATABASE_URL_DIRECT environment variable is not set');
  console.error('Please set DATABASE_URL_DIRECT in Vercel environment variables');
  process.exit(1);
}

// Check if it's a pooler URL (should not contain -pooler)
if (directUrl.includes('-pooler')) {
  console.error('❌ Error: DATABASE_URL_DIRECT should NOT contain "-pooler"');
  console.error('Current value contains pooler:', directUrl.substring(0, 50) + '...');
  console.error('Use the direct endpoint URL instead (without -pooler)');
  process.exit(1);
}

console.log('✅ DATABASE_URL_DIRECT is set');
console.log('🔄 Running Prisma migrations with direct connection...');

try {
  // Set DATABASE_URL to direct URL for migration
  process.env.DATABASE_URL = directUrl;
  
  // Run migration
  execSync('npx prisma migrate deploy', { 
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: directUrl }
  });
  
  console.log('✅ Migrations completed successfully');
  console.log('🔄 Running Next.js build...');
  
  // Build Next.js (can use regular DATABASE_URL)
  execSync('next build', { 
    stdio: 'inherit',
    env: process.env
  });
  
  console.log('✅ Build completed successfully');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

