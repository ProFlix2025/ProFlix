import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add error handling for React mounting
try {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error("Root element not found");
  }
  
  const root = createRoot(rootElement);
  root.render(<App />);
  
  console.log("✅ React app mounted successfully");
} catch (error) {
  console.error("❌ React mounting failed:", error);
  
  // Fallback: Display error message directly
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; background: #1a1a1a; color: #fff; font-family: Arial;">
        <h1>ProFlix - Debug Mode</h1>
        <p>❌ React mounting failed: ${error.message}</p>
        <p>Check browser console for more details.</p>
      </div>
    `;
  }
}
