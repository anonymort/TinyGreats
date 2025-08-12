<script lang="ts">
  import { onMount } from 'svelte';
  import { db, getGreatByYmd, upsertGreat } from '@/lib/db';
  import type { Great } from '@/lib/types';
  import { ymdFromDate, nowEpoch } from '@/lib/date';
  import { clearBadge, setBadge } from '@/lib/storage';
  import { animate } from 'motion';
  
  // Beautiful Lucide icons
  import { Save, Edit3, Calendar, Sparkles, Heart } from 'lucide-svelte';

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
      { scale: [0.98, 1.02, 1.0], opacity: [0.9, 1, 1] },
      { duration: 0.4, easing: [0.4, 0, 0.2, 1] }
    );
  }
  
  function resetEdit() {
    saved = null;
    setTimeout(() => inputEl?.focus(), 100);
  }

  import EmojiPicker from '@/lib/components/EmojiPicker.svelte';
  import { focusBloom, clickPulse } from '@/lib/animations';

  onMount(() => {
    try {
      recent = JSON.parse(localStorage.getItem('recent_emojis') || '[]');
    } catch { recent = []; }
  });
</script>

<!-- Beautiful gradient background -->
<div class="absolute inset-0 bg-gradient-to-br from-ctp-mauve/5 via-ctp-sapphire/5 to-ctp-green/5 -z-10"></div>

<!-- Main card with glassmorphism -->
<section id="today-card" class="relative glass bg-ctp-mantle/70 border-ctp-surface0 rounded-3xl p-8 shadow-xl shadow-ctp-mauve/10">
  {#if !saved}
    <!-- Header with icon -->
    <div class="flex items-center gap-3 mb-6">
      <div class="p-3 rounded-2xl bg-ctp-mauve/10 text-ctp-mauve">
        <Heart size={24} />
      </div>
      <div>
        <h1 class="text-2xl font-serif font-semibold text-ctp-text mb-1">Today's Gratitude</h1>
        <p class="text-ctp-subtext1 text-sm">What's one great thing about today?</p>
      </div>
    </div>
    
    <!-- Input form -->
    <div class="space-y-4">
      <div class="relative">
        <input 
          use:focusBloom 
          bind:this={inputEl} 
          aria-label="Today's great thing" 
          class="w-full px-4 py-4 rounded-2xl glass-subtle bg-ctp-surface0/50 border-ctp-surface1 text-ctp-text placeholder-ctp-subtext0 focus-ring transition-all duration-200" 
          type="text" 
          bind:value={entry} 
          maxlength="280" 
          placeholder="Something wonderful happened..." 
        />
        <div class="absolute right-3 top-1/2 -translate-y-1/2 text-ctp-subtext0 text-sm">
          {280 - entry.length}
        </div>
      </div>
      
      <div class="flex items-center gap-3">
        <!-- Emoji picker -->
        <button 
          bind:this={emojiBtn} 
          aria-label="Pick mood emoji" 
          class="flex-shrink-0 w-14 h-14 rounded-2xl glass-subtle bg-ctp-surface0/50 border-ctp-surface1 text-2xl btn-animate focus-ring flex items-center justify-center" 
          on:click={() => pickerOpen = !pickerOpen}
        >
          {mood || '😊'}
        </button>
        <EmojiPicker {recent} bind:value={mood} bind:open={pickerOpen} anchor={emojiBtn} on:select={(e) => mood = e.detail} />
        
        <!-- Save button -->
        <button 
          use:clickPulse 
          on:click={save} 
          class="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-ctp-mauve hover:bg-ctp-mauve/90 text-ctp-base font-medium transition-all duration-200 btn-animate focus-ring disabled:opacity-50 disabled:cursor-not-allowed" 
          disabled={!entry.trim()}
        >
          <Save size={18} />
          Save Gratitude
        </button>
      </div>
      
      <p class="text-ctp-subtext0 text-sm text-center">💡 Tip: Add an emoji to capture your mood</p>
    </div>
  {:else}
    <!-- Saved state -->
    <div class="text-center space-y-6">
      <!-- Mood and content -->
      <div class="space-y-4">
        <div class="text-6xl mb-4" aria-hidden="true">{saved.mood ?? '✨'}</div>
        <div>
          <div class="text-ctp-subtext1 text-sm mb-2 flex items-center justify-center gap-2">
            <Sparkles size={16} />
            Today's Gratitude
          </div>
          <div class="text-xl font-medium text-ctp-text leading-relaxed">{saved.entry}</div>
        </div>
      </div>
      
      <!-- Action buttons -->
      <div class="flex gap-3 justify-center">
        <a 
          href="/calendar" 
          class="flex items-center gap-2 px-4 py-3 rounded-xl glass-subtle bg-ctp-surface0/50 text-ctp-subtext1 hover:text-ctp-sapphire hover:bg-ctp-surface1/50 transition-all duration-200 btn-animate focus-ring"
        >
          <Calendar size={16} />
          View Calendar
        </a>
        <button 
          on:click={resetEdit} 
          class="flex items-center gap-2 px-4 py-3 rounded-xl glass-subtle bg-ctp-surface0/50 text-ctp-subtext1 hover:text-ctp-peach hover:bg-ctp-surface1/50 transition-all duration-200 btn-animate focus-ring"
        >
          <Edit3 size={16} />
          Edit Entry
        </button>
      </div>
    </div>
  {/if}
</section>

<!-- Footer message -->
<div class="mt-8 text-center">
  <p class="text-ctp-subtext0 text-sm flex items-center justify-center gap-2">
    <span class="w-2 h-2 rounded-full bg-ctp-green"></span>
    Local-only app • No accounts • No tracking
  </p>
</div>

