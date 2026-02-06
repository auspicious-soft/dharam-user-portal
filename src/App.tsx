import { Toaster } from "./components/ui/sonner";
import AppRoutes from "./routes/AppRoutes";


function App() {

  return (
    <>
     <Toaster position="top-right" richColors />
    <AppRoutes />
    </>
  );
}

export default App;