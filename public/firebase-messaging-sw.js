importScripts(
  "https://www.gstatic.com/firebasejs/12.11.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/12.11.0/firebase-messaging-compat.js",
);

const hasValues = (obj) =>
  obj && Object.values(obj).some((value) => Boolean(value));

const resolveConfig = async () => {
  if (hasValues(self.firebaseConfig)) {
    return self.firebaseConfig;
  }

  try {
    const response = await fetch("/firebase-config.json", {
      cache: "no-store",
    });
    const data = await response.json();
    return hasValues(data) ? data : null;
  } catch (error) {
    console.error("Failed to load Firebase config:", error);
    return null;
  }
};

resolveConfig().then((config) => {
  if (!config) {
    console.error("Firebase config not found");
    return;
  }

  firebase.initializeApp(config);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    console.log("🔔 Background message received:", payload);

    const notification = payload.notification || {};
    const data = payload.data || {};

    // Support both notification and data-only messages
    const title = notification.title || data.title || "Notification";
    const body = notification.body || data.body || "You have a new message";
    const icon = notification.icon || data.icon || "/favicon.ico";
    const badge = data.badge || "/favicon.ico";

    const options = {
      body,
      icon,
      badge,
      tag: data.tag || "notification",
      requireInteraction: data.requireInteraction === "true",
      data: data, // Pass all data so click handler can access it
    };

    console.log("📢 Showing notification:", { title, options });
    self.registration.showNotification(title, options);
  });

  // Handle notification click
  self.addEventListener("notificationclick", (event) => {
    console.log("Notification clicked:", event.notification.title);
    event.notification.close();

    // Handle custom click action
    const urlToOpen = event.notification.data?.clickUrl || "/";
    event.waitUntil(
      clients.matchAll({ type: "window" }).then((clientList) => {
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === urlToOpen && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      }),
    );
  });
});
