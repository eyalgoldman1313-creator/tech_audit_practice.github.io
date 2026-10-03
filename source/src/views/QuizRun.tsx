import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import type { Question } from '../types';
import { TOPIC, TOPICS, DIFF_LABEL, guideLink } from '../topics';
import { LETTERS, shuffle, recordAnswer, load, save, fmtTime } from '../lib/util';

export interface QuizItem {
  q: Question;
  order: number[]; // display position -> original option index
}
export interface QuizConfig {
  title: string;
  items: QuizItem[];
  feedback: 'instant' | 'end';
  timeLimitSec?: number;
}

const stripOk = (s: string) => s.replace(/^\s*(נכון|תשובה נכונה)\s*[—–:\-!.]*\s*/, '');

export function prepare(qs: Question[]): QuizItem[] {
  return qs.map((q) => ({ q, order: shuffle(q.options.map((_, i) => i)) }));
}

function rememberWrong(id: string, wrong: boolean) {
  const set = new Set(load<string[]>('wrong', []));
  if (wrong) set.add(id);
  else set.delete(id);
  save('wrong', [...set]);
}

export function Ring({ pct }: { pct: number }) {
  const r = 64;
  const c = 2 * Math.PI * r;
  const color = pct >= 80 ? 'var(--emerald)' : pct >= 60 ? 'var(--amber)' : 'var(--rose)';
  return (
    <div className="score-ring">
      <svg width="150" height="150" viewBox="0 0 150 150" aria-hidden="true">
        <circle cx="75" cy="75" r={r} fill="none" stroke="var(--shell)" strokeWidth="12" />
        <circle cx="75" cy="75" r={r} fill="none" stroke={color} strokeWidth="12" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} />
      </svg>
      <div className="val">
        {pct}%<small>ציון</small>
      </div>
    </div>
  );
}

export default function QuizRun({ config }: { config: QuizConfig | null }) {
  if (!config || config.items.length === 0) {
    return (
      <div className="container empty">
        <p>אין בוחן פעיל.</p>
        <a className="btn btn-primary" href="#/quiz">להרכבת בוחן ←</a>
      </div>
    );
  }
  return <Runner config={config} />;
}

function Runner({ config }: { config: QuizConfig }) {
  const { items, feedback } = config;
  const [idx, setIdx] = useState(0);
  const [picks, setPicks] = useState<(number | null)[]>(() => items.map(() => null));
  const [done, setDone] = useState(false);
  const [left, setLeft] = useState(config.timeLimitSec ?? 0);

  useEffect(() => {
    if (!config.timeLimitSec || done) return;
    const t = setInterval(() => setLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [config.timeLimitSec, done]);
  useEffect(() => {
    if (config.timeLimitSec && left === 0 && !done) finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left]);

  const item = items[idx];
  const picked = picks[idx];
  const revealed = feedback === 'instant' ? picked !== null : done;
  const accent = TOPIC[item.q.topic];

  const pick = (orig: number) => {
    if (feedback === 'instant' && picked !== null) return;
    const next = picks.slice();
    next[idx] = orig;
    setPicks(next);
    if (feedback === 'instant') {
      const ok = orig === item.q.answer;
      recordAnswer(item.q.topic, ok);
      rememberWrong(item.q.id, !ok);
    }
  };

  function finish() {
    if (feedback === 'end') {
      items.forEach((it, i) => {
        const ok = picks[i] === it.q.answer;
        recordAnswer(it.q.topic, ok);
        rememberWrong(it.q.id, !ok);
      });
    }
    setDone(true);
    window.scrollTo({ top: 0 });
  }

  if (done) return <Results config={config} picks={picks} />;

  return (
    <div className="container" style={{ '--accent': accent.accent, '--accent-soft': accent.soft } as CSSProperties}>
      <div className="q-card">
        <div className="quiz-topbar">
          <span className="counter">{idx + 1} / {items.length}</span>
          <div className="progress-track" role="progressbar" aria-label="התקדמות בבוחן" aria-valuenow={idx + 1} aria-valuemin={1} aria-valuemax={items.length}>
            <div className="progress-fill" style={{ width: `${((idx + 1) / items.length) * 100}%` }} />
          </div>
          {config.timeLimitSec ? <span className={'timer' + (left < 120 ? ' low' : '')}>⏱ {fmtTime(left)}</span> : null}
        </div>
        <div className="shell">
          <div className="core">
            <div className="q-meta">
              <span className="chip">{accent.icon} {accent.short}</span>
              <span className="chip grey">{DIFF_LABEL[item.q.difficulty]}</span>
            </div>
            <div className="q-text">{item.q.question}</div>
            <div className="options" role="group" aria-label="אפשרויות תשובה">
              {item.order.map((orig, pos) => {
                let cls = 'option';
                if (revealed) {
                  if (orig === item.q.answer) cls += ' correct';
                  else if (orig === picked) cls += ' wrong';
                } else if (orig === picked) cls += ' picked';
                return (
                  <button key={orig} className={cls} disabled={feedback === 'instant' && picked !== null} onClick={() => pick(orig)}>
                    <span className="letter">{LETTERS[pos]}</span>
                    <span className="opt-body">
                      {item.q.options[orig]}
                      {revealed && (orig === picked || orig === item.q.answer) && item.q.explanations?.[orig] && <span className="opt-exp">{item.q.explanations[orig]}</span>}
                    </span>
                  </button>
                );
              })}
            </div>
            {revealed && (
              <div className={'feedback' + (picked === item.q.answer ? '' : ' no')}>
                <b>{picked === item.q.answer ? '✓ נכון!' : '✗ לא מדויק'}</b>
                {picked !== item.q.answer && item.q.explanations?.[item.q.answer] ? ' — ' + stripOk(item.q.explanations[item.q.answer]) : ''}
                <span className="src">מקור: {item.q.source} · <a href={guideLink(item.q.topic)} target="_blank" rel="noopener">לפרק במדריך ↗</a></span>
              </div>
            )}
            <div className="q-nav">
              <button className="btn btn-ghost btn-sm" disabled={idx === 0} onClick={() => setIdx(idx - 1)}>→ הקודמת</button>
              {idx < items.length - 1 ? (
                <button className="btn btn-primary btn-sm" onClick={() => setIdx(idx + 1)} disabled={feedback === 'instant' && picked === null}>הבאה ←</button>
              ) : (
                <button className="btn btn-accent btn-sm" onClick={finish} disabled={feedback === 'instant' && picked === null}>סיום וציון ✓</button>
              )}
            </div>
          </div>
        </div>
        {feedback === 'end' && (
          <p className="note" style={{ textAlign: 'center', marginBlockStart: 12 }}>
            נענו {picks.filter((p) => p !== null).length} מתוך {items.length} · ניתן לחזור לשאלות קודמות ולשנות תשובה
          </p>
        )}
      </div>
    </div>
  );
}

function Results({ config, picks }: { config: QuizConfig; picks: (number | null)[] }) {
  const { items } = config;
  const correct = items.filter((it, i) => picks[i] === it.q.answer).length;
  const pct = Math.round((100 * correct) / items.length);
  const byTopic = useMemo(() => {
    const m: Record<string, { n: number; ok: number }> = {};
    items.forEach((it, i) => {
      const t = (m[it.q.topic] ??= { n: 0, ok: 0 });
      t.n++;
      if (picks[i] === it.q.answer) t.ok++;
    });
    return TOPICS.filter((t) => m[t.id]).map((t) => ({ t, ...m[t.id] }));
  }, [items, picks]);
  const wrong = items.map((it, i) => ({ it, p: picks[i] })).filter((x) => x.p !== x.it.q.answer);

  return (
    <div className="container">
      <div className="ch-head rv">
        <span className="eyebrow">{config.title}</span>
        <h2>סיכום תוצאות</h2>
        <p className="lead">{correct} תשובות נכונות מתוך {items.length}</p>
      </div>
      <div className="grid g2">
        <div className="shell"><div className="core" style={{ display: 'grid', placeItems: 'center' }}><Ring pct={pct} /></div></div>
        <div className="shell">
          <div className="core">
            <div className="field-label">פילוח לפי נושא</div>
            <div className="bars">
              {byTopic.map(({ t, n, ok }) => (
                <div className="bar-row" key={t.id}>
                  <span>{t.icon} {t.short}</span>
                  <div className="bar"><div style={{ width: `${(100 * ok) / n}%`, background: t.accent }} /></div>
                  <span className="note">{ok}/{n}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {wrong.length > 0 && (
        <>
          <h3 className="section-title">דוח טעויות</h3>
          <p className="section-sub">התשובה הנכונה, ההסבר וקישור לחומר במדריך</p>
          {wrong.map(({ it, p }) => (
            <div className="review-item" key={it.q.id}>
              <div className="ri-q">{it.q.question}</div>
              {p !== null && p !== undefined && <div className="bad">התשובה שלך: {it.q.options[p]}</div>}
              {p === null && <div className="bad">לא נענתה</div>}
              <div className="good">התשובה הנכונה: {it.q.options[it.q.answer]}</div>
              <div className="note" style={{ marginBlockStart: 6 }}>{stripOk(it.q.explanations?.[it.q.answer] ?? '')}</div>
              <div className="note">מקור: {it.q.source} · <a href={guideLink(it.q.topic)} target="_blank" rel="noopener">לפרק במדריך ↗</a></div>
            </div>
          ))}
        </>
      )}
      <div className="btn-row" style={{ justifyContent: 'center', marginBlockStart: 28 }}>
        <a className="btn btn-primary" href="#/quiz">בוחן חדש</a>
        <a className="btn btn-ghost" href="#/home">לדף הבית</a>
      </div>
    </div>
  );
}
