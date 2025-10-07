<script lang="ts">
  import { settings, updateSettings, loadSettings } from '@/lib/stores';
  import { onMount } from 'svelte';
  import { downloadBlob } from '@/lib/storage';
  import { db } from '@/lib/db';
  import { makeDailyICS } from '@/lib/ics';
  import ErrorTray from '@/lib/components/ErrorTray.svelte';

  onMount(loadSettings);

  async function exportJson() {
    const data = { greats: await db.greats.toArray(), settings: await db.settings.toArray() };
    downloadBlob('tiny-gratitude-export.json', new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  }

  function makeIcs() {
    const blob = makeDailyICS('Tiny Gratitude', 'Add one great thing about today');
    downloadBlob('tiny-gratitude-reminder.ics', blob);
  }

  async function importJson(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const text = await file.text();
    const data = JSON.parse(text);
    if (Array.isArray(data.greats)) await db.greats.bulkPut(data.greats);
    if (Array.isArray(data.settings)) await db.settings.bulkPut(data.settings);
    alert('Import complete.');
  }

  let showErrors = false;
</script>

<section class="space-y-6">
  <h1 class="font-serif text-xl">Settings</h1>

  <div class="space-y-2">
    <label for="theme-select" class="block text-sm opacity-80">Theme</label>
    <select id="theme-select" class="rounded border border-ctp-surface1 bg-ctp-surface0 px-3 py-2 text-ctp-text focus-ring" on:change={(e) => updateSettings({ theme: (e.target as HTMLSelectElement).value as any })}>
      <option value="system" selected={$settings?.theme === 'system'}>System</option>
      <option value="daylight" selected={$settings?.theme === 'daylight'}>Daylight</option>
      <option value="midnight" selected={$settings?.theme === 'midnight'}>Midnight</option>
    </select>
  </div>

  <div class="space-y-2">
    <label for="typeface-select" class="block text-sm opacity-80">Typeface</label>
    <select id="typeface-select" class="rounded border border-ctp-surface1 bg-ctp-surface0 px-3 py-2 text-ctp-text focus-ring" on:change={(e) => updateSettings({ typeface: (e.target as HTMLSelectElement).value as any })}>
      <option value="pairA" selected={$settings?.typeface === 'pairA'}>Serif prompt + Humanist sans</option>
      <option value="pairB" selected={$settings?.typeface === 'pairB'}>Serif prompt + Geometric sans</option>
    </select>
  </div>

  <div class="space-y-2">
    <p class="block text-sm opacity-80">Export / Import</p>
    <div class="flex gap-3 items-center">
      <button class="rounded px-3 py-1.5 border border-ctp-surface1 bg-ctp-surface0 text-ctp-text transition-colors hover:bg-ctp-surface1 focus-ring" on:click={exportJson}>Export JSON</button>
      <label for="import-file" class="rounded px-3 py-1.5 border border-ctp-surface1 bg-ctp-surface0 text-ctp-text cursor-pointer transition-colors hover:bg-ctp-surface1 focus-ring">
        Import JSON <input id="import-file" type="file" accept="application/json" class="hidden" on:change={importJson} />
      </label>
    </div>
  </div>

  <div class="space-y-2">
    <p class="block text-sm opacity-80">Reminders without servers</p>
    <button class="rounded px-3 py-1.5 border border-ctp-surface1 bg-ctp-surface0 text-ctp-text transition-colors hover:bg-ctp-surface1 focus-ring" on:click={makeIcs}>Download .ics (daily)</button>
  </div>

  <div class="space-y-2">
    <p class="block text-sm opacity-80">Error Tray</p>
    <button class="rounded px-3 py-1.5 border border-ctp-surface1 bg-ctp-surface0 text-ctp-text transition-colors hover:bg-ctp-surface1 focus-ring" on:click={() => showErrors = !showErrors}>{showErrors ? 'Hide' : 'Show'} errors</button>
    {#if showErrors}
      <ErrorTray />
    {/if}
  </div>

  <p class="text-xs opacity-70">Local-only pledge: no accounts, network blocked by CSP; service worker serves cached assets and rejects cross-origin.</p>
</section>
