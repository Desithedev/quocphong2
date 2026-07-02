export interface Question {
  id: number;
  type: 'single-choice' | 'true-false';
  question: string;
  options?: {
    [key: string]: string;
  };
  statements?: string[];
  answer: string;
}

export type QuizMode = 'practice' | 'exam';

export interface UserAnswers {
  [questionId: number]: string; // selected option key ('a', 'b', etc)
}

export interface QuestionFlags {
  [questionId: number]: boolean; // whether flagged/bookmarked for review
}

export interface QuizSession {
  mode: QuizMode;
  startTime: number;
  timeRemaining: number; // in seconds, only for exam mode
  answers: UserAnswers;
  flags: QuestionFlags;
  isSubmitted: boolean;
}

export interface HistoricalResult {
  id: string; // unique session id
  mode: QuizMode;
  date: string;
  score: number; // number of correct answers
  total: number;
  timeSpent: number; // in seconds
  answers: UserAnswers;
  questions?: Question[];
}
