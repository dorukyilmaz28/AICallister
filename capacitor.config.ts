import type { CapacitorConfig } from '@capacitor/cli';

// Server Mode: Vercel'deki live site'e bağlan
// Static export yapmaya gerek yok!
const isDev = process.env.NODE_ENV === 'development';
const serverUrl = process.env.CAPACITOR_SERVER_URL || 
  (isDev ? 'http://localhost:3000' : 'https://www.callisterai.com');

const config: CapacitorConfig = {
  appId: 'com.callister.frcai',
  appName: 'Callister FRC AI',
  webDir: 'out', // Server mode'da kullanılmaz ama bırakıyoruz
  server: {
    // Production: Vercel site'ini kullan (API route'lar çalışır)
    // Development: Local dev server kullan
    url: serverUrl,
    cleartext: true // HTTP backend için gerekli (Android 9+ Mixed Content hatası için)
  },
  android: {
    allowMixedContent: true, // HTTP backend istekleri için (native HTTP kullanıyoruz ama yine de ekleyelim)
    buildOptions: {
      keystorePath: undefined,
      keystorePassword: undefined,
      keystoreAlias: undefined,
      keystoreAliasPassword: undefined,
    }
  }
};

export default config;
