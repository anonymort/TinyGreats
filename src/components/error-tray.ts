import { getErrors, clearErrors, type ErrorEntry } from '@/lib/errorLog';

// Export cleanup registry for error tray components
export const errorTrayCleanups = new WeakMap<HTMLElement, () => void>();

export function createErrorTray(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'rounded-xl border border-slate-200 bg-white p-3 shadow-sm';

  const header = document.createElement('div');
  header.className = 'flex items-center justify-between mb-2';

  const title = document.createElement('div');
  title.className = 'text-sm font-medium';
  title.textContent = 'Error Tray (local only)';

  const clearBtn = document.createElement('button');
  clearBtn.className = 'text-xs underline';
  clearBtn.textContent = 'Clear';
  clearBtn.addEventListener('click', () => {
    clearErrors();
    renderErrors(listContainer);
  });

  header.appendChild(title);
  header.appendChild(clearBtn);
  container.appendChild(header);

  const listContainer = document.createElement('div');
  container.appendChild(listContainer);

  // Initial render
  renderErrors(listContainer);

  // Auto-refresh every 2 seconds
  const interval = setInterval(() => renderErrors(listContainer), 2000);

  // Store cleanup function in WeakMap
  errorTrayCleanups.set(container, () => clearInterval(interval));

  return container;
}

function renderErrors(container: HTMLElement): void {
  const items = getErrors();
  container.innerHTML = '';

  if (items.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'text-xs opacity-70';
    empty.textContent = 'No errors recorded.';
    container.appendChild(empty);
    return;
  }

  const list = document.createElement('ul');
  list.className = 'space-y-2 max-h-48 overflow-auto text-xs';

  items.slice().reverse().forEach((error: ErrorEntry) => {
    const item = document.createElement('li');

    const time = document.createElement('div');
    time.className = 'opacity-60';
    time.textContent = new Date(error.t).toLocaleString();

    const message = document.createElement('div');
    message.className = 'font-mono whitespace-pre-wrap break-words';
    message.textContent = error.m;

    item.appendChild(time);
    item.appendChild(message);
    list.appendChild(item);
  });

  container.appendChild(list);
}
