import { Capacitor } from '@capacitor/core';
import { CapacitorHttp } from '@capacitor/core';

// API Base URL - Hardcoded (environment variable expose olmasın diye)
// Production: https://www.callisterai.com (www ile - CORS için gerekli)
const API_BASE_URL = 'https://www.callisterai.com';

// Capacitor'da backend URL'ini kullan (static export'ta API route'lar çalışmaz)
function getApiBaseUrl(): string {
  if (typeof window === 'undefined') return API_BASE_URL;
  
  // Production URL - HER ZAMAN kullan (Android için)
  const productionUrl = 'https://www.callisterai.com';
  
  // ⚠️ ANDROID/CAPACITOR İÇİN HER ZAMAN PRODUCTION URL KULLAN ⚠️
  // Capacitor tespiti: Birden fazla yöntemle kontrol et
  const isNativePlatform = Capacitor.isNativePlatform();
  const isCapacitorProtocol = window.location.protocol === 'capacitor:';
  const isHttpsLocalhost = window.location.hostname === 'localhost' && window.location.protocol === 'https:';
  // @ts-ignore - Capacitor'un window'ya eklediği özellikler
  const hasCapacitorGlobal = typeof window.Capacitor !== 'undefined';
  const isServerMode = window.location.hostname === 'www.callisterai.com' || 
                       window.location.hostname === 'callisterai.com';
  
  // Local IP veya localhost kontrolü - EĞER LOCAL IP VARSA MUTLAKA PRODUCTION KULLAN
  const currentHost = window.location.hostname;
  const isLocalIP = currentHost.match(/192\.168\.\d+\.\d+/) || 
                    currentHost.match(/10\.\d+\.\d+\.\d+/) ||
                    currentHost.match(/172\.(1[6-9]|2\d|3[01])\.\d+\.\d+/) ||
                    currentHost === 'localhost' ||
                    currentHost === '127.0.0.1';
  
  const isCapacitor = isNativePlatform || isCapacitorProtocol || isHttpsLocalhost || hasCapacitorGlobal || isServerMode || isLocalIP;
  
  // Eğer Capacitor VEYA local IP ise HER ZAMAN production URL kullan
  if (isCapacitor) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[API] ========== CAPACITOR/LOCAL IP DETECTED ==========');
      console.log('[API] Native platform:', isNativePlatform);
      console.log('[API] Capacitor protocol:', isCapacitorProtocol);
      console.log('[API] HTTPS localhost:', isHttpsLocalhost);
      console.log('[API] Capacitor global:', hasCapacitorGlobal);
      console.log('[API] Server mode:', isServerMode);
      console.log('[API] Is local IP:', isLocalIP);
      console.log('[API] Current hostname:', currentHost);
      console.log('[API] Window location:', window.location.href);
      console.log('[API] Original API_BASE_URL:', API_BASE_URL);
      console.log('[API] ⚠️⚠️⚠️ FORCING PRODUCTION URL:', productionUrl, '⚠️⚠️⚠️');
      console.log('[API] ========================================');
    }
    return productionUrl;
  }
  
  // Web'de de local URL kontrolü yap - local URL'leri production'a yönlendir
  const isLocalUrl = API_BASE_URL.includes('localhost') || 
                     API_BASE_URL.includes('127.0.0.1') || 
                     API_BASE_URL.startsWith('http://') ||
                     API_BASE_URL.match(/192\.168\.\d+\.\d+/) ||
                     API_BASE_URL.match(/10\.\d+\.\d+\.\d+/) ||
                     API_BASE_URL.match(/172\.(1[6-9]|2\d|3[01])\.\d+\.\d+/);
  
  if (isLocalUrl) {
    console.warn('[API] Local URL detected in web mode, using production URL');
    console.warn('[API] Original URL:', API_BASE_URL);
    console.warn('[API] Using:', productionUrl);
    return productionUrl;
  }
  
  return API_BASE_URL;
}

// Token'ı localStorage'dan al (veya cookie'den)
function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

// Token'ı kaydet
export function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('token', token);
}

// Token'ı sil
export function removeToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
}

// API Request helper
interface RequestOptions extends RequestInit {
  requireAuth?: boolean;
}

// Capacitor kontrolünü cache'le (her request'te tekrar hesaplamayı önle)
let isCapacitorCached: boolean | null = null;

function isCapacitorPlatform(): boolean {
  if (isCapacitorCached !== null) return isCapacitorCached;
  
  if (typeof window === 'undefined') {
    isCapacitorCached = false;
    return false;
  }
  
  // Birden fazla yöntemle kontrol et
  const checks = [
    Capacitor.isNativePlatform(),
    window.location.protocol === 'capacitor:',
    (window.location.hostname === 'localhost' && window.location.protocol === 'https:'),
    // @ts-ignore - Capacitor'un window'ya eklediği özellikler
    typeof window.Capacitor !== 'undefined',
  ];
  
  isCapacitorCached = checks.some(check => check === true);
  return isCapacitorCached;
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { requireAuth = true, ...fetchOptions } = options;
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string> || {}),
  };

  // Authentication gerekiyorsa token ekle
  if (requireAuth && token) {
    headers['Authorization'] = `Bearer ${token}`;
    if (process.env.NODE_ENV === 'development') {
      console.log('[API] ✅ Token added to Authorization header, length:', token.length);
    }
  } else if (requireAuth && !token) {
    console.error('[API] ❌❌❌ NO TOKEN FOUND! requireAuth=true but token is null/undefined');
    console.error('[API] This will cause 401 Unauthorized errors!');
    console.error('[API] Endpoint:', endpoint);
    console.error('[API] localStorage token:', typeof window !== 'undefined' ? localStorage.getItem('token') : 'N/A (SSR)');
    
    // Token yoksa ve requireAuth true ise, kullanıcıyı login sayfasına yönlendir
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      if (!currentPath.startsWith('/auth/')) {
        console.error('[API] Redirecting to login page...');
        window.location.href = '/auth/signin';
      }
    }
    
    // Hata fırlat
    const error = new Error('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
    (error as any).statusCode = 401;
    (error as any).noToken = true;
    throw error;
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.log('[API] ⚠️ Auth not required or token not needed for this request');
      }
    }

  // URL oluştur - endpoint zaten http ile başlıyorsa olduğu gibi kullan
  // Aksi halde base URL ekle
  // 🔴🔴🔴 KRİTİK: Vercel trailing slash zorlaması için HER ZAMAN trailing slash ekle
  const baseUrl = getApiBaseUrl();
  let finalEndpoint = endpoint;
  
  // 🔴🔴🔴 TRAILING SLASH GARANTİSİ - VERCEL 308 REDIRECT'İNİ ÖNLEMEK İÇİN 🔴🔴🔌
  // API endpoint'leri için HER ZAMAN trailing slash ekle - HİÇBİR KONTROL YAPMA, SADECE EKLE
  // Query string varsa, query string'den ÖNCE trailing slash ekle
  if (finalEndpoint.includes('/api/')) {
    // API endpoint'i içeriyorsa MUTLAKA trailing slash ekle
    if (finalEndpoint.includes('?')) {
      // Query string varsa, ? işaretinden ÖNCE trailing slash ekle
      const [path, query] = finalEndpoint.split('?');
      // Path'in sonunda / yoksa MUTLAKA ekle (hash kontrolü yapma, sadece ekle)
      const normalizedPath = path.endsWith('/') ? path : path + '/';
      finalEndpoint = normalizedPath + '?' + query;
    } else {
      // Query string yoksa MUTLAKA trailing slash ekle (hash kontrolü yapma, sadece ekle)
      // Eğer zaten / ile bitiyorsa olduğu gibi bırak, yoksa ekle
      if (!finalEndpoint.endsWith('/')) {
        finalEndpoint = finalEndpoint + '/';
      }
    }
    if (process.env.NODE_ENV === 'development') {
      console.log('[API] ✅ TRAILING SLASH NORMALIZED:', endpoint, '->', finalEndpoint);
    }
  }
  
  const url = finalEndpoint.startsWith('http') ? finalEndpoint : `${baseUrl}${finalEndpoint}`;
  
  // 🔴🔴🔴 TRAILING SLASH DOĞRULAMA - URL'DE MUTLAKA OLMALI 🔴🔴🔌
  if (url.includes('/api/') && !url.includes('?')) {
    if (!url.endsWith('/')) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[API] ❌❌❌ TRAILING SLASH EKSİK! URL:', url);
        // Son çare: URL'e trailing slash ekle
        const correctedUrl = url + '/';
        console.log('[API] ✅ TRAILING SLASH DÜZELTİLDİ:', url, '->', correctedUrl);
      }
      // Düzeltilmiş URL'i kullan (ama bu noktaya gelmemeli)
      // const url = correctedUrl; // Bu satırı aktif etme, sadece log için
    }
  }

  // 🔴🔴🔴 KRİTİK DEBUG LOG - URL'Yİ NET GÖR 🔴🔴🔴
  if (process.env.NODE_ENV === 'development') {
    console.log('[API DEBUG] ========== FETCH URL DEBUG ==========');
    console.log('[API DEBUG] Fetch URL:', url);
    console.log('[API DEBUG] Base URL:', baseUrl);
    console.log('[API DEBUG] Original endpoint:', endpoint);
    console.log('[API DEBUG] Final endpoint:', finalEndpoint);
    console.log('[API DEBUG] Full URL constructed:', url);
    console.log('[API DEBUG] URL starts with http?', url.startsWith('http'));
    console.log('[API DEBUG] URL includes /api/?', url.includes('/api/'));
    console.log('[API DEBUG] ======================================');
    
    // DEBUG: URL'yi log'la
    console.log('[API] Making request to:', url);
    console.log('[API] Base URL:', baseUrl);
    console.log('[API] Original endpoint:', endpoint);
    console.log('[API] Final endpoint:', finalEndpoint);
  }

  // Capacitor'da native HTTP kullan (mixed content sorununu çözer)
  const isCapacitor = isCapacitorPlatform();
  
  if (process.env.NODE_ENV === 'development') {
    console.log('[API] Is Capacitor:', isCapacitor);
  }

  try {
    // Capacitor'da tüm istekler için native HTTP kullan (mixed content ve CORS sorunlarını çözer)
    if (isCapacitor) {
      const chatLikeTimeout = url.includes("/api/chat");
      const timeoutMs = chatLikeTimeout ? 120000 : 60000;
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(
          () =>
            reject(
              new Error(
                `Request timeout: API isteği ${timeoutMs / 1000} saniye içinde tamamlanamadı. İnternet bağlantınızı kontrol edin.`
              )
            ),
          timeoutMs
        );
      });
      
      // Method kontrolü - GET istekleri için data gönderme
      const method = (fetchOptions.method as any) || 'GET';
      const requestData = method !== 'GET' && fetchOptions.body 
        ? JSON.parse(fetchOptions.body as string) 
        : undefined;
      
      const requestPromise = CapacitorHttp.request({
        method: method,
        url: url,
        headers: headers,
        data: requestData,
      }).catch((error: any) => {
        // Network hatası için daha açıklayıcı mesaj
        if (error.message?.includes('network') || error.message?.includes('timeout') || error.message?.includes('ECONNREFUSED')) {
          throw new Error('İnternet bağlantısı hatası. Lütfen bağlantınızı kontrol edin ve tekrar deneyin.');
        }
        throw error;
      });
      
      let nativeResponse = await Promise.race([requestPromise, timeoutPromise]) as any;
      
      // ========== DETAYLI LOGGING ==========
      if (process.env.NODE_ENV === 'development') {
        console.log('[API] ========== RESPONSE START ==========');
        console.log('[API] URL:', url);
        // ⚠️ STATUS CODE - BURAYA BAKIN! ⚠️
        console.log('[API] ⚠️⚠️⚠️ STATUS CODE:', nativeResponse.status, '⚠️⚠️⚠️');
        console.log('[API] Status:', nativeResponse.status);
        console.log('[API] Data type:', typeof nativeResponse.data);
        console.log('[API] Data is null?', nativeResponse.data === null);
        console.log('[API] Data is undefined?', nativeResponse.data === undefined);
        console.log('[API] Headers:', JSON.stringify(nativeResponse.headers || {}, null, 2));
      }
      
      // Redirect handling - Eğer 308 redirect alırsak, Location header'ı takip et
      if (nativeResponse.status === 308 || nativeResponse.status === 301 || nativeResponse.status === 302 || nativeResponse.status === 307) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[API] ⚠️ REDIRECT DETECTED! Status:', nativeResponse.status);
          console.log('[API] URL:', url);
          console.log('[API] Headers:', JSON.stringify(nativeResponse.headers || {}, null, 2));
        }
        
        // Headers'ı case-insensitive oku
        const headersObj = nativeResponse.headers || {};
        const allHeaderKeys = Object.keys(headersObj);
        const locationKey = allHeaderKeys.find(key => key.toLowerCase() === 'location');
        const locationHeader = locationKey ? headersObj[locationKey] : null;
        
        if (locationHeader) {
          // Location header'ı absolute URL veya relative URL olabilir
          let redirectUrl = locationHeader;
          if (locationHeader.startsWith('/')) {
            const baseUrl = getApiBaseUrl();
            redirectUrl = baseUrl + locationHeader;
          } else if (!locationHeader.startsWith('http')) {
            const baseUrl = getApiBaseUrl();
            redirectUrl = baseUrl + '/' + locationHeader;
          }
          
          if (process.env.NODE_ENV === 'development') {
            console.log('[API] Following redirect to:', redirectUrl);
          }
          
          // Redirect URL'e tekrar istek yap
          const redirectPromise = CapacitorHttp.request({
            method: method,
            url: redirectUrl,
            headers: headers,
            data: requestData,
          }).catch((error: any) => {
            if (error.message?.includes('network') || error.message?.includes('timeout') || error.message?.includes('ECONNREFUSED')) {
              throw new Error('İnternet bağlantısı hatası. Lütfen bağlantınızı kontrol edin ve tekrar deneyin.');
            }
            throw error;
          });
          
          nativeResponse = await Promise.race([redirectPromise, timeoutPromise]) as any;
          if (process.env.NODE_ENV === 'development') {
            console.log('[API] ✅ Redirect followed, new status:', nativeResponse.status);
          }
        } else {
          // Location header yoksa, URL'e trailing slash ekleyip tekrar dene
          if (!url.endsWith('/')) {
            const redirectUrl = url + '/';
            if (process.env.NODE_ENV === 'development') {
              console.log('[API] No Location header, retrying with trailing slash:', redirectUrl);
            }
            const redirectPromise = CapacitorHttp.request({
              method: method,
              url: redirectUrl,
              headers: headers,
              data: requestData,
            }).catch((error: any) => {
              if (error.message?.includes('network') || error.message?.includes('timeout') || error.message?.includes('ECONNREFUSED')) {
                throw new Error('İnternet bağlantısı hatası. Lütfen bağlantınızı kontrol edin ve tekrar deneyin.');
              }
              throw error;
            });
            nativeResponse = await Promise.race([redirectPromise, timeoutPromise]) as any;
            if (process.env.NODE_ENV === 'development') {
              console.log('[API] ✅ Retry successful, status:', nativeResponse.status);
            }
          }
        }
      }
      
      // Status kontrolü - ÖNCE
      if (nativeResponse.status === 401 && requireAuth) {
        removeToken();
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/signin';
        }
        throw new Error('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
      }

      // Response data'yı string'e çevir (her durumda)
      let rawText: string = '';
      
      if (nativeResponse.data === null || nativeResponse.data === undefined) {
        rawText = '';
      } else if (typeof nativeResponse.data === 'string') {
        rawText = nativeResponse.data;
      } else if (typeof nativeResponse.data === 'object') {
        // Object ise JSON string'e çevir
        try {
          rawText = JSON.stringify(nativeResponse.data);
        } catch (e) {
          rawText = String(nativeResponse.data);
        }
      } else {
        rawText = String(nativeResponse.data);
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[API] Raw text length:', rawText.length);
        console.log('[API] Raw text preview (first 500 chars):', rawText.substring(0, 500));
      }
      
      // ✅ CONTENT-TYPE KONTROLÜ - JSON olmayan response'ları yakala
      const headersObj = nativeResponse.headers || {};
      const contentTypeKey = Object.keys(headersObj).find(key => key.toLowerCase() === 'content-type');
      const contentType = contentTypeKey ? headersObj[contentTypeKey] : null;
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[API] Content-Type:', contentType);
      }
      
      // Content-Type kontrolü - JSON değilse hata ver
      if (contentType && !contentType.includes('application/json') && !contentType.includes('text/json')) {
        console.error('[API] ❌❌❌ NON-JSON CONTENT-TYPE DETECTED! ❌❌❌');
        console.error('[API] Content-Type:', contentType);
        console.error('[API] URL:', url);
        console.error('[API] Status:', nativeResponse.status);
        console.error('[API] Response preview:', rawText.substring(0, 500));
        
        const statusCode = nativeResponse.status;
        let error: Error;
        if (statusCode === 308 || statusCode === 301 || statusCode === 302 || statusCode === 307) {
          error = new Error('Sunucu yönlendirme hatası. Lütfen daha sonra tekrar deneyin.');
        } else if (contentType.includes('text/html')) {
          error = new Error('Sunucu yanıtı beklenmeyen formatta. Lütfen daha sonra tekrar deneyin.');
        } else {
          error = new Error('Sunucu yanıtı işlenemedi. Lütfen tekrar deneyin.');
        }
        (error as any).statusCode = statusCode;
        (error as any).rawResponse = rawText.substring(0, 2000);
        throw error;
      }
      
      // "Redirecting..." string kontrolü - Next.js redirect sayfası
      const trimmed = rawText.trim();
      if (trimmed === 'Redirecting...' || trimmed.toLowerCase().includes('redirecting')) {
        console.error('[API] ❌❌❌ REDIRECTING PAGE DETECTED! ❌❌❌');
        console.error('[API] Backend redirect sayfası döndürüyor!');
        console.error('[API] URL:', url);
        console.error('[API] Status:', nativeResponse.status);
        
        const statusCode = nativeResponse.status;
        const error = new Error('Sunucu yönlendirme hatası. Lütfen daha sonra tekrar deneyin.');
        (error as any).statusCode = statusCode;
        (error as any).rawResponse = rawText.substring(0, 2000);
        throw error;
      }
      
      // HTML kontrolü - ÇOK ERKEN VE ÇOK SIKI
      const isHtml = trimmed.length > 0 && (
        trimmed.startsWith('<!DOCTYPE') || 
        trimmed.startsWith('<!doctype') ||
        trimmed.startsWith('<HTML') ||
        trimmed.startsWith('<html') ||
        trimmed.toLowerCase().startsWith('<!doctype') ||
        (trimmed.startsWith('<') && (trimmed.includes('<html') || trimmed.includes('<HTML')))
      );
      
      if (isHtml) {
        console.error('[API] ❌❌❌ HTML DETECTED! ❌❌❌');
        console.error('[API] Backend HTML döndürüyor!');
        console.error('[API] URL:', url);
        // ⚠️ STATUS CODE - HATA DURUMUNDA BURAYA BAKIN! ⚠️
        console.error('[API] ⚠️⚠️⚠️ STATUS CODE:', nativeResponse.status, '⚠️⚠️⚠️');
        console.error('[API] Status:', nativeResponse.status);
        console.error('[API] Full HTML (first 1500 chars):', rawText.substring(0, 1500));
        
        const statusCode = nativeResponse.status;
        let error: Error;
        if (statusCode === 404) {
          error = new Error('İstenen kaynak bulunamadı.');
        } else if (statusCode === 500) {
          error = new Error('Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.');
        } else {
          error = new Error('Sunucu yanıtı beklenmeyen formatta. Lütfen daha sonra tekrar deneyin.');
        }
        (error as any).statusCode = statusCode;
        (error as any).rawResponse = rawText.substring(0, 2000); // İlk 2000 karakter
        throw error;
      }
      
      // Error status kontrolü
      if (nativeResponse.status >= 400) {
        // ⚠️ STATUS CODE - HATA DURUMUNDA BURAYA BAKIN! ⚠️
        console.error('[API] ⚠️⚠️⚠️ ERROR STATUS CODE:', nativeResponse.status, '⚠️⚠️⚠️');
        let errorMessage = 'Bir hata oluştu';
        
        if (rawText) {
          try {
            const parsed = JSON.parse(rawText);
            errorMessage = parsed.error || parsed.message || errorMessage;
            // Status kodunu mesajdan temizle
            errorMessage = errorMessage.replace(/\[HTTP \d+\]/g, '').trim();
          } catch {
            // JSON parse edilemezse, kullanıcı dostu mesaj ver
            errorMessage = 'Bir hata oluştu. Lütfen tekrar deneyin.';
          }
        }
        
        // Status koduna göre kullanıcı dostu mesaj
        const statusCode = nativeResponse.status;
        let userFriendlyMessage = errorMessage;
        
        if (statusCode === 401) {
          userFriendlyMessage = 'Oturum süresi dolmuş. Lütfen tekrar giriş yapın.';
        } else if (statusCode === 403) {
          userFriendlyMessage = 'Bu işlem için yetkiniz bulunmuyor.';
        } else if (statusCode === 404) {
          userFriendlyMessage = 'İstenen kaynak bulunamadı.';
        } else if (statusCode === 500) {
          userFriendlyMessage =
            errorMessage && errorMessage !== 'Bir hata oluştu'
              ? errorMessage
              : 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.';
        } else if (statusCode >= 500) {
          userFriendlyMessage =
            errorMessage && errorMessage !== 'Bir hata oluştu'
              ? errorMessage
              : 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.';
        } else if (statusCode >= 400) {
          // Diğer 4xx hataları için backend'den gelen mesajı kullan, yoksa genel mesaj
          userFriendlyMessage = errorMessage || 'Bir hata oluştu. Lütfen tekrar deneyin.';
        }
        
        // Error objesine status code'u ve raw response'u ekle (debug için, kullanıcıya gösterilmez)
        const error = new Error(userFriendlyMessage);
        (error as any).statusCode = statusCode;
        (error as any).rawResponse = rawText.substring(0, 2000); // İlk 2000 karakter
        throw error;
      }

      // Success - JSON parse et
      if (!rawText || rawText.trim() === '') {
        console.error('[API] Response data is empty');
        const error = new Error('Sunucudan yanıt alınamadı. Lütfen tekrar deneyin.');
        (error as any).statusCode = nativeResponse.status;
        (error as any).rawResponse = '(Boş yanıt)';
        throw error;
      }
      
      try {
        let parsedData: any;
        
        if (typeof nativeResponse.data === 'object' && nativeResponse.data !== null) {
          // Zaten object ise direkt kullan
          parsedData = nativeResponse.data;
          if (process.env.NODE_ENV === 'development') {
            console.log('[API] ✅ Using pre-parsed object');
          }
        } else {
          // String ise parse et
          parsedData = JSON.parse(rawText);
          if (process.env.NODE_ENV === 'development') {
            console.log('[API] ✅ Parsed JSON from string');
          }
        }
        
        if (process.env.NODE_ENV === 'development') {
          console.log('[API] Final parsed data:', JSON.stringify(parsedData, null, 2));
          console.log('[API] Parsed data type:', typeof parsedData);
          console.log('[API] Parsed data keys:', parsedData && typeof parsedData === 'object' ? Object.keys(parsedData) : 'N/A');
          console.log('[API] ========== RESPONSE END ==========');
        }
        return parsedData as T;
      } catch (parseError: any) {
        console.error('[API] ❌ JSON Parse Error:', parseError);
        console.error('[API] Raw text (first 1000 chars):', rawText.substring(0, 1000));
        
        // HTML olabilir (tekrar kontrol)
        if (rawText.trim().startsWith('<')) {
          const error = new Error('Sunucu yanıtı beklenmeyen formatta. Lütfen daha sonra tekrar deneyin.');
          (error as any).statusCode = nativeResponse.status;
          (error as any).rawResponse = rawText.substring(0, 2000); // İlk 2000 karakter
          throw error;
        }
        
        const error = new Error('Sunucu yanıtı işlenemedi. Lütfen tekrar deneyin.');
        (error as any).statusCode = nativeResponse.status;
        (error as any).rawResponse = rawText.substring(0, 2000); // İlk 2000 karakter
        throw error;
      }
    }

    // Web için normal fetch kullan - timeout ile (chat uzun sürebilir)
    const controller = new AbortController();
    const webTimeoutMs = url.includes("/api/chat") ? 120000 : 60000;
    const timeoutId = setTimeout(() => controller.abort(), webTimeoutMs);
    
    let response: Response;
    try {
      response = await fetch(url, {
        ...fetchOptions,
        headers,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        throw new Error('İstek zaman aşımına uğradı. Lütfen tekrar deneyin.');
      }
      throw fetchError;
    }

    // ✅ CONTENT-TYPE KONTROLÜ - JSON olmayan response'ları yakala
    const contentType = response.headers.get('content-type');
    if (process.env.NODE_ENV === 'development') {
      console.log('[API] Web fetch - Content-Type:', contentType);
    }
    
    // Content-Type kontrolü - JSON değilse hata ver
    if (contentType && !contentType.includes('application/json') && !contentType.includes('text/json')) {
      console.error('[API] ❌❌❌ NON-JSON CONTENT-TYPE DETECTED! ❌❌❌');
      console.error('[API] Content-Type:', contentType);
      console.error('[API] URL:', url);
      console.error('[API] Status:', response.status);
      
      // Response text'ini oku
      const text = await response.text();
      console.error('[API] Response preview:', text.substring(0, 500));
      
      const statusCode = response.status;
      let error: Error;
      if (statusCode === 308 || statusCode === 301 || statusCode === 302 || statusCode === 307) {
        error = new Error('Sunucu yönlendirme hatası. Lütfen daha sonra tekrar deneyin.');
      } else if (contentType.includes('text/html')) {
        error = new Error('Sunucu yanıtı beklenmeyen formatta. Lütfen daha sonra tekrar deneyin.');
      } else {
        error = new Error('Sunucu yanıtı işlenemedi. Lütfen tekrar deneyin.');
      }
      (error as any).statusCode = statusCode;
      (error as any).rawResponse = text.substring(0, 2000);
      throw error;
    }

    // Unauthorized - token geçersiz veya süresi dolmuş
    if (response.status === 401 && requireAuth) {
      removeToken();
      // Next.js'te login sayfasına yönlendir
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/signin';
      }
      const error = new Error('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
      (error as any).statusCode = 401;
      throw error;
    }

    if (!response.ok) {
      // Content-type kontrolü yapıldı, JSON parse et
      const errorData = await response.json().catch(async () => {
        // JSON parse edilemezse text olarak oku
        const text = await response.text();
        // "Redirecting..." kontrolü
        if (text.trim() === 'Redirecting...' || text.toLowerCase().includes('redirecting')) {
          throw new Error('Sunucu yönlendirme hatası. Lütfen daha sonra tekrar deneyin.');
        }
        return { error: text.substring(0, 200) || 'Bir hata oluştu.' };
      });
      // Status kodunu mesajdan temizle
      let errorMsg = errorData.error || 'Bir hata oluştu.';
      errorMsg = errorMsg.replace(/\[HTTP \d+\]/g, '').trim();
      
      // Status koduna göre kullanıcı dostu mesaj
      let userFriendlyMessage = errorMsg;
      if (response.status === 401) {
        userFriendlyMessage = 'Oturum süresi dolmuş. Lütfen tekrar giriş yapın.';
      } else if (response.status === 403) {
        userFriendlyMessage = 'Bu işlem için yetkiniz bulunmuyor.';
      } else if (response.status === 404) {
        userFriendlyMessage = 'İstenen kaynak bulunamadı.';
      } else if (response.status >= 500) {
        userFriendlyMessage = 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.';
      }
      
      const error = new Error(userFriendlyMessage);
      (error as any).statusCode = response.status;
      (error as any).rawResponse = typeof errorData === 'string' ? errorData : JSON.stringify(errorData, null, 2).substring(0, 2000);
      throw error;
    }

    return await response.json();
        } catch (error: any) {
          console.error('[API] Request Error:', error);
          console.error('[API] Error details:', {
            message: error.message,
            url: url,
            isCapacitor: isCapacitor,
            baseUrl: getApiBaseUrl(),
            statusCode: error.statusCode
          });
          
          // Eğer error'da statusCode varsa koru, yoksa ekle
          if (!error.statusCode) {
            // Daha açıklayıcı hata mesajları
            if (error.message?.includes('timeout')) {
              const newError = new Error('İstek zaman aşımına uğradı. Lütfen tekrar deneyin.');
              (newError as any).statusCode = 'TIMEOUT';
              throw newError;
            } else if (error.message?.includes('network') || error.message?.includes('ECONNREFUSED')) {
              const newError = new Error('İnternet bağlantısı hatası. Lütfen bağlantınızı kontrol edin.');
              (newError as any).statusCode = 'NETWORK_ERROR';
              throw newError;
            } else if (error.message?.includes('Failed to fetch')) {
              const newError = new Error('Sunucuya bağlanılamıyor. Lütfen daha sonra tekrar deneyin.');
              (newError as any).statusCode = 'FETCH_ERROR';
              throw newError;
            }
          }
          
          throw error;
        }
}

// API Methods
export const api = {
  // GET request
  get: <T = any>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),

  // POST request
  post: <T = any>(endpoint: string, data?: any, options?: RequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  // PUT request
  put: <T = any>(endpoint: string, data?: any, options?: RequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),

  // DELETE request
  delete: <T = any>(endpoint: string, data?: any, options?: RequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'DELETE',
      body: data?.body ? data.body : (data ? JSON.stringify(data) : undefined),
    }),

  // PATCH request
  patch: <T = any>(endpoint: string, data?: any, options?: RequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),
};

// Authentication API
export const authApi = {
  login: async (email: string, password: string) => {
    try {
      const isCapacitor = isCapacitorPlatform();
      const baseUrl = getApiBaseUrl();
      
      // FARKLI YÖNTEM: Capacitor için özel login implementasyonu
      if (isCapacitor) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[AuthAPI] Using Capacitor-specific login method');
        }
        
        // URL'i her zaman trailing slash ile oluştur
        let loginUrl = `${baseUrl}/api/login/`;
        
        // 🔴🔴🔴 KRİTİK DEBUG LOG - LOGIN URL'Yİ NET GÖR 🔴🔴🔴
        if (process.env.NODE_ENV === 'development') {
          console.log('[API DEBUG] ========== LOGIN URL DEBUG ==========');
          console.log('[API DEBUG] Base URL:', baseUrl);
          console.log('[API DEBUG] Login URL:', loginUrl);
          console.log('[API DEBUG] URL starts with http?', loginUrl.startsWith('http'));
          console.log('[API DEBUG] URL includes /api/login/?', loginUrl.includes('/api/login/'));
          console.log('[API DEBUG] Full constructed URL:', loginUrl);
          console.log('[API DEBUG] ======================================');
        }
        
        // İlk deneme
        let attempt = 0;
        const maxAttempts = 2;
        
        while (attempt < maxAttempts) {
          attempt++;
          if (process.env.NODE_ENV === 'development') {
            console.log(`[AuthAPI] Login attempt ${attempt}/${maxAttempts} to: ${loginUrl}`);
          }
          
          try {
            const timeoutPromise = new Promise<never>((_, reject) => {
              setTimeout(() => reject(new Error('Request timeout')), 60000);
            });
            
            const requestPromise = CapacitorHttp.request({
              method: 'POST',
              url: loginUrl,
              headers: {
                'Content-Type': 'application/json',
              },
              data: { email, password },
            }).catch((error: any) => {
              if (error.message?.includes('network') || error.message?.includes('timeout')) {
                throw new Error('İnternet bağlantısı hatası. Lütfen bağlantınızı kontrol edin.');
              }
              throw error;
            });
            
            const nativeResponse = await Promise.race([requestPromise, timeoutPromise]) as any;
            
            if (process.env.NODE_ENV === 'development') {
              console.log('[AuthAPI] Response status:', nativeResponse.status);
              console.log('[AuthAPI] Response data type:', typeof nativeResponse.data);
            }
            
            // Redirect kontrolü
            if (nativeResponse.status === 308 || nativeResponse.status === 301 || nativeResponse.status === 302 || nativeResponse.status === 307) {
              const headersObj = nativeResponse.headers || {};
              const locationKey = Object.keys(headersObj).find(key => key.toLowerCase() === 'location');
              const locationHeader = locationKey ? headersObj[locationKey] : null;
              
              if (locationHeader && attempt < maxAttempts) {
                let redirectUrl = locationHeader;
                if (locationHeader.startsWith('/')) {
                  redirectUrl = baseUrl + locationHeader;
                } else if (!locationHeader.startsWith('http')) {
                  redirectUrl = baseUrl + '/' + locationHeader;
                }
                if (process.env.NODE_ENV === 'development') {
                  console.log('[AuthAPI] Redirect detected, following to:', redirectUrl);
                }
                loginUrl = redirectUrl;
                continue; // Redirect'i takip et
              }
            }
            
            // Response parse et
            let responseData: any;
            if (typeof nativeResponse.data === 'string') {
              try {
                responseData = JSON.parse(nativeResponse.data);
              } catch (e) {
                // JSON değilse, hata olabilir
                if (nativeResponse.status >= 400) {
                  throw new Error(`HTTP ${nativeResponse.status}: ${nativeResponse.data}`);
                }
                throw new Error('Geçersiz yanıt formatı');
              }
            } else if (typeof nativeResponse.data === 'object' && nativeResponse.data !== null) {
              responseData = nativeResponse.data;
            } else {
              throw new Error('Geçersiz yanıt formatı');
            }
            
            // Hata kontrolü
            if (nativeResponse.status >= 400) {
              const errorMsg = responseData.error || responseData.message || `HTTP ${nativeResponse.status} hatası`;
              const error = new Error(errorMsg);
              (error as any).statusCode = nativeResponse.status;
              (error as any).rawResponse = JSON.stringify(responseData, null, 2);
              throw error;
            }
            
            // Başarılı yanıt
            if (!responseData.token || !responseData.user) {
              throw new Error(responseData.error || 'Giriş başarısız. Email ve şifrenizi kontrol edin.');
            }
            
            // Token ve user bilgisini kaydet
            setToken(responseData.token);
            if (typeof window !== 'undefined') {
              localStorage.setItem('user', JSON.stringify(responseData.user));
            }
            
            if (process.env.NODE_ENV === 'development') {
              console.log('[AuthAPI] ✅ Login successful');
            }
            return { token: responseData.token, user: responseData.user };
            
          } catch (error: any) {
            // Son deneme değilse ve redirect hatası ise tekrar dene
            if (attempt < maxAttempts && (error.message?.includes('redirect') || error.message?.includes('308'))) {
              // URL'e trailing slash ekle ve tekrar dene
              if (!loginUrl.endsWith('/')) {
                loginUrl = loginUrl + '/';
                if (process.env.NODE_ENV === 'development') {
                  console.log('[AuthAPI] Retrying with trailing slash:', loginUrl);
                }
                continue;
              }
            }
            throw error;
          }
        }
        
        throw new Error('Login başarısız. Lütfen tekrar deneyin.');
      }
      
      // Web için normal API çağrısı
      // 🔴🔴🔌 KRİTİK: TRAILING SLASH GARANTİLİ ENDPOINT 🔴🔴🔌
      // Endpoint'in sonunda MUTLAKA trailing slash olmalı
      const webLoginEndpoint = '/api/login/'; // ✅ Trailing slash GARANTİLİ
      
      // 🔴🔴🔌 KRİTİK DEBUG LOG - WEB LOGIN URL 🔴🔴🔌
      const webBaseUrl = getApiBaseUrl();
      const webLoginUrl = `${webBaseUrl}${webLoginEndpoint}`;
      if (process.env.NODE_ENV === 'development') {
        console.log('[API DEBUG] ========== WEB LOGIN URL DEBUG ==========');
        console.log('[API DEBUG] Web Base URL:', webBaseUrl);
        console.log('[API DEBUG] Web Login Endpoint:', webLoginEndpoint);
        console.log('[API DEBUG] Web Login URL:', webLoginUrl);
        console.log('[API DEBUG] URL ends with /?', webLoginUrl.endsWith('/'));
        console.log('[API DEBUG] ======================================');
      }
      
      // ✅ Trailing slash GARANTİLİ endpoint kullan
      const response = await api.post<{ token: string; user: any }>(
        webLoginEndpoint, // ✅ /api/login/ - trailing slash GARANTİLİ
        { email, password },
        { requireAuth: false }
      );
      
      // Response direkt { token: "...", user: {...} } formatında gelir
      if (process.env.NODE_ENV === 'development') {
        console.log('[AuthAPI] Login response type:', typeof response);
        console.log('[AuthAPI] Login response:', response);
      }
      
      if (!response || typeof response !== 'object') {
        console.error('[AuthAPI] ❌ Invalid response format:', response);
        const error = new Error('Sunucu yanıtı beklenmeyen formatta. Lütfen tekrar deneyin.');
        (error as any).statusCode = 'INVALID_RESPONSE';
        (error as any).rawResponse = JSON.stringify(response, null, 2).substring(0, 2000);
        throw error;
      }
      
      const token = response.token;
      const user = response.user;
      
      if (!token || typeof token !== 'string') {
        // Backend'den hata mesajı gelmiş olabilir
        const errorMsg = (response as any).error || 'Giriş başarısız. Email ve şifrenizi kontrol edin.';
        const error = new Error(errorMsg);
        // Eğer response'da statusCode varsa ekle
        if ((response as any).statusCode) {
          (error as any).statusCode = (response as any).statusCode;
        } else {
          (error as any).statusCode = 'NO_TOKEN';
        }
        // Raw response'u da ekle
        (error as any).rawResponse = JSON.stringify(response, null, 2).substring(0, 2000);
        throw error;
      }
      
      // Token ve user bilgisini kaydet
      setToken(token);
      if (user && typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      return { token, user };
    } catch (error: any) {
      // Hata mesajını kullanıcıya ilet, status code ve raw response'u koru
      console.error('[AuthAPI] Login error:', error);
      console.error('[AuthAPI] Error statusCode:', error.statusCode);
      console.error('[AuthAPI] Error rawResponse:', error.rawResponse);
      
      // Eğer error'da zaten statusCode ve rawResponse varsa, olduğu gibi ilet
      if (error.statusCode || error.rawResponse) {
        // Status code ve raw response'u koru
        if (!error.statusCode) {
          (error as any).statusCode = 'UNKNOWN_ERROR';
        }
        if (!error.rawResponse) {
          (error as any).rawResponse = error.message || '(Yanıt yok)';
        }
        throw error;
      } else {
        // Status code yoksa ekle
        const newError = new Error(error.message || 'Giriş yapılırken bir hata oluştu.');
        (newError as any).statusCode = error.statusCode || 'UNKNOWN_ERROR';
        (newError as any).rawResponse = error.message || '(Yanıt yok)';
        throw newError;
      }
    }
  },

  register: async (name: string, email: string, password: string, teamNumber: string) => {
    // ✅ Trailing slash GARANTİLİ endpoint
    return api.post('/api/auth/register/', { name, email, password, teamNumber }, { requireAuth: false });
  },

  verifyTeam: async (teamNumber: string) => {
    // ✅ Trailing slash GARANTİLİ endpoint
    const data = await api.post<{ valid: boolean; team?: { name: string; teamNumber: string }; error?: string }>('/api/auth/verify-team/', { teamNumber }, { requireAuth: false });
    // Backend'den gelen formatı client formatına çevir
    return {
      isValid: data.valid,
      valid: data.valid,
      teamName: data.team?.name,
      team: data.team,
      error: data.error,
    };
  },

  logout: () => {
    removeToken();
  },
};
