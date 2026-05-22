// Register service worker for offline support and PWA features
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js').catch(err => {
    console.error('Service Worker registration failed:', err);
  });
}

// Suppress PWA install prompt
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
});
