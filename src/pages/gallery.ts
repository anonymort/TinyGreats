import { listAllGreats } from '@/lib/db';
import type { Great } from '@/lib/types';

export function createGalleryPage(container: HTMLElement): void {
  container.innerHTML = '';

  let items: Great[] = [];
  let autoplay = false;
  let timer: number | null = null;

  async function loadData() {
    items = await listAllGreats();
    render();
  }

  function togglePlay() {
    autoplay = !autoplay;

    if (timer !== null) {
      clearInterval(timer);
      timer = null;
    }

    if (autoplay) {
      let i = 0;
      timer = window.setInterval(() => {
        const el = document.getElementById('g' + i);
        el?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        i = (i + 1) % items.length;
      }, 3200);
    }

    // Update button text
    const playBtn = document.getElementById('gallery-play-btn');
    if (playBtn) {
      playBtn.textContent = autoplay ? 'Pause' : 'Play';
    }
  }

  function render() {
    container.innerHTML = '';

    const section = document.createElement('section');

    // Header
    const header = document.createElement('div');
    header.className = 'flex items-center justify-between mb-3';

    const title = document.createElement('h1');
    title.className = 'font-serif text-slate-900';
    title.textContent = 'Gallery';

    const playBtn = document.createElement('button');
    playBtn.id = 'gallery-play-btn';
    playBtn.className = 'rounded border border-slate-300 bg-white px-3 py-1.5 text-slate-900 hover:bg-slate-100 transition-colors';
    playBtn.textContent = autoplay ? 'Pause' : 'Play';
    playBtn.addEventListener('click', togglePlay);

    header.appendChild(title);
    header.appendChild(playBtn);
    section.appendChild(header);

    // Gallery carousel
    const carousel = document.createElement('div');
    carousel.className = 'flex gap-4 snap-x overflow-x-auto';

    items.forEach((g, i) => {
      const card = document.createElement('div');
      card.id = 'g' + i;
      card.className = 'min-w-[85%] snap-center rounded-2xl border border-slate-200 bg-white p-5 shadow-sm';

      const emoji = document.createElement('div');
      emoji.className = 'text-5xl mb-2';
      emoji.textContent = g.mood ?? '✨';

      const date = document.createElement('div');
      date.className = 'text-sm opacity-60';
      date.textContent = g.ymd;

      const entryText = document.createElement('div');
      entryText.className = 'text-lg font-medium text-slate-900';
      entryText.textContent = g.entry;

      card.appendChild(emoji);
      card.appendChild(date);
      card.appendChild(entryText);
      carousel.appendChild(card);
    });

    section.appendChild(carousel);
    container.appendChild(section);

    // Cleanup on page unmount
    (section as any).__cleanup = () => {
      if (timer !== null) {
        clearInterval(timer);
        timer = null;
      }
    };
  }

  loadData();
}
