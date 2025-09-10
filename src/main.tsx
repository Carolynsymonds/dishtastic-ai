import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { SecurityToastListener } from './components/SecurityToastListener'
import { initSecurity } from './lib/security'

// Initialize security monitoring
initSecurity()

createRoot(document.getElementById("root")!).render(
  <>
    <SecurityToastListener />
    <App />
  </>
);
