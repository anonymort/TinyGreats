<script lang="ts">
  import { getErrors, clearErrors } from '@/lib/errorLog';
  import { onMount } from 'svelte';
  let items = getErrors();
  function refresh() { items = getErrors(); }
  function clear() { clearErrors(); refresh(); }
  onMount(() => {
    const id = setInterval(refresh, 2000);
    return () => clearInterval(id);
  });
</script>

<div class="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
  <div class="flex items-center justify-between mb-2">
    <div class="text-sm font-medium">Error Tray (local only)</div>
    <button class="text-xs underline" on:click={clear}>Clear</button>
  </div>
  {#if !items.length}
    <div class="text-xs opacity-70">No errors recorded.</div>
  {:else}
    <ul class="space-y-2 max-h-48 overflow-auto text-xs">
      {#each items.slice().reverse() as e}
        <li>
          <div class="opacity-60">{new Date(e.t).toLocaleString()}</div>
          <div class="font-mono whitespace-pre-wrap break-words">{e.m}</div>
        </li>
      {/each}
    </ul>
  {/if}
</div>
