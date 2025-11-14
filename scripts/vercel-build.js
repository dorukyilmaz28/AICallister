const { execSync } = require('child_process');

try {
  console.log('Generating Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  console.log('Running database migrations...');
  try {
    execSync('npx prisma migrate deploy', { 
      stdio: 'inherit',
      timeout: 30000 // 30 seconds timeout
    });
  } catch (migrationError) {
    console.warn('Warning: Migration failed or timed out. This is usually safe if migrations are already applied.');
    console.warn('Continuing with build...');
  }
  
  console.log('Building Next.js application...');
  execSync('next build', { stdio: 'inherit' });
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}

