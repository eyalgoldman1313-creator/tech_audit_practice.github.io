import type { CSSProperties } from 'react';
import { BOARD, CASE_BY_ID } from '../data';
import { TOPIC } from '../topics';

export default function BoardMap() {
  return (
    <div className="container">
      <div className="ch-head rv">
        <span className="eyebrow">מפת בחינות המועצה</span>
        <h2>מה נשאל, ומתי</h2>
        <p className="lead">
          מיפוי שאלות המועצה בביקורת מערכות מידע לפי נושאים (2015–2025), על בסיס המיפוי של המרצה. מועד אביב = מועד קיץ, מועד סתיו = מועד חורף.
          לחיצה על פריט פותחת את הקייס עם הפתרון הרשמי.
        </p>
      </div>
      <div className="grid g2">
        {BOARD.map((b) => {
          const t = TOPIC[b.topicId] ?? TOPIC.process;
          return (
            <div className="shell rv" key={b.topic} style={{ '--accent': t.accent, '--accent-soft': t.soft } as CSSProperties}>
              <div className="core">
                <div className="part-head">
                  <span className="chip">{t.icon} {b.topic}</span>
                  <span className="chip grey">{b.items.length} הופעות</span>
                </div>
                <ul className="prose" style={{ listStyle: 'none', paddingInlineStart: 0 }}>
                  {b.items.map((it, i) => (
                    <li key={i} style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                      <span style={{ color: t.accent }}>•</span>
                      {it.caseId && CASE_BY_ID[it.caseId] ? <a href={`#/case/${it.caseId}`}>{it.label}</a> : <span>{it.label}</span>}
                    </li>
                  ))}
                </ul>
                <a className="link-btn" href={`#/quiz/${b.topicId}`}>לבוחן בנושא ←</a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
