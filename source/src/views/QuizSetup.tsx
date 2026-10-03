import { useState, type CSSProperties } from 'react';
import { TOPICS } from '../topics';
import { QUESTIONS } from '../data';
import { go } from '../lib/router';
import { shuffle, load, save } from '../lib/util';
import type { TopicId, Difficulty } from '../types';
import { prepare, type QuizConfig } from './QuizRun';

export default function QuizSetup({ onStart, preset }: { onStart: (c: QuizConfig) => void; preset?: string }) {
  const presetTopic = TOPICS.find((t) => t.id === preset)?.id;
  const [sel, setSel] = useState<TopicId[]>(presetTopic ? [presetTopic] : load<TopicId[]>('quiz-topics', []));
  const [n, setN] = useState<number>(load('quiz-n', 10));
  const [diff, setDiff] = useState<'all' | Difficulty>('all');
  const [feedback, setFeedback] = useState<'instant' | 'end'>(load('quiz-fb', 'instant'));
  const [onlyWrong, setOnlyWrong] = useState(false);

  const wrongIds = new Set(load<string[]>('wrong', []));
  const pool = QUESTIONS.filter((q) => sel.includes(q.topic) && (diff === 'all' || q.difficulty === diff) && (!onlyWrong || wrongIds.has(q.id)));
  const toggle = (id: TopicId) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const start = () => {
    save('quiz-topics', sel);
    save('quiz-n', n);
    save('quiz-fb', feedback);
    const qs = shuffle(pool).slice(0, n);
    onStart({ title: 'בוחן לפי נושא', items: prepare(qs), feedback });
    go('/run');
  };

  return (
    <div className="container">
      <div className="ch-head rv">
        <span className="eyebrow">בחנים לפי נושא</span>
        <h2>הרכבת בוחן</h2>
        <p className="lead">בחרו נושאים, רמת קושי ומצב משוב — השאלות והמסיחים מעורבבים בכל פעם מחדש</p>
      </div>
      <div className="shell rv">
        <div className="core">
          <div className="field">
            <div className="field-label">
              בחירת נושאים
              <span style={{ marginInlineStart: 'auto' }} className="btn-row">
                <button className="link-btn" onClick={() => setSel(TOPICS.map((t) => t.id))}>בחירת הכול</button>
                <button className="link-btn" onClick={() => setSel([])}>ניקוי</button>
              </span>
            </div>
            <div className="topic-pick">
              {TOPICS.map((t) => (
                <button key={t.id} className={'tp' + (sel.includes(t.id) ? ' on' : '')} style={{ '--accent': t.accent } as CSSProperties} onClick={() => toggle(t.id)} aria-pressed={sel.includes(t.id)}>
                  <span className="tp-ico" style={{ background: t.soft }}>{t.icon}</span>
                  <span className="tp-name">{t.name}</span>
                  <span className="tp-n">{QUESTIONS.filter((q) => q.topic === t.id).length}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="grid g3">
            <div className="field">
              <div className="field-label">מספר שאלות</div>
              <div className="seg">
                {[10, 15, 20, 30].map((x) => (
                  <button key={x} className={n === x ? 'on' : ''} onClick={() => setN(x)}>{x}</button>
                ))}
              </div>
            </div>
            <div className="field">
              <div className="field-label">רמת קושי</div>
              <div className="seg">
                {([['all', 'הכול'], ['easy', 'קל'], ['medium', 'בינוני'], ['hard', 'מאתגר']] as const).map(([v, l]) => (
                  <button key={v} className={diff === v ? 'on' : ''} onClick={() => setDiff(v)}>{l}</button>
                ))}
              </div>
            </div>
            <div className="field">
              <div className="field-label">משוב</div>
              <div className="seg">
                <button className={feedback === 'instant' ? 'on' : ''} onClick={() => setFeedback('instant')}>מיידי</button>
                <button className={feedback === 'end' ? 'on' : ''} onClick={() => setFeedback('end')}>בסוף</button>
              </div>
            </div>
          </div>
          <label className="check" style={{ maxWidth: 520 }}>
            <input type="checkbox" checked={onlyWrong} onChange={(e) => setOnlyWrong(e.target.checked)} />
            <span>רק שאלות שטעיתי בהן בעבר ({wrongIds.size})</span>
          </label>
          <div className="divider" />
          <div className="btn-row" style={{ justifyContent: 'space-between' }}>
            <span className="note">{sel.length === 0 ? 'יש לבחור לפחות נושא אחד' : `${pool.length} שאלות זמינות בבחירה זו`}</span>
            <button className="btn btn-primary" disabled={pool.length === 0} onClick={start}>התחלת תרגול ←</button>
          </div>
        </div>
      </div>
    </div>
  );
}
