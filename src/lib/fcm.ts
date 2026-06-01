import { getToken, isSupported, onMessage } from "firebase/messaging";
import api from "@/lib/axios";
import { firebaseApp } from "@/lib/firebase";

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY ?? "";
const FCM_ENDPOINT = import.meta.env.VITE_FCM_TOKEN_ENDPOINT ?? "";
let foregroundUnsubscribe: (() => void) | null = null;

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

export async function getFcmToken({
  requestPermission = true,
}: GetFcmTokenOptions = {}): Promise<string | null> {
  if (!VAPID_KEY) {
    console.error("❌ Missing VITE_FIREBASE_VAPID_KEY; skipping FCM token.");
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

  try {
    console.log("Checking notification permission...");
    const permission = requestPermission
      ? await Notification.requestPermission()
      : Notification.permission;
    console.log("Permission result:", permission);

    if (permission !== "granted") {
      console.error(
        "❌ Notification permission denied. Current state:",
        Notification.permission,
      );
      return null;
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
      return token;
    } else {
      console.error("❌ Failed to get FCM token - no token returned");
      return null;
    }
  } catch (error) {
    console.error("❌ Error getting FCM token:", error);
    return null;
  }
}

export async function sendFcmToken(
  context: "login" | "register",
): Promise<void> {
  try {
    console.log("📤 Getting FCM token for context:", context);
    const token = await getFcmToken();
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
