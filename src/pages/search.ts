import { db } from '@/lib/db';
import type { Great } from '@/lib/types';

export function createSearchPage(container: HTMLElement): void {
  container.innerHTML = '';

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
    renderResults();
  }

  function render() {
    container.innerHTML = '';

    const section = document.createElement('section');
    section.className = 'space-y-4';

    // Title
    const title = document.createElement('h1');
    title.className = 'font-serif text-xl text-slate-900';
    title.textContent = 'Search & Filter';
    section.appendChild(title);

    // Filter inputs
    const grid = document.createElement('div');
    grid.className = 'grid grid-cols-1 gap-2 sm:grid-cols-4';

    const textInput = document.createElement('input');
    textInput.className = 'rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300';
    textInput.placeholder = 'Text contains…';
    textInput.value = q;
    textInput.addEventListener('input', (e) => {
      q = (e.target as HTMLInputElement).value;
      run();
    });

    const emojiInput = document.createElement('input');
    emojiInput.className = 'rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300';
    emojiInput.placeholder = 'Emoji (e.g., 😊)';
    emojiInput.maxLength = 2;
    emojiInput.value = emoji;
    emojiInput.addEventListener('input', (e) => {
      emoji = (e.target as HTMLInputElement).value;
      run();
    });

    const startInput = document.createElement('input');
    startInput.type = 'date';
    startInput.className = 'rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300';
    startInput.value = start;
    startInput.addEventListener('change', (e) => {
      start = (e.target as HTMLInputElement).value;
      run();
    });

    const endInput = document.createElement('input');
    endInput.type = 'date';
    endInput.className = 'rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300';
    endInput.value = end;
    endInput.addEventListener('change', (e) => {
      end = (e.target as HTMLInputElement).value;
      run();
    });

    grid.appendChild(textInput);
    grid.appendChild(emojiInput);
    grid.appendChild(startInput);
    grid.appendChild(endInput);
    section.appendChild(grid);

    // Results container
    const resultsContainer = document.createElement('div');
    resultsContainer.id = 'search-results';
    resultsContainer.className = 'divide-y divide-slate-200';
    section.appendChild(resultsContainer);

    container.appendChild(section);

    // Initial run
    run();
  }

  function renderResults() {
    const resultsContainer = document.getElementById('search-results');
    if (!resultsContainer) return;

    resultsContainer.innerHTML = '';

    if (results.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'text-sm opacity-60 py-6';
      empty.textContent = 'No matches yet.';
      resultsContainer.appendChild(empty);
      return;
    }

    results.forEach((g) => {
      const link = document.createElement('a');
      link.href = `#/day/${g.ymd}`;
      link.className = 'flex items-start gap-3 rounded px-2 py-3 hover:bg-slate-100 transition-colors';

      const emojiDiv = document.createElement('div');
      emojiDiv.className = 'text-2xl';
      emojiDiv.textContent = g.mood ?? '✨';

      const content = document.createElement('div');
      content.className = 'flex-1';

      const date = document.createElement('div');
      date.className = 'text-xs opacity-60';
      date.textContent = g.ymd;

      const entryText = document.createElement('div');
      entryText.className = 'text-sm text-slate-900';
      entryText.textContent = g.entry;

      content.appendChild(date);
      content.appendChild(entryText);

      link.appendChild(emojiDiv);
      link.appendChild(content);
      resultsContainer.appendChild(link);
    });
  }

  render();
}
