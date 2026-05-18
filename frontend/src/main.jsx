import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { SocketProvider } from './context/SocketContext'
import { GoogleOAuthProvider } from '@react-oauth/google'

const clientId = '508825841965-trhil23cc52o2m2crr35sr3krt65ifl6.apps.googleusercontent.com';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <AuthProvider>
        <SocketProvider>
            <App />
        </SocketProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  </StrictMode>
)

// Register the Workbox-generated Service Worker (via vite-plugin-pwa)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      console.log('✅ Service Worker registered:', registration.scope);

      // Auto update when new version available
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('🔄 New content available — refresh to update');
          }
        });
      });
    } catch (error) {
      console.warn('❌ Service Worker registration failed:', error);
    }
  });
}
