<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { getGreatByYmd, upsertGreat } from '@/lib/db';
  import type { Great } from '@/lib/types';
  import { nowEpoch } from '@/lib/date';

  let ymd = '';
  let entry = '';
  let mood = '';
  let emojiBtn: HTMLButtonElement;
  let pickerOpen = false;
  let recent: string[] = [];
  let saved: Great | null = null;

  $: ymd = $page.params.ymd;

  onMount(async () => {
    const g = await getGreatByYmd(ymd);
    if (g) { saved = g; entry = g.entry; mood = g.mood ?? ''; }
    try { recent = JSON.parse(localStorage.getItem('recent_emojis') || '[]'); } catch { recent = []; }
  });

  async function save() {
    const text = entry.trim();
    if (!text) return;
    const g: Great = {
      id: saved?.id ?? crypto.randomUUID(),
      ymd,
      entry: text.slice(0, 280),
      mood: mood || undefined,
      createdAt: saved?.createdAt ?? nowEpoch(),
      editedAt: nowEpoch(),
      v: 1
    };
    await upsertGreat(g);
    saved = g;
  }

  import EmojiPicker from '@/lib/components/EmojiPicker.svelte';
  import { clickPulse, focusBloom } from '@/lib/animations';
</script>

<section class="mt-6 rounded-2xl border border-black/10 dark:border-white/10 p-5 bg-white/70 dark:bg-black/20">
  <h1 class="text-lg font-serif mb-4">{ymd}</h1>
  <div class="relative flex items-center gap-2">
    <input use:focusBloom class="flex-1 rounded-lg border border-black/10 dark:border-white/10 px-3 py-2 outline-none bg-white/90 dark:bg-white/5" type="text" bind:value={entry} maxlength="280" placeholder="Add a great for this day…" />
    <button bind:this={emojiBtn} aria-label="Pick emoji" class="w-10 h-10 rounded-lg border border-black/10 dark:border-white/10 bg-white/90 dark:bg-white/5" on:click={() => pickerOpen = !pickerOpen}>{mood || '😊'}</button>
    <EmojiPicker {recent} bind:value={mood} bind:open={pickerOpen} anchor={emojiBtn} on:select={(e) => mood = e.detail} />
    <button use:clickPulse on:click={save} class="rounded-lg px-4 py-2 bg-black text-white dark:bg.white dark:text-black disabled:opacity-50" disabled={!entry.trim()}>Save</button>
  </div>
</section>
