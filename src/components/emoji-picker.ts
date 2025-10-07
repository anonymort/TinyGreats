const EMOJIS = ['😊', '✨', '😌', '😀', '😄', '😎', '🥰', '🤗', '🙌', '🌿', '🌞', '🌙', '⭐️', '🌈', '🍃', '🍵', '🫖', '🎈', '🎉', '🍊', '🍓', '☕️'];

export interface EmojiPickerOptions {
  anchor: HTMLElement;
  recent: string[];
  onSelect: (emoji: string) => void;
}

export class EmojiPicker {
  private panel: HTMLElement | null = null;
  private isOpen = false;
  private options: EmojiPickerOptions;

  constructor(options: EmojiPickerOptions) {
    this.options = options;
    this.handleDocClick = this.handleDocClick.bind(this);
  }

  toggle(): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open(): void {
    if (this.isOpen) return;

    this.panel = this.createPanel();
    document.body.appendChild(this.panel);

    // Position relative to anchor
    this.positionPanel();

    this.isOpen = true;
    document.addEventListener('click', this.handleDocClick);
  }

  close(): void {
    if (!this.isOpen || !this.panel) return;

    this.panel.remove();
    this.panel = null;
    this.isOpen = false;
    document.removeEventListener('click', this.handleDocClick);
  }

  updateRecent(recent: string[]): void {
    this.options.recent = recent;
  }

  private createPanel(): HTMLElement {
    const panel = document.createElement('div');
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Emoji picker');
    panel.className = 'absolute z-50 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-lg';

    // Recent emojis section
    if (this.options.recent.length > 0) {
      const recentLabel = document.createElement('div');
      recentLabel.className = 'mb-1 text-[11px] opacity-60 px-1';
      recentLabel.textContent = 'Recent';
      panel.appendChild(recentLabel);

      const recentGrid = document.createElement('div');
      recentGrid.className = 'grid grid-cols-8 gap-1 mb-2';

      this.options.recent.forEach(emoji => {
        const btn = this.createEmojiButton(emoji);
        recentGrid.appendChild(btn);
      });

      panel.appendChild(recentGrid);
    }

    // Popular emojis section
    const popularLabel = document.createElement('div');
    popularLabel.className = 'mb-1 text-[11px] opacity-60 px-1';
    popularLabel.textContent = 'Popular';
    panel.appendChild(popularLabel);

    const popularGrid = document.createElement('div');
    popularGrid.className = 'grid grid-cols-8 gap-1';

    EMOJIS.forEach(emoji => {
      const btn = this.createEmojiButton(emoji);
      popularGrid.appendChild(btn);
    });

    panel.appendChild(popularGrid);

    return panel;
  }

  private createEmojiButton(emoji: string): HTMLElement {
    const btn = document.createElement('button');
    btn.className = 'h-8 w-8 rounded hover:bg-slate-100 transition-colors';
    btn.textContent = emoji;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.options.onSelect(emoji);
      this.close();
    });
    return btn;
  }

  private positionPanel(): void {
    if (!this.panel) return;

    const anchorRect = this.options.anchor.getBoundingClientRect();
    this.panel.style.position = 'fixed';
    this.panel.style.left = `${anchorRect.left}px`;
    this.panel.style.top = `${anchorRect.bottom + 8}px`;
  }

  private handleDocClick(e: MouseEvent): void {
    if (!this.panel || !this.isOpen) return;

    const target = e.target as Node;
    if (!this.panel.contains(target) && !this.options.anchor.contains(target)) {
      this.close();
    }
  }

  destroy(): void {
    this.close();
  }
}
