import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import Modal from 'react-modal';
import App from './App';
import './index.css';
// PWA: register service worker (auto-update)
import { registerSW } from 'virtual:pwa-register';
if ('serviceWorker' in navigator) {
  try {
    registerSW({
      onRegistered(r) {
        console.log('Service worker registered:', r);
      },
      onRegisterError(err) {
        console.error('SW registration error:', err);
      }
    });
  } catch (e) {
    console.warn('PWA registerSW unavailable', e.message);
  }
}
// disable verbose console in production
import './utils/disableConsoleProd';
import { getProfile } from './api/profile';

// Set root element for React Modal accessibility
Modal.setAppElement('#root');

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
      queryFn: getProfile
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
          <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  </React.StrictMode>
);