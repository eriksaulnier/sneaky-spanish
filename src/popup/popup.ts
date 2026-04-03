import type { CEFRLevel } from '../shared/types';
import { getSettings, saveSettings } from '../shared/storage';
import { getWordsToReview } from '../shared/tracking';
import { populateLevelSelect } from '../shared/constants';

const enabledEl = document.getElementById('enabled') as HTMLInputElement;
const levelEl = document.getElementById('level') as HTMLSelectElement;
const highlightEl = document.getElementById('highlight') as HTMLInputElement;
const excludeBtn = document.getElementById('exclude-site') as HTMLButtonElement;
const siteStatus = document.getElementById('site-status') as HTMLParagraphElement;
const optionsLink = document.getElementById('options-link') as HTMLAnchorElement;

let currentHostname = '';

async function init() {
  const settings = await getSettings();

  enabledEl.checked = settings.enabled;
  populateLevelSelect(levelEl, settings.level);
  highlightEl.checked = settings.highlight;

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.url) {
    try {
      currentHostname = new URL(tab.url).hostname;
    } catch {
      currentHostname = '';
    }
  }

  updateExcludeButton(settings.exclusions.includes(currentHostname));

  enabledEl.addEventListener('change', async () => {
    await saveSettings({ enabled: enabledEl.checked });
    notifyContentScript(tab?.id);
  });

  levelEl.addEventListener('change', async () => {
    await saveSettings({ level: levelEl.value as CEFRLevel });
    notifyContentScript(tab?.id);
  });

  highlightEl.addEventListener('change', async () => {
    await saveSettings({ highlight: highlightEl.checked });
    notifyContentScript(tab?.id);
  });

  excludeBtn.addEventListener('click', async () => {
    if (!currentHostname) return;
    const settings = await getSettings();
    const isExcluded = settings.exclusions.includes(currentHostname);

    if (isExcluded) {
      const exclusions = settings.exclusions.filter((h) => h !== currentHostname);
      await saveSettings({ exclusions });
    } else {
      const exclusions = [...settings.exclusions, currentHostname];
      await saveSettings({ exclusions });
    }
    updateExcludeButton(!isExcluded);
    notifyContentScript(tab?.id);
  });

  optionsLink.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.runtime.openOptionsPage();
  });

  const practiceList = document.getElementById('practice-list') as HTMLDivElement;
  const wordsToReview = await getWordsToReview(5);
  if (wordsToReview.length === 0) {
    practiceList.textContent = 'Start browsing to track your progress.';
    practiceList.classList.add('empty');
  } else {
    for (const { word, stat } of wordsToReview) {
      const row = document.createElement('div');
      row.className = 'practice-row';

      const wordEl = document.createElement('span');
      wordEl.className = 'practice-word';
      wordEl.textContent = word;

      const countEl = document.createElement('span');
      countEl.className = 'practice-count';
      countEl.textContent = `${stat.count}\u00d7`;

      row.appendChild(wordEl);
      row.appendChild(countEl);
      practiceList.appendChild(row);
    }
  }
}

function updateExcludeButton(excluded: boolean) {
  if (!currentHostname) {
    excludeBtn.textContent = 'No site detected';
    excludeBtn.disabled = true;
    return;
  }
  if (excluded) {
    excludeBtn.textContent = `Include ${currentHostname}`;
    excludeBtn.classList.add('excluded');
    siteStatus.textContent = 'This site is excluded';
  } else {
    excludeBtn.textContent = `Exclude ${currentHostname}`;
    excludeBtn.classList.remove('excluded');
    siteStatus.textContent = '';
  }
}

function notifyContentScript(tabId?: number) {
  if (tabId) {
    chrome.tabs.sendMessage(tabId, { type: 'settings-changed' }).catch(() => {});
  }
}

init();
