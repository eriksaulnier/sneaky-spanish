import { getSettings } from '../shared/storage';
import { recordClick, recordSeenWords } from '../shared/tracking';
import type { CEFRLevel, Dictionary } from '../shared/types';
import { buildWordSet } from '../shared/word-filter';
import { startObserver } from './observer';
import { restoreOriginalText } from './restore';
import { initTooltip } from './tooltip';
import { getViewportSeenWords, startVisibilityObserver } from './visibility';
import { computePhraseInfo, walkDOM } from './walker';

let currentDictionary: Dictionary | null = null;
let tooltipInitialized = false;

async function loadDictionary(): Promise<Dictionary> {
  const mod = await import('../data/dictionary.json');
  return mod.default as Dictionary;
}

async function flushSeenWords() {
  const seen = getViewportSeenWords();
  if (seen.length === 0) return;
  await recordSeenWords(seen);
}

async function activate(
  dictionary: Dictionary,
  level: CEFRLevel,
  highlight: boolean,
) {
  const wordSet = buildWordSet(dictionary, level);
  if (wordSet.size === 0) return;

  const phraseInfo = computePhraseInfo(wordSet);

  if (highlight) {
    document.documentElement.classList.add('sneaky-highlight');
  } else {
    document.documentElement.classList.remove('sneaky-highlight');
  }

  walkDOM(document.body, wordSet, phraseInfo);
  startVisibilityObserver();
  startObserver(wordSet, phraseInfo);

  if (!tooltipInitialized) {
    initTooltip((word) => {
      recordClick(word);
    });
    tooltipInitialized = true;
  }
}

async function init() {
  const settings = await getSettings();
  if (!settings.enabled) return;

  const hostname = window.location.hostname;
  if (settings.exclusions.includes(hostname)) return;

  currentDictionary = await loadDictionary();

  await activate(currentDictionary, settings.level, settings.highlight);
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'settings-changed') {
    handleSettingsChange();
  }
});

async function handleSettingsChange() {
  restoreOriginalText();

  const settings = await getSettings();
  if (!settings.enabled) return;

  const hostname = window.location.hostname;
  if (settings.exclusions.includes(hostname)) return;

  if (!currentDictionary) {
    currentDictionary = await loadDictionary();
  }

  await activate(currentDictionary, settings.level, settings.highlight);
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) flushSeenWords();
});
window.addEventListener('pagehide', () => flushSeenWords());

init();
