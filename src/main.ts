import './style.css';
import { router } from '@/lib/router';
import { loadSettings } from '@/lib/settings';
import { requestPersistentStorage } from '@/lib/storage';
import { installGlobalHandler } from '@/lib/errorLog';
import { createLayout } from '@/components/layout';
import { createHomePage } from '@/pages/home';
import { createCalendarPage } from '@/pages/calendar';
import { createDayPage } from '@/pages/day';
import { createGalleryPage } from '@/pages/gallery';
import { createSearchPage } from '@/pages/search';
import { createSettingsPage } from '@/pages/settings';

// Initialize app
async function init() {
  const appContainer = document.querySelector<HTMLDivElement>('#app')!;

  // Load settings first
  await loadSettings();

  // Request persistent storage
  requestPersistentStorage();

  // Install global error handler
  installGlobalHandler();

  // Register service worker
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('/service-worker.js');
      console.log('[App] Service worker registered');
    } catch (error) {
      console.error('[App] Service worker registration failed:', error);
    }
  }

  // Create layout
  const layout = createLayout(appContainer);
  appContainer.appendChild(layout);

  // Get content container
  const contentContainer = document.getElementById('app-content')!;

  // Setup router
  router.on('/', () => {
    console.log('[Router] Navigating to home');
    return createHomePage(contentContainer);
  });

  router.on('/calendar', () => {
    console.log('[Router] Navigating to calendar');
    return createCalendarPage(contentContainer);
  });

  router.on('/day/:ymd', (params) => {
    console.log('[Router] Navigating to day:', params.ymd);
    return createDayPage(contentContainer, params.ymd);
  });

  router.on('/gallery', () => {
    console.log('[Router] Navigating to gallery');
    return createGalleryPage(contentContainer);
  });

  router.on('/search', () => {
    console.log('[Router] Navigating to search');
    return createSearchPage(contentContainer);
  });

  router.on('/settings', () => {
    console.log('[Router] Navigating to settings');
    return createSettingsPage(contentContainer);
  });

  // 404 fallback
  router.on('*', () => {
    console.log('[Router] 404 - redirecting to home');
    router.navigate('/');
    return () => {};
  });

  // Start router - this will handle initial route after all routes are registered
  router.start();

  console.log('[App] Tiny Gratitude initialized');
}

// Start the app
init();
