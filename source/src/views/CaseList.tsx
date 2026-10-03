import { useState, type CSSProperties } from 'react';
import { CASES, EXAMS } from '../data';
import { TOPICS, TOPIC } from '../topics';
import { load, save } from '../lib/util';
import type { TopicId } from '../types';

export default function CaseList() {
  const [kind, setKind] = useState<'all' | 'sample' | 'council'>(load('cases-kind', 'all'));
  const [topic, setTopic] = useState<'all' | TopicId>('all');
  const [q, setQ] = useState('');
  const list = CASES.filter(
    (c) =>
      (kind === 'all' || c.kind === kind) &&
      (topic === 'all' || c.topics.includes(topic) || c.parts.some((p) => p.topic === topic)) &&
      (!q || (c.title + c.source + c.background).includes(q)),
  ).sort((a, b) => (a.kind === b.kind ? (b.year ?? 0) - (a.year ?? 0) : a.kind === 'sample' ? -1 : 1));

  return (
    <div className="container">
      <div className="ch-head rv">
        <span className="eyebrow">סימולציית קייס</span>
        <h2>קייסים אמיתיים מהמבחנים</h2>
        <p className="lead">
          כל קייס הוא שאלה פתוחה אמיתית — ממבחני הקורס או מבחינות המועצה — מפוצלת לשלבים לפי סעיפי ה״נדרש״. כותבים תשובה, חושפים את
          הפתרון הרשמי ומסמנים בדיקה עצמית.
        </p>
      </div>

      {EXAMS.length > 0 && (
        <>
          <h3 className="section-title" style={{ marginBlockStart: 0 }}>מבחן מלא בתנאי אמת</h3>
          <p className="section-sub">מבחני הקורס במלואם, עם טיימר — הפתרונות נחשפים רק בסיום</p>
          <div className="grid g3" style={{ marginBlockEnd: 40 }}>
            {EXAMS.map((e) => (
              <a key={e.id} href={`#/fullexam/${e.id}`} className="b-card" style={{ '--accent': '#171E33', '--accent-soft': '#E7E9F1' } as CSSProperties}>
                <div className="ico">⏱️</div>
                <h3>{e.title}</h3>
                <p>{e.caseIds.length} שאלות{e.durationMinutes ? ` · ${e.durationMinutes} דקות` : ''}{e.totalPoints ? ` · ${e.totalPoints} נק׳` : ''}</p>
              </a>
            ))}
          </div>
        </>
      )}

      <h3 className="section-title" style={{ marginBlockStart: 0 }}>בנק הקייסים</h3>
      <div className="filters">
        <div className="seg">
          {([['all', 'הכול'], ['sample', 'מבחני הקורס'], ['council', 'בחינות המועצה']] as const).map(([v, l]) => (
            <button key={v} className={kind === v ? 'on' : ''} onClick={() => { setKind(v); save('cases-kind', v); }}>{l}</button>
          ))}
        </div>
        <select value={topic} onChange={(e) => setTopic(e.target.value as TopicId | 'all')} aria-label="סינון לפי נושא">
          <option value="all">כל הנושאים</option>
          {TOPICS.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <input type="search" placeholder="חיפוש…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="חיפוש קייס" />
      </div>
      {list.length === 0 && <p className="empty">אין קייסים מתאימים לסינון.</p>}
      <div className="grid g3">
        {list.map((c) => {
          const t = TOPIC[c.topics[0]] ?? TOPIC.process;
          return (
            <a key={c.id} href={`#/case/${c.id}`} className="b-card case-card" style={{ '--accent': t.accent, '--accent-soft': t.soft } as CSSProperties}>
              <span className="chip">{c.kind === 'sample' ? '📘 מבחן הקורס' : '🏛️ בחינת מועצה'}</span>
              <h3>{c.title}</h3>
              <div className="src">{c.source} · {c.parts.length} שלבים</div>
              <div className="chips">
                {[...new Set(c.parts.map((p) => p.topic))].map((id) => (
                  <span key={id} className="chip grey">{TOPIC[id]?.icon} {TOPIC[id]?.short}</span>
                ))}
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
