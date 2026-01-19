# Android Test Script - PowerShell (Windows)

Write-Host "🔨 Building static export..." -ForegroundColor Cyan
npm run build:static

Write-Host "🔄 Syncing with Capacitor..." -ForegroundColor Cyan
npx cap sync

Write-Host "📱 Opening Android Studio..." -ForegroundColor Cyan
npx cap open android

Write-Host "✅ Done! Android Studio açıldı. Run butonuna tıklayın." -ForegroundColor Green
