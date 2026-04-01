export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface Settings {
  enabled: boolean;
  level: CEFRLevel;
  highlight: boolean;
  exclusions: string[];
}

export interface DictionaryEntry {
  es: string;
  ipa: string;
  level: CEFRLevel;
}

export type Dictionary = Record<string, DictionaryEntry>;
