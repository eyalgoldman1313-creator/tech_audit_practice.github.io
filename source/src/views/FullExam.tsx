import { useEffect, useState } from 'react';
import { EXAMS, CASE_BY_ID } from '../data';
import { md, fmtTime } from '../lib/util';
import PartBlock from '../components/PartBlock';

export default function FullExam({ id }: { id: string }) {
  const exam = EXAMS.find((e) => e.id === id);
  const [phase, setPhase] = useState<'intro' | 'running' | 'review'>('intro');
  const [minutes, setMinutes] = useState(exam?.durationMinutes ?? 180);
  const [left, setLeft] = useState(0);

  useEffect(() => {
    if (phase !== 'running') return;
    const t = setInterval(() => setLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [phase]);
  useEffect(() => {
    if (phase === 'running' && left === 0) setPhase('review');
  }, [left, phase]);

  if (!exam) return <div className="container empty"><p>המבחן לא נמצא.</p><a className="btn btn-primary" href="#/cases">חזרה</a></div>;
  const cases = exam.caseIds.map((cid) => CASE_BY_ID[cid]).filter(Boolean);

  if (phase === 'intro') {
    return (
      <div className="container">
        <div className="ch-head rv">
          <span className="eyebrow">מבחן מלא</span>
          <h2>{exam.title}</h2>
          <p className="lead">{exam.source}</p>
        </div>
        <div className="shell q-card rv">
          <div className="core">
            {exam.instructions && <div className="prose" dangerouslySetInnerHTML={{ __html: md(exam.instructions) }} />}
            <ul className="prose" style={{ marginBlock: 12 }}>
              {cases.map((c) => (
                <li key={c.id}><b>{c.title}</b> — {c.parts.length} סעיפים{c.points ? `, ${c.points} נק׳` : ''}</li>
              ))}
            </ul>
            <div className="field">
              <div className="field-label">זמן לבחינה</div>
              <div className="seg">
                {[90, 120, 150, 180].map((m) => (
                  <button key={m} className={minutes === m ? 'on' : ''} onClick={() => setMinutes(m)}>{m} דק׳</button>
                ))}
              </div>
            </div>
            <div className="callout warn">הפתרונות ייחשפו רק בסיום (או כשהזמן ייגמר). התשובות נשמרות בדפדפן זה.</div>
            <button className="btn btn-primary" onClick={() => { setLeft(minutes * 60); setPhase('running'); }}>התחלת המבחן ←</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="q-card" style={{ maxWidth: 880 }}>
        <div className="quiz-topbar" style={{ position: 'sticky', top: 76, zIndex: 5, background: 'var(--bg)', paddingBlock: 8 }}>
          <span className="counter">{exam.title}</span>
          <span style={{ flex: 1 }} />
          {phase === 'running' ? (
            <>
              <span className={'timer' + (left < 600 ? ' low' : '')}>⏱ {fmtTime(left)}</span>
              <button className="btn btn-accent btn-sm" onClick={() => { if (confirm('לסיים את המבחן ולהציג פתרונות?')) setPhase('review'); }}>סיום והצגת פתרונות</button>
            </>
          ) : (
            <span className="chip">מצב בדיקה — הפתרונות גלויים</span>
          )}
        </div>
        {cases.map((c, ci) => (
          <section key={c.id} style={{ marginBlock: 28 }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBlockEnd: 10 }}>שאלה {ci + 1}: {c.title} {c.points ? <span className="chip grey">{c.points} נק׳</span> : null}</h2>
            <details className="panel" open>
              <summary>📄 נתוני השאלה<span className="plus">+</span></summary>
              <div className="panel-body prose" dangerouslySetInnerHTML={{ __html: md(c.background) }} />
            </details>
            {c.parts.map((p, i) => (
              <div className="shell" key={i} style={{ marginBlock: 14 }}>
                <div className="core">
                  <PartBlock caseId={c.id} index={i} part={p} revealed={phase === 'review'} hideReveal />
                </div>
              </div>
            ))}
          </section>
        ))}
        {phase === 'review' && (
          <div className="btn-row" style={{ justifyContent: 'center' }}>
            <a className="btn btn-primary" href="#/cases">חזרה לקייסים</a>
          </div>
        )}
      </div>
    </div>
  );
}
