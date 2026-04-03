import { stopObserver } from './observer';
import { destroyTooltip } from './tooltip';
import { stopVisibilityObserver } from './visibility';

export function restoreOriginalText(): void {
  stopObserver();
  stopVisibilityObserver();
  destroyTooltip();

  const spans = document.querySelectorAll('.sneaky-word');
  for (const span of spans) {
    const original = (span as HTMLElement).dataset.original;
    if (original) {
      const textNode = document.createTextNode(original);
      span.parentNode?.replaceChild(textNode, span);
    }
  }

  document.documentElement.classList.remove('sneaky-highlight');
}
