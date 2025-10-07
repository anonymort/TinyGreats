import { ymdFromDate } from '@/lib/date';
import { listAllGreats } from '@/lib/db';

type Day = { ymd: string; filled: boolean; isFuture: boolean };

export function createCalendarPage(container: HTMLElement): () => void {
  container.innerHTML = '';

  const today = new Date();
  const currentYmd = ymdFromDate(today);
  let month = today.getMonth();
  let year = today.getFullYear();
  let filledSet = new Set<string>();
  let disposed = false;

  async function loadData() {
    const all = await listAllGreats();
    if (disposed) return;
    filledSet = new Set(all.map(g => g.ymd));
    render();
  }

  function computeMonthDays(y: number, m: number): Day[] {
    const out: Day[] = [];
    const daysInMonth = new Date(y, m + 1, 0).getDate();

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(y, m, d);
      const ymd = ymdFromDate(date);
      const isFuture = ymd > currentYmd;
      out.push({ ymd, filled: filledSet.has(ymd), isFuture });
    }

    return out;
  }

  function prevMonth() {
    if (month === 0) {
      month = 11;
      year -= 1;
    } else {
      month -= 1;
    }
    render();
  }

  function nextMonth() {
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Don't allow navigation beyond current month
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      if (month === 11) {
        month = 0;
        year += 1;
      } else {
        month += 1;
      }
      render();
    }
  }

  function render() {
    if (disposed) return;
    const days = computeMonthDays(year, month);
    const canGoNext = year < today.getFullYear() || (year === today.getFullYear() && month < today.getMonth());

    container.innerHTML = '';

    const section = document.createElement('section');

    // Header with navigation
    const header = document.createElement('div');
    header.className = 'flex items-center justify-between mb-3';

    const prevBtn = document.createElement('button');
    prevBtn.textContent = '←';
    prevBtn.className = 'p-2 rounded-xl text-slate-600 hover:text-purple-600 hover:bg-slate-100 transition-all duration-200 btn-animate focus-ring';
    prevBtn.setAttribute('aria-label', 'Previous month');
    prevBtn.addEventListener('click', prevMonth);

    const title = document.createElement('h1');
    title.className = 'font-serif text-xl text-slate-900';
    title.textContent = new Date(year, month).toLocaleString(undefined, { month: 'long', year: 'numeric' });

    const nextBtn = document.createElement('button');
    nextBtn.textContent = '→';
    nextBtn.className = 'p-2 rounded-xl text-slate-600 hover:text-purple-600 hover:bg-slate-100 transition-all duration-200 btn-animate focus-ring disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-slate-600 disabled:hover:bg-transparent';
    nextBtn.setAttribute('aria-label', 'Next month');
    nextBtn.disabled = !canGoNext;
    nextBtn.addEventListener('click', nextMonth);

    header.appendChild(prevBtn);
    header.appendChild(title);
    header.appendChild(nextBtn);
    section.appendChild(header);

    // Calendar grid
    const grid = document.createElement('div');
    grid.className = 'grid grid-cols-7 gap-2';

    days.forEach(d => {
      if (d.isFuture) {
        // Future dates: dimmed and non-clickable
        const futureDay = document.createElement('div');
        futureDay.className = 'aspect-square rounded-lg border border-slate-200/30 relative flex items-center justify-center opacity-40 cursor-not-allowed';
        futureDay.setAttribute('aria-label', `${d.ymd} (future date)`);
        futureDay.setAttribute('aria-disabled', 'true');

        const dayNum = document.createElement('span');
        dayNum.className = 'text-sm text-slate-500';
        dayNum.textContent = String(parseInt(d.ymd.slice(-2)));

        futureDay.appendChild(dayNum);
        grid.appendChild(futureDay);
      } else {
        // Past and current dates: clickable
        const link = document.createElement('a');
        link.href = `#/day/${d.ymd}`;
        link.className = 'aspect-square rounded-lg border border-slate-200 relative flex items-center justify-center hover:bg-slate-100 transition-all duration-200 text-slate-900 hover:text-purple-600 btn-animate focus-ring';
        link.setAttribute('aria-label', d.ymd);

        if (d.filled) {
          const indicator = document.createElement('span');
          indicator.className = 'w-2 h-2 rounded-full bg-green-500 absolute top-1.5 right-1.5 shadow-lg';
          link.appendChild(indicator);
        }

        const dayNum = document.createElement('span');
        dayNum.className = 'text-sm';
        dayNum.textContent = String(parseInt(d.ymd.slice(-2)));

        link.appendChild(dayNum);
        grid.appendChild(link);
      }
    });

    section.appendChild(grid);
    container.appendChild(section);
  }

  loadData();

  return () => {
    disposed = true;
  };
}
