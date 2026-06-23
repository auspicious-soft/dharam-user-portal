import { getToken, isSupported, onMessage } from "firebase/messaging";
import api from "@/lib/axios";
import { firebaseApp } from "@/lib/firebase";

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY ?? "";
const FCM_ENDPOINT = import.meta.env.VITE_FCM_TOKEN_ENDPOINT ?? "";
let foregroundUnsubscribe: (() => void) | null = null;
let cachedFcmToken: string | null = null;
let fcmTokenPromise: Promise<string | null> | null = null;
let fcmTokenPromiseRequestsPermission = false;

// Log config on initialization
if (!VAPID_KEY) {
  console.warn("⚠️ VITE_FIREBASE_VAPID_KEY is not set");
} else {
  console.log("✅ VITE_FIREBASE_VAPID_KEY is configured");
}

async function getMessagingSafe() {
  if (!(await isSupported())) {
    return null;
  }

  const { getMessaging } = await import("firebase/messaging");
  return getMessaging(firebaseApp);
}

type GetFcmTokenOptions = {
  requestPermission?: boolean;
};

/**
 * Request notification permission explicitly
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!("Notification" in window)) {
    console.error("❌ Notifications not supported in this browser");
    return "denied";
  }

  if (Notification.permission === "granted") {
    console.log("✅ Notification permission already granted");
    return "granted";
  }

  if (Notification.permission === "denied") {
    console.warn("⚠️ Notification permission was denied by user");
    return "denied";
  }

  console.log("📋 Requesting notification permission...");
  const permission = await Notification.requestPermission();
  console.log("Permission result:", permission);
  return permission;
}

export async function getFcmToken({
  requestPermission = true,
}: GetFcmTokenOptions = {}): Promise<string | null> {
  // Return cached token if available
  if (cachedFcmToken) {
    console.log("✅ Returning cached FCM token");
    return cachedFcmToken;
  }

  if (fcmTokenPromise) {
    const canReusePromise =
      fcmTokenPromiseRequestsPermission ||
      !requestPermission ||
      Notification.permission === "granted";

    if (canReusePromise) {
      console.log("⏳ Waiting for in-progress FCM token fetch...");
      return fcmTokenPromise;
    }
  }

  const tokenPromise = (async () => {
    try {
      console.log("🔍 Starting FCM token fetch process...");

      if (!VAPID_KEY) {
        console.error(
          "❌ Missing VITE_FIREBASE_VAPID_KEY; skipping FCM token.",
        );
        return null;
      }

      if (!("Notification" in window)) {
        console.error("❌ Notifications not supported in this browser");
        return null;
      }

      if (!("serviceWorker" in navigator)) {
        console.error("❌ Service Workers not supported in this browser");
        return null;
      }

      // Request permission if needed
      if (requestPermission) {
        const permission = await requestNotificationPermission();
        if (permission !== "granted") {
          console.error(
            "❌ Notification permission not granted. Permission state:",
            permission,
          );
          return null;
        }
      } else {
        // Check current permission
        const currentPermission = Notification.permission;
        if (currentPermission !== "granted") {
          console.error(
            "❌ Notification permission not granted. Current state:",
            currentPermission,
          );
          return null;
        }
      }

      const messaging = await getMessagingSafe();
      if (!messaging) {
        console.error("❌ Firebase Messaging not supported in this browser");
        return null;
      }

      console.log("📝 Registering service worker...");
      const registration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js",
      );
      console.log("✅ Service worker registered:", registration);

      console.log("🎫 Requesting FCM token...");
      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: registration,
      });

      if (token) {
        console.log("✅ FCM Token obtained:", token.substring(0, 50) + "...");
        cachedFcmToken = token;
        return token;
      } else {
        console.error("❌ Failed to get FCM token - no token returned");
        return null;
      }
    } catch (error) {
      console.error("❌ Error getting FCM token:", error);
      return null;
    } finally {
      // Always clear the promise cache so the next call can retry
      if (fcmTokenPromise === tokenPromise) {
        fcmTokenPromise = null;
        fcmTokenPromiseRequestsPermission = false;
      }
    }
  })();

  fcmTokenPromise = tokenPromise;
  fcmTokenPromiseRequestsPermission = requestPermission;

  return fcmTokenPromise;
}

export async function sendFcmToken(
  context: "login" | "register",
): Promise<void> {
  try {
    console.log("📤 Getting FCM token for context:", context);
    // Explicitly request permission during login/register
    const token = await getFcmToken({ requestPermission: true });
    if (!token) {
      console.warn("⚠️ No FCM token available to send");
      return;
    }

    if (!FCM_ENDPOINT) {
      console.error(
        "❌ Missing VITE_FCM_TOKEN_ENDPOINT; FCM token not sent to server.",
      );
      return;
    }

    console.log("📡 Sending FCM token to backend...");
    const response = await api.post(FCM_ENDPOINT, { token, context });
    console.log("✅ FCM token sent successfully. Response:", response.data);
  } catch (error) {
    console.error("❌ Failed to send FCM token", error);
  }
}

/**
 * Initialize FCM token early in the app lifecycle
 * This ensures the token is ready when the user logs in
 */
export async function initializeFcmToken(): Promise<void> {
  try {
    console.log("🚀 Initializing FCM token on app startup...");
    const token = await getFcmToken({ requestPermission: false });
    if (token) {
      console.log("✅ FCM token initialized successfully");
    } else {
      console.log(
        "⚠️ FCM token not available on startup (may not have permission yet)",
      );
    }
  } catch (error) {
    console.error("⚠️ Error initializing FCM token:", error);
  }
}

export async function setupForegroundNotifications(): Promise<() => void> {
  if (foregroundUnsubscribe) {
    return foregroundUnsubscribe;
  }

  const messaging = await getMessagingSafe();
  if (!messaging) {
    return () => {};
  }

  foregroundUnsubscribe = onMessage(messaging, async (payload) => {
    console.log("📬 Foreground notification received:", payload);

    const notification = payload.notification;
    const data = payload.data;

    // Support both notification and data-only messages
    const title = notification?.title || data?.title || "New Message";
    const body =
      notification?.body || data?.body || "You have a new notification";
    const icon = notification?.icon || data?.icon || "/favicon.ico";

    const options: NotificationOptions = {
      body,
      icon,
      badge: data?.badge,
      tag: data?.tag || "notification",
      requireInteraction: data?.requireInteraction === "true",
    };

    if (!("Notification" in window) || Notification.permission !== "granted") {
      console.warn("⚠️ Notification permission not granted");
      return;
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration(
        "/firebase-messaging-sw.js",
      );

      if (registration) {
        await registration.showNotification(title, options);
        return;
      }

      new Notification(title, options);
    } catch (error) {
      console.error("❌ Failed to show notification:", error);
    }
  });

  return foregroundUnsubscribe;
}
