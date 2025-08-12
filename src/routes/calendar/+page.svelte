<script lang="ts">
  import { onMount } from 'svelte';
  import { listAllGreats } from '@/lib/db';
  import { ymdFromDate } from '@/lib/date';

  type Day = { ymd: string; filled: boolean; isFuture: boolean };
  let days: Day[] = [];
  let today = new Date();
  let currentYmd = ymdFromDate(today);
  let month = today.getMonth();
  let year = today.getFullYear();
  let filledSet = new Set<string>();

  function computeMonthDays(y: number, m: number) {
    const out: Day[] = [];
    for (let d = 1; d <= new Date(y, m + 1, 0).getDate(); d++) {
      const date = new Date(y, m, d);
      const ymd = ymdFromDate(date);
      const isFuture = ymd > currentYmd;
      out.push({ ymd, filled: filledSet.has(ymd), isFuture });
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
    // Prevent navigation to future months
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      if (month === 11) { month = 0; year += 1; } else { month += 1; }
      days = computeMonthDays(year, month);
    }
  }
  
  // Check if next month navigation should be disabled
  $: canGoNext = year < today.getFullYear() || (year === today.getFullYear() && month < today.getMonth());
</script>

<section>
  <div class="flex items-center justify-between mb-3">
    <button 
      on:click={prevMonth} 
      aria-label="Previous month"
      class="p-2 rounded-xl text-ctp-subtext1 hover:text-ctp-mauve hover:bg-ctp-surface0/50 transition-all duration-200 btn-animate focus-ring"
    >
      ←
    </button>
    <h1 class="font-serif text-xl text-ctp-text">
      {new Date(year, month).toLocaleString(undefined, { month: 'long', year: 'numeric' })}
    </h1>
    <button 
      on:click={nextMonth} 
      aria-label="Next month"
      disabled={!canGoNext}
      class="p-2 rounded-xl text-ctp-subtext1 hover:text-ctp-mauve hover:bg-ctp-surface0/50 transition-all duration-200 btn-animate focus-ring disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-ctp-subtext1 disabled:hover:bg-transparent"
    >
      →
    </button>
  </div>
  <div class="grid grid-cols-7 gap-2">
    {#each days as d}
      {#if d.isFuture}
        <!-- Future dates: dimmed and non-clickable -->
        <div 
          class="aspect-square rounded-lg border border-ctp-surface1/30 relative flex items-center justify-center opacity-40 cursor-not-allowed"
          aria-label="{d.ymd} (future date)"
          aria-disabled="true"
        >
          <span class="text-sm text-ctp-subtext0">{parseInt(d.ymd.slice(-2))}</span>
        </div>
      {:else}
        <!-- Past and current dates: clickable -->
        <a 
          class="aspect-square rounded-lg border border-ctp-surface0 relative flex items-center justify-center hover:bg-ctp-surface0/20 transition-all duration-200 text-ctp-text hover:text-ctp-mauve btn-animate focus-ring"
          href={'/day/' + d.ymd} 
          aria-label={d.ymd}
        >
          {#if d.filled}
            <span class="w-2 h-2 rounded-full bg-ctp-green absolute top-1.5 right-1.5 shadow-lg"></span>
          {/if}
          <span class="text-sm">{parseInt(d.ymd.slice(-2))}</span>
        </a>
      {/if}
    {/each}
  </div>
</section>

