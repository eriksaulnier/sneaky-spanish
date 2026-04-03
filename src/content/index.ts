import type { Dictionary, CEFRLevel } from '../shared/types';
import { getSettings } from '../shared/storage';
import { recordClick, updateStreaks, recordSeenWords } from '../shared/tracking';
import { walkDOM, computePhraseInfo, type WordSet } from './walker';
import { startObserver } from './observer';
import { initTooltip } from './tooltip';
import { restoreOriginalText } from './restore';
import { buildWordSet } from '../shared/word-filter';
import { startVisibilityObserver, getViewportSeenWords, stopVisibilityObserver } from './visibility';

let currentDictionary: Dictionary | null = null;
const clickedWords = new Set<string>();
let tooltipInitialized = false;

async function flushStreaks() {
  const seen = getViewportSeenWords();
  if (seen.length === 0) return;
  await recordSeenWords(seen);
  await updateStreaks(seen, [...clickedWords]);
  clickedWords.clear();
}

async function activate(dictionary: Dictionary, level: CEFRLevel, highlight: boolean) {
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
      clickedWords.add(word);
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

  const dictModule = await import('../data/dictionary.json');
  currentDictionary = dictModule.default as Dictionary;

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
    const dictModule = await import('../data/dictionary.json');
    currentDictionary = dictModule.default as Dictionary;
  }

  await activate(currentDictionary, settings.level, settings.highlight);
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) flushStreaks();
});
window.addEventListener('beforeunload', flushStreaks);

init();
