import { settings, updateSettings, loadSettings } from '@/lib/settings';
import { downloadBlob } from '@/lib/storage';
import { db } from '@/lib/db';
import { makeDailyICS } from '@/lib/ics';
import { createErrorTray } from '@/components/error-tray';

export function createSettingsPage(container: HTMLElement): () => void {
  container.innerHTML = '';

  let showErrors = false;
  let errorTrayElement: HTMLElement | null = null;
  let disposed = false;
  const cleanupFns: Array<() => void> = [];

  const registerCleanup = (fn: () => void) => cleanupFns.push(fn);

  const destroyErrorTray = () => {
    if (errorTrayElement) {
      const cleanup = (errorTrayElement as any).__cleanup;
      if (typeof cleanup === 'function') cleanup();
      errorTrayElement.remove();
      errorTrayElement = null;
    }
  };

  const runCleanups = () => {
    destroyErrorTray();
    while (cleanupFns.length) {
      try {
        cleanupFns.pop()?.();
      } catch (error) {
        console.error('[Settings] Cleanup error', error);
      }
    }
  };

  loadSettings();

  async function exportJson() {
    const data = {
      greats: await db.greats.toArray(),
      settings: await db.settings.toArray()
    };
    downloadBlob('tiny-gratitude-export.json', new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  }

  function makeIcs() {
    const blob = makeDailyICS('Tiny Gratitude', 'Add one great thing about today');
    downloadBlob('tiny-gratitude-reminder.ics', blob);
  }

  async function importJson(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const text = await file.text();
    const data = JSON.parse(text);

    if (Array.isArray(data.greats)) await db.greats.bulkPut(data.greats);
    if (Array.isArray(data.settings)) await db.settings.bulkPut(data.settings);

    alert('Import complete.');
  }

  function render() {
    if (disposed) return;
    runCleanups();
    container.innerHTML = '';

    const section = document.createElement('section');
    section.className = 'space-y-6';

    // Title
    const title = document.createElement('h1');
    title.className = 'font-serif text-xl text-slate-900';
    title.textContent = 'Settings';
    section.appendChild(title);

    // Typeface selector
    const typefaceSection = document.createElement('div');
    typefaceSection.className = 'space-y-2';

    const typefaceLabel = document.createElement('label');
    typefaceLabel.htmlFor = 'typeface-select';
    typefaceLabel.className = 'block text-sm opacity-80';
    typefaceLabel.textContent = 'Typeface';

    const typefaceSelect = document.createElement('select');
    typefaceSelect.id = 'typeface-select';
    typefaceSelect.className = 'rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300';

    const optionA = document.createElement('option');
    optionA.value = 'pairA';
    optionA.textContent = 'Serif prompt + Humanist sans';

    const optionB = document.createElement('option');
    optionB.value = 'pairB';
    optionB.textContent = 'Serif prompt + Geometric sans';

    typefaceSelect.appendChild(optionA);
    typefaceSelect.appendChild(optionB);

    const unsubscribe = settings.subscribe((s) => {
      if (disposed) return;
      typefaceSelect.value = s?.typeface || 'pairA';
    });
    registerCleanup(unsubscribe);

    typefaceSelect.addEventListener('change', (e) => {
      const value = (e.target as HTMLSelectElement).value as 'pairA' | 'pairB';
      updateSettings({ typeface: value });
    });

    typefaceSection.appendChild(typefaceLabel);
    typefaceSection.appendChild(typefaceSelect);
    section.appendChild(typefaceSection);

    // Export / Import section
    const exportSection = document.createElement('div');
    exportSection.className = 'space-y-2';

    const exportLabel = document.createElement('p');
    exportLabel.className = 'block text-sm opacity-80';
    exportLabel.textContent = 'Export / Import';

    const exportButtons = document.createElement('div');
    exportButtons.className = 'flex gap-3 items-center';

    const exportBtn = document.createElement('button');
    exportBtn.className = 'rounded border border-slate-300 bg-white px-3 py-1.5 text-slate-900 hover:bg-slate-100 transition-colors';
    exportBtn.textContent = 'Export JSON';
    exportBtn.addEventListener('click', exportJson);

    const importLabel = document.createElement('label');
    importLabel.htmlFor = 'import-file';
    importLabel.className = 'cursor-pointer rounded border border-slate-300 bg-white px-3 py-1.5 text-slate-900 hover:bg-slate-100 transition-colors';
    importLabel.textContent = 'Import JSON';

    const importInput = document.createElement('input');
    importInput.id = 'import-file';
    importInput.type = 'file';
    importInput.accept = 'application/json';
    importInput.className = 'hidden';
    importInput.addEventListener('change', importJson);

    importLabel.appendChild(importInput);

    exportButtons.appendChild(exportBtn);
    exportButtons.appendChild(importLabel);

    exportSection.appendChild(exportLabel);
    exportSection.appendChild(exportButtons);
    section.appendChild(exportSection);

    // Reminders section
    const reminderSection = document.createElement('div');
    reminderSection.className = 'space-y-2';

    const reminderLabel = document.createElement('p');
    reminderLabel.className = 'block text-sm opacity-80';
    reminderLabel.textContent = 'Reminders without servers';

    const icsBtn = document.createElement('button');
    icsBtn.className = 'rounded border border-slate-300 bg-white px-3 py-1.5 text-slate-900 hover:bg-slate-100 transition-colors';
    icsBtn.textContent = 'Download .ics (daily)';
    icsBtn.addEventListener('click', makeIcs);

    reminderSection.appendChild(reminderLabel);
    reminderSection.appendChild(icsBtn);
    section.appendChild(reminderSection);

    // Error Tray section
    const errorSection = document.createElement('div');
    errorSection.className = 'space-y-2';

    const errorLabel = document.createElement('p');
    errorLabel.className = 'block text-sm opacity-80';
    errorLabel.textContent = 'Error Tray';

    const errorBtn = document.createElement('button');
    errorBtn.className = 'rounded border border-slate-300 bg-white px-3 py-1.5 text-slate-900 hover:bg-slate-100 transition-colors';
    errorBtn.textContent = showErrors ? 'Hide errors' : 'Show errors';
    errorBtn.addEventListener('click', () => {
      showErrors = !showErrors;
      errorBtn.textContent = showErrors ? 'Hide errors' : 'Show errors';
      toggleErrorTray();
    });

    errorSection.appendChild(errorLabel);
    errorSection.appendChild(errorBtn);

    const errorTrayContainer = document.createElement('div');
    errorTrayContainer.id = 'error-tray-container';
    errorSection.appendChild(errorTrayContainer);

    section.appendChild(errorSection);

    // Footer note
    const note = document.createElement('p');
    note.className = 'text-xs opacity-70';
    note.textContent = 'Local-only pledge: no accounts, network blocked by CSP; service worker serves cached assets and rejects cross-origin.';
    section.appendChild(note);

    container.appendChild(section);
  }

  function toggleErrorTray() {
    if (disposed) return;
    const errorTrayContainer = document.getElementById('error-tray-container');
    if (!errorTrayContainer) return;

    if (showErrors) {
      if (!errorTrayElement) {
        errorTrayElement = createErrorTray();
      }
      errorTrayContainer.appendChild(errorTrayElement);
    } else {
      destroyErrorTray();
    }
  }

  render();

  return () => {
    disposed = true;
    runCleanups();
  };
}
