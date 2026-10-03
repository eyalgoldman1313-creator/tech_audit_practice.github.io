import { useState, type CSSProperties } from 'react';
import type { CasePart } from '../types';
import { TOPIC, guideLink } from '../topics';
import { md, load, save } from '../lib/util';

export function partKey(caseId: string, i: number) {
  return `ans:${caseId}:${i}`;
}

export function useChecks(caseId: string, i: number, n: number) {
  const key = `chk:${caseId}:${i}`;
  const [checks, setChecks] = useState<boolean[]>(() => {
    const v = load<boolean[]>(key, []);
    return Array.from({ length: n }, (_, k) => !!v[k]);
  });
  const set = (k: number, v: boolean) => {
    const next = checks.slice();
    next[k] = v;
    setChecks(next);
    save(key, next);
  };
  return [checks, set] as const;
}

export function partScore(caseId: string, i: number, part: CasePart): number | null {
  const v = load<boolean[]>(`chk:${caseId}:${i}`, []);
  if (!part.keyPoints?.length || !v.length) return null;
  return v.filter(Boolean).length / part.keyPoints.length;
}

export default function PartBlock({ caseId, index, part, revealed, onReveal, hideReveal }: { caseId: string; index: number; part: CasePart; revealed: boolean; onReveal?: () => void; hideReveal?: boolean }) {
  const t = TOPIC[part.topic] ?? TOPIC.process;
  const [answer, setAnswer] = useState<string>(() => load(partKey(caseId, index), ''));
  const [checks, setCheck] = useChecks(caseId, index, part.keyPoints?.length ?? 0);
  const got = checks.filter(Boolean).length;

  return (
    <div style={{ '--accent': t.accent, '--accent-soft': t.soft } as CSSProperties}>
      <div className="part-head">
        <span className="chip">{part.label}</span>
        {part.points ? <span className="chip grey">{part.points} נק׳</span> : null}
        <span className="chip grey">{t.icon} {t.short}</span>
      </div>
      <div className="part-q prose" dangerouslySetInnerHTML={{ __html: md(part.question) }} />
      <textarea
        className="answer"
        placeholder="כתבו כאן את תשובתכם — בנקודות, מנומקת ותמציתית, כמו במחברת הבחינה…"
        value={answer}
        onChange={(e) => {
          setAnswer(e.target.value);
          save(partKey(caseId, index), e.target.value);
        }}
        aria-label={`תשובה ל${part.label}`}
      />
      <div className="note" style={{ marginBlockStart: 4 }}>{answer.trim() ? `${answer.trim().split(/\s+/).length} מילים · נשמר בדפדפן זה` : 'התשובה נשמרת אוטומטית בדפדפן זה'}</div>
      {!revealed && !hideReveal && (
        <div className="btn-row" style={{ marginBlockStart: 12 }}>
          <button className="btn btn-accent btn-sm" onClick={onReveal}>הצגת הפתרון הרשמי</button>
        </div>
      )}
      {revealed && (
        <>
          <div className="solution">
            <h4>✓ הפתרון הרשמי</h4>
            <div className="prose" dangerouslySetInnerHTML={{ __html: md(part.solution) }} />
          </div>
          {part.keyPoints?.length > 0 && (
            <div className="checklist">
              <h4>בדיקה עצמית — סמנו את הנקודות שכיסיתם ({got}/{part.keyPoints.length})</h4>
              {part.keyPoints.map((k, i) => (
                <label className="check" key={i}>
                  <input type="checkbox" checked={checks[i]} onChange={(e) => setCheck(i, e.target.checked)} />
                  <span>{k}</span>
                </label>
              ))}
              <div className="note">
                <a href={guideLink(part.topic)} target="_blank" rel="noopener">חזרה על הנושא במדריך ↗</a>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
