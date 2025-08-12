<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import { afterNavigate } from '$app/navigation';
  import { settings, loadSettings, themeClass, updateSettings } from '@/lib/stores';
  import { requestPersistentStorage } from '@/lib/storage';
  import { installGlobalHandler } from '@/lib/errorLog';
  
  // Beautiful Lucide icons
  import { Calendar, Image, Search, Settings, Sun, Moon, Sparkles } from 'lucide-svelte';

  onMount(() => {
    loadSettings();
    requestPersistentStorage();
    installGlobalHandler();
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js');
    }
  });

  afterNavigate(() => {
    // Smooth page transition when supported
    if ((document as any).startViewTransition) {
      (document as any).startViewTransition(() => {});
    }
  });

  $: theme = $themeClass;
  $: tfClass = $settings?.typeface === 'pairB' ? 'tf-b' : 'tf-a';
  $: isDark = theme === 'dark';

  function toggleTheme() {
    const next = ($settings?.theme ?? 'system') === 'midnight' ? 'daylight' : 'midnight';
    updateSettings({ theme: next });
  }
</script>

<svelte:head>
  <title>Tiny Gratitude</title>
</svelte:head>

<div class="{theme} min-h-full {tfClass}" class:mocha={isDark} class:latte={!isDark}>
  <!-- Beautiful glassmorphism header -->
  <header class="sticky top-0 z-50 glass-subtle bg-ctp-base/80 border-b border-ctp-surface0/50">
    <nav class="mx-auto max-w-screen-sm px-6 h-16 flex items-center justify-between">
      <!-- Logo with sparkle icon -->
      <a href="/" class="flex items-center gap-2 font-bold text-lg text-ctp-mauve hover:text-ctp-pink transition-colors duration-200">
        <Sparkles size={20} class="text-ctp-yellow" />
        <span class="font-serif">Gratitude</span>
      </a>
      
      <!-- Navigation icons -->
      <div class="flex items-center gap-1" role="toolbar" aria-label="Primary navigation">
        <a 
          href="/calendar" 
          aria-label="Calendar" 
          class="p-2.5 rounded-xl text-ctp-subtext1 hover:text-ctp-mauve hover:bg-ctp-surface0/50 transition-all duration-200 btn-animate focus-ring" 
          title="Calendar"
        >
          <Calendar size={18} />
        </a>
        <a 
          href="/gallery" 
          aria-label="Gallery" 
          class="p-2.5 rounded-xl text-ctp-subtext1 hover:text-ctp-sapphire hover:bg-ctp-surface0/50 transition-all duration-200 btn-animate focus-ring" 
          title="Gallery"
        >
          <Image size={18} />
        </a>
        <a 
          href="/search" 
          aria-label="Search" 
          class="p-2.5 rounded-xl text-ctp-subtext1 hover:text-ctp-green hover:bg-ctp-surface0/50 transition-all duration-200 btn-animate focus-ring" 
          title="Search"
        >
          <Search size={18} />
        </a>
        <a 
          href="/settings" 
          aria-label="Settings" 
          class="p-2.5 rounded-xl text-ctp-subtext1 hover:text-ctp-peach hover:bg-ctp-surface0/50 transition-all duration-200 btn-animate focus-ring" 
          title="Settings"
        >
          <Settings size={18} />
        </a>
        
        <!-- Beautiful theme toggle with smooth transitions -->
        <div class="ml-2 w-px h-6 bg-ctp-surface1"></div>
        <button 
          class="group ml-2 p-2.5 rounded-xl bg-ctp-surface0/70 text-ctp-subtext1 hover:text-ctp-yellow hover:bg-ctp-surface1 transition-all duration-300 btn-animate focus-ring" 
          on:click={toggleTheme} 
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <div class="relative w-[18px] h-[18px]">
            <div class="absolute inset-0 transition-all duration-300 {isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-75'}">
              <Moon size={18} />
            </div>
            <div class="absolute inset-0 transition-all duration-300 {!isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-75'}">
              <Sun size={18} />
            </div>
          </div>
        </button>
      </div>
    </nav>
  </header>

  <!-- Main content with beautiful spacing -->
  <main class="mx-auto max-w-screen-sm px-6 py-8">
    <slot />
  </main>
</div>

<style>
  .tf-a { 
    --font-serif: "Fraunces", Georgia, Cambria, "Times New Roman", Times, serif; 
    --font-sans: "Inter", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif; 
  }
  .tf-b { 
    --font-serif: "Fraunces", "Iowan Old Style", "Palatino", Georgia, serif; 
    --font-sans: "Inter", "SF Pro Text", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif; 
  }
</style>
