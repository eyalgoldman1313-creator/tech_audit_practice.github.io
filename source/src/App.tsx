import { useState } from 'react';
import { useHash } from './lib/router';
import { GUIDE_URL } from './topics';
import Home from './views/Home';
import QuizSetup from './views/QuizSetup';
import QuizRun, { type QuizConfig } from './views/QuizRun';
import ExamMode from './views/ExamMode';
import CaseList from './views/CaseList';
import CaseRun from './views/CaseRun';
import FullExam from './views/FullExam';
import Concepts from './views/Concepts';
import BoardMap from './views/BoardMap';

const LINKS: { path: string; label: string }[] = [
  { path: '/home', label: 'דף הבית' },
  { path: '/quiz', label: 'בחנים' },
  { path: '/exam', label: 'מצב מבחן' },
  { path: '/cases', label: 'סימולציית קייס' },
  { path: '/concepts', label: 'מפתחות מושג' },
  { path: '/map', label: 'מפת בחינות המועצה' },
];

const TABS: { path: string; label: string; icon: string; alt?: string[] }[] = [
  { path: '/home', label: 'בית', icon: '🏠' },
  { path: '/quiz', label: 'בחנים', icon: '📝', alt: ['/run'] },
  { path: '/exam', label: 'מבחן', icon: '🎓' },
  { path: '/cases', label: 'קייסים', icon: '🗂️', alt: ['/case', '/fullexam'] },
  { path: '/concepts', label: 'מושגים', icon: '🔑', alt: ['/map'] },
];

function Nav({ hash }: { hash: string }) {
  const [open, setOpen] = useState(false);
  const root = '/' + (hash.split('/')[1] ?? '');
  const isActive = (p: string) => root === p || (p === '/cases' && (root === '/case' || root === '/fullexam')) || (p === '/quiz' && root === '/run');
  return (
    <div className="nav-wrap">
      <nav className="pill" aria-label="ניווט ראשי">
        <a className="brand" href="#/home">
          <span className="dot" aria-hidden="true" />
          ביקורת מערכות מידע · תרגול
        </a>
        <button className="hamburger" aria-label="פתיחת תפריט" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          ☰
        </button>
        <div className={'nav-links' + (open ? ' open' : '')} onClick={() => setOpen(false)}>
          {LINKS.map((l) => (
            <a key={l.path} href={'#' + l.path} className={isActive(l.path) ? 'active' : ''}>
              {l.label}
            </a>
          ))}
          <a className="ext" href={GUIDE_URL} target="_blank" rel="noopener">
            📘 למדריך ↗
          </a>
        </div>
      </nav>
    </div>
  );
}

export default function App() {
  const hash = useHash();
  const [quiz, setQuiz] = useState<QuizConfig | null>(null);
  const parts = hash.split('/').filter(Boolean);

  let view;
  switch (parts[0]) {
    case 'quiz':
      view = <QuizSetup onStart={setQuiz} preset={parts[1]} />;
      break;
    case 'run':
      view = <QuizRun config={quiz} />;
      break;
    case 'exam':
      view = <ExamMode />;
      break;
    case 'cases':
      view = <CaseList />;
      break;
    case 'case':
      view = <CaseRun id={decodeURIComponent(parts[1] ?? '')} />;
      break;
    case 'fullexam':
      view = <FullExam id={decodeURIComponent(parts[1] ?? '')} />;
      break;
    case 'concepts':
      view = <Concepts tab={parts[1]} />;
      break;
    case 'map':
      view = <BoardMap />;
      break;
    default:
      view = <Home />;
  }

  return (
    <>
      <Nav hash={hash} />
      <main className="view" key={hash}>
        {view}
      </main>
      <nav className="tabbar" aria-label="ניווט מהיר">
        {TABS.map((t) => (
          <a key={t.path} href={'#' + t.path} className={'/' + (hash.split('/')[1] ?? '') === t.path || t.alt?.includes('/' + (hash.split('/')[1] ?? '')) ? 'on' : ''}>
            <span className="ic" aria-hidden="true">{t.icon}</span>
            {t.label}
          </a>
        ))}
      </nav>
      <footer className="foot">
        <span className="mark">ביקורת מערכות מידע ממוחשבות בשילוב AI</span>
        תרגול לבחינה · מבוסס על חוברת הקורס, תקני הביקורת, מבחני הקורס ובחינות המועצה 2015–2025<br /><a href="#/map">מפת בחינות המועצה</a> · <a href={GUIDE_URL} target="_blank" rel="noopener">📘 למדריך ↗</a>
      </footer>
    </>
  );
}
