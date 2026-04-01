export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface Settings {
  enabled: boolean;
  level: CEFRLevel;
  highlight: boolean;
  exclusions: string[];
}

export type PartOfSpeech = 'noun' | 'verb' | 'adj' | 'adv';

export interface DictionaryEntry {
  es: string;
  ipa: string;
  level: CEFRLevel;
  pos: PartOfSpeech;
}

export type Dictionary = Record<string, DictionaryEntry>;
