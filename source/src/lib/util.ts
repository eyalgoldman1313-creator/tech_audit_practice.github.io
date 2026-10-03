import { marked } from 'marked';
import { enhanceTables } from './mdtable';

marked.setOptions({ gfm: true, breaks: true });

export function md(text: string): string {
  const html = marked.parse(text ?? '', { async: false }) as string;
  if (!html.includes('<table') || typeof DOMParser === 'undefined') return html;
  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html');
  enhanceTables(doc.body);
  return doc.body.firstElementChild!.innerHTML;
}

export function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const LETTERS = ['א', 'ב', 'ג', 'ד', 'ה', 'ו'];

// Per-viewer conveniences only; every access is guarded (private mode, blocked storage).
const PREFIX = 'itaudit-practice:';
export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
export function save(key: string, value: unknown): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export interface Stats {
  [topic: string]: { seen: number; correct: number };
}
export function recordAnswer(topic: string, correct: boolean): void {
  const s = load<Stats>('stats', {});
  const t = s[topic] ?? { seen: 0, correct: 0 };
  t.seen += 1;
  if (correct) t.correct += 1;
  s[topic] = t;
  save('stats', s);
}

export function fmtTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
