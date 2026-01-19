"use client";

import { useEffect } from 'react';

export function NotificationInit() {
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    let timeoutId: NodeJS.Timeout | null = null;

    const initNotifications = async () => {
      try {
        // Double-check Capacitor is available with try-catch
        let Capacitor: any;
        try {
          const capacitorModule = await import('@capacitor/core');
          Capacitor = capacitorModule.Capacitor;
          
          // Verify Capacitor is truly ready
          if (!Capacitor || !Capacitor.isNativePlatform()) {
            return;
          }

          // Additional check: ensure window.Capacitor is available
          if (!(window as any).Capacitor) {
            return;
          }
        } catch (err) {
          // Capacitor not available, skip silently
          return;
        }

        // Additional delay to ensure WebView is fully initialized
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Check if user is authenticated
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        
        if (!token || !userStr) return;

        // Now safely import notification functions
        // Push notifications geçici olarak devre dışı (Firebase yapılandırması eksik)
        // Sadece local notifications kullanıyoruz
        try {
          const { requestNotificationPermissions, checkNotificationPermissions } = await import('@/lib/notifications');

          // Check current permissions with error handling
          let hasPermission;
          try {
            hasPermission = await checkNotificationPermissions();
          } catch (err) {
            console.warn('Failed to check notification permissions:', err);
            return;
          }
          
          // If not granted, request permissions (sadece local notifications için)
          if (!hasPermission.granted && !hasPermission.denied) {
            try {
              await requestNotificationPermissions();
              // Push token kaydı atlandı - Firebase yapılandırması eksik
            } catch (err) {
              console.warn('Failed to request notification permissions:', err);
            }
          }
          
          // Push notifications devre dışı - Firebase yapılandırması gerekiyor
          // Push token kaydı yapılmıyor
        } catch (err) {
          // Notification library yüklenemezse sessizce devam et
          console.warn('Notification library not available:', err);
        }
      } catch (error) {
        // Silently fail - notifications are not critical for app functionality
        console.warn('Notification initialization skipped:', error);
      }
    };

    // Wait for page to be fully loaded, then check if Capacitor
    const checkAndInit = () => {
      timeoutId = setTimeout(async () => {
        try {
          const { Capacitor } = await import('@capacitor/core');
          if (Capacitor.isNativePlatform()) {
            // Additional delay before initialization
            setTimeout(initNotifications, 5000);
          }
        } catch {
          // Not Capacitor or not ready, skip silently
        }
      }, 2000);
    };

    if (document.readyState === 'complete') {
      checkAndInit();
    } else {
      window.addEventListener('load', checkAndInit, { once: true });
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  return null; // This component doesn't render anything
}
