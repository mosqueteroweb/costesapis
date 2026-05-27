import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Basic error logging for deployment debugging
window.onerror = function(message, source, lineno, colno, error) {
  console.error("Global error caught:", message, "at", source, ":", lineno, ":", colno, error);
  const root = document.getElementById('root');
  if (root && root.innerHTML === '') {
    root.innerHTML = `<div style="padding: 20px; color: white; background: #09090b; min-height: 100vh; font-family: sans-serif;">
      <h1 style="color: #ef4444;">Application Error</h1>
      <p>Something went wrong while loading the application.</p>
      <pre style="background: #18181b; padding: 10px; border-radius: 8px; overflow: auto;">${message}</pre>
      <button onclick="window.location.reload()" style="background: #8b5cf6; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer;">Retry</button>
    </div>`;
  }
};

window.onunhandledrejection = function(event) {
  console.error("Unhandled promise rejection:", event.reason);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
