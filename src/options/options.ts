import type { CEFRLevel, Dictionary, Settings, WordStats, DictionaryEntry } from '../shared/types';
import { getSettings, saveSettings } from '../shared/storage';
import { getWordStats, resetWordStats } from '../shared/tracking';
import { buildWordSet } from '../shared/word-filter';
import { CEFR_LEVELS, isLevelIncluded } from '../shared/constants';

function debounce(fn: () => void, ms: number): () => void {
  let timer: ReturnType<typeof setTimeout>;
  return () => { clearTimeout(timer); timer = setTimeout(fn, ms); };
}

// DOM element references
const levelEl = document.getElementById('level') as HTMLSelectElement;
const statActive = document.getElementById('stat-active') as HTMLElement;
const statSeen = document.getElementById('stat-seen') as HTMLElement;
const statEncounters = document.getElementById('stat-encounters') as HTMLElement;
const statClicked = document.getElementById('stat-clicked') as HTMLElement;
const progressSummary = document.getElementById('progress-summary') as HTMLElement;

const statsSearch = document.getElementById('stats-search') as HTMLInputElement;
const statsBody = document.getElementById('stats-body') as HTMLTableSectionElement;
const statsEmpty = document.getElementById('stats-empty') as HTMLElement;
const tableContainer = document.querySelector('.table-container') as HTMLElement;
const resetAllBtn = document.getElementById('reset-all') as HTMLButtonElement;

const wordlistSearch = document.getElementById('wordlist-search') as HTMLInputElement;
const currentLevel = document.getElementById('current-level') as HTMLElement;
const wordlistGroups = document.getElementById('wordlist-groups') as HTMLElement;

const listEl = document.getElementById('exclusion-list') as HTMLUListElement;
const emptyMsg = document.getElementById('empty-message') as HTMLParagraphElement;
const newSiteInput = document.getElementById('new-site') as HTMLInputElement;
const addBtn = document.getElementById('add-site') as HTMLButtonElement;

// State
let dictionary: Dictionary;
let settings: Settings;
let wordStats: WordStats;

// Sort state for stats table
let sortColumn = 'clicks';
let sortAsc = false;

async function init() {
  dictionary = (await import('../data/dictionary.json')).default as Dictionary;
  settings = await getSettings();
  wordStats = await getWordStats();

  levelEl.value = settings.level;
  renderProgress();
  renderWordStats();
  renderActiveWords();
  renderExclusions();
  setupEventListeners();
}

function renderProgress() {
  const activeCount = buildWordSet(dictionary, settings.level).size;
  const entries = Object.values(wordStats);

  const seen = entries.filter((s) => (s.seenCount ?? 0) > 0).length;
  const encounters = entries.reduce((sum, s) => sum + (s.seenCount ?? 0), 0);
  const clicked = entries.filter((s) => s.count > 0).length;

  statActive.textContent = String(activeCount);
  statSeen.textContent = String(seen);
  statEncounters.textContent = String(encounters);
  statClicked.textContent = String(clicked);

  progressSummary.textContent =
    seen > 0
      ? `You've encountered ${seen} words and only needed help with ${clicked}.`
      : '';
}

function renderWordStats() {
  const query = statsSearch.value.trim().toLowerCase();

  type Row = {
    word: string;
    entry: DictionaryEntry | undefined;
    seenCount: number;
    count: number;
  };

  const rows: Row[] = Object.entries(wordStats)
    .filter(([, stat]) => (stat.seenCount ?? 0) > 0 || stat.count > 0)
    .map(([word, stat]) => ({
      word,
      entry: dictionary[word],
      seenCount: stat.seenCount ?? 0,
      count: stat.count,
    }));

  const filtered = query
    ? rows.filter(
        (r) =>
          r.word.toLowerCase().includes(query) ||
          (r.entry?.es ?? '').toLowerCase().includes(query),
      )
    : rows;

  const levelIndex = (level: string | undefined) =>
    level ? CEFR_LEVELS.indexOf(level as (typeof CEFR_LEVELS)[number]) : -1;

  filtered.sort((a, b) => {
    let cmp = 0;
    switch (sortColumn) {
      case 'word':
        cmp = a.word.localeCompare(b.word);
        break;
      case 'spanish':
        cmp = (a.entry?.es ?? '').localeCompare(b.entry?.es ?? '');
        break;
      case 'level':
        cmp = levelIndex(a.entry?.level) - levelIndex(b.entry?.level);
        break;
      case 'seen':
        cmp = a.seenCount - b.seenCount;
        break;
      case 'clicks':
        cmp = a.count - b.count;
        break;
    }
    return sortAsc ? cmp : -cmp;
  });

  statsBody.textContent = '';

  for (const row of filtered) {
    const tr = document.createElement('tr');

    const tdWord = document.createElement('td');
    tdWord.textContent = row.word;
    tr.appendChild(tdWord);

    const tdSpanish = document.createElement('td');
    tdSpanish.textContent = row.entry?.es ?? '—';
    tr.appendChild(tdSpanish);

    const tdLevel = document.createElement('td');
    tdLevel.textContent = row.entry?.level ?? '—';
    tr.appendChild(tdLevel);

    const tdSeen = document.createElement('td');
    tdSeen.textContent = String(row.seenCount);
    tr.appendChild(tdSeen);

    const tdClicks = document.createElement('td');
    tdClicks.textContent = String(row.count);
    tr.appendChild(tdClicks);

    const tdReset = document.createElement('td');
    const resetBtn = document.createElement('button');
    resetBtn.type = 'button';
    resetBtn.className = 'reset-btn';
    resetBtn.textContent = 'Reset';
    resetBtn.addEventListener('click', async () => {
      await resetWordStats([row.word]);
      wordStats = await getWordStats();
      renderProgress();
      renderWordStats();
    });
    tdReset.appendChild(resetBtn);
    tr.appendChild(tdReset);

    statsBody.appendChild(tr);
  }

  const hasEntries = Object.values(wordStats).some(
    (s) => (s.seenCount ?? 0) > 0 || s.count > 0,
  );

  statsEmpty.style.display = hasEntries ? 'none' : 'block';
  tableContainer.style.display = hasEntries ? '' : 'none';
}

function renderActiveWords() {
  currentLevel.textContent = settings.level;

  const wordSet = buildWordSet(dictionary, settings.level);
  const query = wordlistSearch.value.trim().toLowerCase();

  wordlistGroups.textContent = '';

  for (const level of CEFR_LEVELS) {
    if (!isLevelIncluded(level, settings.level)) continue;

    const words = [...wordSet.entries()].filter(
      ([, entry]) => entry.level === level,
    );

    const filteredWords = query
      ? words.filter(
          ([word, entry]) =>
            word.toLowerCase().includes(query) ||
            entry.es.toLowerCase().includes(query),
        )
      : words;

    const group = document.createElement('div');
    group.className = 'level-group';

    const header = document.createElement('div');
    header.className = 'level-header';

    const headerText = document.createElement('span');
    headerText.textContent = `${level} (${filteredWords.length} words)`;

    const chevron = document.createElement('span');
    chevron.className = 'chevron';
    chevron.textContent = '▾';

    header.appendChild(headerText);
    header.appendChild(chevron);

    header.addEventListener('click', () => {
      group.classList.toggle('collapsed');
    });

    const body = document.createElement('div');
    body.className = 'level-body';

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const headRow = document.createElement('tr');
    for (const label of ['English', 'Spanish', 'IPA']) {
      const th = document.createElement('th');
      th.textContent = label;
      headRow.appendChild(th);
    }
    thead.appendChild(headRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    for (const [word, entry] of filteredWords) {
      const tr = document.createElement('tr');

      const tdEn = document.createElement('td');
      tdEn.textContent = word;
      tr.appendChild(tdEn);

      const tdEs = document.createElement('td');
      tdEs.textContent = entry.es;
      tr.appendChild(tdEs);

      const tdIpa = document.createElement('td');
      tdIpa.textContent = entry.ipa;
      tr.appendChild(tdIpa);

      tbody.appendChild(tr);
    }
    table.appendChild(tbody);

    body.appendChild(table);
    group.appendChild(header);
    group.appendChild(body);
    wordlistGroups.appendChild(group);
  }
}

async function renderExclusions() {
  const current = await getSettings();
  listEl.textContent = '';

  if (current.exclusions.length === 0) {
    emptyMsg.style.display = 'block';
    return;
  }

  emptyMsg.style.display = 'none';

  for (const hostname of current.exclusions) {
    const li = document.createElement('li');

    const span = document.createElement('span');
    span.textContent = hostname;
    li.appendChild(span);

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.textContent = 'Remove';
    removeBtn.addEventListener('click', async () => {
      const latest = await getSettings();
      await saveSettings({
        exclusions: latest.exclusions.filter((h) => h !== hostname),
      });
      renderExclusions();
    });
    li.appendChild(removeBtn);

    listEl.appendChild(li);
  }
}

async function addSite() {
  const hostname = newSiteInput.value.trim().toLowerCase();
  if (!hostname) return;

  const current = await getSettings();
  if (current.exclusions.includes(hostname)) {
    newSiteInput.value = '';
    return;
  }

  await saveSettings({ exclusions: [...current.exclusions, hostname] });
  newSiteInput.value = '';
  renderExclusions();
}

function setupEventListeners() {
  const defaultSortTh = document.querySelector('th.sortable[data-sort="clicks"]');
  if (defaultSortTh) defaultSortTh.classList.add('sort-desc');

  levelEl.addEventListener('change', async () => {
    settings.level = levelEl.value as CEFRLevel;
    await saveSettings({ level: settings.level });
    renderProgress();
    renderActiveWords();
  });

  statsSearch.addEventListener('input', debounce(() => renderWordStats(), 200));
  wordlistSearch.addEventListener('input', debounce(() => renderActiveWords(), 200));

  resetAllBtn.addEventListener('click', async () => {
    if (!confirm('Reset all word statistics? This cannot be undone.')) return;
    await resetWordStats();
    wordStats = await getWordStats();
    renderProgress();
    renderWordStats();
  });

  addBtn.addEventListener('click', addSite);
  newSiteInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addSite();
  });

  document.querySelectorAll('th.sortable').forEach((th) => {
    th.addEventListener('click', () => {
      const col = (th as HTMLElement).dataset['sort'] ?? '';
      if (sortColumn === col) {
        sortAsc = !sortAsc;
      } else {
        sortColumn = col;
        sortAsc = false;
      }

      document.querySelectorAll('th.sortable').forEach((h) => {
        h.classList.remove('sort-asc', 'sort-desc');
      });
      th.classList.add(sortAsc ? 'sort-asc' : 'sort-desc');

      renderWordStats();
    });
  });
}

init();
