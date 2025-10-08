import { ymdFromDate } from '@/lib/date';
import { listAllGreats } from '@/lib/db';
import type { Great } from '@/lib/types';

type Day = { ymd: string; filled: boolean; isFuture: boolean; mood?: string };

export function createCalendarPage(container: HTMLElement): () => void {
  container.innerHTML = '';

  const today = new Date();
  const currentYmd = ymdFromDate(today);
  let month = today.getMonth();
  let year = today.getFullYear();
  let greatsByYmd = new Map<string, Great>();
  let disposed = false;

  async function loadData() {
    const all = await listAllGreats();
    if (disposed) return;
    greatsByYmd = new Map(all.map(g => [g.ymd, g]));
    render();
  }

  function jumpToToday() {
    month = today.getMonth();
    year = today.getFullYear();
    render();
  }

  function computeMonthDays(y: number, m: number): (Day | null)[] {
    const out: (Day | null)[] = [];
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const firstDayOfWeek = new Date(y, m, 1).getDay(); // 0=Sun, 1=Mon, ..., 6=Sat

    // Add empty cells for days before the month starts
    for (let i = 0; i < firstDayOfWeek; i++) {
      out.push(null);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(y, m, d);
      const ymd = ymdFromDate(date);
      const isFuture = ymd > currentYmd;
      const great = greatsByYmd.get(ymd);
      out.push({
        ymd,
        filled: !!great,
        isFuture,
        mood: great?.mood
      });
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

    const navLeft = document.createElement('div');
    navLeft.className = 'flex items-center gap-2';

    const prevBtn = document.createElement('button');
    prevBtn.textContent = '←';
    prevBtn.className = 'p-2 rounded-xl text-slate-600 hover:text-purple-600 hover:bg-slate-100 transition-all duration-200 btn-animate focus-ring';
    prevBtn.setAttribute('aria-label', 'Previous month');
    prevBtn.addEventListener('click', prevMonth);

    const todayBtn = document.createElement('button');
    todayBtn.textContent = 'Today';
    todayBtn.className = 'px-3 py-1.5 text-sm rounded-xl text-slate-600 hover:text-purple-600 hover:bg-slate-100 transition-all duration-200 btn-animate focus-ring';
    todayBtn.setAttribute('aria-label', 'Jump to current month');
    todayBtn.addEventListener('click', jumpToToday);

    navLeft.appendChild(prevBtn);
    navLeft.appendChild(todayBtn);

    const title = document.createElement('h1');
    title.className = 'font-serif text-xl text-slate-900';
    title.textContent = new Date(year, month).toLocaleString(undefined, { month: 'long', year: 'numeric' });

    const nextBtn = document.createElement('button');
    nextBtn.textContent = '→';
    nextBtn.className = 'p-2 rounded-xl text-slate-600 hover:text-purple-600 hover:bg-slate-100 transition-all duration-200 btn-animate focus-ring disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-slate-600 disabled:hover:bg-transparent';
    nextBtn.setAttribute('aria-label', 'Next month');
    nextBtn.disabled = !canGoNext;
    nextBtn.addEventListener('click', nextMonth);

    header.appendChild(navLeft);
    header.appendChild(title);
    header.appendChild(nextBtn);
    section.appendChild(header);

    // Weekday headers
    const weekdayHeader = document.createElement('div');
    weekdayHeader.className = 'grid grid-cols-7 gap-2 mb-2';
    const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    weekdays.forEach(day => {
      const label = document.createElement('div');
      label.className = 'text-center text-xs font-medium text-slate-500';
      label.textContent = day;
      weekdayHeader.appendChild(label);
    });
    section.appendChild(weekdayHeader);

    // Calendar grid
    const grid = document.createElement('div');
    grid.className = 'grid grid-cols-7 gap-2';

    days.forEach(d => {
      if (d === null) {
        // Empty cell for calendar alignment
        const emptyCell = document.createElement('div');
        emptyCell.className = 'aspect-square';
        emptyCell.setAttribute('aria-hidden', 'true');
        grid.appendChild(emptyCell);
      } else if (d.isFuture) {
        // Future dates: dimmed and non-clickable
        const futureDay = document.createElement('div');
        futureDay.className = 'aspect-square rounded-lg border border-slate-200/30 relative flex flex-col items-center justify-center opacity-40 cursor-not-allowed';
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
        const baseClasses = 'aspect-square rounded-lg border relative flex flex-col items-center justify-center transition-all duration-200 btn-animate focus-ring';

        if (d.filled) {
          // Filled days: purple tint background with emoji
          link.className = `${baseClasses} border-purple-300 bg-purple-50 hover:bg-purple-100 text-slate-900`;
        } else {
          // Empty days: default styling
          link.className = `${baseClasses} border-slate-200 hover:bg-slate-100 text-slate-900 hover:text-purple-600`;
        }

        link.href = `#/day/${d.ymd}`;
        link.setAttribute('aria-label', d.ymd);

        if (d.filled && d.mood) {
          // Show emoji for filled days
          const emoji = document.createElement('span');
          emoji.className = 'text-lg mb-0.5';
          emoji.textContent = d.mood;
          link.appendChild(emoji);
        }

        const dayNum = document.createElement('span');
        dayNum.className = 'text-xs';
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
