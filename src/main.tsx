import { createRoot } from "react-dom/client";
import App from "./App";
import { CartProvider } from "./context/CartContext";
import { LanguageProvider } from "./context/LanguageContext";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <LanguageProvider>
    <CartProvider>
      <App />
    </CartProvider>
  </LanguageProvider>
);

