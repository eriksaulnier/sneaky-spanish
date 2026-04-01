const TOOLTIP_STYLES = `
  :host {
    position: fixed;
    z-index: 2147483647;
    pointer-events: none;
  }
  .tooltip {
    pointer-events: auto;
    background: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 10px 14px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 14px;
    line-height: 1.4;
    color: #333;
    max-width: 240px;
  }
  .label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #888;
    margin-bottom: 4px;
  }
  .original {
    font-weight: 600;
    font-size: 16px;
    color: #111;
  }
  .ipa {
    color: #666;
    font-size: 13px;
    margin-top: 2px;
  }
`;

class SneakyTooltip extends HTMLElement {
  private root: ShadowRoot;
  private container: HTMLDivElement;
  private labelEl: HTMLDivElement;
  private originalEl: HTMLDivElement;
  private ipaEl: HTMLDivElement;

  constructor() {
    super();
    this.root = this.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = TOOLTIP_STYLES;
    this.root.appendChild(style);

    this.container = document.createElement('div');
    this.container.className = 'tooltip';
    this.container.style.display = 'none';

    this.labelEl = document.createElement('div');
    this.labelEl.className = 'label';
    this.labelEl.textContent = 'Spanish for\u2026';

    this.originalEl = document.createElement('div');
    this.originalEl.className = 'original';

    this.ipaEl = document.createElement('div');
    this.ipaEl.className = 'ipa';

    this.container.appendChild(this.labelEl);
    this.container.appendChild(this.originalEl);
    this.container.appendChild(this.ipaEl);
    this.root.appendChild(this.container);
  }

  show(anchor: Element, original: string, ipa: string) {
    this.originalEl.textContent = original;
    this.ipaEl.textContent = ipa;
    this.container.style.display = 'block';
    this.position(anchor);
  }

  hide() {
    this.container.style.display = 'none';
  }

  get visible() {
    return this.container.style.display !== 'none';
  }

  private position(anchor: Element) {
    const rect = anchor.getBoundingClientRect();
    const gap = 6;

    this.style.left = '0px';
    this.style.top = '0px';

    requestAnimationFrame(() => {
      const tipRect = this.container.getBoundingClientRect();
      let top: number;
      let left: number;

      if (rect.bottom + gap + tipRect.height <= window.innerHeight) {
        top = rect.bottom + gap;
      } else {
        top = rect.top - gap - tipRect.height;
      }

      left = rect.left + rect.width / 2 - tipRect.width / 2;
      left = Math.max(8, Math.min(left, window.innerWidth - tipRect.width - 8));
      top = Math.max(8, top);

      this.style.left = `${left}px`;
      this.style.top = `${top}px`;
    });
  }
}

customElements.define('sneaky-tooltip', SneakyTooltip);

let tooltip: SneakyTooltip | null = null;

function getTooltip(): SneakyTooltip {
  if (!tooltip) {
    tooltip = document.createElement('sneaky-tooltip') as SneakyTooltip;
    document.body.appendChild(tooltip);
  }
  return tooltip;
}

export function initTooltip(): void {
  document.addEventListener('click', (e) => {
    const target = (e.target as Element).closest?.('.sneaky-word') as HTMLElement | null;
    if (target) {
      e.preventDefault();
      e.stopPropagation();
      const t = getTooltip();
      t.show(target, target.dataset.original!, target.dataset.ipa!);
    } else {
      const t = getTooltip();
      if (t.visible) t.hide();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && tooltip?.visible) {
      tooltip.hide();
    }
  });
}

export function destroyTooltip(): void {
  if (tooltip) {
    tooltip.remove();
    tooltip = null;
  }
}
