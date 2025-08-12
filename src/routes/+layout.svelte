<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import { afterNavigate } from '$app/navigation';
  import { settings, loadSettings, themeClass, updateSettings } from '@/lib/stores';
  import { requestPersistentStorage } from '@/lib/storage';
  import { installGlobalHandler } from '@/lib/errorLog';

  onMount(() => {
    loadSettings();
    requestPersistentStorage();
    installGlobalHandler();
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js');
    }
  });

  afterNavigate(() => {
    // Gentle page transition when supported
    if ((document as any).startViewTransition) {
      (document as any).startViewTransition(() => {});
    }
  });

  $: theme = $themeClass;
  $: tfClass = $settings?.typeface === 'pairB' ? 'tf-b' : 'tf-a';

  function toggleTheme() {
    const next = ($settings?.theme ?? 'system') === 'midnight' ? 'daylight' : 'midnight';
    updateSettings({ theme: next });
  }
</script>

<svelte:head>
  <title>Tiny Gratitude</title>
</svelte:head>

<div class:dark={theme === 'dark'} class={"min-h-full " + tfClass}>
  <header class="sticky top-0 z-10 backdrop-blur bg-[color:var(--bg)]/75 border-b border-black/5 dark:border-white/5">
    <nav class="mx-auto max-w-screen-sm px-4 h-14 flex items-center justify-between">
      <a href="/" class="font-semibold tracking-tight">Grats</a>
      <div class="flex items-center gap-3 text-sm" role="toolbar" aria-label="Primary">
        <a href="/calendar" aria-label="Calendar" class="opacity-80 hover:opacity-100" title="Calendar">📅</a>
        <a href="/gallery" aria-label="Gallery" class="opacity-80 hover:opacity-100" title="Gallery">🖼️</a>
        <a href="/search" aria-label="Search" class="opacity-80 hover:opacity-100" title="Search">🔎</a>
        <a href="/settings" aria-label="Settings" class="opacity-80 hover:opacity-100" title="Settings">⚙️</a>
        <button class="ml-2 rounded px-2 py-1 border border-black/10 dark:border-white/10" on:click={toggleTheme} aria-label="Toggle theme">🌓</button>
      </div>
    </nav>
  </header>

  <main class="mx-auto max-w-screen-sm px-4 py-6">
    <slot />
  </main>
</div>

<style>
  header { -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px); }
  .dark header { background-color: rgba(15,17,21,0.75); }
  .tf-a { --font-serif: Georgia, Cambria, 'Times New Roman', Times, serif; --font-sans: Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; }
  .tf-b { --font-serif: 'Iowan Old Style', 'Palatino', Georgia, serif; --font-sans: 'SF Pro Text', system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; }
  .tf-a body, .tf-b body { font-family: var(--font-sans); }
</style>
