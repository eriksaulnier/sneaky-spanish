import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS } from '../../src/shared/constants';
import { getSettings, saveSettings } from '../../src/shared/storage';

describe('getSettings', () => {
  it('returns DEFAULT_SETTINGS when storage is empty', async () => {
    const settings = await getSettings();
    expect(settings).toEqual(DEFAULT_SETTINGS);
  });

  it('returns stored values when present', async () => {
    await chrome.storage.sync.set({ level: 'B2', enabled: false });
    const settings = await getSettings();
    expect(settings.level).toBe('B2');
    expect(settings.enabled).toBe(false);
  });

  it('merges stored values over defaults', async () => {
    await chrome.storage.sync.set({ level: 'C1' });
    const settings = await getSettings();
    expect(settings.level).toBe('C1');
    // Other fields should still have defaults
    expect(settings.enabled).toBe(true);
    expect(settings.highlight).toBe(false);
    expect(settings.exclusions).toEqual([]);
  });
  it('returns defaults for corrupted level', async () => {
    await chrome.storage.sync.set({ level: 'X1' });
    const settings = await getSettings();
    expect(settings.level).toBe('A1');
  });

  it('returns defaults for non-boolean enabled', async () => {
    await chrome.storage.sync.set({ enabled: 'yes' });
    const settings = await getSettings();
    expect(settings.enabled).toBe(true);
  });

  it('returns defaults for non-boolean highlight', async () => {
    await chrome.storage.sync.set({ highlight: 1 });
    const settings = await getSettings();
    expect(settings.highlight).toBe(false);
  });

  it('filters non-string entries from exclusions', async () => {
    await chrome.storage.sync.set({
      exclusions: ['example.com', 42, null, 'test.org'],
    });
    const settings = await getSettings();
    expect(settings.exclusions).toEqual(['example.com', 'test.org']);
  });

  it('returns default exclusions for non-array value', async () => {
    await chrome.storage.sync.set({ exclusions: 'not-an-array' });
    const settings = await getSettings();
    expect(settings.exclusions).toEqual([]);
  });

  it('preserves valid values while fixing invalid ones', async () => {
    await chrome.storage.sync.set({
      enabled: false,
      level: 'INVALID',
      highlight: true,
    });
    const settings = await getSettings();
    expect(settings.enabled).toBe(false);
    expect(settings.level).toBe('A1');
    expect(settings.highlight).toBe(true);
  });
});

describe('saveSettings', () => {
  it('writes partial settings to storage', async () => {
    await saveSettings({ level: 'A2' });
    const settings = await getSettings();
    expect(settings.level).toBe('A2');
  });

  it('subsequent getSettings reflects the change', async () => {
    await saveSettings({ enabled: false, highlight: true });
    const settings = await getSettings();
    expect(settings.enabled).toBe(false);
    expect(settings.highlight).toBe(true);
  });

  it('preserves other settings when saving partial', async () => {
    await saveSettings({ level: 'B1' });
    await saveSettings({ highlight: true });
    const settings = await getSettings();
    expect(settings.level).toBe('B1');
    expect(settings.highlight).toBe(true);
  });
});
