import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";
import { GamificationProvider } from "./contexts/GamificationContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <GamificationProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </GamificationProvider>
    </AuthProvider>
  </React.StrictMode>
);