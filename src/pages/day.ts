import { getGreatByYmd, upsertGreat } from '@/lib/db';
import type { Great } from '@/lib/types';
import { EmojiPicker } from '@/components/emoji-picker';
import { addFocusBloom, addClickPulse } from '@/lib/animations';

const MAX_RECENT_EMOJIS = 8;

// Validate ymd format (YYYY-MM-DD)
function isValidYmd(ymd: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(ymd);
}

export function createDayPage(container: HTMLElement, ymd: string): () => void {
  // Validate ymd parameter
  if (!isValidYmd(ymd)) {
    container.innerHTML = '<div class="text-center py-8 text-slate-600">Invalid date format</div>';
    return () => {};
  }
  container.innerHTML = '';

  let entry = '';
  let mood = '';
  let saved: Great | null = null;
  let emojiPicker: EmojiPicker | null = null;
  let recent: string[] = [];
  let disposed = false;
  const cleanupFns: Array<() => void> = [];

  const registerCleanup = (fn: () => void) => cleanupFns.push(fn);
  const runCleanups = () => {
    while (cleanupFns.length) {
      try {
        cleanupFns.pop()?.();
      } catch (error) {
        console.error('[Day] Cleanup error', error);
      }
    }
    emojiPicker = null;
  };

  try {
    recent = JSON.parse(localStorage.getItem('recent_emojis') || '[]');
  } catch {
    recent = [];
  }

  async function save() {
    const text = entry.trim();
    if (!text) return;

    const g: Great = {
      id: saved?.id ?? crypto.randomUUID(),
      ymd,
      entry: text.slice(0, 280),
      mood: mood || undefined,
      createdAt: saved?.createdAt ?? Date.now(),
      editedAt: Date.now(),
      v: 1
    };

    await upsertGreat(g);
    if (disposed) return;

    saved = g;

    if (mood) {
      recent = Array.from(new Set([mood, ...recent])).slice(0, MAX_RECENT_EMOJIS);
      localStorage.setItem('recent_emojis', JSON.stringify(recent));
    }

    render();
  }

  function render() {
    if (disposed) return;
    runCleanups();
    container.innerHTML = '';

    const section = document.createElement('section');
    section.className = 'mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm';

    const title = document.createElement('h1');
    title.className = 'text-lg font-serif mb-4 text-slate-900';
    title.textContent = ymd;
    section.appendChild(title);

    const form = document.createElement('div');
    form.className = 'relative flex items-center gap-2';

    let saveBtn: HTMLButtonElement;

    const input = document.createElement('input');
    input.id = 'day-input';
    input.type = 'text';
    input.maxLength = 280;
    input.value = entry;
    input.placeholder = 'Add a great for this day…';
    input.className = 'flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400';

    input.addEventListener('input', (e) => {
      entry = (e.target as HTMLInputElement).value;
      if (saveBtn) saveBtn.disabled = !entry.trim();
    });

    registerCleanup(addFocusBloom(input));

    const emojiBtn = document.createElement('button');
    emojiBtn.className = 'w-10 h-10 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 transition-colors';
    emojiBtn.textContent = mood || '😊';
    emojiBtn.setAttribute('aria-label', 'Pick emoji');

    emojiPicker?.destroy();
    const picker = new EmojiPicker({
      anchor: emojiBtn,
      recent,
      onSelect: (emoji) => {
        mood = emoji;
        emojiBtn.textContent = mood || '😊';
      }
    });
    emojiPicker = picker;
    emojiBtn.addEventListener('click', () => picker.toggle());
    registerCleanup(() => picker.destroy());

    saveBtn = document.createElement('button');
    saveBtn.className = 'rounded-lg px-4 py-2 bg-slate-900 text-white hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
    saveBtn.textContent = 'Save';
    saveBtn.disabled = !entry.trim();
    saveBtn.addEventListener('click', save);
    registerCleanup(addClickPulse(saveBtn));

    form.appendChild(input);
    form.appendChild(emojiBtn);
    form.appendChild(saveBtn);
    section.appendChild(form);

    container.appendChild(section);
  }

  render();

  getGreatByYmd(ymd).then((g) => {
    if (disposed) return;
    if (g) {
      saved = g;
      entry = g.entry;
      mood = g.mood ?? '';
      render();
    }
  });

  return () => {
    disposed = true;
    runCleanups();
  };
}
