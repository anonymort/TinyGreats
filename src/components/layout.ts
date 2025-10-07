import { Calendar, Image, Search, Settings, Sparkles } from 'lucide';
import { settings } from '@/lib/settings';
import { iconToSVG } from '@/lib/icons';

export function createLayout(_container: HTMLElement): HTMLElement {
  const layout = document.createElement('div');
  layout.className = 'min-h-full';

  // Apply typeface class
  settings.subscribe((s) => {
    const tfClass = s?.typeface === 'pairB' ? 'tf-b' : 'tf-a';
    layout.className = `min-h-full ${tfClass}`;
  });

  // Create header
  const header = createHeader();
  layout.appendChild(header);

  // Create main content area
  const main = document.createElement('main');
  main.id = 'app-content';
  main.className = 'mx-auto max-w-screen-sm px-6 py-8';
  layout.appendChild(main);

  return layout;
}

function createHeader(): HTMLElement {
  const header = document.createElement('header');
  header.className = 'sticky top-0 z-50 glass-subtle bg-slate-100/80 border-b border-slate-200/50';

  const nav = document.createElement('nav');
  nav.className = 'mx-auto max-w-screen-sm px-6 h-16 flex items-center justify-between';

  // Logo
  const logo = createLogo();
  nav.appendChild(logo);

  // Navigation icons
  const navIcons = createNavIcons();
  nav.appendChild(navIcons);

  header.appendChild(nav);
  return header;
}

function createLogo(): HTMLElement {
  const logo = document.createElement('a');
  logo.href = '#/';
  logo.className = 'flex items-center gap-2 font-bold text-lg text-slate-700 hover:text-slate-900 transition-colors duration-200';

  const iconEl = iconToSVG(Sparkles, 20);
  iconEl.classList.add('text-amber-500');

  const text = document.createElement('span');
  text.className = 'font-serif';
  text.textContent = 'Gratitude';

  logo.appendChild(iconEl);
  logo.appendChild(text);

  return logo;
}

function createNavIcons(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'flex items-center gap-1';
  container.setAttribute('role', 'toolbar');
  container.setAttribute('aria-label', 'Primary navigation');

  const icons = [
    {
      href: '#/calendar',
      icon: Calendar,
      label: 'Calendar',
      color: 'text-slate-600 hover:text-purple-600 hover:bg-slate-100'
    },
    {
      href: '#/gallery',
      icon: Image,
      label: 'Gallery',
      color: 'text-slate-600 hover:text-cyan-600 hover:bg-slate-100'
    },
    {
      href: '#/search',
      icon: Search,
      label: 'Search',
      color: 'text-slate-600 hover:text-green-600 hover:bg-slate-100'
    },
    {
      href: '#/settings',
      icon: Settings,
      label: 'Settings',
      color: 'text-slate-600 hover:text-orange-600 hover:bg-slate-100'
    }
  ];

  icons.forEach(({ href, icon, label, color }) => {
    const link = document.createElement('a');
    link.href = href;
    link.setAttribute('aria-label', label);
    link.setAttribute('title', label);
    link.className = `p-2.5 rounded-xl ${color} transition-all duration-200 btn-animate focus-ring`;

    const iconEl = iconToSVG(icon, 18);
    link.appendChild(iconEl);

    container.appendChild(link);
  });

  return container;
}
