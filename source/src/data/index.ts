import type { Question, Case, SampleExam, Flashcard, CompareTable, DecisionTree, BoardRef } from '../types';
import questionsJson from './questions.json';
import casesJson from './cases.json';
import examsJson from './exams.json';
import flashJson from './flashcards.json';
import tablesJson from './tables.json';
import treesJson from './trees.json';
import boardJson from './boardmap.json';

export const QUESTIONS = questionsJson as unknown as Question[];
export const CASES = casesJson as unknown as Case[];
export const EXAMS = examsJson as unknown as SampleExam[];
export const FLASHCARDS = flashJson as unknown as Flashcard[];
export const TABLES = tablesJson as unknown as CompareTable[];
export const TREES = treesJson as unknown as DecisionTree[];
export const BOARD = boardJson as unknown as BoardRef[];
export const CASE_BY_ID: Record<string, Case> = Object.fromEntries(CASES.map((c) => [c.id, c]));
