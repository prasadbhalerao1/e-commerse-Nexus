import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Patch global fetch to route requests starting with /api/ to the backend dynamically
const originalFetch = window.fetch;
window.fetch = (input, init) => {
  let url = input;
  if (typeof input === 'string' && input.startsWith('/api/')) {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
    url = `${backendUrl.replace(/\/$/, '')}${input}`;
    
    // Auto-inject credentials (cookies) for CORS session persistence
    if (!init) init = {};
    if (!init.credentials) {
      init.credentials = 'include';
    }
  }
  return originalFetch(url, init);
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
