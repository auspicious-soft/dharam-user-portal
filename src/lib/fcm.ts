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

export async function getFcmToken(): Promise<string | null> {
  if (!VAPID_KEY) {
    console.warn("Missing VITE_FIREBASE_VAPID_KEY; skipping FCM token.");
    return null;
  }

  if (!("Notification" in window)) {
    return null;
  }

  if (!("serviceWorker" in navigator)) {
    return null;
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    return null;
  }

  const messaging = await getMessagingSafe();
  if (!messaging) {
    return null;
  }

  const registration = await navigator.serviceWorker.register(
    "/firebase-messaging-sw.js"
  );

  const token = await getToken(messaging, {
    vapidKey: VAPID_KEY,
    serviceWorkerRegistration: registration,
  });

  return token ?? null;
}

export async function sendFcmToken(
  context: "login" | "register"
): Promise<void> {
  try {
    const token = await getFcmToken();
    if (!token) {
      return;
    }

    if (!FCM_ENDPOINT) {
      console.warn(
        "Missing VITE_FCM_TOKEN_ENDPOINT; FCM token not sent to server."
      );
      return;
    }

    await api.post(FCM_ENDPOINT, { token, context });
  } catch (error) {
    console.error("Failed to send FCM token", error);
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
    const notification = payload.notification;
    const title = notification?.title ?? "Notification";
    const options: NotificationOptions = {
      body: notification?.body,
      icon: notification?.icon,
    };

    if (!("Notification" in window) || Notification.permission !== "granted") {
      return;
    }

    const registration = await navigator.serviceWorker.getRegistration(
      "/firebase-messaging-sw.js"
    );

    if (registration) {
      await registration.showNotification(title, options);
      return;
    }

    new Notification(title, options);
  });

  return foregroundUnsubscribe;
}
