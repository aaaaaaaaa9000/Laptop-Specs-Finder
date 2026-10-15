import type { HistoryEntry, SpecsResponse } from '../types';

const STORAGE_KEY = 'laptopSpecsHistory';
const MAX_ENTRIES = 30;

export const normalizeKey = (q: string) => q.replace(/\s+/g, ' ').trim().toLowerCase();

export const loadHistory = (): HistoryEntry[] => {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed.filter(e => e && typeof e.query === 'string' && e.result) : [];
  } catch {
    return [];
  }
};

const saveHistory = (entries: HistoryEntry[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (err) {
    console.error('Failed to save search history:', err);
  }
};

export const addToHistory = (entries: HistoryEntry[], query: string, result: SpecsResponse): HistoryEntry[] => {
  const key = normalizeKey(query);
  const next = [
    { query: query.replace(/\s+/g, ' ').trim(), timestamp: Date.now(), result },
    ...entries.filter(e => normalizeKey(e.query) !== key),
  ].slice(0, MAX_ENTRIES);
  saveHistory(next);
  return next;
};

export const removeFromHistory = (entries: HistoryEntry[], query: string): HistoryEntry[] => {
  const key = normalizeKey(query);
  const next = entries.filter(e => normalizeKey(e.query) !== key);
  saveHistory(next);
  return next;
};

export const clearHistory = (): HistoryEntry[] => {
  saveHistory([]);
  return [];
};

export const findInHistory = (entries: HistoryEntry[], query: string): HistoryEntry | undefined => {
  const key = normalizeKey(query);
  return entries.find(e => normalizeKey(e.query) === key);
};

export interface Suggestion {
  text: string;
  fromHistory: boolean;
}

// Suggestions come from past queries plus the exact model names found in past results,
// so the list grows into a personal catalogue of real laptop names.
export const getSuggestions = (entries: HistoryEntry[], input: string, limit = 8): Suggestion[] => {
  const tokens = normalizeKey(input).split(' ').filter(Boolean);
  const seen = new Set<string>();
  const candidates: Suggestion[] = [];
  const push = (text: string, fromHistory: boolean) => {
    const key = normalizeKey(text);
    if (!key || seen.has(key)) return;
    seen.add(key);
    candidates.push({ text, fromHistory });
  };

  for (const e of entries) push(e.query, true);
  for (const e of entries) for (const l of e.result.laptops) push(l.modelName, false);

  return candidates
    .filter(c => {
      const key = normalizeKey(c.text);
      return tokens.every(t => key.includes(t)) && key !== tokens.join(' ');
    })
    .slice(0, limit);
};
