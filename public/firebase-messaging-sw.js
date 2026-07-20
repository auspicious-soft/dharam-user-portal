const DEFAULT_ICON = "/favicon.ico";
const DEFAULT_TAG = "notification";
 
const getPayload = (event) => {
  if (!event.data) {
    return {};
  }
 
  try {
    return event.data.json();
  } catch (error) {
    return { data: { body: event.data.text() } };
  }
};
 
const getValue = (payload, key) => {
  return (
    payload?.notification?.[key] ||
    payload?.data?.[key] ||
    payload?.fcmOptions?.[key] ||
    payload?.webpush?.notification?.[key]
  );
};
 
const normalizeUrl = (url) => {
  if (!url) {
    return "/";
  }
 
  try {
    return new URL(url, self.location.origin).href;
  } catch (error) {
    return "/";
  }
};
 
self.addEventListener("push", (event) => {
  const payload = getPayload(event);
  const title = getValue(payload, "title") || "Notification";
  const body = getValue(payload, "body") || "You have a new message";
  const icon = getValue(payload, "icon") || DEFAULT_ICON;
  const badge = getValue(payload, "badge") || DEFAULT_ICON;
  const tag = getValue(payload, "tag") || DEFAULT_TAG;
  const clickUrl =
    getValue(payload, "click_action") ||
    getValue(payload, "clickUrl") ||
    payload?.fcmOptions?.link ||
    payload?.webpush?.fcm_options?.link ||
    "/";
 
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon,
      badge,
      tag,
      requireInteraction: payload?.data?.requireInteraction === "true",
      data: {
        ...(payload?.data || {}),
        clickUrl: normalizeUrl(clickUrl),
      },
    }),
  );
});
 
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
 
  const urlToOpen = normalizeUrl(event.notification.data?.clickUrl);
 
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === urlToOpen && "focus" in client) {
          return client.focus();
        }
      }
 
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
 
      return undefined;
    }),
  );
});