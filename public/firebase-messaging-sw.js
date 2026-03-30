importScripts("https://www.gstatic.com/firebasejs/12.11.0/firebase-app-compat.js");
importScripts(
  "https://www.gstatic.com/firebasejs/12.11.0/firebase-messaging-compat.js"
);

const hasValues = (obj) =>
  obj && Object.values(obj).some((value) => Boolean(value));

const resolveConfig = async () => {
  if (hasValues(self.firebaseConfig)) {
    return self.firebaseConfig;
  }

  try {
    const response = await fetch("/firebase-config.json", { cache: "no-store" });
    const data = await response.json();
    return hasValues(data) ? data : null;
  } catch (error) {
    return null;
  }
};

resolveConfig().then((config) => {
  if (!config) {
    return;
  }

  firebase.initializeApp(config);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    const notification = payload.notification || {};
    const title = notification.title || "Notification";

    const options = {
      body: notification.body,
      icon: notification.icon,
    };

    self.registration.showNotification(title, options);
  });
});
