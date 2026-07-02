import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Sparkles, 
  Award, 
  HelpCircle,
  FolderOpen
} from 'lucide-react';
import { Question, QuizMode, HistoricalResult, UserAnswers } from './types';
import { QUESTIONS } from './data/questions';
import { Dashboard } from './components/Dashboard';
import { QuizView } from './components/QuizView';
import { ResultsView } from './components/ResultsView';

// Helper function to shuffle questions list and choices layout safely with remapped answer keys
export function prepareQuizQuestions(
  questionsSubset: Question[],
  shouldShuffleQuestions: boolean,
  shouldShuffleOptions: boolean
): Question[] {
  // Map back to original QUESTIONS dataset to always ensure static foundation and prevent double-shuffling artifacts
  const baseQuestions = questionsSubset.map(sq => {
    const original = QUESTIONS.find(q => q.id === sq.id);
    if (original) {
      return {
        id: original.id,
        type: original.type,
        question: original.question,
        options: original.options ? { ...original.options } : undefined,
        statements: original.statements ? [...original.statements] : undefined,
        answer: original.answer
      };
    }
    return {
      id: sq.id,
      type: sq.type,
      question: sq.question,
      options: sq.options ? { ...sq.options } : undefined,
      statements: sq.statements ? [...sq.statements] : undefined,
      answer: sq.answer
    };
  });

  let prepared = baseQuestions;

  // Shuffle individual question choice options order
  if (shouldShuffleOptions) {
    prepared = prepared.map(q => {
      if (q.type !== 'single-choice' || !q.options) {
        return q;
      }
      const optionEntries = Object.entries(q.options);
      const correctText = q.options[q.answer];

      // Fisher-Yates array shuffling
      const shuffledEntries = [...optionEntries];
      for (let i = shuffledEntries.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledEntries[i], shuffledEntries[j]] = [shuffledEntries[j], shuffledEntries[i]];
      }

      // Re-map into continuous keys 'a', 'b', 'c', 'd' ...
      const newOptions: { [key: string]: string } = {};
      let newAnswerKey = q.answer;

      const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g'].slice(0, shuffledEntries.length);
      
      shuffledEntries.forEach((entry, idx) => {
        const letter = letters[idx];
        newOptions[letter] = entry[1];
        
        // If this entry matches original correct answer's text, update the code answer mapping
        if (entry[1] === correctText) {
          newAnswerKey = letter;
        }
      });

      return {
        ...q,
        options: newOptions,
        answer: newAnswerKey
      };
    });
  }

  // Shuffle question list order
  if (shouldShuffleQuestions) {
    const shuffled = [...prepared];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  return prepared;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'quiz' | 'results'>('dashboard');
  
  // Quiz states
  const [quizMode, setQuizMode] = useState<QuizMode>('practice');
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [activeTitle, setActiveTitle] = useState('');
  const [userAnswers, setUserAnswers] = useState<UserAnswers>({});
  const [timeSpent, setTimeSpent] = useState(0);
  const [isReviewMode, setIsReviewMode] = useState(false);

  // Persistent shuffling configurations
  const [shuffleQuestions, setShuffleQuestions] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('os_quiz_shuffle_questions_v1');
      return stored !== null ? JSON.parse(stored) : true;
    } catch {
      return true;
    }
  });

  const [shuffleOptions, setShuffleOptions] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('os_quiz_shuffle_options_v1');
      return stored !== null ? JSON.parse(stored) : true;
    } catch {
      return true;
    }
  });

  const handleToggleShuffleQuestions = (val: boolean) => {
    setShuffleQuestions(val);
    localStorage.setItem('os_quiz_shuffle_questions_v1', JSON.stringify(val));
  };

  const handleToggleShuffleOptions = (val: boolean) => {
    setShuffleOptions(val);
    localStorage.setItem('os_quiz_shuffle_options_v1', JSON.stringify(val));
  };

  // History state
  const [history, setHistory] = useState<HistoricalResult[]>([]);

  // Persistent active practice session (if any)
  const [resumeSession, setResumeSession] = useState<{
    questions: Question[];
    title: string;
    answers: UserAnswers;
    mode: QuizMode;
  } | null>(null);

  // Load history & resume session from localStorage on mount
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('os_quiz_history_v1');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
      
      const storedActive = localStorage.getItem('os_quiz_active_practice_v1');
      if (storedActive) {
        setResumeSession(JSON.parse(storedActive));
      }
    } catch (e) {
      console.error('Error loading localStorage data:', e);
    }
  }, []);

  // Sync history to localStorage
  const saveHistory = (newHistory: HistoricalResult[]) => {
    try {
      setHistory(newHistory);
      localStorage.setItem('os_quiz_history_v1', JSON.stringify(newHistory));
    } catch (e) {
      console.error('Error storing history data:', e);
    }
  };

  // Start a fresh quiz
  const handleStartQuiz = (mode: QuizMode, questionsSubset: Question[], title: string) => {
    const prepared = prepareQuizQuestions(questionsSubset, shuffleQuestions, shuffleOptions);
    setQuizMode(mode);
    setActiveQuestions(prepared);
    setActiveTitle(title);
    setUserAnswers({});
    setTimeSpent(0);
    setIsReviewMode(false);
    setActiveTab('quiz');

    // If starting a new quiz, clear resume flag if we didn't use it
    if (mode === 'exam') {
      localStorage.removeItem('os_quiz_active_practice_v1');
      setResumeSession(null);
    }
  };

  // Resume an interrupted session
  const handleResumeSavedSession = () => {
    if (!resumeSession) return;
    setQuizMode(resumeSession.mode);
    setActiveQuestions(resumeSession.questions);
    setActiveTitle(resumeSession.title);
    setUserAnswers(resumeSession.answers);
    setTimeSpent(0);
    setIsReviewMode(false);
    setActiveTab('quiz');
  };

  // Submit and process quiz results
  const handleSubmitQuiz = (finalAnswers: UserAnswers, finalTimeSpent: number) => {
    setUserAnswers(finalAnswers);
    setTimeSpent(finalTimeSpent);
    
    // Save to history (only for completed sets)
    const correctCount = activeQuestions.filter(q => finalAnswers[q.id] === q.answer).length;
    
    const newResult: HistoricalResult = {
      id: Math.random().toString(36).substring(2, 9),
      mode: quizMode,
      date: new Date().toISOString(),
      score: correctCount,
      total: activeQuestions.length,
      timeSpent: finalTimeSpent,
      answers: finalAnswers,
      questions: activeQuestions
    };

    const updatedHistory = [newResult, ...history];
    saveHistory(updatedHistory);

    // If on practice mode, also remove temporary save
    localStorage.removeItem('os_quiz_active_practice_v1');
    setResumeSession(null);

    setIsReviewMode(false);
    setActiveTab('results');
  };

  // Exit quiz mid-way - we save practice mode, but discard exam mode progress naturally
  const handleExitQuiz = (currentSessionAnswers?: UserAnswers) => {
    if (quizMode === 'practice' && activeQuestions.length > 0) {
      const activeState = {
        questions: activeQuestions,
        title: activeTitle,
        answers: currentSessionAnswers || userAnswers,
        mode: quizMode
      };
      localStorage.setItem('os_quiz_active_practice_v1', JSON.stringify(activeState));
      setResumeSession(activeState);
    }
    setActiveTab('dashboard');
  };

  // View a review of a past result
  const handleViewPastResult = (pastResult: HistoricalResult) => {
    // Determine the original questions set based on historical results
    let restoredQuestions = pastResult.questions || QUESTIONS;
    if (!pastResult.questions && pastResult.total !== QUESTIONS.length) {
      // Find matching range of categories, or just questions that were answered
      restoredQuestions = QUESTIONS.filter(q => pastResult.answers[q.id] !== undefined);
      // Fallback if no questions matched but total is still specified (e.g. subset by category boundary)
      if (restoredQuestions.length === 0) {
        restoredQuestions = QUESTIONS.slice(0, pastResult.total);
      }
    }

    setQuizMode(pastResult.mode);
    setActiveQuestions(restoredQuestions);
    setActiveTitle(pastResult.mode === 'exam' 
      ? `Xem lại đề thi (${pastResult.score}/${pastResult.total})` 
      : `Xem lại bài tập (${pastResult.score}/${pastResult.total})`
    );
    setUserAnswers(pastResult.answers);
    setTimeSpent(pastResult.timeSpent);
    setIsReviewMode(true);
    setActiveTab('quiz');
  };

  // Delete a history item
  const handleDeleteHistoryItem = (id: string) => {
    const updated = history.filter(h => h.id !== id);
    saveHistory(updated);
  };

  // Clear memory history list
  const handleClearHistory = () => {
    if (window.confirm('Bạn có thực sự muốn xóa toàn bộ lịch sử làm bài?')) {
      saveHistory([]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 flex flex-col font-sans transition-colors duration-200">
      
      {/* Dynamic Header banner */}
      <header className="bg-white border-b border-slate-100 py-3.5 px-6 shadow-2xs z-30 flex items-center justify-between sticky top-0 backdrop-blur-md bg-white/90">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-600 rounded-lg text-white">
            <BookOpen className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-1">
              Trắc Nghiệm GDQPAN
            </h1>
            <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider font-mono">
              Học & Luyện Thi {QUESTIONS.length} Câu Đầy Đủ
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200/50 font-mono">
            Học kỳ II
          </span>
        </div>
      </header>

      {/* Main Container Workspace layout */}
      <main className="flex-1 relative">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {/* Optional Prompt to Resume saved Practice session */}
              {resumeSession && (
                <div className="max-w-7xl mx-auto px-4 mt-6">
                  <div className="bg-indigo-600 rounded-xl p-4 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-700 rounded-lg">
                        <FolderOpen className="h-5 w-5 text-indigo-200" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">Bạn hành động chưa hoàn thành bài luyện tập cũ</h4>
                        <p className="text-xs text-indigo-100 mt-0.5">
                          Tiêu đề: "{resumeSession.title}" • Đã làm {Object.keys(resumeSession.answers).length} câu • Bạn có thể làm tiếp bất cứ lúc nào.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 self-stretch sm:self-center">
                      <button
                        onClick={() => {
                          localStorage.removeItem('os_quiz_active_practice_v1');
                          setResumeSession(null);
                        }}
                        className="px-3 py-1.5 text-xs font-semibold hover:bg-indigo-700 border border-indigo-500 rounded-lg cursor-pointer text-indigo-100 transition-colors"
                      >
                        Hủy bỏ
                      </button>
                      <button
                        onClick={handleResumeSavedSession}
                        className="px-4 py-1.5 text-xs font-bold bg-white text-indigo-700 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                      >
                        Tiếp tục làm bài
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <Dashboard
                history={history}
                onStartQuiz={handleStartQuiz}
                onViewPastResult={handleViewPastResult}
                onDeleteHistoryItem={handleDeleteHistoryItem}
                onClearHistory={handleClearHistory}
                shuffleQuestions={shuffleQuestions}
                shuffleOptions={shuffleOptions}
                onToggleShuffleQuestions={handleToggleShuffleQuestions}
                onToggleShuffleOptions={handleToggleShuffleOptions}
              />
            </motion.div>
          )}

          {activeTab === 'quiz' && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <QuizView
                mode={quizMode}
                questions={activeQuestions}
                title={activeTitle}
                onExit={() => handleExitQuiz(userAnswers)}
                onSubmitResults={handleSubmitQuiz}
                pastResultAnswers={isReviewMode ? userAnswers : undefined}
                isReviewMode={isReviewMode}
              />
            </motion.div>
          )}

          {activeTab === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <ResultsView
                questions={activeQuestions}
                answers={userAnswers}
                timeSpent={timeSpent}
                onRestart={() => handleStartQuiz(quizMode, activeQuestions, activeTitle)}
                onReviewAnswers={() => {
                  setIsReviewMode(true);
                  setActiveTab('quiz');
                }}
                onBackToDashboard={() => setActiveTab('dashboard')}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer credits info */}
      <footer className="bg-white border-t border-slate-100 py-6 text-center text-xs text-slate-400 mt-auto">
        <p className="font-medium font-mono">© 2026 Hệ thống Trắc nghiệm Giáo Dục Quốc Phòng - An Ninh.</p>
        <p className="mt-1 text-slate-400">Thiết kế học tập tối ưu, hỗ trợ xáo trộn câu hỏi và đáp án ngẫu nhiên vượt trội.</p>
      </footer>
    </div>
  );
}
