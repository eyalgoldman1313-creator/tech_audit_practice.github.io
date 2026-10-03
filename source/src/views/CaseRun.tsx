import { useState, type CSSProperties } from 'react';
import { CASE_BY_ID } from '../data';
import { TOPIC } from '../topics';
import { md } from '../lib/util';
import PartBlock, { partScore } from '../components/PartBlock';

export default function CaseRun({ id }: { id: string }) {
  const c = CASE_BY_ID[id];
  const [stage, setStage] = useState(0);
  const [revealed, setRevealed] = useState<boolean[]>(() => (c ? c.parts.map(() => false) : []));
  const [, force] = useState(0);

  if (!c) {
    return (
      <div className="container empty">
        <p>הקייס לא נמצא.</p>
        <a className="btn btn-primary" href="#/cases">לרשימת הקייסים</a>
      </div>
    );
  }
  const t = TOPIC[c.topics[0]] ?? TOPIC.process;
  const summary = stage === c.parts.length;

  return (
    <div className="container" style={{ '--accent': t.accent, '--accent-soft': t.soft } as CSSProperties}>
      <div className="q-card" style={{ maxWidth: 860 }}>
        <div className="q-meta">
          <span className="chip">🗂️ סימולציית קייס</span>
          <span className="chip grey">{c.source}</span>
          {c.points ? <span className="chip grey">{c.points} נק׳</span> : null}
        </div>
        <h2 style={{ fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 800, marginBlockEnd: 12 }}>{c.title}</h2>
        <div className="quiz-topbar">
          <span className="counter">{summary ? 'סיכום' : `שלב ${stage + 1} / ${c.parts.length}`}</span>
          <div className="progress-track"><div className="progress-fill" style={{ width: `${(Math.min(stage + 1, c.parts.length) / c.parts.length) * 100}%` }} /></div>
        </div>

        <details className="panel" open={stage === 0}>
          <summary>📄 נתוני הקייס — {c.title}<span className="plus">+</span></summary>
          <div className="panel-body prose" dangerouslySetInnerHTML={{ __html: md(c.background) }} />
        </details>

        {!summary ? (
          <div className="shell">
            <div className="core">
              <PartBlock
                key={stage}
                caseId={c.id}
                index={stage}
                part={c.parts[stage]}
                revealed={revealed[stage]}
                onReveal={() => setRevealed((r) => r.map((v, i) => (i === stage ? true : v)))}
              />
              <div className="q-nav">
                <button className="btn btn-ghost btn-sm" disabled={stage === 0} onClick={() => setStage(stage - 1)}>→ שלב קודם</button>
                <button className="btn btn-primary btn-sm" onClick={() => { setStage(stage + 1); force((x) => x + 1); window.scrollTo({ top: 0 }); }}>
                  {stage < c.parts.length - 1 ? 'לשלב הבא ←' : 'לסיכום ←'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="shell">
            <div className="core">
              <div className="field-label">סיכום בדיקה עצמית</div>
              <div className="bars">
                {c.parts.map((p, i) => {
                  const s = partScore(c.id, i, p);
                  return (
                    <div className="bar-row" key={i}>
                      <span>{p.label}{p.points ? ` (${p.points} נק׳)` : ''}</span>
                      <div className="bar"><div style={{ width: `${(s ?? 0) * 100}%`, background: 'var(--emerald)' }} /></div>
                      <span className="note">{s === null ? '—' : `${Math.round(s * 100)}%`}</span>
                    </div>
                  );
                })}
              </div>
              <p className="note" style={{ marginBlockStart: 12 }}>
                האחוז מחושב לפי נקודות המפתח שסימנתם בכל שלב. בבחינה — בודקים מחפשים נימוק, הפניה לתקן ויישום לנתוני הקייס.
              </p>
              <div className="btn-row" style={{ marginBlockStart: 16 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => setStage(0)}>חזרה לשלב הראשון</button>
                <a className="btn btn-primary btn-sm" href="#/cases">לקייס הבא ←</a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
