import { Toaster } from "./components/ui/sonner";
import AppRoutes from "./routes/AppRoutes";
import { useEffect } from "react";
import { setupForegroundNotifications } from "./lib/fcm";


function App() {
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    void setupForegroundNotifications()
      .then((handler) => {
        unsubscribe = handler;
      })
      .catch((error) => {
        console.error("Failed to setup foreground notifications", error);
      });

    return () => {
      unsubscribe?.();
    };
  }, []);

  return (
    <>
     <Toaster position="top-right" richColors />
    <AppRoutes />
    </>
  );
}

export default App;
