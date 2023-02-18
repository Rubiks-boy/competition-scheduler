import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { initializeAuth } from "./utils/auth";
import { StateProvider } from "./app/StateProvider";
import "./index.css";

const container = document.getElementById("root")!;
const root = createRoot(container);

initializeAuth();

root.render(
  <StateProvider>
    <App />
  </StateProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
