import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "./App.css";
import Router from "./routes";
import ScrollToTop from "@/components/common/ScrollToTop";
import { TOAST_COLORS } from "@/constants/colors";

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Router />
      <Toaster
        position="top-center"
        reverseOrder={false}
        containerStyle={{ zIndex: 99999 }}
        toastOptions={{
          duration: 3000,
          style: {
            fontSize: "13px",
            fontWeight: "500",
            borderRadius: "8px",
            background: TOAST_COLORS.baseBg,
            color: TOAST_COLORS.baseFg,
            padding: "8px 16px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          },
          success: {
            style: {
              background: TOAST_COLORS.successBg,
              color: TOAST_COLORS.baseFg,
            },
            iconTheme: {
              primary: TOAST_COLORS.baseFg,
              secondary: TOAST_COLORS.successBg,
            },
          },
          error: {
            style: {
              background: TOAST_COLORS.errorBg,
              color: TOAST_COLORS.baseFg,
            },
            iconTheme: {
              primary: TOAST_COLORS.baseFg,
              secondary: TOAST_COLORS.errorBg,
            },
          },
        }}
      />
    </BrowserRouter>
  );
}

export default App;
