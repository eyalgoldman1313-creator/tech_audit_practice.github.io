import { useMemo, useState, type CSSProperties } from 'react';
import { FLASHCARDS, TABLES, TREES } from '../data';
import { TOPICS, TOPIC } from '../topics';
import { md, shuffle, load, save } from '../lib/util';
import { go } from '../lib/router';
import type { TopicId, TreeNode, DecisionTree } from '../types';

type Tab = 'cards' | 'tables' | 'trees';

export default function Concepts({ tab }: { tab?: string }) {
  const active: Tab = tab === 'tables' || tab === 'trees' ? tab : 'cards';
  return (
    <div className="container">
      <div className="ch-head rv">
        <span className="eyebrow">מפתחות מושג</span>
        <h2>מושגים, השוואות והחלטות</h2>
        <p className="lead">כרטיסיות לשינון, טבלאות השוואה בין מושגים קרובים ועצי החלטה לשאלות ״איזו בקרה / איזו טכניקה / איזה אתר?״</p>
      </div>
      <div className="tabs">
        <div className="seg">
          <button className={active === 'cards' ? 'on' : ''} onClick={() => go('/concepts/cards')}>🃏 כרטיסיות ({FLASHCARDS.length})</button>
          <button className={active === 'tables' ? 'on' : ''} onClick={() => go('/concepts/tables')}>📊 טבלאות השוואה ({TABLES.length})</button>
          <button className={active === 'trees' ? 'on' : ''} onClick={() => go('/concepts/trees')}>🌳 עצי החלטה ({TREES.length})</button>
        </div>
      </div>
      {active === 'cards' && <Cards />}
      {active === 'tables' && <Tables />}
      {active === 'trees' && <Trees />}
    </div>
  );
}

function TopicFilter({ value, onChange, ids }: { value: 'all' | TopicId; onChange: (v: 'all' | TopicId) => void; ids: TopicId[] }) {
  return (
    <div className="filters">
      <select value={value} onChange={(e) => onChange(e.target.value as 'all' | TopicId)} aria-label="סינון לפי נושא">
        <option value="all">כל הנושאים</option>
        {TOPICS.filter((t) => ids.includes(t.id)).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
      </select>
    </div>
  );
}

function Cards() {
  const [topic, setTopic] = useState<'all' | TopicId>('all');
  const [seed, setSeed] = useState(0);
  const deck = useMemo(() => {
    const d = FLASHCARDS.filter((c) => topic === 'all' || c.topic === topic);
    return seed ? shuffle(d) : d;
  }, [topic, seed]);
  const [i, setI] = useState(0);
  const [flip, setFlip] = useState(false);
  const known = new Set(load<string[]>('known', []));
  const [, bump] = useState(0);
  const card = deck[Math.min(i, deck.length - 1)];
  if (!card) return <p className="empty">אין כרטיסיות.</p>;
  const t = TOPIC[card.topic];
  const move = (d: number) => { setFlip(false); setI((x) => (x + d + deck.length) % deck.length); };
  const mark = () => { known.has(card.id) ? known.delete(card.id) : known.add(card.id); save('known', [...known]); bump((x) => x + 1); };

  return (
    <>
      <TopicFilter value={topic} onChange={(v) => { setTopic(v); setI(0); setFlip(false); }} ids={[...new Set(FLASHCARDS.map((c) => c.topic))]} />
      <div className={'flash' + (flip ? ' flipped' : '')} style={{ '--accent': t.accent, '--accent-soft': t.soft } as CSSProperties}>
        <div className="flash-inner" onClick={() => setFlip((f) => !f)} role="button" tabIndex={0} aria-label="הפיכת כרטיסייה" onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setFlip((f) => !f); } }}>
          <div className="flash-face">
            <span className="chip">{t.icon} {t.short}</span>
            <div className="flash-term">{card.term}</div>
            <span className="note">לחצו להצגת ההגדרה</span>
          </div>
          <div className="flash-face back">
            <div className="flash-term" style={{ fontSize: '1.2rem' }}>{card.term}</div>
            <div className="prose" dangerouslySetInnerHTML={{ __html: md(card.definition) }} />
            {card.source && <div className="note">מקור: {card.source}</div>}
          </div>
        </div>
      </div>
      <div className="btn-row" style={{ justifyContent: 'center', marginBlockStart: 18 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => move(-1)}>→ הקודמת</button>
        <span className="counter">{Math.min(i, deck.length - 1) + 1} / {deck.length}</span>
        <button className="btn btn-ghost btn-sm" onClick={() => move(1)}>הבאה ←</button>
      </div>
      <div className="btn-row" style={{ justifyContent: 'center', marginBlockStart: 10 }}>
        <button className={'btn btn-sm ' + (known.has(card.id) ? 'btn-accent' : 'btn-ghost')} onClick={mark}>{known.has(card.id) ? '✓ יודע/ת' : 'סימון כ״יודע/ת״'}</button>
        <button className="btn btn-ghost btn-sm" onClick={() => { setSeed((s) => s + 1); setI(0); setFlip(false); }}>🔀 ערבוב</button>
        <span className="note">{deck.filter((c) => known.has(c.id)).length} מתוך {deck.length} סומנו</span>
      </div>
    </>
  );
}

function Tables() {
  const [topic, setTopic] = useState<'all' | TopicId>('all');
  const list = TABLES.filter((x) => topic === 'all' || x.topic === topic);
  return (
    <>
      <TopicFilter value={topic} onChange={setTopic} ids={[...new Set(TABLES.map((c) => c.topic))]} />
      {list.map((tb) => {
        const t = TOPIC[tb.topic];
        return (
          <div className="shell" key={tb.id} style={{ marginBlock: 18, '--accent': t.accent, '--accent-soft': t.soft } as CSSProperties}>
            <div className="core">
              <div className="part-head"><span className="chip">{t.icon} {t.short}</span></div>
              <h3 style={{ fontSize: '1.2rem', marginBlockEnd: 6 }}>{tb.title}</h3>
              {tb.intro && <p className="note">{tb.intro}</p>}
              <div className="tbl-wrap prose">
                <table>
                  <thead><tr>{tb.headers.map((h, i) => <th key={i}>{h}</th>)}</tr></thead>
                  <tbody>
                    {tb.rows.map((r, i) => (
                      <tr key={i}>{r.map((c, j) => <td key={j} data-label={tb.headers[j]} dangerouslySetInnerHTML={{ __html: j === 0 ? `<b>${c}</b>` : c }} />)}</tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {tb.source && <div className="note">מקור: {tb.source}</div>}
            </div>
          </div>
        );
      })}
    </>
  );
}

function Trees() {
  const [cur, setCur] = useState<DecisionTree | null>(null);
  if (cur) return <TreeRun tree={cur} onBack={() => setCur(null)} />;
  return (
    <div className="grid g3">
      {TREES.map((tr) => {
        const t = TOPIC[tr.topic];
        return (
          <button key={tr.id} className="b-card" style={{ '--accent': t.accent, '--accent-soft': t.soft } as CSSProperties} onClick={() => setCur(tr)}>
            <div className="ico">🌳</div>
            <h3>{tr.title}</h3>
            <p>{tr.intro}</p>
          </button>
        );
      })}
    </div>
  );
}

function TreeRun({ tree, onBack }: { tree: DecisionTree; onBack: () => void }) {
  const [path, setPath] = useState<{ node: TreeNode; label?: string }[]>([{ node: tree.root }]);
  const node = path[path.length - 1].node;
  const t = TOPIC[tree.topic];
  return (
    <div className="tree-step" style={{ '--accent': t.accent, '--accent-soft': t.soft } as CSSProperties}>
      <div className="shell">
        <div className="core">
          <div className="part-head">
            <span className="chip">{t.icon} {tree.title}</span>
          </div>
          {path.length > 1 && (
            <div className="crumbs">
              {path.slice(1).map((p, i) => <span key={i} className="chip grey">{p.label}</span>)}
            </div>
          )}
          {node.result ? (
            <div className="tree-result">
              <strong>{node.result}</strong>
              {node.detail && <div className="prose" dangerouslySetInnerHTML={{ __html: md(node.detail) }} />}
            </div>
          ) : (
            <>
              <div className="q-text">{node.q}</div>
              <div className="options">
                {node.options?.map((o, i) => (
                  <button key={i} className="option" onClick={() => setPath([...path, { node: o.next, label: o.label }])}>
                    <span className="letter">{i + 1}</span>
                    <span className="opt-body">{o.label}</span>
                  </button>
                ))}
              </div>
            </>
          )}
          <div className="q-nav">
            <button className="btn btn-ghost btn-sm" onClick={() => (path.length > 1 ? setPath(path.slice(0, -1)) : onBack())}>→ חזרה</button>
            <div className="btn-row">
              {path.length > 1 && <button className="btn btn-ghost btn-sm" onClick={() => setPath([{ node: tree.root }])}>מההתחלה</button>}
              <button className="btn btn-primary btn-sm" onClick={onBack}>לכל העצים</button>
            </div>
          </div>
          {tree.source && <div className="note">מקור: {tree.source}</div>}
        </div>
      </div>
    </div>
  );
}
