<script lang="ts">
  import { onMount } from 'svelte';
  import { listAllGreats } from '@/lib/db';
  import { ymdFromDate } from '@/lib/date';

  type Day = { ymd: string; filled: boolean };
  let days: Day[] = [];
  let today = new Date();
  let month = today.getMonth();
  let year = today.getFullYear();
  let filledSet = new Set<string>();

  function computeMonthDays(y: number, m: number) {
    const first = new Date(y, m, 1);
    const out: Day[] = [];
    for (let d = 1; d <= new Date(y, m + 1, 0).getDate(); d++) {
      const date = new Date(y, m, d);
      const ymd = ymdFromDate(date);
      out.push({ ymd, filled: filledSet.has(ymd) });
    }
    return out;
  }

  async function refresh() {
    const all = await listAllGreats();
    filledSet = new Set(all.map(g => g.ymd));
    days = computeMonthDays(year, month);
  }

  onMount(refresh);

  function prevMonth() {
    if (month === 0) { month = 11; year -= 1; } else { month -= 1; }
    days = computeMonthDays(year, month);
  }
  function nextMonth() {
    if (month === 11) { month = 0; year += 1; } else { month += 1; }
    days = computeMonthDays(year, month);
  }
</script>

<section>
  <div class="flex items-center justify-between mb-3">
    <button on:click={prevMonth} aria-label="Previous month">←</button>
    <h1 class="font-serif">{new Date(year, month).toLocaleString(undefined, { month: 'long', year: 'numeric' })}</h1>
    <button on:click={nextMonth} aria-label="Next month">→</button>
  </div>
  <div class="grid grid-cols-7 gap-2">
    {#each days as d}
      <a class="aspect-square rounded-lg border border-black/10 dark:border-white/10 relative flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5" href={'/day/' + d.ymd} aria-label={d.ymd}>
        {#if d.filled}
          <span class="w-2 h-2 rounded-full bg-pastel-mint absolute top-1.5 right-1.5 shadow-[0_0_6px_2px_rgba(191,227,208,0.8)]"></span>
        {/if}
        <span class="text-sm opacity-80">{parseInt(d.ymd.slice(-2))}</span>
      </a>
    {/each}
  </div>
</section>

