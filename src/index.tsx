import { createRoot } from "react-dom/client";
import App from "./App";
import { initializeAuth } from "./utils/auth";
import "./index.css";

const container = document.getElementById("root")!;
const root = createRoot(container);

initializeAuth();

root.render(<App />);
