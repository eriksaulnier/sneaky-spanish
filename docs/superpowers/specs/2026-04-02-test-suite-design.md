# Test Suite Design

## Goal

Add a comprehensive test suite targeting 80% coverage with tests that verify correctness from first principles (not just confirming current behavior). Coverage threshold enforced so builds fail below 80%.

## Framework

- **Vitest** with jsdom environment for DOM tests
- **@vitest/coverage-v8** for coverage reporting and threshold enforcement
- Manual chrome.storage mock (no external mocking libraries)

## Chrome Mock

A `tests/setup.ts` file that creates a `globalThis.chrome` object with:

- `chrome.storage.local.get(keys)` / `.set(items)` backed by a plain `Record<string, unknown>`
- `chrome.storage.sync.get(keys)` / `.set(items)` backed by a separate plain object
- Both `.get()` implementations handle the "defaults" pattern: when called with an object, return stored values merged over the defaults (matching real Chrome behavior)
- A `resetChromeStorage()` helper exported for use in `beforeEach`
- `chrome.runtime.onMessage` / `chrome.runtime.onInstalled` as no-op stubs

## Test Modules (priority order)

### 1. walker.ts (content/walker.test.ts)

The most complex module. Test these internal functions via their public API (`processNode`, `walkDOM`, `computePhraseInfo`):

**Tokenization & word detection:**
- Splits on whitespace and punctuation
- Preserves delimiters (they appear in output)
- Handles edge cases: empty string, only whitespace, only punctuation

**Single word matching:**
- Replaces a known word with its Spanish equivalent
- Creates a `<span class="sneaky-word">` with correct data attributes (data-original, data-spanish, data-ipa)
- Case matching: capitalizes Spanish word when English was capitalized
- Leaves unknown words as text nodes
- Skips words inside SKIP_ELEMENTS (script, style, code, pre, textarea, input, etc.)
- Skips words inside contenteditable elements
- Skips words already inside .sneaky-word spans

**Phrase matching:**
- Matches multi-word phrases ("ice cream" -> "helado")
- Longest match wins (if "ice" and "ice cream" are both in dictionary, "ice cream" matches)
- Phrase matching broken by punctuation between words
- Phrase matching tolerates whitespace between words
- `computePhraseInfo` correctly identifies phrase start words and max phrase length

**processNode edge cases:**
- Returns false for text nodes with no matches
- Returns true when replacements were made
- Handles text nodes that are children of skipped elements
- Does not process already-processed content

### 2. tracking.ts (shared/tracking.test.ts)

**recordClick:**
- Creates a new entry with count=1 on first click
- Increments count on subsequent clicks
- Preserves firstSeen, updates lastSeen
- Sets seenCount=0 for new entries

**recordSeenWords:**
- Creates new entries for unseen words with seenCount=1
- Increments seenCount for known words
- Updates lastSeen timestamp
- Handles mix of new and known words in one call

**resetWordStats:**
- Clears all stats when called with no args
- Deletes specific words when called with array
- No-op for empty array

**getWordsToReview:**
- Returns words sorted by click count descending
- Respects limit parameter
- Only returns words with count > 0

**Mutex (withLock):**
- Concurrent calls execute sequentially (not interleaved)
- A failing call does not block subsequent calls
- Test by recording execution order of overlapping async operations

### 3. word-filter.ts (shared/word-filter.test.ts)

**buildWordSet:**
- Includes words at or below the selected CEFR level
- Excludes words above the selected level
- Only includes nouns and phrases (filters out verbs, adjectives, adverbs)
- Returns a Map keyed by English word
- Empty dictionary returns empty map
- A1 level only returns A1 words; C2 returns all levels

### 4. constants.ts (shared/constants.test.ts)

**isLevelIncluded:**
- A1 word included at all levels
- C2 word only included at C2
- Same level is included (boundary)
- All 6 levels work correctly

**populateLevelSelect:**
- Populates empty select with 6 options
- Options have correct values and labels
- Sets selected value when provided
- Idempotent: calling twice doesn't duplicate options

### 5. storage.ts (shared/storage.test.ts)

**getSettings:**
- Returns DEFAULT_SETTINGS when storage is empty
- Returns stored values when present
- Merges stored values over defaults (partial storage)

**saveSettings:**
- Writes partial settings to chrome.storage.sync
- Subsequent getSettings reflects the change

### 6. visibility.ts (content/visibility.test.ts)

**startVisibilityObserver:**
- Creates an IntersectionObserver
- Observes existing .sneaky-word spans
- Records word as seen when intersection fires
- Unobserves span after recording

**getViewportSeenWords:**
- Returns accumulated seen words
- Returns each word only once even if seen multiple times

**stopVisibilityObserver:**
- Disconnects observer
- Clears seen set

### 7. restore.ts (content/restore.test.ts)

**restoreOriginalText:**
- Replaces .sneaky-word spans with text nodes containing data-original value
- Removes sneaky-highlight class from documentElement
- Handles multiple spans
- No-op when no spans exist

## Coverage Configuration

In `vitest.config.ts`:

```typescript
coverage: {
  provider: 'v8',
  include: ['src/**/*.ts'],
  exclude: [
    'src/popup/popup.ts',
    'src/options/options.ts',
    'src/content/index.ts',
    'src/background/service-worker.ts',
    'src/shared/types.ts',
  ],
  thresholds: {
    lines: 80,
    branches: 80,
    functions: 80,
  },
}
```

## Package.json Scripts

```json
"test": "vitest run",
"test:watch": "vitest",
"test:coverage": "vitest run --coverage"
```

## Dependencies to Add

```
vitest (devDependency)
@vitest/coverage-v8 (devDependency)
jsdom (devDependency)
```
