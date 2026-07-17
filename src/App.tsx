import { Toaster } from "./components/ui/sonner";
import AppRoutes from "./routes/AppRoutes";
import { useEffect } from "react";
import { setupForegroundNotifications, initializeFcmToken } from "./lib/fcm";

function App() {
  useEffect(() => {
    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault();
    };

    document.addEventListener("contextmenu", handleContextMenu);

    let unsubscribe: (() => void) | undefined;

    // Initialize FCM token early on app load
    void initializeFcmToken();

    void setupForegroundNotifications()
      .then((handler) => {
        unsubscribe = handler;
      })
      .catch((error) => {
        console.error("Failed to setup foreground notifications", error);
      });

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      unsubscribe?.();
    };
  }, []);

  return (
    <>
      <Toaster position="top-center" richColors />
      <AppRoutes />
    </>
  );
}

export default App;
