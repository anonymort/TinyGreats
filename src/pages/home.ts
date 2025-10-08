import { Heart, Save, Edit3, Calendar as CalendarIcon, Sparkles } from 'lucide';
import { ymdFromDate } from '@/lib/date';
import { getGreatByYmd, upsertGreat } from '@/lib/db';
import type { Great } from '@/lib/types';
import { clearBadge, setBadge } from '@/lib/storage';
import { EmojiPicker } from '@/components/emoji-picker';
import { addFocusBloom, addClickPulse, bloomElement, addHeartFillHover } from '@/lib/animations';
import { iconToSVG } from '@/lib/icons';

const today = ymdFromDate(new Date());
const MAX_RECENT_EMOJIS = 8;

export function createHomePage(container: HTMLElement): () => void {
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
        console.error('[Home] Cleanup error', error);
      }
    }
    emojiPicker = null;
  };

  try {
    recent = JSON.parse(localStorage.getItem('recent_emojis') || '[]');
  } catch {
    recent = [];
  }

  function render() {
    if (disposed) return;
    runCleanups();
    container.innerHTML = '';

    const bgGradient = document.createElement('div');
    bgGradient.className = 'absolute inset-0 bg-gradient-to-br from-purple-50 via-cyan-50 to-green-50 -z-10';
    container.appendChild(bgGradient);

    const card = document.createElement('section');
    card.id = 'today-card';
    card.className = 'relative glass bg-slate-50/70 border border-slate-200 rounded-3xl p-8 shadow-xl shadow-purple-100';

    if (!saved) {
      card.appendChild(renderEntryForm());
    } else {
      card.appendChild(renderSavedState());
    }

    container.appendChild(card);

    const footer = document.createElement('div');
    footer.className = 'mt-8 text-center';
    const footerText = document.createElement('p');
    footerText.className = 'text-slate-500 text-sm flex items-center justify-center gap-2';

    const dot = document.createElement('span');
    dot.className = 'w-2 h-2 rounded-full bg-green-500';

    footerText.appendChild(dot);
    footerText.appendChild(document.createTextNode('Local-only app • No accounts • No tracking'));
    footer.appendChild(footerText);
    container.appendChild(footer);
  }

  async function save() {
    const text = entry.trim();
    if (!text) return;

    const g: Great = {
      id: crypto.randomUUID(),
      ymd: today,
      entry: text.slice(0, 280),
      mood: mood || undefined,
      createdAt: Date.now(),
      v: 1
    };

    await upsertGreat(g);
    if (disposed) return;

    saved = g;
    clearBadge();

    try {
      navigator.vibrate?.(30);
    } catch {}

    const card = document.querySelector('#today-card');
    if (card) bloomElement(card as HTMLElement);

    if (mood) {
      recent = Array.from(new Set([mood, ...recent])).slice(0, MAX_RECENT_EMOJIS);
      localStorage.setItem('recent_emojis', JSON.stringify(recent));
    }

    render();
  }

  function resetEdit() {
    if (disposed) return;
    saved = null;
    render();
    setTimeout(() => {
      if (disposed) return;
      const input = document.querySelector('#entry-input') as HTMLInputElement | null;
      input?.focus();
    }, 100);
  }

  function renderEntryForm(): HTMLElement {
    const form = document.createElement('div');

    const header = document.createElement('div');
    header.className = 'flex items-center gap-3 mb-6';

    const iconContainer = document.createElement('div');
    iconContainer.className = 'p-3 rounded-2xl bg-pink-100 text-pink-600';
    const heartIcon = iconToSVG(Heart, 24);
    heartIcon.style.display = 'inline-block';
    const heartFillCleanup = addHeartFillHover(heartIcon);
    registerCleanup(heartFillCleanup);
    iconContainer.appendChild(heartIcon);

    const textContainer = document.createElement('div');
    const title = document.createElement('h1');
    title.className = 'text-2xl font-serif font-semibold text-slate-900 mb-1';
    title.textContent = "Today's Gratitude";

    const subtitle = document.createElement('p');
    subtitle.className = 'text-slate-600 text-sm';
    subtitle.textContent = "What's one great thing about today?";

    textContainer.appendChild(title);
    textContainer.appendChild(subtitle);
    header.appendChild(iconContainer);
    header.appendChild(textContainer);
    form.appendChild(header);

    const inputArea = document.createElement('div');
    inputArea.className = 'space-y-4';

    const inputWrapper = document.createElement('div');
    inputWrapper.className = 'relative';

    let saveBtn: HTMLButtonElement;

    const input = document.createElement('input');
    input.id = 'entry-input';
    input.type = 'text';
    input.maxLength = 280;
    input.placeholder = 'Something wonderful happened...';
    input.value = entry;
    input.className = 'w-full px-4 py-4 rounded-2xl glass-subtle bg-slate-100/50 border border-slate-300 text-slate-900 placeholder-slate-400 focus-ring transition-all duration-200';

    const charCounter = document.createElement('div');
    charCounter.id = 'char-counter';
    charCounter.className = 'absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm';
    charCounter.textContent = String(280 - entry.length);

    input.addEventListener('input', (e) => {
      entry = (e.target as HTMLInputElement).value;
      charCounter.textContent = String(280 - entry.length);
      if (saveBtn) saveBtn.disabled = !entry.trim();
    });

    const focusCleanup = addFocusBloom(input);
    registerCleanup(focusCleanup);

    inputWrapper.appendChild(input);
    inputWrapper.appendChild(charCounter);
    inputArea.appendChild(inputWrapper);

    const buttonRow = document.createElement('div');
    buttonRow.className = 'flex items-center gap-3';

    const emojiBtn = document.createElement('button');
    emojiBtn.className = 'flex-shrink-0 w-14 h-14 rounded-2xl glass-subtle bg-slate-100/50 border border-slate-300 text-2xl btn-animate focus-ring flex items-center justify-center';
    emojiBtn.textContent = mood || '😊';
    emojiBtn.setAttribute('aria-label', 'Pick mood emoji');

    emojiPicker?.destroy();
    const picker = new EmojiPicker({
      anchor: emojiBtn,
      recent,
      onSelect: (emoji) => {
        mood = emoji;
        emojiBtn.textContent = mood || '😊';
        picker.updateRecent(recent);
      }
    });
    emojiPicker = picker;
    emojiBtn.addEventListener('click', () => picker.toggle());
    registerCleanup(() => picker.destroy());

    saveBtn = document.createElement('button');
    saveBtn.className = 'flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-medium transition-all duration-200 btn-animate focus-ring disabled:opacity-50 disabled:cursor-not-allowed';
    saveBtn.disabled = !entry.trim();
    saveBtn.appendChild(iconToSVG(Save, 18));
    saveBtn.appendChild(document.createTextNode('Save Gratitude'));
    saveBtn.addEventListener('click', save);

    const clickCleanup = addClickPulse(saveBtn);
    registerCleanup(clickCleanup);

    buttonRow.appendChild(emojiBtn);
    buttonRow.appendChild(saveBtn);
    inputArea.appendChild(buttonRow);

    const tip = document.createElement('p');
    tip.className = 'text-slate-500 text-sm text-center';
    tip.textContent = '💡 Tip: Add an emoji to capture your mood';
    inputArea.appendChild(tip);

    form.appendChild(inputArea);

    return form;
  }

  function renderSavedState(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'text-center space-y-6';

    // Mood and content
    const contentArea = document.createElement('div');
    contentArea.className = 'space-y-4';

    const moodDisplay = document.createElement('div');
    moodDisplay.className = 'text-6xl mb-4';
    moodDisplay.textContent = saved!.mood ?? '✨';
    moodDisplay.setAttribute('aria-hidden', 'true');

    const textArea = document.createElement('div');
    const label = document.createElement('div');
    label.className = 'text-slate-600 text-sm mb-2 flex items-center justify-center gap-2';
    label.appendChild(iconToSVG(Sparkles, 16));
    label.appendChild(document.createTextNode("Today's Gratitude"));

    const entryText = document.createElement('div');
    entryText.className = 'text-xl font-medium text-slate-900 leading-relaxed';
    entryText.textContent = saved!.entry;

    textArea.appendChild(label);
    textArea.appendChild(entryText);
    contentArea.appendChild(moodDisplay);
    contentArea.appendChild(textArea);
    container.appendChild(contentArea);

    // Action buttons
    const buttonRow = document.createElement('div');
    buttonRow.className = 'flex gap-3 justify-center';

    const calendarLink = document.createElement('a');
    calendarLink.href = '#/calendar';
    calendarLink.className = 'flex items-center gap-2 px-4 py-3 rounded-xl glass-subtle bg-slate-100/50 text-slate-600 hover:text-cyan-600 hover:bg-slate-200/50 transition-all duration-200 btn-animate focus-ring';
    calendarLink.appendChild(iconToSVG(CalendarIcon, 16));
    calendarLink.appendChild(document.createTextNode('View Calendar'));

    const editBtn = document.createElement('button');
    editBtn.className = 'flex items-center gap-2 px-4 py-3 rounded-xl glass-subtle bg-slate-100/50 text-slate-600 hover:text-orange-600 hover:bg-slate-200/50 transition-all duration-200 btn-animate focus-ring';
    editBtn.appendChild(iconToSVG(Edit3, 16));
    editBtn.appendChild(document.createTextNode('Edit Entry'));
    editBtn.addEventListener('click', resetEdit);

    buttonRow.appendChild(calendarLink);
    buttonRow.appendChild(editBtn);
    container.appendChild(buttonRow);

    return container;
  }

  render();

  getGreatByYmd(today).then((existing) => {
    if (disposed) return;
    if (existing) {
      saved = existing;
      entry = existing.entry;
      mood = existing.mood ?? '';
      clearBadge();
      render();
    } else {
      setBadge(1);
    }
  });

  return () => {
    disposed = true;
    runCleanups();
  };
}
