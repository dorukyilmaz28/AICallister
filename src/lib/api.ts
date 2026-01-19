import { Capacitor } from '@capacitor/core';
import { CapacitorHttp } from '@capacitor/core';

// API Base URL - Environment variable'dan alınır
// Development: http://localhost:3001
// Production: https://www.callisterai.com (www ile - CORS için gerekli)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://www.callisterai.com';

// Capacitor'da backend URL'ini kullan (static export'ta API route'lar çalışmaz)
function getApiBaseUrl(): string {
  if (typeof window === 'undefined') return API_BASE_URL;
  
  // Capacitor'da https://localhost kullanılıyorsa backend'e yönlendir
  const isCapacitor = Capacitor.isNativePlatform() || 
                      (window.location.hostname === 'localhost' && window.location.protocol === 'https:');
  
  if (isCapacitor) {
    // Capacitor'da HER ZAMAN production URL'i kullan (localhost/local IP çalışmaz)
    // www.callisterai.com üzerinden çalışıyoruz, API de aynı domain'de olmalı
    const productionUrl = 'https://www.callisterai.com';
    
    // Eğer API_BASE_URL localhost, local IP, veya HTTP ise, production URL kullan
    const isLocalUrl = API_BASE_URL.includes('localhost') || 
                       API_BASE_URL.includes('127.0.0.1') || 
                       API_BASE_URL.startsWith('http://') || // HTTP reddet (HTTPS gerekli)
                       API_BASE_URL.match(/192\.168\.\d+\.\d+/) || // Local IP
                       API_BASE_URL.match(/10\.\d+\.\d+\.\d+/) || // Private IP
                       API_BASE_URL.match(/172\.(1[6-9]|2\d|3[01])\.\d+\.\d+/); // Private IP range
    
    // Capacitor'da HER ZAMAN production URL kullan (güvenlik ve CORS için)
    const url = productionUrl;
    
    console.log('[API] Capacitor detected, forcing production URL:', url);
    console.log('[API] Original API_BASE_URL was:', API_BASE_URL);
    console.log('[API] Is local URL?', isLocalUrl);
    return url;
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
  }

  // URL oluştur - endpoint zaten http ile başlıyorsa olduğu gibi kullan
  // Aksi halde base URL ekle
  const baseUrl = getApiBaseUrl();
  const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;

  // DEBUG: URL'yi log'la
  console.log('[API] Making request to:', url);
  console.log('[API] Base URL:', baseUrl);
  console.log('[API] Endpoint:', endpoint);

  // Capacitor'da native HTTP kullan (mixed content sorununu çözer)
  const isCapacitor = isCapacitorPlatform();
  
  console.log('[API] Is Capacitor:', isCapacitor);

  try {
    // Capacitor'da tüm istekler için native HTTP kullan (mixed content ve CORS sorunlarını çözer)
    if (isCapacitor) {
      // Timeout ekle (60 saniye - daha uzun süre)
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout: API isteği 60 saniye içinde tamamlanamadı. İnternet bağlantınızı kontrol edin.')), 60000);
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
      
      const nativeResponse = await Promise.race([requestPromise, timeoutPromise]) as any;
      
      // DEBUG: Response'u log'la
      console.log('[API] Response status:', nativeResponse.status);
      console.log('[API] Response data type:', typeof nativeResponse.data);
      console.log('[API] Response headers:', nativeResponse.headers);
      
      // Response data'yı string olarak log'la (HTML kontrolü için)
      const responseString = typeof nativeResponse.data === 'string' 
        ? nativeResponse.data 
        : JSON.stringify(nativeResponse.data);
      console.log('[API] Response data (first 500 chars):', responseString.substring(0, 500));
      
      // HTML kontrolü
      if (typeof responseString === 'string' && responseString.trim().startsWith('<!DOCTYPE') || responseString.trim().startsWith('<html')) {
        console.error('[API] Backend HTML döndürüyor! Endpoint çalışmıyor.');
        throw new Error('Backend endpoint bulunamadı. Vercel\'de deploy edilmiş mi kontrol edin.');
      }
      
      // Status kontrolü
      if (nativeResponse.status === 401 && requireAuth) {
        removeToken();
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/signin';
        }
        throw new Error('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
      }

      if (nativeResponse.status >= 400) {
        let errorMessage = `HTTP ${nativeResponse.status}`;
        if (nativeResponse.data) {
          if (typeof nativeResponse.data === 'object') {
            errorMessage = nativeResponse.data.error || errorMessage;
          } else if (typeof nativeResponse.data === 'string') {
            // String response'u log'la
            console.log('[API] Error response (string):', nativeResponse.data);
            try {
              const parsed = JSON.parse(nativeResponse.data);
              errorMessage = parsed.error || errorMessage;
            } catch {
              errorMessage = nativeResponse.data;
            }
          }
        }
        throw new Error(errorMessage);
      }

      // CapacitorHttp response: { status: number, data: any, headers: any }
      // data otomatik parse edilmiş JSON objesi olmalı
      if (!nativeResponse.data) {
        console.error('[API] Response data is null/undefined');
        throw new Error('API yanıtı boş geldi. Backend çalışmıyor olabilir.');
      }
      
      // Data'nın tipini kontrol et ve log'la
      if (typeof nativeResponse.data === 'string') {
        console.log('[API] Response data is string, parsing...');
        try {
          const parsed = JSON.parse(nativeResponse.data);
          console.log('[API] Parsed data:', parsed);
          return parsed as T;
        } catch (e) {
          console.error('[API] Failed to parse string response:', e);
          console.error('[API] Raw string:', nativeResponse.data);
          throw new Error('API yanıtı geçersiz format. Backend HTML döndürüyor olabilir.');
        }
      }
      
      console.log('[API] Returning response data:', nativeResponse.data);
      return nativeResponse.data as T;
    }

    // Web için normal fetch kullan
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    // Unauthorized - token geçersiz veya süresi dolmuş
    if (response.status === 401 && requireAuth) {
      removeToken();
      // Next.js'te login sayfasına yönlendir
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/signin';
      }
      throw new Error('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Bir hata oluştu.' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('[API] Request Error:', error);
    console.error('[API] Error details:', {
      message: error.message,
      url: url,
      isCapacitor: isCapacitor,
      baseUrl: getApiBaseUrl()
    });
    
    // Daha açıklayıcı hata mesajları
    if (error.message?.includes('timeout')) {
      throw new Error('İstek zaman aşımına uğradı. Lütfen tekrar deneyin.');
    } else if (error.message?.includes('network') || error.message?.includes('ECONNREFUSED')) {
      throw new Error('İnternet bağlantısı hatası. Lütfen bağlantınızı kontrol edin.');
    } else if (error.message?.includes('Failed to fetch')) {
      throw new Error('Sunucuya bağlanılamıyor. Lütfen daha sonra tekrar deneyin.');
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
  delete: <T = any>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),

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
      const response = await api.post<{ token: string; user: any }>(
        '/api/login',
        { email, password },
        { requireAuth: false }
      );
      
      // Response direkt { token: "...", user: {...} } formatında gelir
      if (!response || typeof response !== 'object') {
        throw new Error('API yanıtı geçersiz.');
      }
      
      const token = response.token;
      const user = response.user;
      
      if (!token || typeof token !== 'string') {
        // Backend'den hata mesajı gelmiş olabilir
        const errorMsg = (response as any).error || 'Giriş başarısız. Email ve şifrenizi kontrol edin.';
        throw new Error(errorMsg);
      }
      
      // Token ve user bilgisini kaydet
      setToken(token);
      if (user && typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      return { token, user };
    } catch (error: any) {
      // Hata mesajını kullanıcıya ilet
      throw new Error(error.message || 'Giriş yapılırken bir hata oluştu.');
    }
  },

  register: async (name: string, email: string, password: string, teamNumber: string) => {
    return api.post('/api/auth/register', { name, email, password, teamNumber }, { requireAuth: false });
  },

  verifyTeam: async (teamNumber: string) => {
    const data = await api.post<{ valid: boolean; team?: { name: string; teamNumber: string }; error?: string }>('/api/auth/verify-team', { teamNumber }, { requireAuth: false });
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
