import { createRoot } from "react-dom/client";
import App from "./App";
import { CartProvider } from "./context/CartContext";
import { LanguageProvider } from "./context/LanguageContext";
import { SiteSettingsProvider } from "./context/SiteSettingsContext";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <LanguageProvider>
    <SiteSettingsProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </SiteSettingsProvider>
  </LanguageProvider>
);

