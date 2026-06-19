import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
// Load Google Identity Services script
const loadGoogleScript = () => {
  const id = 'google-identity-script';
  if (document.getElementById(id)) return;
  const s = document.createElement('script');
  s.src = 'https://accounts.google.com/gsi/client';
  s.async = true;
  s.defer = true;
  s.id = id;
  document.head.appendChild(s);
};
loadGoogleScript();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
