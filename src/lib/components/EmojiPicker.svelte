<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  
  export let open = false;
  export let value: string = '';
  export let recent: string[] = [];
  export let anchor: HTMLElement | null = null;
  const dispatch = createEventDispatcher<{ select: string }>();

  const EMOJIS = ['😊','✨','😌','😀','😄','😎','🥰','🤗','🙌','🌿','🌞','🌙','⭐️','🌈','🍃','🍵','🫖','🎈','🎉','🍊','🍓','☕️'];

  function pick(e: string) {
    value = e;
    dispatch('select', e);
    open = false;
  }

  let panel: HTMLDivElement;
  function onDocClick(e: MouseEvent) {
    if (!panel) return;
    const target = e.target as Node;
    if (open && !panel.contains(target) && anchor && !anchor.contains(target)) {
      open = false;
    }
  }
  onMount(() => {
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  });
</script>

{#if open}
  <div bind:this={panel} role="dialog" aria-label="Emoji picker" class="absolute z-50 mt-2 rounded-xl border border-black/10 dark:border-white/10 bg-white/95 dark:bg-black/90 shadow-lg p-2 w-56">
    {#if recent.length}
      <div class="mb-1 text-[11px] opacity-60 px-1">Recent</div>
      <div class="grid grid-cols-8 gap-1 mb-2">
        {#each recent as e}
          <button class="h-8 w-8 rounded hover:bg-black/5 dark:hover:bg-white/10" on:click={() => pick(e)}>{e}</button>
        {/each}
      </div>
    {/if}
    <div class="mb-1 text-[11px] opacity-60 px-1">Popular</div>
    <div class="grid grid-cols-8 gap-1">
      {#each EMOJIS as e}
        <button class="h-8 w-8 rounded hover:bg-black/5 dark:hover:bg.white/10" on:click={() => pick(e)}>{e}</button>
      {/each}
    </div>
  </div>
{/if}

