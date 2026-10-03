import type { TopicId } from './types';

export interface TopicMeta {
  id: TopicId;
  name: string;
  short: string;
  icon: string;
  accent: string;
  soft: string;
  blurb: string;
}

export const TOPICS: TopicMeta[] = [
  { id: 'infra', name: 'התשתית הטכנולוגית', short: 'תשתית', icon: '🖧', accent: '#2E7CF6', soft: '#EAF2FE', blurb: 'מבנה אגף IT והפרדת תפקידים, סוגי עיבוד, סביבות עבודה, רשתות וענן' },
  { id: 'systems', name: 'מבנה מערכות מידע והמערכת החשבונאית', short: 'מערכות מידע', icon: '🗄️', accent: '#0891B2', soft: '#E4F6FA', blurb: 'תוכנות מדף, ERP, פיתוח עצמי, ממשקים, ספר ראשי וספרי עזר' },
  { id: 'process', name: 'תהליך הביקורת ותקני ביקורת', short: 'תהליך הביקורת', icon: '🎯', accent: '#6366F1', soft: '#EEF0FE', blurb: 'סיכון ביקורת, תקנים 315/330/500/610/620, נתיב ביקורת' },
  { id: 'controls', name: 'בקרות כלליות (ITGC) ובקרות יישומיות', short: 'בקרות', icon: '🛡️', accent: '#0E9F6E', soft: '#E6F7F0', blurb: 'מונעת/מגלה/מתקנת/מפצה, בקרות קלט-עיבוד-פלט, ITGC' },
  { id: 'security', name: 'אבטחת מידע וסייבר', short: 'אבטחת מידע', icon: '🔐', accent: '#E11D48', soft: '#FDEAEF', blurb: 'ממשל אבטחת מידע, הרשאות, הצפנה, אבטחה פיזית וסביבתית, סייבר' },
  { id: 'bcp', name: 'המשכיות עסקית והתאוששות מאסון', short: 'BCP / DRP', icon: '🔄', accent: '#D97706', soft: '#FDF3E3', blurb: 'גיבויים, BIA, אתרים חלופיים, תרגולים ותפקיד המבקר' },
  { id: 'sdlc', name: 'מחזור חיים של מערכות מידע', short: 'מחזור חיים', icon: '🧩', accent: '#7C3AED', soft: '#F3EDFD', blurb: 'שלבי פיתוח, ליווי פרויקטים, הסבת נתונים, ניהול שינויים' },
  { id: 'models', name: 'מודלים לניהול בקרות פנימיות', short: 'COSO / CobiT', icon: '🏛️', accent: '#1E3A8A', soft: '#E7ECF8', blurb: '3 קווי הגנה, COSO, CobiT' },
  { id: 'caat', name: 'כלים וטכניקות ביקורת ממוחשבות ו-AI', short: 'CAATs ו-AI', icon: '🤖', accent: '#0F766E', soft: '#E2F5F3', blurb: 'GAS, ITF, Test Data, SCARF, Snapshot, Data Analytics, AI, RPA' },
  { id: 'outsourcing', name: 'לשכות שירות, מיקור חוץ וענן', short: 'לשכות שירות וענן', icon: '☁️', accent: '#0284C7', soft: '#E0F2FE', blurb: 'תקן 402, דוחות סוג א\'/ב\', SLA, סיכוני ענן' },
  { id: 'laws', name: 'חוקים ותקנות', short: 'חקיקה', icon: '⚖️', accent: '#9333EA', soft: '#F5ECFE', blurb: 'ניהול פנקסים ממוחשב, חתימה אלקטרונית, חוק המחשבים, הגנת הפרטיות' },
];

export const TOPIC: Record<TopicId, TopicMeta> = Object.fromEntries(TOPICS.map((t) => [t.id, t])) as Record<TopicId, TopicMeta>;

export const GUIDE_URL = 'https://eyalgoldman1313-creator.github.io/tech_audit_guide.github.io/';
export const guideLink = (topic: TopicId) => `${GUIDE_URL}#ch-${topic}`;

export const DIFF_LABEL: Record<string, string> = { easy: 'קל', medium: 'בינוני', hard: 'מאתגר' };
