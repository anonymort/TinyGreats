<script lang="ts">
  import { onMount } from 'svelte';
  import { db, getGreatByYmd, upsertGreat } from '@/lib/db';
  import type { Great } from '@/lib/types';
  import { ymdFromDate, nowEpoch } from '@/lib/date';
  import { clearBadge, setBadge } from '@/lib/storage';
  import { animate, spring } from 'motion';

  const today = ymdFromDate(new Date());
  let entry = '';
  let mood = '';
  let saved: Great | null = null;
  let inputEl: HTMLInputElement;
  let emojiBtn: HTMLButtonElement;
  let pickerOpen = false;
  let recent: string[] = [];

  onMount(async () => {
    const existing = await getGreatByYmd(today);
    if (existing) {
      saved = existing;
      entry = existing.entry;
      mood = existing.mood ?? '';
      clearBadge();
    } else {
      setBadge(1);
    }
  });

  async function save() {
    const text = entry.trim();
    if (!text) return;
    const g: Great = {
      id: crypto.randomUUID(),
      ymd: today,
      entry: text.slice(0, 280),
      mood: mood || undefined,
      createdAt: nowEpoch(),
      v: 1
    };
    await upsertGreat(g);
    saved = g;
    clearBadge();
    try { navigator.vibrate?.(30); } catch {}
    bloom();
    if (mood) {
      recent = Array.from(new Set([mood, ...recent])).slice(0, 8);
      localStorage.setItem('recent_emojis', JSON.stringify(recent));
    }
  }

  function bloom() {
    const card = document.querySelector('#today-card');
    if (!card) return;
    animate(
      card,
      { scale: [0.96, 1.08, 1.0], opacity: [0.95, 1, 1] },
      { duration: 0.22, easing: 'ease-out' }
    );
  }
  
  function resetEdit() {
    saved = null;
    setTimeout(() => inputEl?.focus(), 0);
  }

  import EmojiPicker from '@/lib/components/EmojiPicker.svelte';
  import { focusBloom, clickPulse } from '@/lib/animations';

  onMount(() => {
    try {
      recent = JSON.parse(localStorage.getItem('recent_emojis') || '[]');
    } catch { recent = []; }
  });
</script>

<section id="today-card" class="mt-6 rounded-2xl border border-black/10 dark:border-white/10 p-5 shadow-sm bg-white/70 dark:bg-black/20">
  {#if !saved}
    <h1 class="text-lg font-serif mb-4">What’s one great thing about today?</h1>
    <div class="relative flex items-center gap-2">
      <input use:focusBloom bind:this={inputEl} aria-label="Today's great" class="flex-1 rounded-lg border border-black/10 dark:border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-pastel-mint/60 bg-white/90 dark:bg-white/5" type="text" bind:value={entry} maxlength="280" placeholder="Type a short phrase…" />
      <button bind:this={emojiBtn} aria-label="Pick emoji" class="w-10 h-10 rounded-lg border border-black/10 dark:border-white/10 bg-white/90 dark:bg-white/5" on:click={() => pickerOpen = !pickerOpen}>{mood || '😊'}</button>
      <EmojiPicker {recent} bind:value={mood} bind:open={pickerOpen} anchor={emojiBtn} on:select={(e) => mood = e.detail} />
      <button use:clickPulse on:click={save} class="rounded-lg px-4 py-2 bg-black text-white dark:bg-white dark:text-black disabled:opacity-50" disabled={!entry.trim()}>Save</button>
    </div>
    <p class="mt-2 text-xs opacity-70">Tip: add an emoji for your mood.</p>
  {:else}
    <div class="flex items-start gap-3">
      <div class="text-2xl" aria-hidden="true">{saved.mood ?? '✨'}</div>
      <div>
        <div class="text-sm opacity-60">Today</div>
        <div class="text-lg font-medium">{saved.entry}</div>
      </div>
    </div>
    <div class="mt-4 flex gap-2">
      <a class="rounded px-3 py-1.5 border border-black/10 dark:border-white/10" href="/calendar">Open calendar</a>
      <button class="rounded px-3 py-1.5 border border-black/10 dark:border-white/10" on:click={resetEdit}>Edit</button>
    </div>
  {/if}
</section>

<p class="mt-6 text-sm opacity-70">Local-only. No accounts, no telemetry.</p>

<style>
  input:focus { transform: scale(1.01); transition: transform 150ms ease-out; }
  @media (prefers-reduced-motion: reduce) { input:focus { transform: none; } }
</style>
