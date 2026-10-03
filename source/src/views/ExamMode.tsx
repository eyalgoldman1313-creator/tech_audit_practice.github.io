import { useState } from 'react';
import { TOPICS, TOPIC } from '../topics';
import { QUESTIONS, CASES } from '../data';
import { shuffle } from '../lib/util';
import QuizRun, { prepare, type QuizConfig } from './QuizRun';
import type { Question, TopicId } from '../types';

// Topic weight = how often the topic shows up in board-exam parts and course exams (min 1).
function topicWeights(): Record<TopicId, number> {
  const w = Object.fromEntries(TOPICS.map((t) => [t.id, 1])) as Record<TopicId, number>;
  CASES.forEach((c) => c.parts.forEach((p) => { if (w[p.topic] !== undefined) w[p.topic] += 1; }));
  return w;
}

function weightedSet(n: number): Question[] {
  const w = topicWeights();
  const avail = TOPICS.filter((t) => QUESTIONS.some((q) => q.topic === t.id));
  const total = avail.reduce((s, t) => s + w[t.id], 0);
  const quota: Record<string, number> = {};
  let assigned = 0;
  avail.forEach((t) => {
    quota[t.id] = Math.floor((n * w[t.id]) / total);
    assigned += quota[t.id];
  });
  // distribute remainder to the heaviest topics
  const byW = avail.slice().sort((a, b) => w[b.id] - w[a.id]);
  for (let i = 0; assigned < n && byW.length; i = (i + 1) % byW.length) {
    quota[byW[i].id]++;
    assigned++;
  }
  const out: Question[] = [];
  avail.forEach((t) => {
    out.push(...shuffle(QUESTIONS.filter((q) => q.topic === t.id)).slice(0, quota[t.id]));
  });
  if (out.length < n) {
    const used = new Set(out.map((q) => q.id));
    out.push(...shuffle(QUESTIONS.filter((q) => !used.has(q.id))).slice(0, n - out.length));
  }
  return shuffle(out);
}

export default function ExamMode() {
  const [n, setN] = useState(30);
  const [timed, setTimed] = useState(true);
  const [cfg, setCfg] = useState<QuizConfig | null>(null);
  const w = topicWeights();
  const total = TOPICS.reduce((s, t) => s + w[t.id], 0);

  if (cfg) return <QuizRun config={cfg} />;

  return (
    <div className="container">
      <div className="ch-head rv">
        <span className="eyebrow">מצב מבחן</span>
        <h2>מבחן משוקלל</h2>
        <p className="lead">
          סט שאלות שמשקלו לפי תדירות הנושאים בבחינות המועצה ובמבחני הקורס. המשוב והציון — רק בסיום, כמו במבחן אמיתי.
        </p>
      </div>
      <div className="grid g2">
        <div className="shell rv">
          <div className="core">
            <div className="field">
              <div className="field-label">אורך המבחן</div>
              <div className="seg">
                {[20, 30, 45].map((x) => (
                  <button key={x} className={n === x ? 'on' : ''} onClick={() => setN(x)}>{x} שאלות</button>
                ))}
              </div>
            </div>
            <div className="field">
              <div className="field-label">טיימר</div>
              <div className="seg">
                <button className={timed ? 'on' : ''} onClick={() => setTimed(true)}>{Math.round(n * 1.5)} דקות</button>
                <button className={!timed ? 'on' : ''} onClick={() => setTimed(false)}>ללא הגבלה</button>
              </div>
            </div>
            <div className="callout">
              המבחן בקורס עצמו בנוי משאלות פתוחות (קייסים). כדי להתאמן על כתיבה — עברו ל<a href="#/cases">סימולציית קייס</a> או למבחן מלא מתוך מבחני הקורס.
            </div>
            <button className="btn btn-primary" disabled={QUESTIONS.length === 0} onClick={() => setCfg({ title: 'מבחן משוקלל', items: prepare(weightedSet(n)), feedback: 'end', timeLimitSec: timed ? Math.round(n * 1.5) * 60 : undefined })}>
              התחלת מבחן ←
            </button>
          </div>
        </div>
        <div className="shell rv">
          <div className="core">
            <div className="field-label">משקל הנושאים</div>
            <div className="bars">
              {TOPICS.slice().sort((a, b) => w[b.id] - w[a.id]).map((t) => (
                <div className="bar-row" key={t.id}>
                  <span>{t.icon} {TOPIC[t.id].short}</span>
                  <div className="bar"><div style={{ width: `${(100 * w[t.id]) / Math.max(...Object.values(w))}%`, background: t.accent }} /></div>
                  <span className="note">{Math.round((100 * w[t.id]) / total)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
