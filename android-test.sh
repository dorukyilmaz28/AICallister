#!/bin/bash
# Android Test Script - Hızlı test için

echo "🔨 Building static export..."
npm run build:static

echo "🔄 Syncing with Capacitor..."
npx cap sync

echo "📱 Opening Android Studio..."
npx cap open android

echo "✅ Done! Android Studio açıldı. Run butonuna tıklayın."
