<script lang="ts">
  import { onMount } from 'svelte';
  import { db } from '@/lib/db';
  import type { Great } from '@/lib/types';
  import { ymdFromDate } from '@/lib/date';

  let q = '';
  let emoji = '';
  let start = '';
  let end = '';
  let results: Great[] = [];

  async function run() {
    const startY = start || '0000-01-01';
    const endY = end || '9999-12-31';
    let coll = await db.greats.where('ymd').between(startY, endY, true, true).toArray();
    if (emoji) coll = coll.filter((g) => g.mood === emoji);
    if (q.trim()) coll = coll.filter((g) => g.entry.toLowerCase().includes(q.trim().toLowerCase()));
    // Newest first
    results = coll.sort((a, b) => b.createdAt - a.createdAt);
  }

  onMount(run);
</script>

<section class="space-y-4">
  <h1 class="font-serif text-xl">Search & Filter</h1>
  <div class="grid grid-cols-1 sm:grid-cols-4 gap-2">
    <input class="rounded border border-black/10 dark:border-white/10 px-3 py-2 bg-transparent" placeholder="Text contains…" bind:value={q} on:input={run} />
    <input class="rounded border border-black/10 dark:border-white/10 px-3 py-2 bg-transparent" placeholder="Emoji (e.g., 😊)" bind:value={emoji} maxlength="2" on:input={run} />
    <input class="rounded border border-black/10 dark:border-white/10 px-3 py-2 bg-transparent" type="date" bind:value={start} on:change={run} />
    <input class="rounded border border-black/10 dark:border-white/10 px-3 py-2 bg-transparent" type="date" bind:value={end} on:change={run} />
  </div>
  <div class="divide-y divide-black/5 dark:divide-white/10">
    {#each results as g}
      <a class="flex items-start gap-3 py-3 hover:bg-black/5 dark:hover:bg-white/5 rounded px-2" href={'/day/' + g.ymd}>
        <div class="text-2xl">{g.mood ?? '✨'}</div>
        <div class="flex-1">
          <div class="text-xs opacity-60">{g.ymd}</div>
          <div class="text-sm">{g.entry}</div>
        </div>
      </a>
    {/each}
    {#if !results.length}
      <div class="text-sm opacity-60 py-6">No matches yet.</div>
    {/if}
  </div>
</section>

