// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "@fontsource/alexandria/400.css";
import "@fontsource/alexandria/500.css";
import "@fontsource/alexandria/600.css";
import "@fontsource/alexandria/700.css";

createRoot(document.getElementById("root")!).render(
  // <StrictMode>
    <div className="font-alexandria">
      <App />
    </div>
  // </StrictMode>,
);
