const TOOLTIP_STYLES = `
  :host {
    position: fixed;
    z-index: 2147483647;
    pointer-events: none;
  }
  .tooltip {
    pointer-events: auto;
    background: #fff;
    border: 1px solid #43A047;
    border-radius: 8px;
    padding: 10px 14px;
    box-shadow: 0 4px 16px rgba(67, 160, 71, 0.15);
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 14px;
    line-height: 1.4;
    color: #1a1a1a;
    max-width: 240px;
  }
  .label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #43A047;
    font-weight: 600;
    margin-bottom: 4px;
  }
  .original {
    font-weight: 600;
    font-size: 16px;
    color: #1a1a1a;
  }
  .ipa {
    color: #78716c;
    font-size: 13px;
    margin-top: 2px;
  }
`;

interface Tooltip {
  host: HTMLDivElement;
  container: HTMLDivElement;
  originalEl: HTMLDivElement;
  ipaEl: HTMLDivElement;
}

let tooltip: Tooltip | null = null;

function createTooltip(): Tooltip {
  const host = document.createElement('div');
  host.style.position = 'fixed';
  host.style.zIndex = '2147483647';
  host.style.pointerEvents = 'none';

  const shadow = host.attachShadow({ mode: 'open' });

  const style = document.createElement('style');
  style.textContent = TOOLTIP_STYLES;
  shadow.appendChild(style);

  const container = document.createElement('div');
  container.className = 'tooltip';
  container.style.display = 'none';

  const labelEl = document.createElement('div');
  labelEl.className = 'label';
  labelEl.textContent = 'Spanish for\u2026';

  const originalEl = document.createElement('div');
  originalEl.className = 'original';

  const ipaEl = document.createElement('div');
  ipaEl.className = 'ipa';

  container.appendChild(labelEl);
  container.appendChild(originalEl);
  container.appendChild(ipaEl);
  shadow.appendChild(container);
  document.body.appendChild(host);

  return { host, container, originalEl, ipaEl };
}

function getTooltip(): Tooltip {
  if (!tooltip) {
    tooltip = createTooltip();
  }
  return tooltip;
}

function isVisible(): boolean {
  return tooltip?.container.style.display !== 'none';
}

function show(anchor: Element, original: string, ipa: string) {
  const t = getTooltip();
  t.originalEl.textContent = original;
  t.ipaEl.textContent = ipa;
  t.container.style.display = 'block';
  position(t, anchor);
}

function hide() {
  if (tooltip) {
    tooltip.container.style.display = 'none';
  }
}

function position(t: Tooltip, anchor: Element) {
  const rect = anchor.getBoundingClientRect();
  const gap = 6;

  t.host.style.left = '0px';
  t.host.style.top = '0px';

  requestAnimationFrame(() => {
    const tipRect = t.container.getBoundingClientRect();
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

    t.host.style.left = `${left}px`;
    t.host.style.top = `${top}px`;
  });
}

export function initTooltip(onReveal?: (word: string) => void): void {
  let autoHideTimer: ReturnType<typeof setTimeout> | null = null;

  function clearAutoHide() {
    if (autoHideTimer) { clearTimeout(autoHideTimer); autoHideTimer = null; }
  }

  document.addEventListener('click', (e) => {
    const target = (e.target as Element).closest?.('.sneaky-word') as HTMLElement | null;
    if (target) {
      clearAutoHide();
      show(target, target.dataset.original!, target.dataset.ipa!);
      autoHideTimer = setTimeout(hide, 3000);
      onReveal?.(target.dataset.original!);
      return;
    }

    // Click outside tooltip hides it
    if (isVisible()) {
      const t = getTooltip();
      const clickedInTooltip = t.container.contains(e.target as Node);
      if (!clickedInTooltip) {
        clearAutoHide();
        hide();
      }
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isVisible()) {
      clearAutoHide();
      hide();
    }
  });
}

export function destroyTooltip(): void {
  if (tooltip) {
    tooltip.host.remove();
    tooltip = null;
  }
}
