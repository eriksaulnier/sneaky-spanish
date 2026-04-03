import { beforeEach, describe, expect, it, vi } from 'vitest';
import { stopObserver } from '../../src/content/observer';
import { restoreOriginalText } from '../../src/content/restore';
import { destroyTooltip } from '../../src/content/tooltip';
import { stopVisibilityObserver } from '../../src/content/visibility';

// Mock the dependencies that restoreOriginalText calls
vi.mock('../../src/content/observer', () => ({
  stopObserver: vi.fn(),
}));

vi.mock('../../src/content/tooltip', () => ({
  destroyTooltip: vi.fn(),
}));

vi.mock('../../src/content/visibility', () => ({
  stopVisibilityObserver: vi.fn(),
}));

function createSneakySpan(original: string, spanish: string): HTMLSpanElement {
  const span = document.createElement('span');
  span.className = 'sneaky-word';
  span.dataset.original = original;
  span.textContent = spanish;
  return span;
}

describe('restoreOriginalText', () => {
  beforeEach(() => {
    document.body.textContent = '';
    document.documentElement.classList.remove('sneaky-highlight');
    vi.clearAllMocks();
  });

  it('replaces sneaky-word spans with original text nodes', () => {
    const p = document.createElement('p');
    p.appendChild(document.createTextNode('The '));
    p.appendChild(createSneakySpan('house', 'casa'));
    p.appendChild(document.createTextNode(' is big'));
    document.body.appendChild(p);

    restoreOriginalText();

    expect(p.textContent).toBe('The house is big');
    expect(p.querySelector('.sneaky-word')).toBeNull();
  });

  it('handles multiple spans', () => {
    const p = document.createElement('p');
    p.appendChild(createSneakySpan('cat', 'gato'));
    p.appendChild(document.createTextNode(' and '));
    p.appendChild(createSneakySpan('dog', 'perro'));
    document.body.appendChild(p);

    restoreOriginalText();

    expect(p.textContent).toBe('cat and dog');
    expect(document.querySelectorAll('.sneaky-word').length).toBe(0);
  });

  it('removes sneaky-highlight class from html element', () => {
    document.documentElement.classList.add('sneaky-highlight');

    restoreOriginalText();

    expect(
      document.documentElement.classList.contains('sneaky-highlight'),
    ).toBe(false);
  });

  it('no-op when no spans exist', () => {
    const p = document.createElement('p');
    p.textContent = 'Just plain text';
    document.body.appendChild(p);

    restoreOriginalText();

    expect(p.textContent).toBe('Just plain text');
  });

  it('calls stopObserver, stopVisibilityObserver, and destroyTooltip', () => {
    restoreOriginalText();

    expect(stopObserver).toHaveBeenCalledOnce();
    expect(stopVisibilityObserver).toHaveBeenCalledOnce();
    expect(destroyTooltip).toHaveBeenCalledOnce();
  });

  it('skips spans without data-original attribute', () => {
    const p = document.createElement('p');
    const span = document.createElement('span');
    span.className = 'sneaky-word';
    span.textContent = 'orphan';
    p.appendChild(span);
    p.appendChild(document.createTextNode(' text'));
    document.body.appendChild(p);

    restoreOriginalText();

    // Span without data-original should remain (no replacement possible)
    expect(document.querySelector('.sneaky-word')).not.toBeNull();
  });
});
