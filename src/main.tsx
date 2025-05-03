
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Check if we have a stored redirect path
const redirectPath = localStorage.getItem('redirect_to');
if (redirectPath) {
  // Clear the stored path
  localStorage.removeItem('redirect_to');
  
  // If we're not on the path already, redirect to it
  if (window.location.pathname !== redirectPath.split('?')[0]) {
    window.history.replaceState(null, '', redirectPath);
  }
}

createRoot(document.getElementById("root")!).render(<App />);
