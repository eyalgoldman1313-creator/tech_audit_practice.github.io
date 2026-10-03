export type TopicId =
  | 'infra'
  | 'systems'
  | 'process'
  | 'controls'
  | 'security'
  | 'bcp'
  | 'sdlc'
  | 'models'
  | 'caat'
  | 'outsourcing'
  | 'laws';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Question {
  id: string;
  topic: TopicId;
  difficulty: Difficulty;
  question: string;
  options: string[];
  answer: number;
  explanations: string[];
  source: string;
}

export interface CasePart {
  label: string;
  points?: number;
  topic: TopicId;
  question: string;
  solution: string;
  keyPoints: string[];
}

export interface Case {
  id: string;
  kind: 'council' | 'sample';
  title: string;
  source: string;
  points?: number;
  topics: TopicId[];
  background: string;
  parts: CasePart[];
  year?: number;
  session?: string;
}

export interface SampleExam {
  id: string;
  title: string;
  source: string;
  durationMinutes?: number;
  totalPoints?: number;
  instructions?: string;
  caseIds: string[];
}

export interface Flashcard {
  id: string;
  topic: TopicId;
  term: string;
  definition: string;
  source?: string;
}

export interface CompareTable {
  id: string;
  topic: TopicId;
  title: string;
  intro?: string;
  headers: string[];
  rows: string[][];
  source?: string;
}

export interface TreeNode {
  q?: string;
  options?: { label: string; next: TreeNode }[];
  result?: string;
  detail?: string;
}

export interface DecisionTree {
  id: string;
  topic: TopicId;
  title: string;
  intro?: string;
  root: TreeNode;
  source?: string;
}

export interface BoardRef {
  topic: string;
  topicId: TopicId;
  items: { label: string; caseId?: string }[];
}
