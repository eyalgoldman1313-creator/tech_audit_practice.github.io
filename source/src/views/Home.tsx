import { TOPICS } from '../topics';
import { QUESTIONS, CASES, FLASHCARDS, TABLES, TREES, EXAMS } from '../data';
import { load, type Stats } from '../lib/util';
import type { CSSProperties } from 'react';

const MODES = [
  { href: '#/quiz', ico: '📝', title: 'בחנים לפי נושא', text: 'שאלות ברירה עם משוב מיידי והסבר מנומק לכל מסיח', accent: '#6366F1', soft: '#EEF0FE' },
  { href: '#/exam', ico: '🎓', title: 'מצב מבחן משוקלל', text: 'סט משוקלל לפי תדירות הנושאים בבחינות — עם טיימר, ציון ופילוח לפי נושא', accent: '#0E9F6E', soft: '#E6F7F0' },
  { href: '#/cases', ico: '🗂️', title: 'סימולציית קייס', text: 'שאלות פתוחות אמיתיות מבחינות המועצה וממבחני הקורס — כתיבה, פתרון רשמי ובדיקה עצמית', accent: '#D97706', soft: '#FDF3E3' },
  { href: '#/concepts', ico: '🔑', title: 'מפתחות מושג', text: 'כרטיסיות, טבלאות השוואה ועצי החלטה', accent: '#E11D48', soft: '#FDEAEF' },
  { href: '#/map', ico: '🗺️', title: 'מפת בחינות המועצה', text: 'איזה נושא נשאל באיזו בחינה (2015–2025) — עם קישור ישיר לקייס', accent: '#0891B2', soft: '#E4F6FA' },
];

export default function Home() {
  const stats = load<Stats>('stats', {});
  const counts = Object.fromEntries(TOPICS.map((t) => [t.id, QUESTIONS.filter((q) => q.topic === t.id).length]));
  const caseCounts = Object.fromEntries(TOPICS.map((t) => [t.id, CASES.filter((c) => c.topics.includes(t.id)).length]));
  return (
    <div className="container">
      <div className="hero rv">
        <span className="eyebrow">תרגול פעיל לבחינה · שנה״ל תשפ״ו</span>
        <h1 className="hero-title">ביקורת מערכות מידע ממוחשבות בשילוב AI</h1>
        <p className="hero-sub">
          בחנים עצמיים, מצב מבחן משוקלל, סימולציית קייסים אמיתיים ומפתחות מושג — הכול מבוסס על חוברת הקורס, תקני הביקורת,
          מבחני הקורס ובחינות המועצה 2015–2025.
        </p>
        <div className="hero-meta">
          <span>{QUESTIONS.length} שאלות ברירה</span>
          <span>{CASES.length} קייסים פתוחים</span>
          <span>{EXAMS.length} מבחנים מלאים</span>
          <span>{FLASHCARDS.length + TABLES.length + TREES.length} מפתחות מושג</span>
        </div>
      </div>

      <div className="bento">
        {MODES.map((m, i) => (
          <a key={m.href} href={m.href} className={'b-card rv ' + (i < 3 ? 'b-item' : 'b-wide')} style={{ '--accent': m.accent, '--accent-soft': m.soft, animationDelay: `${i * 60}ms` } as CSSProperties}>
            <div className="ico">{m.ico}</div>
            <h3>{m.title}</h3>
            <p>{m.text}</p>
          </a>
        ))}
      </div>

      <h2 className="section-title">נושאי התרגול</h2>
      <p className="section-sub">לפי סילבוס הקורס — לחיצה פותחת בוחן ממוקד בנושא</p>
      <div className="grid g3">
        {TOPICS.map((t) => {
          const s = stats[t.id];
          const pct = s && s.seen ? Math.round((100 * s.correct) / s.seen) : null;
          return (
            <a key={t.id} href={`#/quiz/${t.id}`} className="b-card" style={{ '--accent': t.accent, '--accent-soft': t.soft } as CSSProperties}>
              <div className="ico">{t.icon}</div>
              <h3>{t.name}</h3>
              <p>{t.blurb}</p>
              <div className="count btn-row">
                <span className="chip">{counts[t.id]} שאלות</span>
                {caseCounts[t.id] > 0 && <span className="chip grey">{caseCounts[t.id]} קייסים</span>}
                {pct !== null && <span className="chip grey">הצלחה {pct}%</span>}
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
