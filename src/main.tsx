import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css"
import { SubscriptionProvider } from "./SubscriptionContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
    <SubscriptionProvider>
      <App />
      </SubscriptionProvider>
    </BrowserRouter>
  </React.StrictMode>
);
