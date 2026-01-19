# 🚀 Capacitor Server Mode - Static Export Alternatifi

## ✅ Çözüm: Remote Server Kullanımı

Android app'i **Vercel'deki live site'e** bağlayarak static export yapmadan çalıştırabiliriz.

---

## 🎯 Avantajlar

✅ **Static export yok** - Her seferinde build yapmaya gerek yok  
✅ **API route'lar çalışır** - Vercel'de serverless functions aktif  
✅ **Her zaman güncel** - Kod değişikliği anında yansır  
✅ **Basit workflow** - Sadece Vercel'de deploy, Android app otomatik güncellenir  

---

## ⚠️ Dezavantajlar

❌ **Offline çalışmaz** - İnternet bağlantısı gerekli  
❌ **İlk yükleme yavaş** - Webview ilk açılışta site'i yükler  
❌ **Data kullanımı** - Her açılışta site yüklenir  

---

## 📋 Kurulum

### 1. Capacitor Config Güncelle

`capacitor.config.ts`:

```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.callister.frcai',
  appName: 'Callister FRC AI',
  webDir: 'out', // Bu artık kullanılmayacak ama bırakabiliriz
  server: {
    // Production: Vercel site'ini kullan
    url: 'https://callisterai.com',
    cleartext: true
  },
  android: {
    allowMixedContent: true,
    buildOptions: {
      keystorePath: undefined,
      keystorePath: undefined,
      keystorePassword: undefined,
      keystoreAlias: undefined,
      keystoreAliasPassword: undefined,
    }
  }
};

export default config;
```

### 2. Sync Yap

```bash
npx cap sync android
```

**Artık `build:static` yapmaya gerek yok!**

### 3. APK Oluştur

```bash
cd android
.\gradlew.bat assembleDebug
```

---

## 🔄 Development vs Production

### Development (Local Test):

```typescript
server: {
  url: 'http://localhost:3000', // Local dev server
  cleartext: true
}
```

### Production (Vercel):

```typescript
server: {
  url: 'https://callisterai.com', // Vercel site
  cleartext: true
}
```

---

## 🎛️ Environment-Based Config

Daha iyi bir yaklaşım: Environment variable kullan:

```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const isDev = process.env.NODE_ENV === 'development';
const serverUrl = process.env.CAPACITOR_SERVER_URL || 
  (isDev ? 'http://localhost:3000' : 'https://callisterai.com');

const config: CapacitorConfig = {
  appId: 'com.callister.frcai',
  appName: 'Callister FRC AI',
  webDir: 'out',
  server: {
    url: serverUrl,
    cleartext: true
  },
  android: {
    allowMixedContent: true,
    buildOptions: {
      keystorePath: undefined,
      keystorePassword: undefined,
      keystoreAlias: undefined,
      keystoreAliasPassword: undefined,
    }
  }
};

export default config;
```

`.env`:
```env
CAPACITOR_SERVER_URL="https://callisterai.com"
```

---

## 📱 Android App Workflow

### Eski Yöntem (Static Export):
```bash
npm run build:static  # Her seferinde build
npx cap sync android
cd android && .\gradlew.bat assembleDebug
```

### Yeni Yöntem (Server Mode):
```bash
# Sadece ilk kurulumda
npx cap sync android
cd android && .\gradlew.bat assembleDebug

# Sonraki güncellemeler için:
# Sadece Vercel'de deploy yap, Android app otomatik güncellenir!
```

---

## 🔍 Test

1. **Vercel'de deploy yap**
2. **Android app'i aç**
3. **Site yüklenmeli** - `https://callisterai.com` görünmeli
4. **API route'lar çalışmalı** - Login test et

---

## 🆘 Sorun Giderme

### "Site yüklenmiyor"
- Vercel'de site çalışıyor mu kontrol et
- `capacitor.config.ts`'de `url` doğru mu?
- AndroidManifest.xml'de internet permission var mı?

### "API route'lar çalışmıyor"
- Vercel'de API route'lar deploy edilmiş mi?
- Environment variables eksik mi?
- Vercel build log'larını kontrol et

### "İlk yükleme çok yavaş"
- Normal, webview site'i yüklüyor
- İkinci açılışta cache'den yüklenir (daha hızlı)

---

## 🎯 Öneri

**Production için:**
- ✅ Server Mode kullan (her zaman güncel)
- ✅ Vercel'de deploy yap
- ✅ Android app otomatik güncellenir

**Development için:**
- ✅ Local server kullan (`http://localhost:3000`)
- ✅ Hot reload çalışır
- ✅ Hızlı test

---

## 📝 Özet

**Static Export Yerine:**
1. `capacitor.config.ts`'de `server.url` ayarla
2. `npx cap sync android`
3. APK oluştur
4. Vercel'de deploy yap → Android app otomatik güncellenir!

**Artık `build:static` yapmaya gerek yok!** 🎉
