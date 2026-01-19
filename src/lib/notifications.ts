/**
 * Push Notifications Service
 * Handles registration and notification display for team chat messages
 */

import { Capacitor } from '@capacitor/core';

// Dynamic imports to avoid SSR issues - will be imported on-demand

export interface NotificationPermission {
  granted: boolean;
  denied: boolean;
}

/**
 * Request notification permissions and register for push notifications
 */
export async function requestNotificationPermissions(): Promise<NotificationPermission> {
  if (!Capacitor.isNativePlatform()) {
    // Web platform - use browser notifications
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return {
        granted: permission === 'granted',
        denied: permission === 'denied',
      };
    }
    return { granted: false, denied: true };
  }

  // Native platform - use Capacitor Push Notifications
  // Push notifications Firebase gerektiriyor - eğer yapılandırılmamışsa local notifications kullan
  try {
    // Dynamic import to avoid SSR issues
    const { PushNotifications: PushNotificationsModule } = await import('@capacitor/push-notifications');
    
    // Request permissions
    const permissionStatus = await PushNotificationsModule.requestPermissions();
    
    if (permissionStatus.receive === 'granted') {
      try {
        // Register for push notifications (Firebase yapılandırması gerekiyor)
        await PushNotificationsModule.register();
        
        // Setup listeners
        setupNotificationListeners(PushNotificationsModule);
        
        return {
          granted: true,
          denied: false,
        };
      } catch (registerError) {
        // Firebase yapılandırması eksik olabilir - local notifications kullan
        console.warn('Push notifications registration failed (Firebase may not be configured). Using local notifications only:', registerError);
        return {
          granted: true, // Permission granted, but push notifications not available
          denied: false,
        };
      }
    }
    
    return {
      granted: false,
      denied: permissionStatus.receive === 'denied',
    };
  } catch (error) {
    // Push notifications plugin yüklenemezse local notifications kullan
    console.warn('Push notifications not available. Using local notifications only:', error);
    return { granted: false, denied: false };
  }
}

/**
 * Setup notification event listeners
 */
async function setupNotificationListeners(PushNotificationsModule: any) {
  // Handle registration
  PushNotificationsModule.addListener('registration', (token: { value: string }) => {
    console.log('Push registration success, token:', token.value);
    // Store token in localStorage or send to backend
    if (typeof window !== 'undefined') {
      localStorage.setItem('pushToken', token.value);
    }
  });

  // Handle registration errors
  PushNotificationsModule.addListener('registrationError', (error: any) => {
    console.error('Push registration error:', error);
  });

  // Handle push notifications received while app is open
  PushNotificationsModule.addListener('pushNotificationReceived', (notification: any) => {
    console.log('Push notification received:', notification);
    showLocalNotification(notification);
  });

  // Handle push notification actions
  PushNotificationsModule.addListener('pushNotificationActionPerformed', (notification: any) => {
    console.log('Push notification action performed:', notification);
    // Handle notification tap - navigate to chat
    if (typeof window !== 'undefined') {
      const data = notification.notification.data;
      if (data?.conversationId) {
        window.location.href = `/chat?conversation=${data.conversationId}`;
      } else {
        window.location.href = '/chat';
      }
    }
  });
}

/**
 * Show a local notification (for when app is in foreground)
 */
async function showLocalNotification(pushNotification: any) {
  if (!Capacitor.isNativePlatform()) {
    // Web platform
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(pushNotification.title || 'New Message', {
        body: pushNotification.body || '',
        icon: '/8f28b76859c1479d839d270409be3586.jpg',
        badge: '/8f28b76859c1479d839d270409be3586.jpg',
        tag: pushNotification.data?.conversationId || 'chat',
        requireInteraction: false,
      });
    }
    return;
  }

  // Native platform - use Local Notifications
  try {
    const { LocalNotifications: LocalNotificationsModule } = await import('@capacitor/local-notifications');
    const hasPermission = await LocalNotificationsModule.checkPermissions();
    if (hasPermission.display === 'granted') {
      await LocalNotificationsModule.schedule({
        notifications: [
          {
            title: pushNotification.title || 'New Message',
            body: pushNotification.body || '',
            id: Date.now(),
            schedule: { at: new Date() },
            sound: 'default',
            attachments: undefined,
            actionTypeId: '',
            extra: pushNotification.data || {},
          },
        ],
      });
    }
  } catch (error) {
    console.error('Error showing local notification:', error);
  }
}

/**
 * Check current notification permission status
 */
export async function checkNotificationPermissions(): Promise<NotificationPermission> {
  if (!Capacitor.isNativePlatform()) {
    if ('Notification' in window) {
      return {
        granted: Notification.permission === 'granted',
        denied: Notification.permission === 'denied',
      };
    }
    return { granted: false, denied: true };
  }

  try {
    const { PushNotifications: PushNotificationsModule } = await import('@capacitor/push-notifications');
    const status = await PushNotificationsModule.checkPermissions();
    return {
      granted: status.receive === 'granted',
      denied: status.receive === 'denied',
    };
  } catch (error) {
    // Push notifications plugin yüklenemezse local notifications kullan
    console.warn('Push notifications not available. Checking local notifications instead:', error);
    try {
      const { LocalNotifications: LocalNotificationsModule } = await import('@capacitor/local-notifications');
      const localStatus = await LocalNotificationsModule.checkPermissions();
      return {
        granted: localStatus.display === 'granted',
        denied: localStatus.display === 'denied',
      };
    } catch (localError) {
      console.warn('Local notifications also not available:', localError);
      return { granted: false, denied: false };
    }
  }
}

/**
 * Get stored push notification token
 */
export function getPushToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('pushToken');
}

/**
 * Send push token to backend
 */
export async function registerPushToken(token: string, userId: string) {
  try {
    const { api } = await import('./api');
    await api.post('/api/notifications/register', {
      token,
      userId,
      platform: Capacitor.getPlatform(),
    });
  } catch (error) {
    console.error('Error registering push token:', error);
  }
}
