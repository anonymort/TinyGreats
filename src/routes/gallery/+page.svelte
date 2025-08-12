<script lang="ts">
  import { onMount } from 'svelte';
  import { listAllGreats } from '@/lib/db';
  import type { Great } from '@/lib/types';

  let items: Great[] = [];
  let autoplay = false;
  let timer: any;

  onMount(async () => {
    items = await listAllGreats();
  });

  function togglePlay() {
    autoplay = !autoplay;
    clearInterval(timer);
    if (autoplay) {
      let i = 0;
      timer = setInterval(() => {
        const el = document.getElementById('g' + i);
        el?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        i = (i + 1) % items.length;
      }, 3200);
    }
  }
</script>

<section>
  <div class="flex items-center justify-between mb-3">
    <h1 class="font-serif">Gallery</h1>
    <button class="rounded px-3 py-1.5 border border-black/10 dark:border-white/10" on:click={togglePlay}>{autoplay ? 'Pause' : 'Play'}</button>
  </div>
  <div class="flex gap-4 snap-x overflow-x-auto">
    {#each items as g, i}
      <div id={'g' + i} class="min-w-[85%] snap-center rounded-2xl border border-black/10 dark:border-white/10 p-5 bg-white/70 dark:bg-black/20">
        <div class="text-5xl mb-2">{g.mood ?? '✨'}</div>
        <div class="text-sm opacity-60">{g.ymd}</div>
        <div class="text-lg font-medium">{g.entry}</div>
      </div>
    {/each}
  </div>
</section>

